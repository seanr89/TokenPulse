export type GeminiModel = 'All Gemini' | 'gemini-2.5-pro' | 'gemini-2.5-flash';

export interface AntigravitySessionEvent {
  id: string;
  turnNumber: number;
  sessionId: string;
  sessionTitle: string;
  timestamp: string;
  actionType: 'Code Edit' | 'Tool Execution' | 'File Read' | 'Planning' | 'Terminal Run';
  actionSummary: string;
  model: Exclude<GeminiModel, 'All Gemini'>;
  contextWindowMax: number; // 1,000,000 for Gemini 2.5
  // Token segments for this event
  cachedTokens: number;
  workspaceFileTokens: number;
  toolOutputTokens: number;
  thinkingTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
}

export interface AntigravitySession {
  id: string;
  title: string;
  startedAt: string;
  defaultModel: Exclude<GeminiModel, 'All Gemini'>;
}

export const ANTIGRAVITY_SESSIONS: AntigravitySession[] = [
  {
    id: 'ag-942',
    title: 'ag-942 · Full-Stack Auth & API Refactor',
    startedAt: 'Today, 11:40 AM',
    defaultModel: 'gemini-2.5-pro',
  },
  {
    id: 'ag-941',
    title: 'ag-941 · UI Chart & Layout Simplification',
    startedAt: 'Today, 10:15 AM',
    defaultModel: 'gemini-2.5-flash',
  },
];

export const INITIAL_ANTIGRAVITY_EVENTS: AntigravitySessionEvent[] = [
  {
    id: 'evt-01',
    turnNumber: 1,
    sessionId: 'ag-942',
    sessionTitle: 'ag-942 · Full-Stack Auth & API Refactor',
    timestamp: '11:40:12',
    actionType: 'Planning',
    actionSummary: 'Initialize workspace context & read project structure',
    model: 'gemini-2.5-pro',
    contextWindowMax: 1000000,
    cachedTokens: 18000,
    workspaceFileTokens: 24000,
    toolOutputTokens: 6500,
    thinkingTokens: 3200,
    outputTokens: 1800,
    latencyMs: 1120,
    costUsd: 0.0068,
  },
  {
    id: 'evt-02',
    turnNumber: 2,
    sessionId: 'ag-942',
    sessionTitle: 'ag-942 · Full-Stack Auth & API Refactor',
    timestamp: '11:42:05',
    actionType: 'File Read',
    actionSummary: 'view_file on src/server.ts, src/auth/session.ts, package.json',
    model: 'gemini-2.5-pro',
    contextWindowMax: 1000000,
    cachedTokens: 46000,
    workspaceFileTokens: 38000,
    toolOutputTokens: 14200,
    thinkingTokens: 2900,
    outputTokens: 1400,
    latencyMs: 1340,
    costUsd: 0.0084,
  },
  {
    id: 'evt-03',
    turnNumber: 3,
    sessionId: 'ag-942',
    sessionTitle: 'ag-942 · Full-Stack Auth & API Refactor',
    timestamp: '11:44:38',
    actionType: 'Code Edit',
    actionSummary: 'replace_file_content in src/auth/session.ts (JWT token refresh)',
    model: 'gemini-2.5-pro',
    contextWindowMax: 1000000,
    cachedTokens: 89000,
    workspaceFileTokens: 42000,
    toolOutputTokens: 11800,
    thinkingTokens: 5400,
    outputTokens: 3900,
    latencyMs: 1890,
    costUsd: 0.0112,
  },
  {
    id: 'evt-04',
    turnNumber: 4,
    sessionId: 'ag-942',
    sessionTitle: 'ag-942 · Full-Stack Auth & API Refactor',
    timestamp: '11:46:19',
    actionType: 'Terminal Run',
    actionSummary: 'run_command: npm run test:unit (captured stdout & stack trace)',
    model: 'gemini-2.5-flash',
    contextWindowMax: 1000000,
    cachedTokens: 134000,
    workspaceFileTokens: 18000,
    toolOutputTokens: 31500,
    thinkingTokens: 1900,
    outputTokens: 1200,
    latencyMs: 680,
    costUsd: 0.0021,
  },
  {
    id: 'evt-05',
    turnNumber: 5,
    sessionId: 'ag-942',
    sessionTitle: 'ag-942 · Full-Stack Auth & API Refactor',
    timestamp: '11:48:51',
    actionType: 'Code Edit',
    actionSummary: 'multi_replace_file_content across middleware & route handlers',
    model: 'gemini-2.5-pro',
    contextWindowMax: 1000000,
    cachedTokens: 176000,
    workspaceFileTokens: 51000,
    toolOutputTokens: 16400,
    thinkingTokens: 6800,
    outputTokens: 4600,
    latencyMs: 2150,
    costUsd: 0.0148,
  },
  {
    id: 'evt-06',
    turnNumber: 6,
    sessionId: 'ag-942',
    sessionTitle: 'ag-942 · Full-Stack Auth & API Refactor',
    timestamp: '11:51:10',
    actionType: 'Tool Execution',
    actionSummary: 'compile_applet & lint verification check',
    model: 'gemini-2.5-flash',
    contextWindowMax: 1000000,
    cachedTokens: 238000,
    workspaceFileTokens: 15000,
    toolOutputTokens: 19200,
    thinkingTokens: 1400,
    outputTokens: 1100,
    latencyMs: 590,
    costUsd: 0.0026,
  },
  {
    id: 'evt-07',
    turnNumber: 7,
    sessionId: 'ag-941',
    sessionTitle: 'ag-941 · UI Chart & Layout Simplification',
    timestamp: '12:04:22',
    actionType: 'File Read',
    actionSummary: 'view_file on src/App.tsx & src/components/TokenChart.tsx',
    model: 'gemini-2.5-flash',
    contextWindowMax: 1000000,
    cachedTokens: 254000,
    workspaceFileTokens: 34000,
    toolOutputTokens: 12000,
    thinkingTokens: 2100,
    outputTokens: 1600,
    latencyMs: 640,
    costUsd: 0.0031,
  },
  {
    id: 'evt-08',
    turnNumber: 8,
    sessionId: 'ag-941',
    sessionTitle: 'ag-941 · UI Chart & Layout Simplification',
    timestamp: '12:12:45',
    actionType: 'Code Edit',
    actionSummary: 'write_to_file: simplified Gemini session chart & event breakdown',
    model: 'gemini-2.5-pro',
    contextWindowMax: 1000000,
    cachedTokens: 294200,
    workspaceFileTokens: 44000,
    toolOutputTokens: 21400,
    thinkingTokens: 4800,
    outputTokens: 3600,
    latencyMs: 1740,
    costUsd: 0.0124,
  },
];
