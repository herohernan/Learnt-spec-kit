# Spec-kit (Python)

## References

### Oficial
* [Github](https://github.com/github/spec-kit)

* [MicrosoftLearnt](https://learn.microsoft.com/es-es/training/modules/spec-driven-development-github-spec-kit-enterprise-developers/)

### Youtube Course
* [NetNinja](https://www.youtube.com/playlist?ist=PL4cUxeGkcC9h9RbDpG8ZModUzwy45tLjb)

## Installation on windows

```sh
# Install UV
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Using UV, install spec-kit
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.8.13
```

## Initialize a project

```sh
# init a new spec-kit project integrated with copilot
cd <ProjectPath>
specify init <ProjectName> --integration copilot
cd <ProjectName>

#Note: for a existing project we use this instead
specify init --here
```

## Slash commands

### mandatory
/speckit.constitution - Establish project principles
/speckit.specify - Create baseline specification
/speckit.plan - Create implementation plan
/speckit.tasks - Generate actionable tasks
/speckit.implement - Execute implementation 

| Command                  | Agent Skill            | Description                                                                |
| ------------------------ | ---------------------- | -------------------------------------------------------------------------- |
| `/speckit.constitution`  | `speckit-constitution` | Create or update project governing principles and development guidelines   |
| `/speckit.specify`       | `speckit-specify`      | Define what you want to build (requirements and user stories)              |
| `/speckit.plan`          | `speckit-plan`         | Create technical implementation plans with your chosen tech stack          |
| `/speckit.tasks`         | `speckit-tasks`        | Generate actionable task lists for implementation                          |
| `/speckit.taskstoissues` | `speckit-taskstoissues`| Convert generated task lists into GitHub issues for tracking and execution |
| `/speckit.implement`     | `speckit-implement`    | Execute all tasks to build the feature according to the plan               |

### optionals
/speckit.clarify - Ask structured questions to de-risk ambiguous areas before planning (run before /speckit.plan)
/speckit.analyze - Cross-artifact consistency & alignment report (after /speckit.tasks, before /speckit.implement)
/speckit.checklist - Generate quality checklists to validate requirements (after /speckit.plan)   

| Command              | Agent Skill            | Description                                                                                                                          |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/speckit.clarify`   | `speckit-clarify`      | Clarify underspecified areas (recommended before `/speckit.plan`; formerly `/quizme`)                                                |
| `/speckit.analyze`   | `speckit-analyze`      | Cross-artifact consistency & coverage analysis (run after `/speckit.tasks`, before `/speckit.implement`)                             |
| `/speckit.checklist` | `speckit-checklist`    | Generate custom quality checklists that validate requirements completeness, clarity, and consistency (like "unit tests for English") |

## Config the porject

```sh
# Project principles
/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements

# Specify what do we want to build (Create spec)
/speckit.specify Build an application that can help me organize my photos in separate photo albums. Albums are grouped by date and can be re-organized by dragging and dropping on the main page. Albums are never in other nested albums. Within each album, photos are previewed in a tile-like interface.

# Create a technical implementation plan
/speckit.plan The application uses Vite with minimal number of libraries. Use vanilla HTML, CSS, and JavaScript as much as possible. Images are not uploaded anywhere and metadata is stored in a local SQLite database.

# Break down into task
/speckit.tasks

# Execute implementation
/speckit.tasks
```