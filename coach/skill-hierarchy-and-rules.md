# Skill: CLAUDE.md Hierarchy and Path-Specific Rules (Steps 4 to 5)

## Lab Steps Covered
- **Step 4:** Build the CLAUDE.md hierarchy:
  - Create `coding_standards.md` at project root.
  - Add `@import coding_standards.md` as the very first line of `CLAUDE.md`.
  - Create `app/CLAUDE.md` with directory-scoped conventions.
  - Validate with `python main.py` option 2.
- **Step 5:** Add path-specific rules:
  - Create directory `.claude/rules/`.
  - Create `.claude/rules/test-conventions.md` with glob `**/*.test.py`.
  - Create `.claude/rules/api-conventions.md` with glob `app/**/*.py` and exclude `!**/*.test.py`.
  - Validate with `python main.py` option 3.

## Verification Requirements
- **C4:** `python main.py` option 2 output shows:
  - `✓ Project-level: CLAUDE.md exists with @import`
  - `✓ Directory-level: app/CLAUDE.md exists (directory-level)`
- **C5:** `python main.py` option 3 output shows:
  - `✓ Found 2 rule file(s) with glob patterns`

## Hint Ladder
### Step 4 Hints
- **H1 (Guiding Question):** Where should modular standards live when using `@import`, and does `main.py` expect `@import` at a specific position?
- **H2 (File Path & Structure):** Create `coding_standards.md` in the project root (not in `app/`). In `CLAUDE.md`, put `@import coding_standards.md` on line 1 before any header. Then create `app/CLAUDE.md`.
- **H3 (Exact Solution):**
  Create `coding_standards.md`:
  ```markdown
  # Coding Standards

  ## Function naming
  - Use verb_noun format: get_product, update_stock, calculate_total
  - Prefix validation functions with validate_
  - Prefix formatting functions with format_

  ## Error handling
  - Return None for not-found cases, never raise exceptions in lookup functions
  - Validate inputs at the start of each public function
  - Use descriptive variable names for error states

  ## Data formats
  - Product IDs use "PROD-XXX" format
  - Prices are floats rounded to 2 decimal places
  - Stock quantities are non-negative integers
  ```
  Add `@import coding_standards.md` at line 1 of `CLAUDE.md`.
  Create `app/CLAUDE.md`:
  ```markdown
  # App Code

  This directory contains the sample application for the lab.

  ## Conventions
  - All functions use snake_case naming
  - Products use "PROD-XXX" ID format
  - Test files use the .test.py suffix and unittest framework
  - Keep functions small — each function does one thing
  ```

### Step 5 Hints
- **H1 (Guiding Question):** How does Claude Code know which files a rule applies to without hardcoding paths in CLAUDE.md?
- **H2 (File Path & Structure):** Place rule files in `.claude/rules/`. Each markdown file requires YAML frontmatter with a `paths:` list using glob patterns.
- **H3 (Exact Solution):**
  Create `.claude/rules/test-conventions.md`:
  ```markdown
  ---
  paths:
    - "**/*.test.py"
  ---

  # Test File Conventions

  - Use unittest.TestCase for all test classes
  - Name test methods with test_ prefix describing the scenario: test_existing_product, test_empty_order
  - One assertion per test method when possible
  - Use setUp() for shared test fixtures, not repeated initialization
  - Test both success and failure cases for every function
  - Use assertIsNone for None checks, not assertEqual(result, None)
  ```
  Create `.claude/rules/api-conventions.md`:
  ```markdown
  ---
  paths:
    - "app/**/*.py"
    - "!**/*.test.py"
  ---

  # API Code Conventions

  - Every function must validate its inputs before processing
  - Return None for not-found cases — never raise KeyError or similar
  - Use type hints for function parameters and return values
  - Keep functions under 20 lines — extract helpers for complex logic
  - All dict lookups use .get() with a default, never direct key access
  ```

## Common Failure Causes
1. **The `@import` line is not the very first line:** Placed after a heading or at bottom of `CLAUDE.md`.
2. **`coding_standards.md` created inside `app/`:** Must be in project root alongside `CLAUDE.md`.
3. **YAML paths indentation is wrong:** Frontmatter in `.claude/rules/*.md` missing indentation or invalid list syntax (`paths:` followed by `  - "..."`).
4. **Missing exclusion glob:** `api-conventions.md` missing `!**/*.test.py` or wrong pattern syntax.
5. **Rules folder name misspelled:** e.g., `.claude/rule/` instead of `.claude/rules/`.

## Recovery Guidance
- Verify file tree matches:
  - `./CLAUDE.md`
  - `./coding_standards.md`
  - `./app/CLAUDE.md`
  - `./.claude/rules/test-conventions.md`
  - `./.claude/rules/api-conventions.md`
- Always inspect file content before re-validating.
