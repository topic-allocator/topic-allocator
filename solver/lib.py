from os import replace
from typing import List, TypedDict
from operator import itemgetter
from pulp import LpMinimize, LpProblem, LpVariable, lpSum, const  # type: ignore


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


class Instructor(TypedDict):
    id: str
    min: int
    max: int


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
    students, topics, instructors, applications = itemgetter(
        "students", "topics", "instructors", "applications"
    )(input)

    for application in applications:
        application["is_admitted"] = LpVariable(
            f"{application['student_id']}:{application['topic_id']}",
            0,
            1,
            const.LpBinary,
        )

    prob = LpProblem("student-topic-assignment", LpMinimize)
    prob += (
        lpSum(
            [
                application["is_admitted"] * application["rank"]
                for application in applications
            ]
        ),
        "objective",
    )

    # Each student can be admitted to at most one topic (1)
    for student in students:
        prob += (
            lpSum(
                [
                    application["is_admitted"]
                    for application in applications
                    if application["student_id"] == student["id"]
                ]
            )
            <= 1,
            f"student:{student['id']}:assignment:debug",
        )

    # Respect topic capacity (2)
    for topic in topics:
        prob += (
            lpSum(
                [
                    application["is_admitted"]
                    for application in applications
                    if application["topic_id"] == topic["id"]
                ]
            )
            <= topic["capacity"],
            f"topic:{topic['id']}:capacity:debug",
        )

    # Enforce stability (3)
    for application in applications:
        prob += (
            lpSum(
                [
                    other_application["is_admitted"]
                    for other_application in applications
                    if other_application["student_id"] == application["student_id"]
                    and other_application["rank"] <= application["rank"]
                ]
            )
            * application["topic_capacity"]
            + lpSum(
                [
                    other_application["is_admitted"]
                    for other_application in applications
                    if other_application["topic_id"] == application["topic_id"]
                    and other_application["grade"] >= application["grade"]
                ]
            )
            >= application["topic_capacity"],
            f"student:{application['student_id']}:topic:{application['topic_id']}:assignment:debug",
        )

    # Instructor min/max
    for instructor in instructors:
        prob += (
            lpSum(
                [
                    application["is_admitted"]
                    for application in applications
                    if application["instructor_id"] == instructor["id"]
                ]
            )
            >= 0,  # instructor["min"],
            f"instructor:{instructor['id']}:min:debug",
        )

        prob += (
            lpSum(
                [
                    application["is_admitted"]
                    for application in applications
                    if application["instructor_id"] == instructor["id"]
                ]
            )
            <= 999,  # instructor["max"],
            f"instructor:{instructor['id']}:max:debug",
        )

    prob.solve()

    matchings: List[Matching] = [
        {
            # LpVariable converts "-" to "_" in its name, so we need to convert it back
            "student_id": v.name.split(":")[0].replace("_", "-"),
            "topic_id": v.name.split(":")[1].replace("_", "-"),
        }
        for v in prob.variables()
        if "debug" not in v.name and v.varValue == 1
    ]

    result: SolverResult = {
        "status": prob.status,
        "matchings": matchings,
    }

    return result
