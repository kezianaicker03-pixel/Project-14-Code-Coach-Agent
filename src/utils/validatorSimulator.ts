export interface SimulatedFileState {
  claudeMdWithImport: boolean;
  appClaudeMd: boolean;
  pathRules: boolean;
  customSkill: boolean;
  mcpConfig: boolean;
  scratchPad: boolean;
}

export const INITIAL_SIMULATED_FILES: SimulatedFileState = {
  claudeMdWithImport: false,
  appClaudeMd: false,
  pathRules: false,
  customSkill: false,
  mcpConfig: false,
  scratchPad: false
};

export function runSimulatedValidator(option: number | string, files: SimulatedFileState): string {
  const opt = String(option).trim();

  if (opt === "1") {
    const checks = [
      {
        name: "CLAUDE.md with @import",
        ok: files.claudeMdWithImport,
        passMsg: "CLAUDE.md exists with @import",
        failMsg: "CLAUDE.md exists but does not use @import (or not found)"
      },
      {
        name: "Directory-level CLAUDE.md",
        ok: files.appClaudeMd,
        passMsg: "app/CLAUDE.md exists (directory-level)",
        failMsg: "app/CLAUDE.md not found (directory-level)"
      },
      {
        name: "Path-specific rules",
        ok: files.pathRules,
        passMsg: "Found 2 rule file(s) with glob patterns",
        failMsg: ".claude/rules/ directory not found or has no matching glob patterns"
      },
      {
        name: "Custom skill (context:fork)",
        ok: files.customSkill,
        passMsg: "Found 1 skill(s) with context:fork",
        failMsg: ".claude/commands/ exists but no skill uses context:fork"
      },
      {
        name: "MCP server config",
        ok: files.mcpConfig,
        passMsg: ".mcp.json configured with 2 server(s) and env var expansion",
        failMsg: ".mcp.json not found or missing ${ENV_VAR} expansion"
      },
      {
        name: "Context persistence (scratch.md)",
        ok: files.scratchPad,
        passMsg: "scratch.md exists with content",
        failMsg: "scratch.md not found or appears empty"
      }
    ];

    let passed = 0;
    let out = "Workspace Configuration Checks\n\n";
    checks.forEach(c => {
      if (c.ok) {
        passed++;
        out += `  ✓ ${c.name}\n    ${c.passMsg}\n`;
      } else {
        out += `  ✗ ${c.name}\n    ${c.failMsg}\n`;
      }
    });

    out += `\n${passed}/6 checks passed\n`;
    if (passed === 6) {
      out += "All checks passed! Workspace is fully configured.";
    } else {
      out += "Follow the README to complete the remaining configuration.";
    }
    return out;
  }

  if (opt === "2") {
    const s1 = files.claudeMdWithImport ? "✓" : "✗";
    const msg1 = files.claudeMdWithImport
      ? "CLAUDE.md exists with @import"
      : "CLAUDE.md exists but does not use @import";
    const s2 = files.appClaudeMd ? "✓" : "✗";
    const msg2 = files.appClaudeMd
      ? "app/CLAUDE.md exists (directory-level)"
      : "app/CLAUDE.md not found (directory-level)";

    return `  ${s1} Project-level: ${msg1}\n  ${s2} Directory-level: ${msg2}`;
  }

  if (opt === "3") {
    if (files.pathRules) {
      return "  ✓ Found 2 rule file(s) with glob patterns";
    }
    return "  ✗ .claude/rules/ directory not found";
  }

  if (opt === "4") {
    if (files.customSkill) {
      return "  ✓ Found 1 skill(s) with context:fork";
    }
    return "  ✗ .claude/commands/ directory not found or no skills use context:fork";
  }

  if (opt === "5") {
    if (files.mcpConfig) {
      return "  ✓ .mcp.json configured with 2 server(s) and env var expansion";
    }
    return "  ✗ .mcp.json not found or missing ${ENV_VAR} expansion";
  }

  if (opt === "6") {
    if (files.scratchPad) {
      return "  ✓ scratch.md exists with content";
    }
    return "  ✗ scratch.md not found";
  }

  return "Choose 1-6, c, or q.";
}
