# Skill: Plan Mode and Iterative Refinement (Step 8)

## Lab Steps Covered
- **Step 8:** Master Plan Mode vs Direct Execution and Iterative Refinement with Concrete Examples.
  - Understand architectural tradeoffs: Plan mode (`Shift+Tab` or `/plan`) for multi-file edits, complex refactorings, or multiple reasonable approaches.
  - Direct execution for small, well-scoped single-file changes.
  - Vague prompts produce inconsistent results or interview questions.
  - 2–3 concrete input/output examples provide predictable, high-precision results without ambiguity.

## Verification Requirements
- **C8:** Learner demonstrates plan mode exercise, direct execution exercise, and provides description/evidence of comparing vague prompts vs concrete input/output examples.

## Hint Ladder
- **H1 (Guiding Question):** When a task affects multiple functions across an application versus a one-line bug fix, how should you configure your AI assistant's execution strategy?
- **H2 (File Path & Structure):** Use Plan mode (`/plan`) when modifying several functions in `app/sample_app.py` or making architectural decisions. For single-function fixes, use direct execution.
- **H3 (Exact Solution):**
  - **Plan mode prompt:**
    ```
    Refactor all functions in app/sample_app.py to add input validation. Each function should check its inputs and return a structured error dict with "error" and "message" keys when validation fails. Also add type hints to all function signatures.
    ```
  - **Direct execution prompt:**
    ```
    Fix the calculate_order_total function in app/sample_app.py so it handles the case where a product_id in the items list does not exist. It should include a warning in the result instead of silently skipping it.
    ```
  - **Concrete examples prompt:**
    ```
    Add input validation to app/sample_app.py functions.
    Here are examples of the expected behavior:

    get_product("") should return
    {"error": True, "message": "product_id cannot be empty"}

    get_product("INVALID") should return
    {"error": True, "message": "must match PROD-XXX format"}

    update_stock("PROD-001", "abc") should return
    {"error": True, "message": "quantity must be an integer"}

    calculate_order_total("not a list") should return
    {"error": True, "message": "items must be a list"}
    ```

## Common Failure Causes
1. **Using direct execution on large multi-file refactors:** Leads to unreviewed breaking changes.
2. **Vague prompt without examples:** Prompting "make error handling better" results in generic or incorrect code.
3. **Not restoring `sample_app.py`:** Forgetting to restore starter code (`cp _manage/starter/app/sample_app.py app/sample_app.py`) between test exercises.

## Recovery Guidance
- Restore `app/sample_app.py` from `_manage/starter/app/sample_app.py`.
- Formulate prompts with clear input/output pairs.
