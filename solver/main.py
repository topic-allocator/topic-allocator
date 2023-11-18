import fileinput
from typing import List, TypedDict
from pulp import LpMinimize, LpProblem, LpVariable, const, json, lpSum, sys  # type: ignore


class Application(TypedDict):
    student_id: int
    rank: int
    topic_id: int
    instructor_id: int
    grade: float
    topic_capacity: int
    is_admitted: LpVariable


class Student(TypedDict):
    id: int


class Topic(TypedDict):
    id: int
    capacity: int


class Instructor(TypedDict):
    id: int
    min: int
    max: int


def main() -> None:
    input = ""
    for line in fileinput.input():
        input += line
    parsed_input = json.loads(input)

    students: List[Student] = parsed_input["students"]
    topics: List[Topic] = parsed_input["topics"]
    instructors: List[Instructor] = parsed_input["instructors"]
    applications: List[Application] = list(
        map(
            lambda application: {
                "student_id": application["studentId"],
                "rank": application["rank"],
                "topic_id": application["topicId"],
                "instructor_id": application["instructorId"],
                "grade": application["grade"],
                "topic_capacity": application["capacity"],
                "is_admitted": LpVariable(
                    f"{application['studentId']}_{application['topicId']}",
                    0,
                    1,
                    const.LpBinary,
                ),
            },
            parsed_input["applications"],
        )
    )

    prob = LpProblem("student-topic-assignment", LpMinimize)
    prob += (lpSum([
        application["is_admitted"] * application["rank"]
        for application in applications
    ]), "objective")

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
            f"student_{student['id']}_assignment_debug",
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
            f"topic_{topic['id']}_capacity_debug",
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
            f"student_{application['student_id']}_topic_{application['topic_id']}_assignment_debug",
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
            >= 1,  # instructor["min"],
            f"instructor_{instructor['id']}_min_debug",
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
            f"instructor_{instructor['id']}_max_debug",
        )

    prob.solve()

    result = {}
    for v in prob.variables():
        if "debug" not in v.name and v.varValue == 1:
            result[v.name] = v.varValue

    print("status:", prob.status)
    sys.stdout.flush()
    print("students count:", len(students))
    sys.stdout.flush()
    print("students assigned:", len(result))
    sys.stdout.flush()
    print("result:", json.dumps(list(result.keys())))
    sys.stdout.flush()


if __name__ == "__main__":
    main()
