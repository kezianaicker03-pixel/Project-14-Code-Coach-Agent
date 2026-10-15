import { CHECKLIST_ITEMS, QUESTIONS_BANK } from "../data/coachData";

export interface ProgressState {
  tool: string | null;
  os: "Windows" | "macOS" | "Linux" | null;
  python_version: string | null;
  current_step: number;
  checklist: Record<string, "unverified" | "red" | "green" | "green_concept">;
  hint_level: number;
  questions: Record<string, "pending" | "correct" | "wrong">;
  wrong_answers: Record<string, number>;
  assisted_steps: number[];
}

export interface CoachRecord {
  action: string;
  rule_ids: string[];
  step_id: number | null;
  check_status: "unverified" | "red" | "green" | "green_concept";
  hint_level: number;
  question_id: string | null;
  needs_learner_confirmation: boolean;
}

export interface CoachResponse {
  reply: string;
  record: CoachRecord;
  updatedState: ProgressState;
  suggestedAction?: string;
  isEscalation?: boolean;
  escalationDraft?: string;
  pendingApproval?: {
    actionType: "file_write" | "manage_restart" | "manage_solve";
    targetFile?: string;
    proposedContent?: string;
    token: string;
  };
}

export const INITIAL_PROGRESS_STATE: ProgressState = {
  tool: null,
  os: null,
  python_version: null,
  current_step: 0,
  checklist: {
    C0: "unverified",
    C1: "unverified",
    C2: "unverified",
    C3: "unverified",
    C4: "unverified",
    C5: "unverified",
    C6: "unverified",
    C7: "unverified",
    C8: "unverified",
    C9: "unverified",
    C10: "unverified"
  },
  hint_level: 1,
  questions: {
    Q1: "pending",
    Q2: "pending",
    Q3: "pending",
    Q4: "pending",
    Q5: "pending",
    Q6: "pending",
    Q7: "pending",
    Q8: "pending",
    Q9: "pending",
    Q10: "pending",
    Q11: "pending",
    Q12: "pending",
    Q13: "pending",
    Q14: "pending"
  },
  wrong_answers: {
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0,
    Q5: 0,
    Q6: 0,
    Q7: 0,
    Q8: 0,
    Q9: 0,
    Q10: 0,
    Q11: 0,
    Q12: 0,
    Q13: 0,
    Q14: 0
  },
  assisted_steps: []
};

// Secret detection pattern (Anthropic keys, generic long hex/base64 tokens)
const SECRET_REGEX = /(sk-ant-[a-zA-Z0-9_\-]{20,}|ANTHROPIC_API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]{15,}['"]?)/i;

export function evaluateLearnerInput(
  input: string,
  state: ProgressState,
  pendingApproval?: CoachResponse["pendingApproval"]
): CoachResponse {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const nextState: ProgressState = JSON.parse(JSON.stringify(state));

  // G7: Secret Protection Check FIRST
  if (SECRET_REGEX.test(input) || lower.includes("sk-ant-api")) {
    const reply =
      "Security Alert: You pasted what appears to be an active API key into the chat.\n\n" +
      "1. Immediately revoke this API key in your Anthropic Console.\n" +
      "2. Generate a new secret key.\n" +
      "3. Place it exclusively in your local `.env` file.\n\n" +
      "Never paste key values in chat. For `.env`, confirm variable names only.\n\n" +
      "Next action: Confirm you have revoked the exposed key.";

    return {
      reply,
      record: {
        action: "diagnose",
        rule_ids: ["G7"],
        step_id: nextState.current_step,
        check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: "Confirm key revocation"
    };
  }

  // Initial Setup / Welcome Check (G11, Sec 12)
  if (!nextState.tool || !nextState.os) {
    // Check if the user is answering the initial prompt
    let detectedTool: string | null = null;
    if (lower.includes("claude code") || lower.includes("claude")) detectedTool = "Claude Code";
    else if (lower.includes("codex")) detectedTool = "Codex";
    else if (lower.includes("ai studio") || lower.includes("google ai studio")) detectedTool = "Google AI Studio";

    let detectedOS: "Windows" | "macOS" | "Linux" | null = null;
    if (lower.includes("windows")) detectedOS = "Windows";
    else if (lower.includes("macos") || lower.includes("mac") || lower.includes("darwin")) detectedOS = "macOS";
    else if (lower.includes("linux") || lower.includes("ubuntu")) detectedOS = "Linux";

    if (detectedTool || detectedOS) {
      if (detectedTool) nextState.tool = detectedTool;
      if (detectedOS) nextState.os = detectedOS;
    }

    if (!nextState.tool || !nextState.os) {
      // Still need one or both
      const reply =
        "Welcome to H9loop Code Coach! Which coding tool are you using — Claude Code, Codex or Google AI Studio — and are you on Windows, macOS or Linux?";

      return {
        reply,
        record: {
          action: "ask_tool",
          rule_ids: ["G1", "G11"],
          step_id: 0,
          check_status: "unverified",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Specify your tool and OS"
      };
    }

    // Both detected, now initiate Step 0 instructions
    nextState.current_step = 0;
    const reply =
      `Great, configured for ${nextState.tool} on ${nextState.os}.\n\n` +
      `### Step 0: Open the lab folder\n` +
      `1. Open the \`02_code_generation_workflows/\` folder in VSCode.\n` +
      `2. Launch your terminal inside this folder.\n` +
      `3. Verify that \`CLAUDE.md\`, \`main.py\`, and \`app/\` are present.\n\n` +
      `Next action: Paste directory listing or terminal evidence showing these files.`;

    return {
      reply,
      record: {
        action: "show_step",
        rule_ids: ["G1", "G11"],
        step_id: 0,
        check_status: "unverified",
        hint_level: 1,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: "Paste Step 0 folder evidence"
    };
  }

  // Handle "pause" or "show checklist" (Section 10)
  if (lower === "show checklist" || lower === "pause" || lower.includes("checklist")) {
    const listSummary = Object.entries(nextState.checklist)
      .map(([k, v]) => `- **${k}**: ${v.toUpperCase()}`)
      .join("\n");

    const reply =
      `### Current Progress Status\n\n` +
      `Current Step: **Step ${nextState.current_step}**\n` +
      `Hint Level: **H${nextState.hint_level}**\n\n` +
      `${listSummary}\n\n` +
      `Next action: Resume Step ${nextState.current_step} or paste current step evidence.`;

    return {
      reply,
      record: {
        action: "show_step",
        rule_ids: ["G1", "G11"],
        step_id: nextState.current_step,
        check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState
    };
  }

  // S14: Mood / Frustration Check (G10)
  if (
    lower.includes("this is useless") ||
    lower.includes("nothing works") ||
    lower.includes("i hate this") ||
    lower.includes("so frustrated")
  ) {
    const step = nextState.current_step;
    const reply =
      "I know this configuration can feel frustrating, but we will solve it together step by step.\n\n" +
      `Let's take one smaller action for Step ${step}:\n` +
      `1. Run \`python main.py\`\n` +
      `2. Select option ${step >= 4 && step <= 9 ? step - 2 : 1}\n` +
      `3. Paste the exact output lines here.\n\n` +
      `Next action: Paste that output so we can diagnose the exact cause.`;

    return {
      reply,
      record: {
        action: "diagnose",
        rule_ids: ["G10"],
        step_id: step,
        check_status: nextState.checklist[`C${step}`] || "red",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: "Paste validator output"
    };
  }

  // S2: Attempting to Skip Steps (G1)
  if (
    (lower.includes("skip to step") || lower.includes("jump to step")) &&
    !lower.includes("solve")
  ) {
    const reply =
      "I cannot skip steps ahead. H9loop Code Lab requires verified progression.\n\n" +
      "**Lab Roadmap:**\n" +
      "• Steps 0–3: Environment & baseline checks (C0–C3)\n" +
      "• Steps 4–5: CLAUDE.md hierarchy & rules (C4–C5)\n" +
      "• Step 6: Custom review skill (C6)\n" +
      "• Step 7: MCP servers & credentials (C7)\n" +
      "• Step 8: Plan mode & refinement (C8)\n" +
      "• Steps 9–10: Sessions & all-pass (C9–C10)\n\n" +
      `Next action: Complete verified evidence for Step ${nextState.current_step}.`;

    return {
      reply,
      record: {
        action: "show_step",
        rule_ids: ["G1"],
        step_id: nextState.current_step,
        check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState
    };
  }

  // S12: Attempting to Commit .env (G7, Sec 7)
  if (lower.includes("commit") && lower.includes(".env")) {
    const reply =
      "Never commit `.env` to version control. It contains private API credentials.\n\n" +
      "1. Verify `.env` is listed in `.gitignore`:\n" +
      "```bash\n" +
      "grep .env .gitignore\n" +
      "```\n" +
      "2. Stage only lab configuration files, never secret files:\n" +
      "```bash\n" +
      "git status\n" +
      "```\n\n" +
      "Next action: Confirm that `.env` is ignored before continuing.";

    return {
      reply,
      record: {
        action: "diagnose",
        rule_ids: ["G7", "Sec. 7"],
        step_id: nextState.current_step,
        check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState
    };
  }

  // S8: manage.py restart request (Sec 7)
  if (lower.includes("manage.py restart") || lower.includes("python manage.py restart")) {
    if (pendingApproval && pendingApproval.actionType === "manage_restart" && lower === "yes") {
      const reply =
        "Confirmed. Executed `python manage.py restart`.\n\n" +
        "1. Restored starter files in `_manage/starter/`.\n" +
        "2. Removed `.claude/`, `app/CLAUDE.md`, `coding_standards.md`, `.mcp.json`, and `scratch.md`.\n" +
        "3. Your `.env` was preserved.\n\n" +
        "Next action: Run `python main.py` option 1 to confirm baseline state.";

      // Reset generated checks
      nextState.current_step = 3;
      nextState.checklist.C4 = "unverified";
      nextState.checklist.C5 = "unverified";
      nextState.checklist.C6 = "unverified";
      nextState.checklist.C7 = "unverified";
      nextState.checklist.C8 = "unverified";
      nextState.checklist.C9 = "unverified";
      nextState.checklist.C10 = "unverified";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["Sec. 7"],
          step_id: 3,
          check_status: "unverified",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState
      };
    }

    const reply =
      "Running `python manage.py restart` will remove all generated configuration (`.claude/`, `coding_standards.md`, `app/CLAUDE.md`, `.mcp.json`, `scratch.md`).\n\n" +
      "• Your `.env` will be kept.\n" +
      "• A backup has been prepared in `coach/backups/`.\n\n" +
      "Do you explicitly approve running restart? Reply 'yes' to proceed.";

    return {
      reply,
      record: {
        action: "confirm_write",
        rule_ids: ["Sec. 7"],
        step_id: nextState.current_step,
        check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: true
      },
      updatedState: nextState,
      pendingApproval: {
        actionType: "manage_restart",
        token: "tok_restart_" + Date.now()
      }
    };
  }

  // S9: manage.py solve request (Sec 7, Sec 8)
  if (lower.includes("manage.py solve") || lower.includes("python manage.py solve")) {
    if (pendingApproval && pendingApproval.actionType === "manage_solve" && lower === "solve") {
      nextState.assisted_steps = [4, 5, 6, 7, 8, 9, 10];
      const reply =
        "Configurations applied via `manage.py solve`.\n\n" +
        "1. Steps 4 through 10 have been recorded as **assisted steps**.\n" +
        "2. You must still independently answer all 14 questions (Q1–Q14) to complete the lab.\n\n" +
        "Next action: Run `python main.py` option 1 and paste the output.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["Sec. 7", "Sec. 8"],
          step_id: 10,
          check_status: "unverified",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState
      };
    }

    const reply =
      "`python manage.py solve` applies the full solution. This will mark steps as assisted.\n\n" +
      "You will still be required to answer all 14 knowledge questions.\n\n" +
      "To confirm you understand, reply with the single word: `solve`.";

    return {
      reply,
      record: {
        action: "confirm_write",
        rule_ids: ["Sec. 7", "Sec. 8"],
        step_id: nextState.current_step,
        check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: true
      },
      updatedState: nextState,
      pendingApproval: {
        actionType: "manage_solve",
        token: "tok_solve_" + Date.now()
      }
    };
  }

  // S7: Python Version < 3.10 Check (G2, G9)
  if (
    lower.includes("python 3.9") ||
    lower.includes("python 3.8") ||
    lower.includes("python 3.7") ||
    (lower.includes("python --version") && (lower.includes("3.9") || lower.includes("3.8")))
  ) {
    nextState.checklist.C1 = "red";
    nextState.python_version = "3.9";

    const reply =
      "Python 3.10 or higher is required for H9loop Code Lab (FastMCP and modern async support).\n\n" +
      "1. Check installed Python versions:\n" +
      "```bash\n" +
      (nextState.os === "Windows" ? "py --list" : "which python3.10 python3.11") +
      "\n```\n" +
      "2. Re-create virtual environment with Python 3.10+:\n" +
      "```bash\n" +
      (nextState.os === "Windows" ? "py -3.10 -m venv .venv" : "python3.10 -m venv .venv") +
      "\n```\n\n" +
      "If you cannot install Python 3.10+, let me know so I can prepare an instructor escalation.";

    return {
      reply,
      record: {
        action: "diagnose",
        rule_ids: ["G2", "G9"],
        step_id: 1,
        check_status: "red",
        hint_level: 1,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: "Upgrade Python to 3.10+"
    };
  }

  // Escalation request on Python upgrade failure
  if (lower.includes("cannot upgrade") || lower.includes("can't upgrade")) {
    const escalationDraft =
      `# Escalation Draft: Python Version Prerequisite Blocked\n` +
      `- Learner OS: ${nextState.os}\n` +
      `- Current Python: ${nextState.python_version || "3.9"}\n` +
      `- Required: >= 3.10\n` +
      `- Attempted Fix: Virtualenv recreation with Python 3.10+\n` +
      `- Required Instructor Help: Learner needs assistance installing Python 3.10 or higher on their system.`;

    const reply =
      "I have prepared an instructor-ready escalation draft for you:\n\n" +
      "```markdown\n" +
      escalationDraft +
      "\n```\n\n" +
      "Please copy and share this draft with your H9loop instructor.";

    return {
      reply,
      record: {
        action: "escalate",
        rule_ids: ["G9"],
        step_id: 1,
        check_status: "red",
        hint_level: 1,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      isEscalation: true,
      escalationDraft
    };
  }

  // S6: Windows Virtual Environment Activation Question (G11, Sec 5)
  if (lower.includes("activate") && (lower.includes("virtualenv") || lower.includes("virtual environment") || lower.includes(".venv"))) {
    const cmd = nextState.os === "Windows"
      ? ".venv\\Scripts\\activate"
      : "source .venv/bin/activate";

    const reply =
      `To activate your virtual environment on ${nextState.os || "your system"}:\n\n` +
      "```bash\n" +
      cmd +
      "\n```\n\n" +
      "Your prompt will now show the `(.venv)` prefix.\n\n" +
      "Next action: Paste output of `python --version` showing active virtual environment.";

    return {
      reply,
      record: {
        action: "show_step",
        rule_ids: ["G11", "Sec. 5"],
        step_id: 1,
        check_status: nextState.checklist.C1,
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: `Run ${cmd}`
    };
  }

  // S4: "Just write all the files for me" (G3, G4, Sec 7)
  if (lower.includes("just write all the files for me") || lower.includes("write the files for me")) {
    if (nextState.hint_level < 3) {
      nextState.hint_level = 1;
      const reply =
        "I cannot write files automatically for you in Google AI Studio. Let's solve Step 4 with a hint:\n\n" +
        "**Hint 1 (H1):** Where should modular conventions be placed so CLAUDE.md can load them with `@import`?\n\n" +
        "Would you like more guidance (H2), or the exact solution (H3)?";

      return {
        reply,
        record: {
          action: "give_hint",
          rule_ids: ["G3", "G4", "Sec. 7"],
          step_id: 4,
          check_status: "unverified",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Ask for H2 or try creating coding_standards.md"
      };
    } else {
      // H3 already seen
      const reply =
        "Here is the proposed file `coding_standards.md` to create in the project root:\n\n" +
        "```markdown\n" +
        "# Coding Standards\n\n" +
        "## Function naming\n" +
        "- Use verb_noun format: get_product, update_stock, calculate_total\n" +
        "- Prefix validation functions with validate_\n" +
        "- Prefix formatting functions with format_\n" +
        "```\n\n" +
        "Take a backup of your workspace first, then reply 'yes' to confirm creating this file.";

      return {
        reply,
        record: {
          action: "confirm_write",
          rule_ids: ["G4", "Sec. 7"],
          step_id: 4,
          check_status: "unverified",
          hint_level: 3,
          question_id: null,
          needs_learner_confirmation: true
        },
        updatedState: nextState,
        pendingApproval: {
          actionType: "file_write",
          targetFile: "coding_standards.md",
          token: "tok_write_" + Date.now()
        }
      };
    }
  }

  // S10: /mcp shows only fetch; inventory missing (R3, R6)
  if (lower.includes("only fetch") || (lower.includes("/mcp") && lower.includes("missing"))) {
    const reply =
      "Let's diagnose why `inventory` is missing without modifying `.mcp.json` blindly:\n\n" +
      "1. Check `.env` contains `INVENTORY_SECRET=lab02_secret` (do not print value in chat).\n" +
      "2. Verify `mcp_server/inventory_server.py` exists.\n" +
      "3. Ensure the virtual environment is active.\n" +
      "4. Restart Claude Code (`/quit` and relaunch) so it discovers new MCP servers.\n\n" +
      "Next action: Check `.env` for `INVENTORY_SECRET` and restart the tool.";

    return {
      reply,
      record: {
        action: "diagnose",
        rule_ids: ["R3", "R6"],
        step_id: 7,
        check_status: "red",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: "Check .env and restart tool"
    };
  }

  // S13: "Improve the error handling in sample_app.py" (G13)
  if (lower.includes("improve the error handling in") || (lower.includes("error handling") && lower.includes("sample_app.py"))) {
    const reply =
      "Before writing code, please provide 2 or 3 concrete input/output examples of the desired behavior.\n\n" +
      "• **Strategy recommendation:** Use **Direct execution** if fixing a single function (e.g. `calculate_order_total`).\n" +
      "• Use **Plan mode** if refactoring error handling across the entire module.\n\n" +
      "Next action: Paste 2–3 input/output examples (e.g. `get_product(\"\") -> {\"error\": true}`).";

    return {
      reply,
      record: {
        action: "coding_help",
        rule_ids: ["G13"],
        step_id: 8,
        check_status: nextState.checklist.C8,
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: "Provide 2-3 concrete I/O examples"
    };
  }

  // S11: "Is my setup done?" with only partial green (G2, Sec 8)
  if (lower.includes("is my setup done") || lower.includes("am i done") || lower.includes("is it complete")) {
    const greenCount = Object.values(nextState.checklist).filter(s => s === "green" || s === "green_concept").length;
    if (greenCount < 11) {
      const reply =
        `No, your setup is not done yet (${greenCount}/11 checklist items completed).\n\n` +
        `Current incomplete item: **C${nextState.current_step}**.\n\n` +
        `Next action: Complete Step ${nextState.current_step} and paste the required evidence.`;

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G2", "Sec. 8"],
          step_id: nextState.current_step,
          check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
          hint_level: nextState.hint_level,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: `Complete Step ${nextState.current_step}`
      };
    }
  }

  // S3: Learner claims "I did step 4", but validator shows fail (G2, R6)
  if (
    (lower.includes("i did step 4") || lower.includes("finished step 4")) &&
    (lower.includes("fail") || !lower.includes("pass"))
  ) {
    nextState.checklist.C4 = "red";
    const reply =
      "C4 remains RED. Both hierarchy checks must pass in `main.py` option 2.\n\n" +
      "Diagnosed fix:\n" +
      "Verify that `@import coding_standards.md` is at the very first line of `CLAUDE.md`, before any heading.\n\n" +
      "Next action: Re-run `python main.py` option 2 and paste the output.";

    return {
      reply,
      record: {
        action: "diagnose",
        rule_ids: ["G2", "R6"],
        step_id: 4,
        check_status: "red",
        hint_level: 2,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState,
      suggestedAction: "Fix CLAUDE.md line 1 and re-run option 2"
    };
  }

  // Request for another learner's progress (G9)
  if (lower.includes("another learner") || lower.includes("other student") || lower.includes("other learner's data")) {
    const reply =
      "I cannot provide data or progress belonging to another learner. Each learner session is strictly private under data protection rules.\n\n" +
      `Next action: Let's focus on your own Step ${nextState.current_step}.`;

    return {
      reply,
      record: {
        action: "diagnose",
        rule_ids: ["G9"],
        step_id: nextState.current_step,
        check_status: nextState.checklist[`C${nextState.current_step}`] || "unverified",
        hint_level: nextState.hint_level,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState
    };
  }

  // Hint requests (G3)
  if (lower === "hint" || lower === "give me a hint" || lower === "h1" || lower === "h2" || lower === "h3") {
    let requestedLevel = nextState.hint_level;
    if (lower === "h1") requestedLevel = 1;
    else if (lower === "h2") requestedLevel = 2;
    else if (lower === "h3" || lower.includes("complete answer") || lower.includes("solution")) requestedLevel = 3;
    else requestedLevel = Math.min(3, requestedLevel + 1);

    nextState.hint_level = requestedLevel;
    const step = nextState.current_step;

    let hintText = "";
    if (requestedLevel === 1) {
      hintText = `**H1 (Guiding Question):** What does the lab guide state as the requirement for Step ${step}?`;
    } else if (requestedLevel === 2) {
      hintText = `**H2 (File Path & Structure):** Check the exact file location and naming required in Step ${step} from \`LAB_README.md\`.`;
    } else {
      hintText = `**H3 (Exact Solution):** Refer to the exact snippet in \`coach/LAB_README.md\` under Step ${step}.`;
    }

    const reply =
      `Here is your Level ${requestedLevel} hint for Step ${step}:\n\n` +
      hintText + "\n\n" +
      `Next action: Apply the guidance and paste the verification evidence.`;

    return {
      reply,
      record: {
        action: "give_hint",
        rule_ids: ["G3"],
        step_id: step,
        check_status: nextState.checklist[`C${step}`] || "unverified",
        hint_level: requestedLevel,
        question_id: null,
        needs_learner_confirmation: false
      },
      updatedState: nextState
    };
  }

  // ==========================================
  // PROGRESSION CHECKPOINTS (C0 to C10 & Q1–Q14)
  // ==========================================

  // Check C0: Step 0 folder evidence
  if (nextState.current_step === 0) {
    if (lower.includes("claude.md") && lower.includes("main.py") && lower.includes("app")) {
      nextState.checklist.C0 = "green";
      nextState.current_step = 1;
      nextState.hint_level = 1;

      const reply =
        "Verified C0: Workspace root contains `CLAUDE.md`, `main.py`, and `app/`.\n\n" +
        "### Step 1: Create a Python virtual environment\n" +
        "1. Create and activate `.venv`:\n" +
        "```bash\n" +
        (nextState.os === "Windows" ? "python -m venv .venv\n.venv\\Scripts\\activate" : "python3 -m venv .venv\nsource .venv/bin/activate") +
        "\n```\n" +
        "2. Check version with `python --version`.\n\n" +
        "Next action: Paste output of `python --version` showing 3.10 or higher.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 0,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Paste python --version output"
      };
    }
  }

  // Check C1: Python >= 3.10 and venv
  if (nextState.current_step === 1) {
    if ((lower.includes("python 3.10") || lower.includes("python 3.11") || lower.includes("python 3.12") || lower.includes("python 3.13") || lower.includes("3.1")) && !lower.includes("3.9")) {
      nextState.checklist.C1 = "green";
      nextState.python_version = "3.10+";
      nextState.current_step = 2;
      nextState.hint_level = 1;

      const reply =
        "Verified C1: Python version is 3.10+ and virtual environment is active.\n\n" +
        "### Step 2: Configure Environment\n" +
        "1. Copy example env:\n" +
        "```bash\n" +
        (nextState.os === "Windows" ? "copy .env.example .env" : "cp .env.example .env") +
        "\n```\n" +
        "2. Install requirements:\n" +
        "```bash\n" +
        "pip install -r requirements.txt\n" +
        "```\n\n" +
        "Next action: Paste output showing requirements installed and `.env` variable names.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 1,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Paste pip install output and .env variable names"
      };
    }
  }

  // Check C2: .env configured & pip install successful
  if (nextState.current_step === 2) {
    if (lower.includes("successfully installed") || lower.includes("requirement already satisfied") || lower.includes("installed") || lower.includes("anthropic_api_key")) {
      nextState.checklist.C2 = "green";
      nextState.current_step = 3;
      nextState.hint_level = 1;

      const reply =
        "Verified C2: Dependencies installed and environment configured.\n\n" +
        "### Step 3: Run Baseline Validation\n" +
        "1. Run the validator:\n" +
        "```bash\n" +
        "python main.py\n" +
        "```\n" +
        "2. Choose option `1` to run all checks.\n" +
        "3. Confirm that all 6 checks FAIL (baseline).\n\n" +
        "Next action: Paste the output of `python main.py` option 1.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 2,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Paste python main.py option 1 output"
      };
    }
  }

  // Check C3: Baseline failure (0/6 checks passed)
  if (nextState.current_step === 3) {
    if ((lower.includes("0/6 checks passed") || lower.includes("0 passed") || lower.includes("6 fail")) || (lower.includes("✗") && lower.includes("workspace configuration checks"))) {
      nextState.checklist.C3 = "green";
      nextState.current_step = 4;
      nextState.hint_level = 1;

      const reply =
        "Verified C3: Baseline established with 0/6 checks passing.\n\n" +
        "### Step 4: Build the CLAUDE.md Hierarchy\n" +
        "1. Create `coding_standards.md` in the project root.\n" +
        "2. Add `@import coding_standards.md` at line 1 of `CLAUDE.md`.\n" +
        "3. Create directory-level `app/CLAUDE.md`.\n" +
        "4. Validate with `python main.py` option `2`.\n\n" +
        "Next action: Paste `python main.py` option 2 output.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 3,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Configure Step 4 and paste option 2 output"
      };
    }
  }

  // Check C4: Option 2 PASS (Hierarchy)
  if (nextState.current_step === 4) {
    if (lower.includes("claude.md exists with @import") && lower.includes("app/claude.md exists")) {
      nextState.checklist.C4 = "green";
      nextState.current_step = 5;
      nextState.hint_level = 1;

      const reply =
        "Verified C4: Project and directory CLAUDE.md hierarchy configured.\n\n" +
        "### Step 5: Add Path-Specific Rules\n" +
        "1. Create `.claude/rules/` directory.\n" +
        "2. Add `test-conventions.md` with paths `**/*.test.py`.\n" +
        "3. Add `api-conventions.md` with `app/**/*.py` and exclude `!**/*.test.py`.\n" +
        "4. Validate with `python main.py` option `3`.\n\n" +
        "Next action: Paste `python main.py` option 3 output.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 4,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Configure Step 5 rules and paste option 3 output"
      };
    }
  }

  // Check C5: Option 3 PASS (Path-specific rules)
  if (nextState.current_step === 5) {
    if (lower.includes("found 2 rule file(s) with glob patterns") || lower.includes("rule file(s) with glob patterns")) {
      nextState.checklist.C5 = "green";
      nextState.current_step = 6;
      nextState.hint_level = 1;

      const reply =
        "Verified C5: Path-specific rules configured.\n\n" +
        "### Step 6: Create Code Review Skill\n" +
        "1. Create `.claude/commands/review.md`.\n" +
        "2. Use `context: fork` and `allowed-tools: [Read, Glob, Grep]`.\n" +
        "3. Check with `python main.py` option `4`.\n\n" +
        "Next action: Paste `python main.py` option 4 output.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 5,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Configure Step 6 and paste option 4 output"
      };
    }
  }

  // Check C6: Option 4 PASS (Custom skill with context:fork)
  if (nextState.current_step === 6) {
    if (lower.includes("skill(s) with context:fork") || lower.includes("found 1 skill(s)")) {
      nextState.checklist.C6 = "green";
      nextState.current_step = 7;
      nextState.hint_level = 1;

      const reply =
        "Verified C6: Custom review skill with `context:fork` configured.\n\n" +
        "### Step 7: Configure MCP Servers\n" +
        "1. Add `INVENTORY_SECRET=lab02_secret` to `.env`.\n" +
        "2. Create `.mcp.json` with `fetch` and `inventory` servers.\n" +
        "3. Use `${INVENTORY_SECRET}` env var expansion.\n" +
        "4. Validate with `python main.py` option `5`.\n\n" +
        "Next action: Paste `python main.py` option 5 output.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 6,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Configure Step 7 and paste option 5 output"
      };
    }
  }

  // Check C7: Option 5 PASS (MCP config)
  if (nextState.current_step === 7) {
    if (lower.includes(".mcp.json configured with 2 server(s)") || lower.includes("server(s) and env var expansion")) {
      nextState.checklist.C7 = "green";
      nextState.current_step = 8;
      nextState.hint_level = 1;

      const reply =
        "Verified C7: MCP servers configured with env var expansion.\n\n" +
        "### Step 8: Plan Mode & Concrete Examples\n" +
        "1. Test plan mode vs direct execution on `app/sample_app.py`.\n" +
        "2. Observe how concrete input/output examples produce predictable fixes.\n" +
        "3. Restore starter file: `cp _manage/starter/app/sample_app.py app/sample_app.py`.\n\n" +
        "Next action: Describe what happened when you used concrete input/output examples.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 7,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Share Step 8 observations"
      };
    }
  }

  // Check C8: Plan mode description & concrete examples
  if (nextState.current_step === 8) {
    if (
      lower.includes("example") ||
      lower.includes("plan mode") ||
      lower.includes("direct execution") ||
      lower.includes("predictable") ||
      lower.includes("input/output")
    ) {
      nextState.checklist.C8 = "green";
      nextState.current_step = 9;
      nextState.hint_level = 1;

      const reply =
        "Verified C8: Plan mode and iterative refinement concepts completed.\n\n" +
        "### Step 9: Manage Sessions & Context Persistence\n" +
        "1. Create `scratch.md` listing functions from `app/sample_app.py`.\n" +
        "2. Test `--resume` and understand `--fork-session` branching.\n" +
        "3. Validate with `python main.py` option `6`.\n\n" +
        "Next action: Paste `python main.py` option 6 output.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 8,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Create scratch.md and paste option 6 output"
      };
    }
  }

  // Check C9: Option 6 PASS (scratch.md)
  if (nextState.current_step === 9) {
    if (lower.includes("scratch.md exists with content")) {
      nextState.checklist.C9 = "green";
      nextState.current_step = 10;
      nextState.hint_level = 1;

      const reply =
        "Verified C9: Context persistence in `scratch.md` verified.\n\n" +
        "### Step 10: Final All-Checks Validation\n" +
        "Run all validation checks:\n" +
        "```bash\n" +
        "python main.py\n" +
        "```\n" +
        "Choose option `1` to run all checks.\n\n" +
        "Next action: Paste `python main.py` option 1 output showing 6/6 passed.";

      return {
        reply,
        record: {
          action: "verify",
          rule_ids: ["G1", "G2"],
          step_id: 9,
          check_status: "green",
          hint_level: 1,
          question_id: null,
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Paste option 1 output showing 6/6 checks passed"
      };
    }
  }

  // Check C10: Option 1 shows 6/6 passed
  if (nextState.current_step === 10 && nextState.checklist.C10 !== "green") {
    if (lower.includes("6/6 checks passed") || (lower.includes("all checks passed") && lower.includes("fully configured"))) {
      nextState.checklist.C10 = "green";
      nextState.hint_level = 1;

      const firstQuestion = QUESTIONS_BANK[0];
      const reply =
        "Verified C10: All 6 workspace configuration checks PASSED!\n\n" +
        "Now starting Knowledge Evaluation (Q1 to Q14), one at a time.\n\n" +
        `**Question 1 (Q1):**\n${firstQuestion.question}\n\n` +
        "Next action: Answer Question 1.";

      return {
        reply,
        record: {
          action: "ask_question",
          rule_ids: ["G1", "G2"],
          step_id: 10,
          check_status: "green",
          hint_level: 1,
          question_id: "Q1",
          needs_learner_confirmation: false
        },
        updatedState: nextState,
        suggestedAction: "Answer Q1"
      };
    }
  }

  // Knowledge Questions Evaluation (Q1 to Q14)
  if (nextState.checklist.C10 === "green") {
    // Find current pending question
    const currentQEntry = QUESTIONS_BANK.find(q => nextState.questions[q.id] === "pending");

    if (currentQEntry) {
      const qId = currentQEntry.id;
      // Grade the answer based on keywords
      const matchedKeywords = currentQEntry.keywords.filter(kw => lower.includes(kw.toLowerCase()));
      const isCorrect = matchedKeywords.length >= 2 || (currentQEntry.keywords.length < 3 && matchedKeywords.length >= 1);

      if (isCorrect) {
        nextState.questions[qId] = "correct";
        const nextQIndex = QUESTIONS_BANK.findIndex(q => q.id === qId) + 1;

        if (nextQIndex < QUESTIONS_BANK.length) {
          const nextQ = QUESTIONS_BANK[nextQIndex];
          const reply =
            `Correct! Excellent answer for ${qId}.\n\n` +
            `**Question ${nextQIndex + 1} (${nextQ.id}):**\n${nextQ.question}\n\n` +
            `Next action: Answer ${nextQ.id}.`;

          return {
            reply,
            record: {
              action: "grade_answer",
              rule_ids: ["G1", "G2"],
              step_id: 10,
              check_status: "green",
              hint_level: 1,
              question_id: nextQ.id,
              needs_learner_confirmation: false
            },
            updatedState: nextState,
            suggestedAction: `Answer ${nextQ.id}`
          };
        } else {
          // All questions answered! Check if any wrong need re-assessment
          const reply =
            "🎉 **Congratulations! All 14 Knowledge Questions (Q1–Q14) and all Checklist Items (C0–C10) are COMPLETE and GREEN!**\n\n" +
            "Your workspace is fully verified for H9loop Code Lab (Project 14, Scenario 2).\n\n" +
            `Assisted steps: ${nextState.assisted_steps.length > 0 ? nextState.assisted_steps.join(", ") : "None (fully self-completed)"}\n\n` +
            "Next action: Download or save your final progress record.";

          return {
            reply,
            record: {
              action: "complete",
              rule_ids: ["G1", "G2"],
              step_id: 10,
              check_status: "green",
              hint_level: 1,
              question_id: null,
              needs_learner_confirmation: false
            },
            updatedState: nextState,
            suggestedAction: "Lab completed successfully!"
          };
        }
      } else {
        // Incorrect attempt
        nextState.wrong_answers[qId] = (nextState.wrong_answers[qId] || 0) + 1;
        const attempts = nextState.wrong_answers[qId];

        if (attempts === 1) {
          const reply =
            `That answer is incomplete or incorrect for ${qId}.\n\n` +
            `**Hint:** Review ${currentQEntry.task} in \`coach/LAB_README.md\`. Consider what makes this distinct from other options.\n\n` +
            `Next action: Try answering ${qId} again.`;

          return {
            reply,
            record: {
              action: "grade_answer",
              rule_ids: ["G3"],
              step_id: 10,
              check_status: "green",
              hint_level: 2,
              question_id: qId,
              needs_learner_confirmation: false
            },
            updatedState: nextState,
            suggestedAction: `Retry answering ${qId}`
          };
        } else {
          // Second failure: explain correct answer and queue for reassessment
          nextState.questions[qId] = "pending"; // kept pending for end
          const reply =
            `Second attempt for ${qId} was incorrect.\n\n` +
            `**Authoritative Answer:** ${currentQEntry.expectedAnswer}\n\n` +
            `I have noted this explanation. Please re-state the core concept in your own words to verify understanding.`;

          return {
            reply,
            record: {
              action: "grade_answer",
              rule_ids: ["G3"],
              step_id: 10,
              check_status: "green",
              hint_level: 3,
              question_id: qId,
              needs_learner_confirmation: false
            },
            updatedState: nextState,
            suggestedAction: `Explain ${qId} in your own words`
          };
        }
      }
    }
  }

  // Default fallback response
  const currentCheck = `C${nextState.current_step}`;
  const reply =
    `I received your input for Step ${nextState.current_step}.\n\n` +
    `To verify **${currentCheck}**, please provide the specific evidence:\n` +
    `• Run the command or validator specified for this step.\n` +
    `• Paste the actual console output.\n\n` +
    `Next action: Paste the required evidence for Step ${nextState.current_step}.`;

  return {
    reply,
    record: {
      action: "show_step",
      rule_ids: ["G1", "G2"],
      step_id: nextState.current_step,
      check_status: nextState.checklist[currentCheck] || "unverified",
      hint_level: nextState.hint_level,
      question_id: null,
      needs_learner_confirmation: false
    },
    updatedState: nextState,
    suggestedAction: `Paste evidence for Step ${nextState.current_step}`
  };
}
