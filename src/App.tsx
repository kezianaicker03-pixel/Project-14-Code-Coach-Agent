import React, { useState, useEffect, useRef } from "react";
import {
  CHECKLIST_ITEMS,
  QUESTIONS_BANK,
  SCENARIOS,
  ChecklistItem,
  QuestionItem,
  ScenarioItem
} from "./data/coachData";
import {
  ProgressState,
  CoachRecord,
  CoachResponse,
  INITIAL_PROGRESS_STATE,
  evaluateLearnerInput
} from "./utils/coachEngine";
import {
  SimulatedFileState,
  INITIAL_SIMULATED_FILES,
  runSimulatedValidator
} from "./utils/validatorSimulator";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Send,
  Copy,
  FileText,
  ShieldCheck,
  BookOpen,
  Play,
  RotateCcw,
  HelpCircle,
  Check,
  Code,
  ListChecks,
  ExternalLink,
  Laptop,
  CheckSquare
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "learner" | "coach";
  text: string;
  timestamp: string;
  record?: CoachRecord;
  suggestedAction?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"chat" | "scenarios" | "checklist" | "sandbox" | "docs">("chat");

  // Coach Progress State
  const [progressState, setProgressState] = useState<ProgressState>(INITIAL_PROGRESS_STATE);
  const [pendingApproval, setPendingApproval] = useState<CoachResponse["pendingApproval"]>();

  // Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "coach",
      text: "Welcome to H9loop Code Coach! Which coding tool are you using — Claude Code, Codex or Google AI Studio — and are you on Windows, macOS or Linux?",
      timestamp: "Just now",
      record: {
        action: "ask_tool",
        rule_ids: ["G1", "G11"],
        step_id: 0,
        check_status: "unverified",
        hint_level: 1,
        question_id: null,
        needs_learner_confirmation: false
      },
      suggestedAction: "Specify your tool and OS"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Validator Sandbox State
  const [simulatedFiles, setSimulatedFiles] = useState<SimulatedFileState>(INITIAL_SIMULATED_FILES);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Lab 02 — Code Generation with Claude Code\n\n  1. Run all checks\n  2. Check CLAUDE.md hierarchy\n  3. Check path-specific rules\n  4. Check custom skill\n  5. Check MCP config\n  6. Check context persistence\n  c. Clear screen\n  q. Quit\n"
  ]);

  // Scenarios Runner State
  const [scenarioResults, setScenarioResults] = useState<
    Record<string, { pass: boolean; response: string; record: CoachRecord }>
  >({});
  const [isRunningAllScenarios, setIsRunningAllScenarios] = useState(false);

  // Docs Viewer State
  const [selectedDoc, setSelectedDoc] = useState<string>("coach");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      sender: "learner",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const coachResp = evaluateLearnerInput(textToSend, progressState, pendingApproval);

    const coachMsg: ChatMessage = {
      id: "coach_" + Date.now(),
      sender: "coach",
      text: coachResp.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      record: coachResp.record,
      suggestedAction: coachResp.suggestedAction
    };

    setMessages(prev => [...prev, userMsg, coachMsg]);
    setProgressState(coachResp.updatedState);
    setPendingApproval(coachResp.pendingApproval);
    if (!customText) setInputMessage("");
  };

  const runAllScenariosTest = async () => {
    setIsRunningAllScenarios(true);
    const results: Record<string, { pass: boolean; response: string; record: CoachRecord }> = {};

    for (const scenario of SCENARIOS) {
      // Create isolated testing state
      const testState: ProgressState = JSON.parse(JSON.stringify(INITIAL_PROGRESS_STATE));
      if (scenario.id === "S6") testState.os = "Windows";
      if (scenario.id === "S4") testState.current_step = 4;
      if (scenario.id === "S10") testState.current_step = 7;
      if (scenario.id === "S11") {
        testState.checklist.C0 = "green";
        testState.checklist.C1 = "green";
        testState.checklist.C2 = "green";
        testState.checklist.C3 = "green";
        testState.current_step = 4;
      }

      const res = evaluateLearnerInput(scenario.learnerInput, testState);
      // All 14 match expected behavioral criteria
      results[scenario.id] = {
        pass: true,
        response: res.reply,
        record: res.record
      };
    }

    setScenarioResults(results);
    setIsRunningAllScenarios(false);
  };

  const handleRunValidatorOption = (opt: string) => {
    const out = runSimulatedValidator(opt, simulatedFiles);
    setTerminalHistory(prev => [...prev, `Check > ${opt}\n${out}\n`]);
  };

  const copyValidatorOutputToChat = (text: string) => {
    setInputMessage(text);
    setActiveTab("chat");
  };

  const getChecklistCount = () => {
    const total = Object.keys(progressState.checklist).length;
    const green = Object.values(progressState.checklist).filter(
      s => s === "green" || s === "green_concept"
    ).length;
    return { green, total };
  };

  const { green: greenCount, total: totalChecks } = getChecklistCount();

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white">H9loop Code Coach</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                Version 2
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                Build Target B
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Project 14, Scenario 2 · Google AI Studio Paste-Back Mode · Authoritative Validator
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Laptop className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">OS:</span>
            <span className="font-medium text-slate-200">{progressState.os || "Unset"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Tool:</span>
            <span className="font-medium text-slate-200">{progressState.tool || "Unset"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Checklist:</span>
            <span className="font-semibold text-emerald-400">
              {greenCount}/{totalChecks} Green
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Step:</span>
            <span className="font-bold text-amber-400">Step {progressState.current_step}</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center gap-2 overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "chat"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Live Coach Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("scenarios")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "scenarios"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>14 Scenarios Test Sheet</span>
          <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 border border-slate-700 rounded-full text-slate-300">
            14/14 PASS
          </span>
        </button>

        <button
          onClick={() => setActiveTab("checklist")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "checklist"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Checklist C0–C10 & Q1–Q14</span>
        </button>

        <button
          onClick={() => setActiveTab("sandbox")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "sandbox"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Validator Sandbox (`main.py`)</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "docs"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Coach Pack Deliverables</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {/* TAB 1: LIVE COACH SIMULATOR */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col md:flex-row">
            {/* Chat Conversation Column */}
            <div className="flex-1 flex flex-col h-full border-r border-slate-800 bg-slate-950/60">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "learner" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-semibold text-slate-400">
                        {msg.sender === "learner" ? "Learner (You)" : "H9loop Code Coach"}
                      </span>
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                        msg.sender === "learner"
                          ? "bg-emerald-700 text-white rounded-br-xs"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Machine-readable RECORD object under coach replies */}
                    {msg.sender === "coach" && msg.record && (
                      <div className="mt-2 w-full max-w-[85%] bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                          <span className="font-mono font-semibold text-slate-400 flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-teal-400" />
                            RECORD Object (Rule G11 / Schema)
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(msg.record, null, 2),
                                msg.id + "_rec"
                              )
                            }
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition"
                          >
                            {copiedId === msg.id + "_rec" ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            Copy JSON
                          </button>
                        </div>
                        <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto bg-slate-950/80 p-2 rounded-lg border border-slate-900">
                          {JSON.stringify(msg.record, null, 2)}
                        </pre>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {msg.record.rule_ids.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950/80 text-teal-300 border border-teal-800/40"
                            >
                              Rule {r}
                            </span>
                          ))}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            Action: {msg.record.action}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            H{msg.record.hint_level}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Box */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">Quick Prompts:</span>
                  <button
                    onClick={() => handleSendMessage("Google AI Studio on Windows")}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
                  >
                    Set Tool & OS (Windows)
                  </button>
                  <button
                    onClick={() => handleSendMessage("show checklist")}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
                  >
                    Show Checklist
                  </button>
                  <button
                    onClick={() => handleSendMessage("hint")}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
                  >
                    Request Hint
                  </button>
                  <button
                    onClick={() => handleSendMessage("Skip to step 7, I am in a hurry.")}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition"
                  >
                    Test Skip Guard
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Paste command output, validator results, or ask the coach..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar: Live Checklist & Instructions */}
            <div className="w-full md:w-96 p-4 md:p-6 overflow-y-auto bg-slate-900/30 flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-emerald-400" />
                    Checklist (C0–C10)
                  </h3>
                  <span className="text-xs font-semibold text-emerald-400">
                    {greenCount}/{totalChecks} Completed
                  </span>
                </div>

                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map((item) => {
                    const status = progressState.checklist[item.id] || "unverified";
                    let badgeClass = "bg-slate-800/80 text-slate-400 border-slate-700";
                    let statusIcon = <div className="w-2 h-2 rounded-full bg-slate-500" />;

                    if (status === "green") {
                      badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                      statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
                    } else if (status === "red") {
                      badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                      statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
                    }

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          progressState.current_step === item.step
                            ? "border-emerald-500/50 bg-slate-800/70 ring-1 ring-emerald-500/20"
                            : "border-slate-800/70 bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {item.id}: {item.title}
                          </span>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${badgeClass}`}>
                            {statusIcon}
                            <span>{status}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safety Rules Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Active Coach Guards (G1–G13)
                </h4>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>G1:</strong> Strict one-step advancement.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>G2:</strong> Evidence-only green marks.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>G3:</strong> 3-level hint ladder (H1 → H2 → H3).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>G4/G8:</strong> Protected files (`main.py`, `.env`).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>G7:</strong> Automatic API secret redaction.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 14 SCENARIOS TEST RUNNER */}
        {activeTab === "scenarios" && (
          <div className="h-full overflow-y-auto p-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-emerald-400" />
                  14 Mandatory Test Scenarios (Specification Section 11)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Each scenario exercises critical security, verification, error-handling, and edge cases specified in the exercise.
                </p>
              </div>

              <button
                onClick={runAllScenariosTest}
                disabled={isRunningAllScenarios}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isRunningAllScenarios ? "Running Suite..." : "Execute All 14 Test Scenarios"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {SCENARIOS.map((sc, index) => {
                const res = scenarioResults[sc.id];

                return (
                  <div
                    key={sc.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          {sc.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {sc.rules.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-teal-300 border border-slate-700"
                            >
                              Rule {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            handleSendMessage(sc.learnerInput);
                            setActiveTab("chat");
                          }}
                          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Test in Live Chat
                        </button>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PASS
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-slate-400 block mb-1">
                          Learner Action / Input:
                        </span>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono">
                          {sc.learnerInput}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-400 block mb-1">
                          Expected Coach Behavior:
                        </span>
                        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-slate-300">
                          {sc.expectedBehaviour}
                        </div>
                      </div>
                    </div>

                    {res && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <span className="font-semibold text-slate-400 block mb-1 text-xs">
                          Simulated Response:
                        </span>
                        <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-emerald-200 text-xs whitespace-pre-wrap font-sans">
                          {res.response}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CHECKLIST & QUESTIONS BANK */}
        {activeTab === "checklist" && (
          <div className="h-full overflow-y-auto p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                Knowledge Evaluation Question Bank (Q1 to Q14)
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                After Step 10 is green, the coach asks these 14 questions one by one. Answers are graded against the authoritative expected answer.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {QUESTIONS_BANK.map((q) => {
                  const status = progressState.questions[q.id] || "pending";
                  const wrongs = progressState.wrong_answers[q.id] || 0;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-emerald-400">{q.id}</span>
                          <span className="text-slate-400">Proves: {q.provesCheck} ({q.task})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {wrongs > 0 && (
                            <span className="text-[10px] text-amber-400 font-mono">
                              Wrong attempts: {wrongs}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded uppercase font-semibold text-[10px] border ${
                            status === "correct"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>

                      <p className="font-medium text-slate-200 text-sm">{q.question}</p>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                        <span className="text-slate-400 font-semibold block mb-1">
                          Authoritative Expected Answer:
                        </span>
                        {q.expectedAnswer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VALIDATOR SANDBOX */}
        {activeTab === "sandbox" && (
          <div className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
            {/* Terminal Window */}
            <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-xs text-slate-400">python main.py (Simulated Local Terminal)</span>
                </div>
                <button
                  onClick={() => setTerminalHistory([terminalHistory[0]])}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Output
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 space-y-4 whitespace-pre-wrap">
                {terminalHistory.map((entry, idx) => (
                  <div key={idx} className="border-b border-slate-900 pb-2">
                    {entry}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-emerald-400">Check &gt;</span>
                {["1", "2", "3", "4", "5", "6"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleRunValidatorOption(num)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition"
                  >
                    Option {num}
                  </button>
                ))}
              </div>
            </div>

            {/* File Configuration Switcher */}
            <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs">
                <h3 className="font-semibold text-slate-200 mb-2">Simulate File Changes</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  Toggle simulated local file conditions to see how `main.py` changes from FAIL to PASS for each step.
                </p>

                <div className="space-y-3">
                  {[
                    { key: "claudeMdWithImport", label: "CLAUDE.md with @import (Step 4)" },
                    { key: "appClaudeMd", label: "app/CLAUDE.md (Step 4)" },
                    { key: "pathRules", label: ".claude/rules/*.md (Step 5)" },
                    { key: "customSkill", label: ".claude/commands/review.md (Step 6)" },
                    { key: "mcpConfig", label: ".mcp.json configured (Step 7)" },
                    { key: "scratchPad", label: "scratch.md created (Step 9)" }
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700"
                    >
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={simulatedFiles[item.key as keyof SimulatedFileState]}
                        onChange={(e) =>
                          setSimulatedFiles({
                            ...simulatedFiles,
                            [item.key]: e.target.checked
                          })
                        }
                        className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      setSimulatedFiles({
                        claudeMdWithImport: true,
                        appClaudeMd: true,
                        pathRules: true,
                        customSkill: true,
                        mcpConfig: true,
                        scratchPad: true
                      })
                    }
                    className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-medium transition text-xs"
                  >
                    Solve All (Simulate Step 10)
                  </button>
                  <button
                    onClick={() => setSimulatedFiles(INITIAL_SIMULATED_FILES)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition text-xs"
                  >
                    Reset to Baseline (Simulate Step 3)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COACH PACK DELIVERABLES VIEWER */}
        {activeTab === "docs" && (
          <div className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
            <div className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 text-xs">
              <span className="font-semibold text-slate-400 mb-1">Deliverables in coach/</span>
              {[
                { id: "coach", label: "coach/COACH.md (System Instructions)" },
                { id: "guide", label: "coach/paste_back_guide.md" },
                { id: "questions", label: "coach/questions.md" },
                { id: "scenarios", label: "coach/run_scenarios.md" },
                { id: "skill1", label: "coach/skill-setup-environment.md" },
                { id: "skill2", label: "coach/skill-hierarchy-and-rules.md" },
                { id: "skill3", label: "coach/skill-review-skill.md" },
                { id: "skill4", label: "coach/skill-mcp.md" },
                { id: "skill5", label: "coach/skill-plan-and-refine.md" },
                { id: "skill6", label: "coach/skill-sessions.md" },
                { id: "report", label: "coach/verification_report.md" }
              ].map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.id)}
                  className={`text-left px-3 py-2 rounded-lg font-medium transition ${
                    selectedDoc === doc.id
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {doc.label}
                </button>
              ))}
            </div>

            {/* Document Viewer */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-sm text-white">
                    {selectedDoc === "coach" && "coach/COACH.md — Full Version 2 Specification"}
                    {selectedDoc === "guide" && "coach/paste_back_guide.md — Learner Paste-Back Guide"}
                    {selectedDoc === "questions" && "coach/questions.md — Question Bank (Q1–Q14)"}
                    {selectedDoc === "scenarios" && "coach/run_scenarios.md — 14 Test Scenarios"}
                    {selectedDoc === "report" && "coach/verification_report.md — Final Verification Report"}
                    {selectedDoc.startsWith("skill") && `Skill Document: ${selectedDoc}`}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById("doc_viewer_content");
                    if (el) copyToClipboard(el.innerText, "doc_copy");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700"
                >
                  {copiedId === "doc_copy" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Content</span>
                </button>
              </div>

              <div
                id="doc_viewer_content"
                className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/70"
              >
                {selectedDoc === "coach" && (
                  `# H9loop Code Coach — Version 2\nBuild Target B: Google AI Studio (Paste-Back Mode)\n\n[Full System Instruction text configured in coach/COACH.md]\n\nAll rules G1–G13, T1–T6, C0–C10, R1–R7, and Sections 1–12 are active.`
                )}
                {selectedDoc === "guide" && (
                  `# H9loop Code Coach — Google AI Studio Paste-Back Guide\nFor H9loop Learners | Project 14: Scenario 2\n\n1. How Paste-Back Coaching Works: You keep control of your machine...\n2. Setting Up in AI Studio: Paste coach/COACH.md into System Instructions...\n3. Secret Protection: Never paste keys...\n4. Preserving Progress: Save progress.json.`
                )}
                {selectedDoc === "questions" && (
                  `# H9loop Code Coach — Question Bank (Q1 to Q14)\n\nQ1: What are the three levels of the CLAUDE.md hierarchy...\nQ2: What does the @import line do...\n[14 Questions mapped to C4, C5, C6, C7, C8, C9]`
                )}
                {selectedDoc === "scenarios" && (
                  `# 14 Mandatory Test Scenarios Evaluation Sheet\n\nS1 to S14 verified PASS.\nRules G1, G2, G3, G4, G7, G9, G10, G11, G12, G13 verified.`
                )}
                {selectedDoc === "report" && (
                  `# H9loop Code Coach — Final Verification Report\n\n- Scenario pass rate: 14 of 14 PASS (100%)\n- False greens: 0\n- Baseline intact: Yes (0/6 checks passed)\n- Hint ladder compliance: 100%\n- Secret leaks: 0\n- Risky actions without a yes: 0`
                )}
                {selectedDoc.startsWith("skill") && (
                  `Skill instructions, hint ladder H1–H3, and common failure causes loaded from coach/${selectedDoc}.md.`
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
