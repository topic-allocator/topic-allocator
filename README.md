<h1 align="center">Topic Allocator</h1>

<div align="center">

[![server deployment](https://github.com/topic-allocator/topic-allocator/actions/workflows/deploy-server.yml/badge.svg?branch=main)](https://github.com/topic-allocator/topic-allocator/actions/workflows/deploy-server.yml)
[![solver deployment](https://github.com/topic-allocator/topic-allocator/actions/workflows/deploy-solver.yml/badge.svg?branch=main)](https://github.com/topic-allocator/topic-allocator/actions/workflows/deploy-solver.yml)
[![unit tests](https://github.com/topic-allocator/topic-allocator/actions/workflows/unit.yml/badge.svg)](https://github.com/topic-allocator/topic-allocator/actions/workflows/unit.yml)
[![e2e tests](https://github.com/topic-allocator/topic-allocator/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/topic-allocator/topic-allocator/actions/workflows/e2e.yml)

</div>

## Summary

The goal of the application is streamlining the process of allocating multiple
topics between students, taking into account certain constraints, such as the
preference of the students, or the capacity of the instructors. (The problem is
very similar to the college admissions problem, researched by [Gale and
Shapley](https://www.eecs.harvard.edu/cs286r/courses/fall09/papers/galeshapley.pdf).)

The application is designed to be embedded into e-learning platforms such as
[Moodle](https://moodle.org/) via implementing the
[LTI](https://www.1edtech.org/standards/lti) standard. This way most of the
authentication and authorization is not the concern of the application.

## Development

The project can be broken into four modules, a **client** and a **server**, the
**solver**, and finally a module for **e2e** tests.

### Client and Server

The server is an [Azure
Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview)
application, running on [Node](https://nodejs.org/). The ORM used is
[Prisma](https://www.prisma.io/docs/orm). The client is a
[React](https://react.dev/reference/react) SPA, using
[Vite](https://vitejs.dev/) as a bundler. The two modules are under an [npm
workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

#### Starting locally

1. Install dependencies, in the root of the project run:

```
npm install
```

(This will install dependencies for both the client and the server.)

2. During development, the server sources ENV variables from `server/.env`.
Put a `.env` file at the root of the server folder (check [.env.example](server/.env.example) for help)

3. Start the dev servers

```
npm run dev -w client
```

and

```
npm run dev -w server
```

4. Navigate to the address of the client and set a cookie with key `jwt` and
   the value of the JWT that was produced as the result of an LTI launch.
   (Setting it manually is only required during development. Check
   [lti.ts](server/src/handlers/lti.ts) for more details.)

### Solver

The solver is also an Azure Functions application this time written in python. The mixed integer programming model is mostly based on [this publication](https://arxiv.org/pdf/1408.6878.pdf).

#### Starting locally

1. Set up a [virtual environment](https://docs.python.org/3/library/venv.html)
(This is **not** just for convenience, azure functions requires a virtual environment to work properly.)

2. Install dependencies, in the root of the project run:

```
pip install -r solver/requirements.txt
```

3. In the root of the solver folder run:

```
func start
```

(For this you will need the [Azure Functions Core
Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local).)

Considering that you will probably run this together with the server, the
default port, 7071 will be taken. You can specify a different port like this:

```
func start -p 7072
```

### E2E tests

[Playwright](https://playwright.dev/) is used for e2e tests.

#### Running tests locally

1. Install dependencies, in the e2e folder run:

```
npm install && npx playwright install
```

2. Start the other modules locally

```
docker compose up
```

(You can also spin up the dev servers individually, however, in this case make
sure to build the client and put the bundle under `server/static`.)

3. Make sure the database is in the right state

```
npx ts-node server/src/seed/ci-seed.ts
```

4. Run the tests

```
npm run test
```

Running with ui:

```
npm run test -- --ui
```

(Quick tip for writing tests: Check [Playwright
codegen](https://playwright.dev/docs/codegen-intro).)

## Deployment

Deployment happens through [GitHub
Actions](https://github.com/features/actions). See the specified
[workflows](.github/workflows) for more details.

**IMPORTANT: Workflows responsible for deployment do not cover database
migrations (yet). In the event of a schema change `npx prisma migrate deploy`
must be manually run against the production database.**

E2E and unit tests are also automatically run through GitHub Actions.
