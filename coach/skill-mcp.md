# Skill: MCP Server Configuration (Step 7)

## Lab Steps Covered
- **Step 7:** Configure MCP servers in `.mcp.json`.
  - Check custom server file `mcp_server/inventory_server.py`.
  - Add `INVENTORY_SECRET=lab02_secret` (or configured value) to `.env`.
  - Create `.mcp.json` at lab root configuring:
    - `fetch` (community server using `python -m mcp_server_fetch`)
    - `inventory` (custom server `python mcp_server/inventory_server.py` with environment variable expansion `"${INVENTORY_SECRET}"`)
  - Validate with `python main.py` option 5.
  - Restart tool and verify tools via `/mcp` or complete permitted concept alternative.

## Verification Requirements
- **C7:**
  - `python main.py` option 5 output shows:
    `✓ .mcp.json configured with 2 server(s) and env var expansion`
  - Learner demonstrates `/mcp` output showing `fetch` and `inventory`, or answers the permitted concept alternative for MCP discovery and credential expansion.

## Hint Ladder
- **H1 (Guiding Question):** Why do we store the secret in `.env` and use `${INVENTORY_SECRET}` in `.mcp.json` rather than hardcoding it?
- **H2 (File Path & Structure):** Create `.mcp.json` in the project root. It must have the `mcpServers` object with keys `fetch` and `inventory`. The `inventory` entry uses `"env": {"INVENTORY_SECRET": "${INVENTORY_SECRET}"}`.
- **H3 (Exact Solution):**
  Ensure `.env` contains:
  ```
  INVENTORY_SECRET=lab02_secret
  ```
  Create `.mcp.json`:
  ```json
  {
    "mcpServers": {
      "fetch": {
        "command": "python",
        "args": ["-m", "mcp_server_fetch"]
      },
      "inventory": {
        "command": "python",
        "args": ["mcp_server/inventory_server.py"],
        "env": {
          "INVENTORY_SECRET": "${INVENTORY_SECRET}"
        }
      }
    }
  }
  ```

## Common Failure Causes
1. **`.mcp.json` is not valid JSON:** Missing commas, trailing commas, or unescaped quotes.
2. **Missing `${INVENTORY_SECRET}` expansion syntax:** Hardcoding the actual secret string into `.mcp.json` instead of literal `"${INVENTORY_SECRET}"`.
3. **`INVENTORY_SECRET` missing from `.env`:** When running `/mcp`, custom inventory server fails auth checks.
4. **Tool not restarted:** Claude Code / IDE only discovers MCP servers at launch.
5. **Missing `mcp_server/inventory_server.py`:** If deleted or path misspelled.

## Recovery Guidance
- Run `python -m json.tool .mcp.json` to test JSON syntax validity.
- Verify `.env` contains `INVENTORY_SECRET`. Do NOT print or leak secret values into chat.
- Test `python main.py` option 5.
