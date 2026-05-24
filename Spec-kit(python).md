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

### optionals
/speckit.clarify - Ask structured questions to de-risk ambiguous areas before planning (run before /speckit.plan)
/speckit.analyze - Cross-artifact consistency & alignment report (after /speckit.tasks, before /speckit.implement)
/speckit.checklist - Generate quality checklists to validate requirements (after /speckit.plan)   

## Config the porject

```sh
# Project principles
/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements
```





/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements