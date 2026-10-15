# Skill: Session Management and Context Persistence (Steps 9 to 10)

## Lab Steps Covered
- **Step 9:** Manage sessions and persist context across boundaries:
  - Create and populate `scratch.md` under heading `## Functions`.
  - Resume sessions with `--resume` to pick up prior context.
  - Notice stale tool results when files change; understand when to start fresh sessions with summaries.
  - Understand session forking with `--fork-session` (conversation branching vs disk persistence).
  - Validate context persistence with `python main.py` option 6.
- **Step 10:** Final validation:
  - Run `python main.py` option 1.
  - All 6 checks must PASS (`6/6 checks passed`).

## Verification Requirements
- **C9:**
  - `python main.py` option 6 output shows:
    `✓ scratch.md exists with content`
  - Learner demonstrates `--resume` and `--fork-session` comprehension or completes permitted concept alternative.
- **C10:**
  - `python main.py` option 1 output shows:
    `6/6 checks passed`
    `All checks passed! Workspace is fully configured.`

## Hint Ladder
- **H1 (Guiding Question):** How do you preserve findings when conversation context compresses, and how do you branch a conversation without losing original history?
- **H2 (File Path & Structure):** Create `scratch.md` in the project root with the functions extracted from `app/sample_app.py`. Understand that `--fork-session` branches the conversation history, not disk files.
- **H3 (Exact Solution):**
  Create `scratch.md`:
  ```markdown
  # Scratchpad

  ## Functions
  - `get_product(product_id)`: Look up product details by ID
  - `update_stock(product_id, quantity)`: Modify inventory count
  - `calculate_order_total(items)`: Compute total order price
  - `get_low_stock_products(threshold)`: Return items below inventory threshold
  ```
  Validate with `python main.py` option 6, then run `python main.py` option 1 to confirm all 6 checks pass.

## Common Failure Causes
1. **`scratch.md` empty:** Created an empty file; `main.py` requires `len(content.strip()) >= 10`.
2. **Confusing file sandboxing with session forking:** Assuming `--fork-session` isolates file edits (file changes are always real and live on disk).
3. **Resuming with stale tool results:** When code changes significantly between sessions, a fresh session with an injected structured summary is superior to resuming.
4. **Any earlier check still failing:** Re-run option 1 in `main.py` to identify which of the 6 checks is red.

## Recovery Guidance
- Verify all 6 check files exist:
  1. `CLAUDE.md` with `@import coding_standards.md`
  2. `app/CLAUDE.md`
  3. `.claude/rules/*.md`
  4. `.claude/commands/review.md`
  5. `.mcp.json`
  6. `scratch.md`
- Run `python main.py` option 1 to confirm all 6 are green.
