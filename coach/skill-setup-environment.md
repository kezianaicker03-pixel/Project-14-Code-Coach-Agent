# Skill: Setup and Environment (Steps 0 to 3)

## Lab Steps Covered
- **Step 0:** Open the lab folder (`02_code_generation_workflows/`) in VSCode and launch terminal inside it.
- **Step 1:** Create and activate a Python virtual environment (`python -m venv .venv`).
- **Step 2:** Copy `.env.example` to `.env`, set `ANTHROPIC_API_KEY`, install `pip install -r requirements.txt`.
- **Step 3:** Run `python main.py` option 1 (all 6 checks fail as baseline).

## Verification Requirements
- **C0:** Lab folder evidence confirms `CLAUDE.md`, `main.py`, and `app/` are in the current working directory.
- **C1:** Python version output confirms version >= 3.10 and terminal prompt shows `(.venv)` prefix indicating active virtual environment.
- **C2:** `.env` exists with variable names (`ANTHROPIC_API_KEY`, `INVENTORY_SECRET`), `.gitignore` contains `.env`, and `pip install -r requirements.txt` succeeds without errors.
- **C3:** `python main.py` option 1 output pasted showing all 6 checks FAIL (`0/6 checks passed`).

## Hint Ladder
- **H1 (Guiding Question):** What does your terminal prompt display at the beginning of the command line, and which directory are you currently in?
- **H2 (File Path & Structure):** Ensure you are at the lab root containing `main.py`. Activate `.venv` using `source .venv/bin/activate` (macOS/Linux) or `.venv\Scripts\activate` (Windows). For Step 2, run `cp .env.example .env` and check `.gitignore`.
- **H3 (Exact Solution):**
  ```bash
  # Step 0 & 1
  python3 -m venv .venv
  source .venv/bin/activate   # macOS/Linux
  # OR on Windows: .venv\Scripts\activate

  # Step 2
  cp .env.example .env
  pip install -r requirements.txt

  # Step 3
  python main.py
  # Enter 1 to run all checks and verify all 6 fail
  ```

## Common Failure Causes
1. **Python version < 3.10:** User is running Python 3.8 or 3.9. FastMCP and dependencies require Python 3.10+.
2. **Virtual environment not activated:** Commands are run in global Python; packages fail to install or `main.py` cannot import dependencies.
3. **Wrong directory:** Terminal opened in home directory or parent directory instead of `02_code_generation_workflows/`.
4. **API key or secret pasted in chat:** Learner exposes their Anthropic key instead of confirming file presence.
5. **.env not ignored:** `.gitignore` was modified or does not list `.env`.
6. **Premature passes:** Attempting to claim C3 before running option 1.

## Recovery Guidance
- If virtual environment is corrupt: remove `.venv` (`rm -rf .venv` or `rmdir /s /q .venv`), recreate with `python -m venv .venv`, re-activate, and rerun `pip install -r requirements.txt`.
- If Python version is below 3.10: Guide learner to install Python 3.10+ via official installer or package manager. If unable, trigger escalation (G9).
