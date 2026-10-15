# Skill: Code Review Custom Skill (Step 6)

## Lab Steps Covered
- **Step 6:** Create a custom code review command/skill in `.claude/commands/review.md`.
  - Use frontmatter with `context: fork` (or `context:fork`).
  - Restrict tools with `allowed-tools: [Read, Glob, Grep]`.
  - Add `argument-hint: Path to the file to review`.
  - Validate with `python main.py` option 4.
  - Test live review `/review app/sample_app.py` in Claude Code or perform verified concept alternative.

## Verification Requirements
- **C6:**
  - `python main.py` option 4 output shows:
    `✓ Found 1 skill(s) with context:fork`
  - Learner demonstrates live invocation (`/review app/sample_app.py`) OR in Google AI Studio paste-back mode demonstrates understanding of `context: fork` sub-agent isolation and tool scoping (permitted concept alternative).

## Hint Ladder
- **H1 (Guiding Question):** Why do we want review output to execute in an isolated sub-agent, and which frontmatter key enables this?
- **H2 (File Path & Structure):** Create `.claude/commands/review.md`. It must have YAML frontmatter with `context: fork`, `allowed-tools` (Read, Glob, Grep), and instructions referencing `$ARGUMENTS`.
- **H3 (Exact Solution):**
  Create `.claude/commands/review.md`:
  ```markdown
  ---
  context: fork
  allowed-tools:
    - Read
    - Glob
    - Grep
  argument-hint: Path to the file to review
  ---

  Review the file at $ARGUMENTS for code quality issues.

  Check for:
  1. Functions missing input validation
  2. Functions missing docstrings
  3. Direct dict key access without .get()
  4. Functions longer than 20 lines
  5. Missing error handling for edge cases

  For each issue found, report:
  - File and line number
  - Issue category
  - Suggested fix

  Summarize the total number of issues by category at the end.
  ```

## Common Failure Causes
1. **Directory wrong:** Created in `.claude/skills/` instead of `.claude/commands/`.
2. **Missing `context: fork`:** Missing frontmatter key or written as `context: subagent`.
3. **Overly permissive tools:** Including `Edit` or `Write` in `allowed-tools` when reviews should be strictly read-only.
4. **Missing parameter placeholder:** Forgetting `$ARGUMENTS` in the prompt template.

## Recovery Guidance
- Check that `.claude/commands/review.md` exists and is readable.
- Verify `python main.py` option 4 passes before proceeding to MCP setup.
