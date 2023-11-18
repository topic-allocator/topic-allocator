from lib import SolverInput, solve
from pulp import json  # type: ignore
import azure.functions as func  # type: ignore
import logging
from schema import Or, Schema, And, SchemaError  # type: ignore

input_schema = Schema(
    {
        "applications": [
            {
                "student_id": int,
                "rank": And(int, lambda n: 0 < n),
                "topic_id": int,
                "instructor_id": int,
                "grade": And(Or(float, int), lambda n: 0 <= n, lambda n: n <= 5),
                "topic_capacity": And(int, lambda n: 0 <= n),
            }
        ],
        "students": [
            {
                "id": int,
            }
        ],
        "topics": [
            {
                "id": int,
                "capacity": And(int, lambda n: 0 < n),
            }
        ],
        "instructors": [
            {
                "id": int,
                "min": And(int, lambda n: 0 <= n),
                "max": And(int, lambda n: 0 <= n),
            }
        ],
    }
)

app = func.FunctionApp()


@app.function_name(name="solve")
@app.route(route="solve", methods=["POST"])
def run_solver(
    req: func.HttpRequest,
) -> func.HttpResponse:
    try:
        input: SolverInput = req.get_json()
    except ValueError as e:
        logging.error(e)
        return func.HttpResponse(
            body=json.dumps({"error": f"Failed to parse JSON: {e}"}),
            status_code=400,
        )

    try:
        input_schema.validate(input)
    except SchemaError as e:
        logging.error(e)
        return func.HttpResponse(
            body=json.dumps({"error": f"Invalid input: {e}"}),
            status_code=400,
        )

    result = solve(input)
    logging.info(result)
    return func.HttpResponse(body=json.dumps(result), mimetype="application/json")
