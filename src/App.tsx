import React, { useState, useMemo } from 'react';
import {
  GeminiModel,
  AntigravitySessionEvent,
  ANTIGRAVITY_SESSIONS,
  INITIAL_ANTIGRAVITY_EVENTS,
} from './data/telemetryData';
import { TokenChart } from './components/TokenChart';
import {
  PlusCircle,
  Download,
  Check,
  Terminal,
  FileCode,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';

export default function App() {
  const [events, setEvents] = useState<AntigravitySessionEvent[]>(
    INITIAL_ANTIGRAVITY_EVENTS
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<GeminiModel>('All Gemini');
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-08');
  const [exportedToast, setExportedToast] = useState<boolean>(false);

  // Filter events by session & Gemini model
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedSessionId !== 'all' && ev.sessionId !== selectedSessionId) {
        return false;
      }
      if (modelFilter !== 'All Gemini' && ev.model !== modelFilter) {
        return false;
      }
      return true;
    });
  }, [events, selectedSessionId, modelFilter]);

  const selectedEvent = useMemo(() => {
    return (
      filteredEvents.find((e) => e.id === selectedEventId) ||
      filteredEvents[filteredEvents.length - 1] ||
      null
    );
  }, [filteredEvents, selectedEventId]);

  // Aggregate summary totals for the active filter
  const totals = useMemo(() => {
    let cached = 0;
    let files = 0;
    let tools = 0;
    let thinking = 0;
    let output = 0;
    let cost = 0;

    filteredEvents.forEach((e) => {
      cached += e.cachedTokens;
      files += e.workspaceFileTokens;
      tools += e.toolOutputTokens;
      thinking += e.thinkingTokens;
      output += e.outputTokens;
      cost += e.costUsd;
    });

    const grandTotal = cached + files + tools + thinking + output;
    const latestEvent = filteredEvents[filteredEvents.length - 1];
    const latestWindowTokens = latestEvent
      ? latestEvent.cachedTokens +
        latestEvent.workspaceFileTokens +
        latestEvent.toolOutputTokens +
        latestEvent.thinkingTokens +
        latestEvent.outputTokens
      : 0;

    return {
      cached,
      files,
      tools,
      thinking,
      output,
      grandTotal,
      cost,
      latestWindowTokens,
      windowPct: (latestWindowTokens / 1000000) * 100,
    };
  }, [filteredEvents]);

  const handleLogAntigravityTurn = () => {
    const nextTurn = events.length + 1;
    const isFlash = Math.random() > 0.5;
    const prev = events[events.length - 1] || INITIAL_ANTIGRAVITY_EVENTS[0];
    const now = new Date().toTimeString().split(' ')[0];

    const actions: Array<{
      type: AntigravitySessionEvent['actionType'];
      summary: string;
    }> = [
      {
        type: 'Code Edit',
        summary: 'replace_file_content in src/App.tsx (update Gemini chart layout)',
      },
      {
        type: 'Tool Execution',
        summary: 'compile_applet (TypeScript & Vite bundle verification)',
      },
      {
        type: 'File Read',
        summary: 'view_file on src/data/telemetryData.ts',
      },
      {
        type: 'Terminal Run',
        summary: 'run_command: git status --short',
      },
    ];
    const picked = actions[nextTurn % actions.length];

    const newEvent: AntigravitySessionEvent = {
      id: `evt-${Date.now()}`,
      turnNumber: nextTurn,
      sessionId: selectedSessionId === 'all' ? 'ag-941' : selectedSessionId,
      sessionTitle: 'ag-941 · UI Chart & Layout Simplification',
      timestamp: now,
      actionType: picked.type,
      actionSummary: picked.summary,
      model: isFlash ? 'gemini-2.5-flash' : 'gemini-2.5-pro',
      contextWindowMax: 1000000,
      cachedTokens: Math.min(820000, prev.cachedTokens + 18500),
      workspaceFileTokens: Math.round(22000 + Math.random() * 24000),
      toolOutputTokens: Math.round(9000 + Math.random() * 14000),
      thinkingTokens: isFlash ? 1600 : 4400,
      outputTokens: Math.round(1400 + Math.random() * 2200),
      latencyMs: isFlash ? 620 : 1580,
      costUsd: isFlash ? 0.0028 : 0.0118,
    };

    setEvents((prevList) => [...prevList, newEvent]);
    setSelectedEventId(newEvent.id);
  };

  const handleExportCsv = () => {
    const header =
      'turn,timestamp,session_id,model,action_type,cached_tokens,workspace_file_tokens,tool_output_tokens,thinking_tokens,output_tokens,latency_ms,cost_usd';
    const rows = filteredEvents.map(
      (e) =>
        `${e.turnNumber},${e.timestamp},${e.sessionId},${e.model},${e.actionType},${e.cachedTokens},${e.workspaceFileTokens},${e.toolOutputTokens},${e.thinkingTokens},${e.outputTokens},${e.latencyMs},${e.costUsd}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'antigravity-gemini-session.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 2000);
  };

  const formatK = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    return `${(n / 1000).toFixed(1)}k`;
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F1F5F9] flex flex-col">
      {/* CLEAN 3-ZONE TOP HEADER */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-[#11131C] border-b border-white/[0.08] sticky top-0 z-30">
        {/* Zone 1: Single text wordmark */}
        <a
          href="#top"
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Antigravity · Gemini Context
        </a>

        {/* Zone 2: Concise navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a
            href="#chart-breakdown"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Turn Breakdown
          </a>
          <a
            href="#selected-turn"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Selected Event
          </a>
          <a
            href="#session-events"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Event Log
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleLogAntigravityTurn}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#3B82F6] rounded-md hover:bg-[#3B82F6]/90 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Simulate Next Turn
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 space-y-6">
        {/* FILTER & SESSION SELECTOR BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11131C] border border-white/[0.08] rounded-lg p-3.5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Antigravity Session Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Session:</span>
              <select
                aria-label="Filter Antigravity Session"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="bg-[#090A0F] border border-white/[0.1] rounded-md px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="all">All Antigravity Sessions (8 turns)</option>
                {ANTIGRAVITY_SESSIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Gemini Model Filter */}
            <div className="flex items-center bg-[#090A0F] border border-white/[0.08] rounded-md p-0.5">
              {(['All Gemini', 'gemini-2.5-pro', 'gemini-2.5-flash'] as GeminiModel[]).map(
                (mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setModelFilter(mod)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                      modelFilter === mod
                        ? 'bg-[#1E2231] text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mod}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-md bg-[#090A0F] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {exportedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">Exported CSV</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Session CSV</span>
              </>
            )}
          </button>
        </div>

        {/* 4 SIMPLE SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#11131C] border border-white/[0.08] rounded-lg p-4">
            <div className="text-xs text-slate-400">Current Gemini 1M Window Fill</div>
            <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-bold text-white">
                {formatK(totals.latestWindowTokens)}
              </span>
              <span className="text-xs text-[#3B82F6]">
                {totals.windowPct.toFixed(1)}% of 1M
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-[#090A0F] rounded overflow-hidden">
              <div
                className="h-full bg-[#3B82F6]"
                style={{ width: `${Math.min(100, totals.windowPct)}%` }}
              />
            </div>
          </div>

          <div className="bg-[#11131C] border border-white/[0.08] rounded-lg p-4">
            <div className="text-xs text-slate-400">Cached Context Hit Rate</div>
            <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-bold text-[#10B981]">
                {totals.grandTotal > 0
                  ? ((totals.cached / totals.grandTotal) * 100).toFixed(1)
                  : '0.0'}
                %
              </span>
              <span className="text-xs text-slate-400">
                {formatK(totals.cached)} cached
              </span>
            </div>
            <div className="mt-2.5 text-xs font-mono text-slate-400">
              Reused across {filteredEvents.length} Antigravity turns
            </div>
          </div>

          <div className="bg-[#11131C] border border-white/[0.08] rounded-lg p-4">
            <div className="text-xs text-slate-400">Workspace Files + Tool Output</div>
            <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-bold text-white">
                {formatK(totals.files + totals.tools)}
              </span>
              <span className="text-xs text-[#06B6D4]">
                {formatK(totals.tools)} tools
              </span>
            </div>
            <div className="mt-2.5 text-xs font-mono text-slate-400">
              {formatK(totals.files)} from view_file & diffs
            </div>
          </div>

          <div className="bg-[#11131C] border border-white/[0.08] rounded-lg p-4">
            <div className="text-xs text-slate-400">Thinking + Output & Cost</div>
            <div className="mt-1.5 flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-bold text-white">
                ${totals.cost.toFixed(4)}
              </span>
              <span className="text-xs text-[#F59E0B]">
                {formatK(totals.thinking)} think
              </span>
            </div>
            <div className="mt-2.5 text-xs font-mono text-slate-400">
              {formatK(totals.output)} code & text generated
            </div>
          </div>
        </section>

        {/* PRIMARY CHART BREAKDOWN */}
        <section id="chart-breakdown">
          <TokenChart
            events={filteredEvents}
            selectedEventId={selectedEvent?.id || null}
            onSelectEvent={(id) => setSelectedEventId(id)}
          />
        </section>

        {/* SELECTED EVENT VISUAL BREAKDOWN BAR */}
        {selectedEvent && (
          <section
            id="selected-turn"
            className="bg-[#11131C] border border-white/[0.08] rounded-lg p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-white font-semibold">
                    Turn #{selectedEvent.turnNumber} · {selectedEvent.actionType}
                  </span>
                  <span>·</span>
                  <span className="text-[#3B82F6]">{selectedEvent.model}</span>
                  <span>·</span>
                  <span>{selectedEvent.timestamp}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mt-1 font-mono">
                  {selectedEvent.actionSummary}
                </h3>
              </div>

              <div className="text-xs font-mono tabular-nums text-slate-300">
                Latency: <strong>{selectedEvent.latencyMs}ms</strong> · Cost:{' '}
                <strong className="text-white">${selectedEvent.costUsd.toFixed(4)}</strong>
              </div>
            </div>

            {/* Horizontal Proportional Bar for Selected Turn */}
            {(() => {
              const turnTotal =
                selectedEvent.cachedTokens +
                selectedEvent.workspaceFileTokens +
                selectedEvent.toolOutputTokens +
                selectedEvent.thinkingTokens +
                selectedEvent.outputTokens;
              const pct = (v: number) =>
                turnTotal > 0 ? Math.max(2, (v / turnTotal) * 100) : 0;

              const breakdownItems = [
                {
                  label: 'Cached Context',
                  tokens: selectedEvent.cachedTokens,
                  color: '#10B981',
                  icon: Layers,
                },
                {
                  label: 'Workspace Files',
                  tokens: selectedEvent.workspaceFileTokens,
                  color: '#3B82F6',
                  icon: FileCode,
                },
                {
                  label: 'Tool Outputs',
                  tokens: selectedEvent.toolOutputTokens,
                  color: '#06B6D4',
                  icon: Terminal,
                },
                {
                  label: 'Gemini Thinking',
                  tokens: selectedEvent.thinkingTokens,
                  color: '#F59E0B',
                  icon: Sparkles,
                },
                {
                  label: 'Model Output',
                  tokens: selectedEvent.outputTokens,
                  color: '#8B5CF6',
                  icon: Cpu,
                },
              ];

              return (
                <>
                  <div className="h-4 w-full rounded overflow-hidden flex bg-[#090A0F] p-0.5 border border-white/[0.08] gap-0.5">
                    {breakdownItems.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          width: `${pct(item.tokens)}%`,
                          backgroundColor: item.color,
                        }}
                        className="h-full first:rounded-l-xs last:rounded-r-xs"
                        title={`${item.label}: ${formatK(item.tokens)} tok`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    {breakdownItems.map((item) => {
                      const share =
                        turnTotal > 0 ? (item.tokens / turnTotal) * 100 : 0;
                      return (
                        <div
                          key={item.label}
                          className="bg-[#090A0F] border border-white/[0.06] rounded p-3 font-mono tabular-nums"
                        >
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                            <span
                              className="w-2 h-2 rounded-xs shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <div className="mt-1.5 flex items-baseline justify-between">
                            <span className="text-sm font-bold text-white">
                              {formatK(item.tokens)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {share.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </section>
        )}

        {/* SIMPLE ANTIGRAVITY SESSION EVENTS TABLE */}
        <section
          id="session-events"
          className="bg-[#11131C] border border-white/[0.08] rounded-lg p-5 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <h2 className="text-base font-semibold text-white">
              Antigravity Gemini Session Events ({filteredEvents.length})
            </h2>
            <span className="text-xs text-slate-400">
              Click any row to highlight turn in breakdown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-mono text-slate-400">
                  <th className="py-2.5 px-3">Turn</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Antigravity Action</th>
                  <th className="py-2.5 px-3">Gemini Model</th>
                  <th className="py-2.5 px-3 text-right">Cached</th>
                  <th className="py-2.5 px-3 text-right">Files + Tools</th>
                  <th className="py-2.5 px-3 text-right">Think + Out</th>
                  <th className="py-2.5 px-3 text-right">Total Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs font-mono tabular-nums">
                {filteredEvents.map((ev) => {
                  const total =
                    ev.cachedTokens +
                    ev.workspaceFileTokens +
                    ev.toolOutputTokens +
                    ev.thinkingTokens +
                    ev.outputTokens;
                  const isSelected = selectedEvent?.id === ev.id;

                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#3B82F6]/15'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        #{ev.turnNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200 max-w-md truncate">
                        <span className="text-slate-400 mr-1.5">
                          [{ev.actionType}]
                        </span>
                        {ev.actionSummary}
                      </td>
                      <td className="py-2.5 px-3 text-[#3B82F6] whitespace-nowrap">
                        {ev.model}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#10B981]">
                        {formatK(ev.cachedTokens)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200">
                        {formatK(ev.workspaceFileTokens + ev.toolOutputTokens)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#F59E0B]">
                        {formatK(ev.thinkingTokens + ev.outputTokens)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-white">
                        {formatK(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
