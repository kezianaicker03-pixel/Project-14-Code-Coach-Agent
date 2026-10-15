# H9loop Code Coach — Question Bank (Q1 to Q14)

After Step 10 is green, the coach asks these questions one at a time and in order, grading each answer against the authoritative expected answer below.

| # | Question | Expected Answer | Proves Checklist Item | Exam Task |
|---|---|---|---|---|
| **Q1** | What are the three levels of the CLAUDE.md hierarchy, and which one is not shared with teammates? | User-level (~/.claude/CLAUDE.md), project-level (CLAUDE.md in the project) and directory-level (for example app/CLAUDE.md). User-level is personal and not shared through version control. | C4 | Task 3.1 |
| **Q2** | What does the @import line do, and where did you put it? | It loads another file (coding_standards.md) as if its content were written inline, keeping CLAUDE.md modular. It goes at the very top of the project CLAUDE.md, before the first heading. | C4 | Task 3.1 |
| **Q3** | When does app/CLAUDE.md load? | Only when Claude Code works on files inside the app/ folder. | C4 | Task 3.1 |
| **Q4** | Why use .claude/rules/ with paths globs instead of a CLAUDE.md in every folder? | Conventions for a file type (for example **/*.test.py) apply in any folder. Rules load only when matching files are edited, which saves context and tokens. | C5 | Task 3.3 |
| **Q5** | In api-conventions.md, what does the line "!**/*.test.py" do? | It excludes test files from that rule, so only production code in app/ gets it. | C5 | Task 3.3 |
| **Q6** | What does context: fork do in review.md, and why use it? | It runs the skill in an isolated sub-agent, so the long review output stays out of the main conversation and does not use up its context. | C6 | Task 3.2 |
| **Q7** | What do allowed-tools and argument-hint do in review.md? | allowed-tools limits the skill to Read, Glob and Grep, so it is read-only. argument-hint asks for the file path, and $ARGUMENTS is replaced with what you type. | C6 | Task 3.2 |
| **Q8** | Where do project-level and personal commands and MCP settings live, and who gets them? | Project-level (.claude/commands/ and .mcp.json) is committed and shared with the team. Personal ones (~/.claude/commands/ and ~/.claude.json) are not shared. | C6, C7 | Task 3.2, 2.4 |
| **Q9** | Why does .mcp.json use ${INVENTORY_SECRET} instead of the value? | Environment variable expansion keeps credentials out of the config file and out of version control. The value comes from .env at runtime. | C7 | Task 2.4 |
| **Q10** | Which server in your .mcp.json is a community server and which is custom, and why? | fetch is a community server (a standard integration, so prefer an existing package). inventory is custom because no community server covers the team's inventory data. | C7 | Task 2.4 |
| **Q11** | When do you use plan mode and when direct execution? | Plan mode for multi-file edits, architectural decisions or several possible approaches. Direct execution for a well-scoped single-file fix with one obvious solution. | C8 | Task 3.4 |
| **Q12** | A vague prompt gave inconsistent results. What do you do? | Give 2 or 3 concrete input/output examples. Put all interacting issues in one message; fix independent issues one at a time. | C8 | Task 3.5 |
| **Q13** | What is the difference between --resume and --resume --fork-session, and what does a fork NOT do? | --resume continues the original session. A fork copies the history into a new independent session and leaves the original unchanged. It does not sandbox files: file changes are real. | C9 | Task 1.7 |
| **Q14** | Why keep a scratch.md, and when start a new session with a summary instead of resuming? | scratch.md keeps key findings outside the conversation so they survive context compression. If tool results from the earlier session are stale, a new session with a structured summary is more reliable. /compact reduces context use. | C9 | Task 1.7, 5.4 |

## Grading Rules:
1. First incorrect attempt: Provide a guiding hint without revealing the direct answer. Increment `wrong_answers[Qn]` by 1.
2. Second incorrect attempt: Explain the correct answer clearly, increment `wrong_answers[Qn]` to 2, and queue the question for reassessment at the end of Q14.
3. Mark question CORRECT only when the learner subsequently demonstrates the required understanding.
