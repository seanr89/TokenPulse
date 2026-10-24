import React, { useState } from 'react';
import { AntigravitySessionEvent } from '../data/telemetryData';
import { BarChart3, Layers } from 'lucide-react';

interface TokenChartProps {
  events: AntigravitySessionEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
}

const SEGMENTS = [
  { key: 'cachedTokens', label: 'Cached Context', color: '#10B981' },
  { key: 'workspaceFileTokens', label: 'Workspace Files', color: '#3B82F6' },
  { key: 'toolOutputTokens', label: 'Tool Outputs', color: '#06B6D4' },
  { key: 'thinkingTokens', label: 'Gemini Thinking', color: '#F59E0B' },
  { key: 'outputTokens', label: 'Model Output', color: '#8B5CF6' },
] as const;

export const TokenChart: React.FC<TokenChartProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
}) => {
  const [chartStyle, setChartStyle] = useState<'bar' | 'area'>('bar');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points = events.map((ev) => {
    const total =
      ev.cachedTokens +
      ev.workspaceFileTokens +
      ev.toolOutputTokens +
      ev.thinkingTokens +
      ev.outputTokens;
    return {
      ...ev,
      total,
    };
  });

  const maxTotal = Math.max(...points.map((p) => p.total), 50000) * 1.1;

  const svgWidth = 860;
  const svgHeight = 260;
  const padLeft = 56;
  const padRight = 20;
  const padTop = 16;
  const padBottom = 32;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const xForIndex = (i: number) =>
    points.length === 1
      ? padLeft + plotW / 2
      : padLeft + (i / Math.max(1, points.length - 1)) * plotW;

  const yForValue = (val: number) =>
    padTop + plotH - Math.min(1, Math.max(0, val / maxTotal)) * plotH;

  const formatK = (n: number) => `${(n / 1000).toFixed(1)}k`;

  // Stacked area layers if area mode is selected
  const stackedAreaLayers = SEGMENTS.map((seg, sIdx) => {
    const topCoords: { x: number; y: number }[] = [];
    const bottomCoords: { x: number; y: number }[] = [];

    points.forEach((pt, i) => {
      let below = 0;
      for (let j = 0; j < sIdx; j++) {
        below += pt[SEGMENTS[j].key];
      }
      const current = pt[seg.key];
      const top = below + current;
      const x = xForIndex(i);
      topCoords.push({ x, y: yForValue(top) });
      bottomCoords.push({ x, y: yForValue(below) });
    });

    const areaPath =
      topCoords
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ') +
      ' ' +
      [...bottomCoords]
        .reverse()
        .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ') +
      ' Z';

    const linePath = topCoords
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    return { seg, areaPath, linePath };
  });

  const activeEvent =
    hoveredIdx !== null && points[hoveredIdx]
      ? points[hoveredIdx]
      : points.find((p) => p.id === selectedEventId) || points[points.length - 1];

  return (
    <div className="bg-[#11131C] border border-white/[0.08] rounded-lg p-5 space-y-4">
      {/* Header & Style Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-base font-semibold text-white">
            Antigravity Session Context Breakdown by Turn
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click or hover any turn to inspect how Gemini context tokens are distributed across cache, files, tools, and thinking
          </p>
        </div>

        <div className="flex items-center bg-[#090A0F] border border-white/[0.08] rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setChartStyle('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              chartStyle === 'bar'
                ? 'bg-[#1E2231] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Stacked Bars
          </button>
          <button
            type="button"
            onClick={() => setChartStyle('area')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              chartStyle === 'area'
                ? 'bg-[#1E2231] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Area Growth
          </button>
        </div>
      </div>

      {/* Legend & Active Turn Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {SEGMENTS.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-300 font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {activeEvent && (
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums bg-[#090A0F] border border-white/[0.08] px-3 py-1.5 rounded">
            <span className="text-[#3B82F6] font-semibold">
              Turn #{activeEvent.turnNumber} ({activeEvent.actionType})
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-white font-semibold">
              {formatK(activeEvent.total)} total tok
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[#10B981]">{activeEvent.model}</span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full pt-1 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[260px] overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = maxTotal * ratio;
            const y = yForValue(val);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {formatK(val)}
                </text>
              </g>
            );
          })}

          {/* Area View */}
          {chartStyle === 'area' &&
            stackedAreaLayers.map((l) => (
              <g key={l.seg.key}>
                <path d={l.areaPath} fill={l.seg.color} fillOpacity={0.28} />
                <path
                  d={l.linePath}
                  fill="none"
                  stroke={l.seg.color}
                  strokeWidth="2"
                />
              </g>
            ))}

          {/* Stacked Bar View */}
          {chartStyle === 'bar' &&
            points.map((pt, i) => {
              const barWidth = Math.min(48, (plotW / Math.max(1, points.length)) * 0.58);
              const centerX = xForIndex(i);
              let cumulativeBelow = 0;
              const isSelected = pt.id === selectedEventId;
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={pt.id}
                  className="cursor-pointer"
                  onClick={() => onSelectEvent(pt.id)}
                >
                  {isSelected && (
                    <rect
                      x={centerX - barWidth / 2 - 5}
                      y={padTop}
                      width={barWidth + 10}
                      height={plotH}
                      fill="rgba(59, 130, 246, 0.08)"
                      stroke="rgba(59, 130, 246, 0.35)"
                      strokeDasharray="2 2"
                      rx={4}
                    />
                  )}
                  {SEGMENTS.map((seg) => {
                    const val = pt[seg.key];
                    const yBottom = yForValue(cumulativeBelow);
                    const yTop = yForValue(cumulativeBelow + val);
                    const h = Math.max(0, yBottom - yTop);
                    cumulativeBelow += val;

                    return (
                      <rect
                        key={seg.key}
                        x={centerX - barWidth / 2}
                        y={yTop}
                        width={barWidth}
                        height={h}
                        fill={seg.color}
                        fillOpacity={isHovered || isSelected ? 0.96 : 0.8}
                        rx={1.5}
                      />
                    );
                  })}
                </g>
              );
            })}

          {/* X-Axis Turn Labels */}
          {points.map((pt, i) => {
            const isSelected = pt.id === selectedEventId;
            return (
              <text
                key={pt.id}
                x={xForIndex(i)}
                y={svgHeight - 8}
                textAnchor="middle"
                className={`text-[11px] font-mono ${
                  isSelected || hoveredIdx === i
                    ? 'fill-white font-bold'
                    : 'fill-slate-400'
                }`}
              >
                Turn {pt.turnNumber}
              </text>
            );
          })}

          {/* Interactive Hit Zones */}
          {points.map((pt, i) => {
            const colW = plotW / Math.max(1, points.length);
            const x = xForIndex(i) - colW / 2;
            return (
              <rect
                key={`hit-${pt.id}`}
                x={Math.max(padLeft, x)}
                y={padTop}
                width={colW}
                height={plotH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onClick={() => onSelectEvent(pt.id)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
