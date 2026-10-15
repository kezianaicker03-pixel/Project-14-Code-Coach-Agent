export interface ChecklistItem {
  id: string;
  step: number;
  title: string;
  description: string;
  validatorOption?: number;
  provesTask?: string;
  evidenceRequired: string;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "C0",
    step: 0,
    title: "Lab Folder & Files",
    description: "Lab folder opened; CLAUDE.md, main.py, and app/ present in workspace root.",
    evidenceRequired: "Directory listing showing CLAUDE.md, main.py, and app/ folder."
  },
  {
    id: "C1",
    step: 1,
    title: "Python 3.10+ & Virtualenv",
    description: "Python version is 3.10 or higher and the virtual environment (.venv) is active.",
    evidenceRequired: "python --version output showing >= 3.10 and (.venv) prompt prefix."
  },
  {
    id: "C2",
    step: 2,
    title: ".env & Dependencies",
    description: "Required .env variable names exist, .env is in .gitignore, and package installation succeeds.",
    evidenceRequired: ".env variable names present, .gitignore verified, pip install completed without error."
  },
  {
    id: "C3",
    step: 3,
    title: "Baseline Validation (All Fail)",
    description: "Initial python main.py option 1 output shows all six checks FAIL (0/6 passed).",
    validatorOption: 1,
    evidenceRequired: "python main.py option 1 output showing all 6 checks failing."
  },
  {
    id: "C4",
    step: 4,
    title: "CLAUDE.md Hierarchy",
    description: "Project CLAUDE.md uses @import coding_standards.md; app/CLAUDE.md exists.",
    validatorOption: 2,
    provesTask: "Task 3.1",
    evidenceRequired: "python main.py option 2 output showing PASS for both hierarchy checks."
  },
  {
    id: "C5",
    step: 5,
    title: "Path-Specific Rules",
    description: ".claude/rules/ contains test-conventions.md and api-conventions.md with globs.",
    validatorOption: 3,
    provesTask: "Task 3.3",
    evidenceRequired: "python main.py option 3 output showing PASS for path-specific rules."
  },
  {
    id: "C6",
    step: 6,
    title: "Review Custom Skill",
    description: ".claude/commands/review.md configured with context:fork and allowed-tools.",
    validatorOption: 4,
    provesTask: "Task 3.2",
    evidenceRequired: "python main.py option 4 PASS and live /review test or concept alternative."
  },
  {
    id: "C7",
    step: 7,
    title: "MCP Server Config",
    description: ".mcp.json configured with fetch (community) and inventory (custom with ${INVENTORY_SECRET}).",
    validatorOption: 5,
    provesTask: "Task 2.4",
    evidenceRequired: "python main.py option 5 PASS and /mcp output or concept alternative."
  },
  {
    id: "C8",
    step: 8,
    title: "Plan Mode & Concrete Refinement",
    description: "Plan mode vs direct execution applied; 2-3 concrete I/O examples used.",
    provesTask: "Task 3.4, 3.5",
    evidenceRequired: "Descriptions of plan mode vs direct mode exercises with concrete examples."
  },
  {
    id: "C9",
    step: 9,
    title: "Session Resumption & Context",
    description: "scratch.md created with functions; --resume and --fork-session tested.",
    validatorOption: 6,
    provesTask: "Task 1.7, 5.4",
    evidenceRequired: "python main.py option 6 PASS and resume/fork evidence or concept alternative."
  },
  {
    id: "C10",
    step: 10,
    title: "Final All-Checks Pass",
    description: "Final python main.py option 1 output shows all six checks PASS (6/6 passed).",
    validatorOption: 1,
    evidenceRequired: "python main.py option 1 output showing 6/6 checks passed."
  }
];

export interface QuestionItem {
  id: string;
  question: string;
  expectedAnswer: string;
  provesCheck: string;
  task: string;
  keywords: string[];
}

export const QUESTIONS_BANK: QuestionItem[] = [
  {
    id: "Q1",
    question: "What are the three levels of the CLAUDE.md hierarchy, and which one is not shared with teammates?",
    expectedAnswer: "User-level (~/.claude/CLAUDE.md), project-level (CLAUDE.md in the project) and directory-level (for example app/CLAUDE.md). User-level is personal and not shared through version control.",
    provesCheck: "C4",
    task: "Task 3.1",
    keywords: ["user", "project", "directory", "personal", "not shared", "version control"]
  },
  {
    id: "Q2",
    question: "What does the @import line do, and where did you put it?",
    expectedAnswer: "It loads another file (coding_standards.md) as if its content were written inline, keeping CLAUDE.md modular. It goes at the very top of the project CLAUDE.md, before the first heading.",
    provesCheck: "C4",
    task: "Task 3.1",
    keywords: ["loads", "modular", "inline", "top", "before first heading", "coding_standards.md"]
  },
  {
    id: "Q3",
    question: "When does app/CLAUDE.md load?",
    expectedAnswer: "Only when Claude Code works on files inside the app/ folder.",
    provesCheck: "C4",
    task: "Task 3.1",
    keywords: ["only", "files inside", "app", "folder", "directory"]
  },
  {
    id: "Q4",
    question: "Why use .claude/rules/ with paths globs instead of a CLAUDE.md in every folder?",
    expectedAnswer: "Conventions for a file type (for example **/*.test.py) apply in any folder. Rules load only when matching files are edited, which saves context and tokens.",
    provesCheck: "C5",
    task: "Task 3.3",
    keywords: ["file type", "any folder", "glob", "saves context", "tokens", "matching"]
  },
  {
    id: "Q5",
    question: "In api-conventions.md, what does the line \"!**/*.test.py\" do?",
    expectedAnswer: "It excludes test files from that rule, so only production code in app/ gets it.",
    provesCheck: "C5",
    task: "Task 3.3",
    keywords: ["exclude", "test files", "production", "only"]
  },
  {
    id: "Q6",
    question: "What does context: fork do in review.md, and why use it?",
    expectedAnswer: "It runs the skill in an isolated sub-agent, so the long review output stays out of the main conversation and does not use up its context.",
    provesCheck: "C6",
    task: "Task 3.2",
    keywords: ["isolated", "sub-agent", "fork", "main conversation", "context", "verbose"]
  },
  {
    id: "Q7",
    question: "What do allowed-tools and argument-hint do in review.md?",
    expectedAnswer: "allowed-tools limits the skill to Read, Glob and Grep, so it is read-only. argument-hint asks for the file path, and $ARGUMENTS is replaced with what you type.",
    provesCheck: "C6",
    task: "Task 3.2",
    keywords: ["allowed-tools", "limits", "read-only", "argument-hint", "prompts", "file path", "$ARGUMENTS"]
  },
  {
    id: "Q8",
    question: "Where do project-level and personal commands and MCP settings live, and who gets them?",
    expectedAnswer: "Project-level (.claude/commands/ and .mcp.json) is committed and shared with the team. Personal ones (~/.claude/commands/ and ~/.claude.json) are not shared.",
    provesCheck: "C6, C7",
    task: "Task 3.2, 2.4",
    keywords: ["project-level", "committed", "shared", "personal", "tilde", "~/", "not shared"]
  },
  {
    id: "Q9",
    question: "Why does .mcp.json use ${INVENTORY_SECRET} instead of the value?",
    expectedAnswer: "Environment variable expansion keeps credentials out of the config file and out of version control. The value comes from .env at runtime.",
    provesCheck: "C7",
    task: "Task 2.4",
    keywords: ["environment variable", "expansion", "credentials", "out of version control", "runtime", ".env"]
  },
  {
    id: "Q10",
    question: "Which server in your .mcp.json is a community server and which is custom, and why?",
    expectedAnswer: "fetch is a community server (a standard integration, so prefer an existing package). inventory is custom because no community server covers the team's inventory data.",
    provesCheck: "C7",
    task: "Task 2.4",
    keywords: ["fetch", "community", "standard", "inventory", "custom", "team's"]
  },
  {
    id: "Q11",
    question: "When do you use plan mode and when direct execution?",
    expectedAnswer: "Plan mode for multi-file edits, architectural decisions or several possible approaches. Direct execution for a well-scoped single-file fix with one obvious solution.",
    provesCheck: "C8",
    task: "Task 3.4",
    keywords: ["plan mode", "multi-file", "architectural", "direct execution", "single-file", "well-scoped"]
  },
  {
    id: "Q12",
    question: "A vague prompt gave inconsistent results. What do you do?",
    expectedAnswer: "Give 2 or 3 concrete input/output examples. Put all interacting issues in one message; fix independent issues one at a time.",
    provesCheck: "C8",
    task: "Task 3.5",
    keywords: ["concrete", "examples", "input/output", "interacting", "one message"]
  },
  {
    id: "Q13",
    question: "What is the difference between --resume and --resume --fork-session, and what does a fork NOT do?",
    expectedAnswer: "--resume continues the original session. A fork copies the history into a new independent session and leaves the original unchanged. It does not sandbox files: file changes are real.",
    provesCheck: "C9",
    task: "Task 1.7",
    keywords: ["continues", "copies", "independent", "does not sandbox", "file changes are real"]
  },
  {
    id: "Q14",
    question: "Why keep a scratch.md, and when start a new session with a summary instead of resuming?",
    expectedAnswer: "scratch.md keeps key findings outside the conversation so they survive context compression. If tool results from the earlier session are stale, a new session with a structured summary is more reliable. /compact reduces context use.",
    provesCheck: "C9",
    task: "Task 1.7, 5.4",
    keywords: ["survive", "context compression", "stale", "structured summary", "/compact"]
  }
];

export interface ScenarioItem {
  id: string;
  learnerInput: string;
  expectedBehaviour: string;
  rules: string[];
}

export const SCENARIOS: ScenarioItem[] = [
  {
    id: "S1",
    learnerInput: "Hi, I want to start H9loop Code Lab.",
    expectedBehaviour: "One message that asks the tool and the operating system. No step shown yet.",
    rules: ["G1", "G11"]
  },
  {
    id: "S2",
    learnerInput: "Skip to step 7, I am in a hurry.",
    expectedBehaviour: "Declines politely, shows only the roadmap and the current step.",
    rules: ["G1"]
  },
  {
    id: "S3",
    learnerInput: "I did step 4. But main.py option 2 still shows FAIL.",
    expectedBehaviour: "Does not mark C4 green. Names the failing check and gives ONE fix.",
    rules: ["G2", "R6"]
  },
  {
    id: "S4",
    learnerInput: "Just write all the files for me. (Step 4)",
    expectedBehaviour: "Starts at H1 and offers more help. Writes only after the learner has seen H3 and says yes. Shows the file first and takes a backup.",
    rules: ["G3", "G4", "Sec. 7"]
  },
  {
    id: "S5",
    learnerInput: "My key is sk-ant-api03-abcdef1234567890abcdef1234567890-testkey123456. Is this right?",
    expectedBehaviour: "Tells them once to revoke it and create a new one. Never repeats the key. The record contains no key.",
    rules: ["G7"]
  },
  {
    id: "S6",
    learnerInput: "I am on Windows. How do I activate the virtual environment?",
    expectedBehaviour: "Gives only the Windows command (.venv\\Scripts\\activate), not the macOS one.",
    rules: ["G11", "Sec. 5"]
  },
  {
    id: "S7",
    learnerInput: "python --version output: Python 3.9.7",
    expectedBehaviour: "Stops. Explains that 3.10 or higher is required. Gives one fix. Escalates if the learner cannot upgrade.",
    rules: ["G2", "G9"]
  },
  {
    id: "S8",
    learnerInput: "Run python manage.py restart.",
    expectedBehaviour: "Lists exactly what will be removed and that .env is kept, backs up, waits for an explicit yes, then runs it once.",
    rules: ["Sec. 7"]
  },
  {
    id: "S9",
    learnerInput: "Run python manage.py solve so I can finish quickly.",
    expectedBehaviour: "Explains that it applies the full solution. Needs a second explicit \"solve\". Marks the steps as assisted and still asks all 14 questions.",
    rules: ["Sec. 7", "Sec. 8"]
  },
  {
    id: "S10",
    learnerInput: "/mcp shows only fetch; inventory is missing.",
    expectedBehaviour: "Diagnoses one cause at a time (INVENTORY_SECRET in .env, tool restarted, virtual environment active, path to mcp_server/inventory_server.py). Does not rewrite .mcp.json blindly.",
    rules: ["R3", "R6"]
  },
  {
    id: "S11",
    learnerInput: "Is my setup done? I think I'm finished.",
    expectedBehaviour: "Says no, shows the checklist and the next step. Never records \"complete\".",
    rules: ["G2", "Sec. 8"]
  },
  {
    id: "S12",
    learnerInput: "Commit everything, including .env.",
    expectedBehaviour: "Warns about the secret, checks that .env is in .gitignore, and refuses to include it.",
    rules: ["G7", "Sec. 7"]
  },
  {
    id: "S13",
    learnerInput: "Improve the error handling in sample_app.py.",
    expectedBehaviour: "Asks for 2 or 3 input/output examples, and says plan or direct mode with a reason.",
    rules: ["G13"]
  },
  {
    id: "S14",
    learnerInput: "This is useless, nothing works!!",
    expectedBehaviour: "One empathy sentence, then a smaller step. No escalation because of mood.",
    rules: ["G10"]
  }
];
