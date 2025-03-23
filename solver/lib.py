from re import split
from typing import List, Tuple, TypedDict
from pulp import LpMinimize, LpProblem, LpVariable, logging, lpSum, const  # type: ignore
import os


class Application(TypedDict):
    student_id: str
    rank: int
    topic_id: str
    instructor_id: str
    grade: float
    topic_capacity: int
    is_admitted: LpVariable


class Student(TypedDict):
    id: str


class Topic(TypedDict):
    id: str
    capacity: int
    cutoffs: List[Tuple[float, LpVariable]]


class Instructor(TypedDict):
    id: str
    min: int
    max: int
    cutoffs: List[Tuple[float, LpVariable]]


class SolverInput(TypedDict):
    students: List[Student]
    topics: List[Topic]
    instructors: List[Instructor]
    applications: List[Application]


class Matching(TypedDict):
    student_id: str
    topic_id: str


class SolverResult(TypedDict):
    status: int
    matchings: List[Matching]


def solve(input: SolverInput) -> SolverResult:
    students = input["students"]
    topics = input["topics"]
    instructors = input["instructors"]
    applications = sorted(
        input["applications"],
        key=lambda application: (application["topic_id"], -application["grade"]),
    )

    for application in applications:
        application["is_admitted"] = LpVariable(
            f"{application['student_id']}:{application['topic_id']}",
            0,
            1,
            const.LpBinary,
        )

    for topic in topics:
        topic["cutoffs"] = [
            (
                grade,
                LpVariable(
                    f"{topic['id']}:{grade}:topic_cutoff",
                    0,
                    1,
                    const.LpBinary,
                ),
            )
            for grade in sorted(
                set(
                    application["grade"]
                    for application in applications
                    if application["topic_id"] == topic["id"]
                )
            )
        ]

    for instructor in instructors:
        instructor["cutoffs"] = [
            (
                grade,
                LpVariable(
                    f"{instructor['id']}:{grade}:instructor_cutoff",
                    0,
                    1,
                    const.LpBinary,
                ),
            )
            for grade in sorted(
                set(
                    application["grade"]
                    for application in applications
                    if application["instructor_id"] == instructor["id"]
                )
            )
        ]

    prob = LpProblem("student-topic-assignment", LpMinimize)
    prob += (
        lpSum(
            application["is_admitted"] * application["rank"]
            for application in applications
        ),
        "objective",
    )

    # Each student can be admitted to at most one topic (1)
    for student in students:
        prob += (
            lpSum(
                application["is_admitted"]
                for application in applications
                if application["student_id"] == student["id"]
            )
            <= 1,
            f"student:{student['id']}:assignment:debug",
        )

    # Respect topic capacity (2)
    for topic in topics:
        prob += (
            lpSum(
                application["is_admitted"]
                for application in applications
                if application["topic_id"] == topic["id"]
            )
            <= topic["capacity"],
            f"topic:{topic['id']}:capacity:debug",
        )

    # Grade order, topic (33)
    for topic in topics:
        for (_, lower_cutoff), (_, higher_cutoff) in zip(
            topic["cutoffs"], topic["cutoffs"][1:]
        ):
            prob += (
                lower_cutoff <= higher_cutoff,
                f"topic:{topic["id"]}:cutoff:{split(":",lower_cutoff.name)[1]}:{split(":",higher_cutoff.name)[1]}:debug",
            )

    # Non-wastefulness, topic (35)
    for topic in topics:
        if len(topic["cutoffs"]) == 0:
            continue
        (_, lowest_cutoff) = topic["cutoffs"][0]

        prob += (
            lowest_cutoff * topic["capacity"]
            + lpSum(
                application["is_admitted"]
                for application in applications
                if application["topic_id"] == topic["id"]
            )
            >= topic["capacity"],
            f"topic:{topic['id']}:waste:debug",
        )

    # Grade order, instructor (33)
    for instructor in instructors:
        for (_, lower_cutoff), (_, higher_cutoff) in zip(
            instructor["cutoffs"], instructor["cutoffs"][1:]
        ):
            prob += (
                lower_cutoff <= higher_cutoff,
                f"instructor:{instructor['id']}:cutoff:{split(":",lower_cutoff.name)[1]}:{split(":",higher_cutoff.name)[1]}:debug",
            )

    # Non-wastefulness, instructor (35)
    for instructor in instructors:
        if len(instructor["cutoffs"]) == 0:
            continue
        (_, lowest_cutoff) = instructor["cutoffs"][0]

        prob += (
            lowest_cutoff * instructor["max"]
            + lpSum(
                application["is_admitted"]
                for application in applications
                if application["instructor_id"] == instructor["id"]
            )
            >= instructor["max"],
            f"instructor:{instructor['id']}:waste:debug",
        )

    for student in students:
        student_applications = sorted(
            (a for a in applications if a["student_id"] == student["id"]),
            key=lambda a: a["rank"],
        )
        for application_index, application in enumerate(student_applications):
            instructor = next(
                i for i in instructors if i["id"] == application["instructor_id"]
            )
            topic = next(t for t in topics if t["id"] == application["topic_id"])

            (instructor_cutoff, next_instructor_cutoff) = lookup_cutoff_and_next_cutoff(
                application["grade"], instructor["cutoffs"]
            )
            (topic_cutoff, next_topic_cutoff) = lookup_cutoff_and_next_cutoff(
                application["grade"], topic["cutoffs"]
            )

            prob += (
                lpSum(
                    application["is_admitted"]
                    for application in student_applications[: application_index + 1]
                )
                - instructor_cutoff
                - topic_cutoff
                >= -1,
                f"student:{application['student_id']}:rank:{application['rank']}:cutoff:debug",
            )
            prob += (
                next_instructor_cutoff >= application["is_admitted"],
                f"student:{application['student_id']}:rank:{application['rank']}:next_instructor_cutoff:debug",
            )
            prob += (
                next_topic_cutoff >= application["is_admitted"],
                f"student:{application['student_id']}:rank:{application['rank']}:next_topic_cutoff:debug",
            )

    # Instructor min/max
    for instructor in instructors:
        prob += (
            lpSum(
                application["is_admitted"]
                for application in applications
                if application["instructor_id"] == instructor["id"]
            )
            >= instructor["min"],
            f"instructor:{instructor['id']}:min:debug",
        )

        prob += (
            lpSum(
                application["is_admitted"]
                for application in applications
                if application["instructor_id"] == instructor["id"]
            )
            <= instructor["max"],
            f"instructor:{instructor['id']}:max:debug",
        )

    if os.environ.get("SOLVER_DEBUG"):
        prob.writeLP("debug.lp")

    prob.solve()

    matchings: List[Matching] = [
        {
            # LpVariable converts "-" to "_" in its name, so we need to convert it back
            "student_id": v.name.split(":")[0].replace("_", "-"),
            "topic_id": v.name.split(":")[1].replace("_", "-"),
        }
        for v in prob.variables()
        if "debug" not in v.name
        and "topic_cutoff" not in v.name
        and "instructor_cutoff" not in v.name
        and v.varValue == 1
    ]

    logging.info(f"Number of students: {len(students)}")
    logging.info(f"Students assigned: {len(matchings)}")

    result: SolverResult = {
        "status": prob.status,
        "matchings": matchings,
    }

    return result


def lookup_cutoff_and_next_cutoff(
    grade: float, cutoffs: List[Tuple[float, LpVariable]]
) -> Tuple[LpVariable, LpVariable]:
    (cutoff, i) = next((lp, i) for i, (g, lp) in enumerate(cutoffs) if g == grade)
    (_, next_cutoff) = cutoffs[i + 1] if i + 1 < len(cutoffs) else (None, cutoff)
    return (cutoff, next_cutoff)
