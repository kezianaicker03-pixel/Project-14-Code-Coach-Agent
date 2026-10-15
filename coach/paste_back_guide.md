# H9loop Code Coach — Google AI Studio Paste-Back Guide
**For H9loop Learners | Project 14: Scenario 2**

Welcome to H9loop Code Lab! In **Build Target B (Google AI Studio Paste-Back Mode)**, you run your AI Coach inside Google AI Studio chat while working in your local development environment. Follow this guide to interact with your coach smoothly and securely.

---

## 1. How Paste-Back Coaching Works

1. **You keep control of your machine:**
   Google AI Studio does not have direct access to your local filesystem or terminal. The coach guides you step-by-step, and you paste back command outputs, validator results, and file snippets.

2. **One step at a time (Rule G1):**
   The coach will never jump ahead or ask you to configure everything at once. Complete the single requested task, paste the exact requested evidence, and wait for confirmation.

3. **Validator-driven verification (Rule G2):**
   The coach marks steps **GREEN** only when you paste real output from `python main.py` or the specific lab evidence. Statements like "I finished it" will not advance the step.

---

## 2. Setting Up Your Session in Google AI Studio

1. **System Instructions:**
   Open Google AI Studio ([aistudio.google.com](https://aistudio.google.com)). In the **System Instructions** panel, paste the contents of `coach/COACH.md`.
2. **Reference Files:**
   Attach or reference `coach/LAB_README.md`, the six skill files (`skill-*.md`), and `coach/questions.md`.
3. **Start the Conversation:**
   Type: `Hi, I want to start H9loop Code Lab.`
4. **Answer the First Question (Rule G11 / First Response):**
   The coach will ask:
   > *"Welcome to H9loop Code Coach! Which coding tool are you using — Claude Code, Codex or Google AI Studio — and are you on Windows, macOS or Linux?"*
   Respond with your tool and OS (e.g. `Google AI Studio on Windows` or `Claude Code on macOS`).

---

## 3. Golden Rules for Pasting Evidence

- **NEVER paste secrets or API keys (Rule G7):**
  If sharing `.env`, paste only variable names (e.g., `ANTHROPIC_API_KEY=...` or `grep -E '^[A-Z]' .env | cut -d= -f1`). Never paste your actual API keys or passwords.
- **Paste clean validator outputs:**
  When instructed to run `python main.py`, paste the console output showing which checks passed or failed.
- **File writes require your explicit approval (Rule G4 & Section 7):**
  The coach will never claim to have edited your files. It will show the exact code block, ask for your confirmation, remind you to keep a backup, and instruct you to create/save the file locally.

---

## 4. Preserving Your Progress State

At each response, the coach outputs a machine-readable **RECORD** and the updated **Checklist (C0–C10)**:
- You can copy this progress block into `coach/progress.json` locally.
- If you close your browser or start a new chat, you can resume by pasting your `progress.json` back into the chat.
- At any time during the lab, you can type **"show checklist"** or **"pause"** to see your full status roadmap.

---

## 5. Lab Roadmap & Checklist Overview

| Check | Focus Area | Authoritative Evidence |
|---|---|---|
| **C0** | Workspace Directory | Listing showing `CLAUDE.md`, `main.py`, and `app/` |
| **C1** | Python 3.10+ & Virtualenv | `python --version` and active venv prompt |
| **C2** | .env, .gitignore, dependencies | `.env` variable names present, in `.gitignore`, pip installed |
| **C3** | Baseline Failure | `python main.py` option 1 shows all 6 checks FAIL |
| **C4** | CLAUDE.md Hierarchy | `python main.py` option 2 shows PASS |
| **C5** | Path-Specific Rules | `python main.py` option 3 shows PASS |
| **C6** | Review Custom Skill | `python main.py` option 4 shows PASS + sub-agent test/concept |
| **C7** | MCP Server Config | `python main.py` option 5 shows PASS + server discovery |
| **C8** | Plan Mode & Refinement | Plan vs direct mode exercises + concrete examples |
| **C9** | Session & Context | `python main.py` option 6 shows PASS + resume/fork evidence |
| **C10** | Final All-Pass | `python main.py` option 1 shows 6/6 PASS |
| **Q1–Q14** | Knowledge Evaluation | 14 exam-mapped conceptual questions |

---

## 6. Helpful Commands Quick Reference

| Action | macOS / Linux | Windows PowerShell / CMD |
|---|---|---|
| Create virtualenv | `python3 -m venv .venv` | `python -m venv .venv` |
| Activate virtualenv | `source .venv/bin/activate` | `.venv\Scripts\activate` |
| Copy environment file | `cp .env.example .env` | `copy .env.example .env` |
| Install dependencies | `pip install -r requirements.txt` | `pip install -r requirements.txt` |
| Run validator | `python main.py` | `python main.py` |
| Reset starter state | `python manage.py restart` | `python manage.py restart` |
