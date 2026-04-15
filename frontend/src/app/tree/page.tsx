"use client";

import { useEffect, useRef, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Phase, TrickInPhase, UserProgress } from "@/lib/types";
import { computeLayout, NODE_H, NODE_W } from "@/lib/tree-layout";
import type { LayoutNode, ResolvedEdge, AnchorSide } from "@/lib/tree-layout";

export default function TreePage() {
  const { user } = useAuth();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [learnedIds, setLearnedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<Phase[]>("/phases/");
        setPhases(data);
        if (user) {
          const progress = await apiGet<UserProgress[]>("/progress/");
          const allTricks = data.flatMap((p) => p.tricks);
          const slugs = new Set(progress.map((p) => p.trick_slug));
          setLearnedIds(
            new Set(allTricks.filter((t) => slugs.has(t.slug)).map((t) => t.id))
          );
        }
      } catch {
        /* */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const allOfficial = phases
    .flatMap((p) => p.tricks)
    .filter((t) => !t.is_community);
  const learnedCount = allOfficial.filter((t) => learnedIds.has(t.id)).length;

  const tree = computeLayout(phases);
  const posMap = new Map(tree.nodes.map((n) => [n.trick.id, n]));

  function getState(t: TrickInPhase) {
    const learned = learnedIds.has(t.id);
    const ready =
      !learned && t.prerequisite_ids.every((id) => learnedIds.has(id));
    return { learned, ready, locked: !learned && !ready };
  }

  async function toggleLearned(trick: TrickInPhase, nextLearned: boolean) {
    if (!user) return;
    // optimistic
    setLearnedIds((prev) => {
      const next = new Set(prev);
      if (nextLearned) next.add(trick.id);
      else next.delete(trick.id);
      return next;
    });
    try {
      if (nextLearned) {
        await apiPost(`/tricks/${trick.slug}/progress/`);
      } else {
        await apiDelete(`/tricks/${trick.slug}/progress/`);
      }
    } catch {
      setLearnedIds((prev) => {
        const next = new Set(prev);
        if (nextLearned) next.delete(trick.id);
        else next.add(trick.id);
        return next;
      });
    }
  }

  // Center scroll on mount
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const el = scrollRef.current;
      const scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollLeft = scrollLeft;
    }
  }, [loading, tree.width]);

  function isEdgeHighlighted(fromId: number, toId: number) {
    if (hovered === null) return false;
    return fromId === hovered || toId === hovered;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-800/50" />
        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-gray-800/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mx-auto max-w-5xl px-6 pt-10 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-orange-400">Freestyle</span> Skill Tree
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Follow the path. Lines connect prerequisites.
            </p>
          </div>
          {user && (
            <div className="rounded-lg border border-gray-800 bg-[#111827] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-600">
                    Progress
                  </p>
                  <p className="text-sm font-bold text-white">
                    {learnedCount}{" "}
                    <span className="font-normal text-gray-500">
                      / {allOfficial.length}
                    </span>
                  </p>
                </div>
                <div className="h-1.5 w-20 rounded-full bg-gray-800">
                  <div
                    className="h-1.5 rounded-full bg-orange-500 transition-all"
                    style={{
                      width: `${allOfficial.length > 0 ? (learnedCount / allOfficial.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-500)]" />{" "}
            Learned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Ready
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-700" /> Locked
          </span>
          {user && (
            <span className="text-gray-600">
              · Tip: click the circle on a card to toggle learned.
            </span>
          )}
        </div>
      </div>

      {/* Tree — height capped to viewport so the horizontal scrollbar stays pinned to the bottom */}
      <div
        ref={scrollRef}
        className="relative overflow-auto px-4 pb-4"
        style={{ height: "calc(100vh - 210px)" }}
      >
        {/* Phase labels — repositioned on scroll via JS */}
        {tree.phaseLabels.map((lbl, i) => (
          <PhaseLabel
            key={i}
            text={lbl.text}
            top={lbl.y - 6}
            scrollRef={scrollRef}
          />
        ))}
        <svg
          viewBox={`0 0 ${tree.width} ${tree.height}`}
          width={tree.width}
          height={tree.height}
          className="mx-auto block"
          style={{ minWidth: tree.width }}
        >
          <defs>
            <filter id="glow-o" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arr-gray"
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <polygon points="0,0 6,3 0,6" fill="#374151" opacity="0.5" />
            </marker>
            <marker
              id="arr-green"
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <polygon points="0,0 6,3 0,6" fill="#10b981" opacity="0.7" />
            </marker>
            <marker
              id="arr-hl"
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <polygon points="0,0 6,3 0,6" fill="#f97316" opacity="0.9" />
            </marker>
          </defs>

          {/* Phase labels rendered as sticky HTML above */}

          {/* Edges */}
          {tree.resolvedEdges.map((e, i) => {
            const { x1, y1, x2, y2, fromSide, toSide } = e;

            // Build bezier control points based on which sides we're connecting
            const dist = Math.hypot(x2 - x1, y2 - y1) * 0.4;
            const cp = (side: AnchorSide, x: number, y: number, d: number) => {
              switch (side) {
                case "top":    return { cx: x, cy: y - d };
                case "bottom": return { cx: x, cy: y + d };
                case "left":   return { cx: x - d, cy: y };
                case "right":  return { cx: x + d, cy: y };
              }
            };
            const c1 = cp(fromSide, x1, y1, dist);
            const c2 = cp(toSide, x2, y2, dist);
            const d = `M${x1},${y1} C${c1.cx},${c1.cy} ${c2.cx},${c2.cy} ${x2},${y2}`;

            const bothDone =
              learnedIds.has(e.fromId) && learnedIds.has(e.toId);
            const hl = isEdgeHighlighted(e.fromId, e.toId);

            const stroke = hl
              ? "#f97316"
              : bothDone
                ? "#10b981"
                : "#374151";
            const opacity = hl ? 0.85 : bothDone ? 0.6 : 0.3;
            const width = hl ? 2.5 : bothDone ? 2 : 1.5;
            const marker = hl
              ? "url(#arr-hl)"
              : bothDone
                ? "url(#arr-green)"
                : "url(#arr-gray)";
            const dash = hl || bothDone ? undefined : "5 4";

            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={width}
                strokeDasharray={dash}
                opacity={opacity}
                markerEnd={marker}
              />
            );
          })}

          {/* Nodes */}
          {tree.nodes.map((n) => (
            <TrickNode
              key={n.trick.id}
              node={n}
              nodeState={getState(n.trick)}
              isHovered={hovered === n.trick.id}
              onHover={setHovered}
              canToggle={Boolean(user)}
              onToggleLearned={(next) => toggleLearned(n.trick, next)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function TrickNode({
  node: n,
  nodeState: { learned, ready, locked },
  isHovered,
  onHover,
  canToggle,
  onToggleLearned,
}: {
  node: LayoutNode;
  nodeState: { learned: boolean; ready: boolean; locked: boolean };
  isHovered: boolean;
  onHover: (id: number | null) => void;
  canToggle: boolean;
  onToggleLearned: (nextLearned: boolean) => void;
}) {
  const accent = learned ? "#10b981" : ready ? "#f97316" : "#1f2937";
  const nameColor = learned ? "#fff" : ready ? "#fde047" : "#6b7280";
  // Logged-in users can toggle learned on ready or already-learned tricks (not locked)
  const toggleable = canToggle && !locked;

  return (
    <a href={`/tricks/${n.trick.slug}`}>
      <g
        style={{ cursor: "pointer" }}
        opacity={locked ? 0.4 : 1}
        onMouseEnter={() => onHover(n.trick.id)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Glow */}
        {ready && (
          <rect
            x={n.x - 4}
            y={n.y - 4}
            width={NODE_W + 8}
            height={NODE_H + 8}
            rx={14}
            fill="none"
            stroke="#f97316"
            strokeWidth={1}
            opacity={0.2}
            filter="url(#glow-o)"
          />
        )}

        {/* Card */}
        <rect
          x={n.x}
          y={n.y}
          width={NODE_W}
          height={NODE_H}
          rx={10}
          fill="#111827"
          stroke={isHovered && !locked ? "#9ca3af" : accent}
          strokeWidth={learned || ready || isHovered ? 1.5 : 1}
        />

        {/* Top accent */}
        {(learned || ready) && (
          <line
            x1={n.x + 12}
            y1={n.y + 1}
            x2={n.x + NODE_W - 12}
            y2={n.y + 1}
            stroke={accent}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Status dot */}
        <circle
          cx={n.x + NODE_W - 16}
          cy={n.y + 16}
          r={5}
          fill={learned ? "#10b981" : ready ? "#f97316" : "#374151"}
          opacity={locked ? 0.3 : 1}
        />
        {learned && (
          <text
            x={n.x + NODE_W - 16}
            y={n.y + 19.5}
            fontSize={8}
            fill="#fff"
            textAnchor="middle"
            fontWeight={800}
          >
            ✓
          </text>
        )}

        {/* Name */}
        <text
          x={n.x + 12}
          y={n.y + 22}
          fill={nameColor}
          fontSize={12}
          fontWeight={600}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {n.trick.name.length > 16
            ? n.trick.name.slice(0, 15) + "\u2026"
            : n.trick.name}
        </text>

        {/* Difficulty + video count */}
        <text
          x={n.x + 12}
          y={n.y + 42}
          fontSize={10}
          fontWeight={700}
          fontFamily="Inter, system-ui, sans-serif"
          fill={
            n.trick.difficulty <= 3
              ? "#4ade80"
              : n.trick.difficulty <= 6
                ? "#facc15"
                : "#f87171"
          }
          opacity={0.9}
        >
          Lvl {n.trick.difficulty}
        </text>
        {n.trick.video_count > 0 && (
          <text
            x={n.x + 58}
            y={n.y + 42}
            fontSize={9}
            fill="#6b7280"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {n.trick.video_count} video
            {n.trick.video_count !== 1 ? "s" : ""}
          </text>
        )}

        {/* Description */}
        <text
          x={n.x + 12}
          y={n.y + 60}
          fontSize={9}
          fill="#4b5563"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {n.trick.description.slice(0, 23)}
          {n.trick.description.length > 23 ? "\u2026" : ""}
        </text>
      </g>

      {/* Learned pill at bottom-right — hidden on already-learned tiles */}
      {canToggle && !learned && (
        <g
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleLearned(!learned);
          }}
          style={{ cursor: "pointer" }}
        >
          <rect
            x={n.x + NODE_W - 64}
            y={n.y + NODE_H - 22}
            width={56}
            height={18}
            rx={9}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1}
          >
            <title>Click to mark as learned</title>
          </rect>
          <text
            x={n.x + NODE_W - 36}
            y={n.y + NODE_H - 10}
            fontSize={9}
            fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
            fill="#d1d5db"
            textAnchor="middle"
            style={{ pointerEvents: "none", textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            Learned
          </text>
        </g>
      )}
    </a>
  );
}

function PhaseLabel({
  text,
  top,
  scrollRef,
}: {
  text: string;
  top: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !labelRef.current) return;

    function onScroll() {
      if (labelRef.current && container) {
        labelRef.current.style.transform = `translateX(${container.scrollLeft}px)`;
      }
    }

    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <div
      ref={labelRef}
      className="pointer-events-none absolute z-10"
      style={{ top }}
    >
      <span className="inline-block rounded-r-md bg-[#0a0f1e]/95 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 backdrop-blur-sm">
        {text}
      </span>
    </div>
  );
}
