/**
 * Sugiyama-style layered graph layout for the skill tree.
 *
 * 1. Layers are assigned by phase (already given).
 * 2. Barycenter heuristic orders nodes within each layer to minimize crossings.
 * 3. Nodes are positioned with proper spacing and centering.
 */

import type { Phase, TrickInPhase } from "./types";

export interface LayoutNode {
  trick: TrickInPhase;
  phaseId: number;
  phaseName: string;
  phaseIdx: number;
  x: number;
  y: number;
}

export type AnchorSide = "top" | "bottom" | "left" | "right";

export interface LayoutEdge {
  fromId: number;
  toId: number;
}

export interface ResolvedEdge {
  fromId: number;
  toId: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fromSide: AnchorSide;
  toSide: AnchorSide;
}

/**
 * Same layer -> use left/right sides. Different layer -> use top/bottom.
 */
function resolveAnchors(
  from: { x: number; y: number },
  to: { x: number; y: number },
  gap: number
): { x1: number; y1: number; x2: number; y2: number; fromSide: AnchorSide; toSide: AnchorSide } {
  const sameRow = Math.abs(to.y - from.y) < NODE_H / 2;

  if (sameRow) {
    // Horizontal: connect via sides
    const goRight = to.x > from.x;
    return {
      x1: goRight ? from.x + NODE_W + gap : from.x - gap,
      y1: from.y + NODE_H / 2,
      x2: goRight ? to.x - gap : to.x + NODE_W + gap,
      y2: to.y + NODE_H / 2,
      fromSide: goRight ? "right" : "left",
      toSide: goRight ? "left" : "right",
    };
  }

  // Vertical: connect via top/bottom
  const goDown = to.y > from.y;
  return {
    x1: from.x + NODE_W / 2,
    y1: goDown ? from.y + NODE_H + gap : from.y - gap,
    x2: to.x + NODE_W / 2,
    y2: goDown ? to.y - gap : to.y + NODE_H + gap,
    fromSide: goDown ? "bottom" : "top",
    toSide: goDown ? "top" : "bottom",
  };
}

export interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  resolvedEdges: ResolvedEdge[];
  width: number;
  height: number;
  phaseLabels: { text: string; x: number; y: number }[];
}

const NODE_W = 160;
const NODE_H = 94;
const GAP_X = 32;
const GAP_Y = 90;
const PHASE_LABEL_H = 28;
const PAD_X = 28;
const PAD_Y = 20;

export { NODE_W, NODE_H };

export function computeLayout(phases: Phase[]): TreeLayout {
  // Collect official tricks per layer
  const layers: TrickInPhase[][] = [];
  const phaseInfo: { id: number; name: string }[] = [];

  for (const phase of phases) {
    const tricks = phase.tricks.filter((t) => !t.is_community);
    if (tricks.length === 0) continue;
    layers.push(tricks);
    phaseInfo.push({ id: phase.id, name: phase.name });
  }

  // Build a map of trick ID -> layer index + position
  const trickLayer = new Map<number, number>();
  for (let li = 0; li < layers.length; li++) {
    for (const t of layers[li]) {
      trickLayer.set(t.id, li);
    }
  }

  // Collect all edges
  const edges: LayoutEdge[] = [];
  const childrenOf = new Map<number, number[]>(); // parent -> children
  const parentsOf = new Map<number, number[]>(); // child -> parents

  for (let li = 0; li < layers.length; li++) {
    for (const t of layers[li]) {
      for (const pid of t.prerequisite_ids) {
        if (trickLayer.has(pid)) {
          edges.push({ fromId: pid, toId: t.id });
          if (!childrenOf.has(pid)) childrenOf.set(pid, []);
          childrenOf.get(pid)!.push(t.id);
          if (!parentsOf.has(t.id)) parentsOf.set(t.id, []);
          parentsOf.get(t.id)!.push(pid);
        }
      }
    }
  }

  // --- Barycenter ordering ---
  // Start with initial order (by difficulty, then name)
  const orderedLayers: TrickInPhase[][] = layers.map((layer) =>
    [...layer].sort((a, b) => a.difficulty - b.difficulty || a.name.localeCompare(b.name))
  );

  // Build position lookup: trick ID -> index in its layer
  function buildPosMap(): Map<number, number> {
    const m = new Map<number, number>();
    for (const layer of orderedLayers) {
      for (let i = 0; i < layer.length; i++) {
        m.set(layer[i].id, i);
      }
    }
    return m;
  }

  // Run barycenter heuristic (top-down then bottom-up) for a few iterations
  for (let iter = 0; iter < 4; iter++) {
    // Top-down pass: order each layer by average position of parents in previous layer
    for (let li = 1; li < orderedLayers.length; li++) {
      const posMap = buildPosMap();
      const scored = orderedLayers[li].map((t) => {
        const pars = parentsOf.get(t.id) || [];
        if (pars.length === 0) return { t, bary: posMap.get(t.id) ?? 0 };
        const avg = pars.reduce((s, p) => s + (posMap.get(p) ?? 0), 0) / pars.length;
        return { t, bary: avg };
      });
      scored.sort((a, b) => a.bary - b.bary);
      orderedLayers[li] = scored.map((s) => s.t);
    }

    // Bottom-up pass: order each layer by average position of children in next layer
    for (let li = orderedLayers.length - 2; li >= 0; li--) {
      const posMap = buildPosMap();
      const scored = orderedLayers[li].map((t) => {
        const kids = childrenOf.get(t.id) || [];
        if (kids.length === 0) return { t, bary: posMap.get(t.id) ?? 0 };
        const avg = kids.reduce((s, c) => s + (posMap.get(c) ?? 0), 0) / kids.length;
        return { t, bary: avg };
      });
      scored.sort((a, b) => a.bary - b.bary);
      orderedLayers[li] = scored.map((s) => s.t);
    }
  }

  // --- Position assignment ---
  // First pass: assign x based on order within layer, centered
  const nodePositions = new Map<number, { x: number; y: number }>();
  let curY = PAD_Y;
  let maxWidth = 0;

  // Calculate the maximum row width to center everything
  let maxRowWidth = 0;
  for (const layer of orderedLayers) {
    const w = layer.length * NODE_W + (layer.length - 1) * GAP_X;
    maxRowWidth = Math.max(maxRowWidth, w);
  }

  const phaseLabels: { text: string; x: number; y: number }[] = [];

  for (let li = 0; li < orderedLayers.length; li++) {
    const layer = orderedLayers[li];
    const rowWidth = layer.length * NODE_W + (layer.length - 1) * GAP_X;
    const offsetX = PAD_X + (maxRowWidth - rowWidth) / 2;

    phaseLabels.push({
      text: `Phase ${li + 1} \u2014 ${phaseInfo[li].name}`,
      x: PAD_X,
      y: curY + PHASE_LABEL_H - 6,
    });

    curY += PHASE_LABEL_H;

    for (let i = 0; i < layer.length; i++) {
      const x = offsetX + i * (NODE_W + GAP_X);
      nodePositions.set(layer[i].id, { x, y: curY });
      maxWidth = Math.max(maxWidth, x + NODE_W);
    }

    curY += NODE_H + GAP_Y;
  }

  // --- Refinement: shift nodes toward barycenter of their connections ---
  // This makes connected nodes align better vertically
  for (let pass = 0; pass < 3; pass++) {
    for (let li = 0; li < orderedLayers.length; li++) {
      const layer = orderedLayers[li];
      for (let i = 0; i < layer.length; i++) {
        const t = layer[i];
        const pos = nodePositions.get(t.id)!;
        const connected: number[] = [
          ...(parentsOf.get(t.id) || []),
          ...(childrenOf.get(t.id) || []),
        ];
        if (connected.length === 0) continue;

        // Target x = average x of connected nodes
        const avgX =
          connected.reduce((s, cid) => s + (nodePositions.get(cid)?.x ?? pos.x), 0) /
          connected.length;

        // Nudge toward target, but don't overlap neighbors
        const leftBound =
          i > 0
            ? nodePositions.get(layer[i - 1].id)!.x + NODE_W + GAP_X
            : PAD_X;
        const rightBound =
          i < layer.length - 1
            ? nodePositions.get(layer[i + 1].id)!.x - NODE_W - GAP_X
            : maxRowWidth + PAD_X;

        const nudge = (avgX - pos.x) * 0.3; // gentle nudge
        const newX = Math.max(leftBound, Math.min(rightBound, pos.x + nudge));
        nodePositions.set(t.id, { ...pos, x: newX });
      }
    }
  }

  // Build final nodes
  const layoutNodes: LayoutNode[] = [];
  for (let li = 0; li < orderedLayers.length; li++) {
    for (const t of orderedLayers[li]) {
      const pos = nodePositions.get(t.id)!;
      layoutNodes.push({
        trick: t,
        phaseId: phaseInfo[li].id,
        phaseName: phaseInfo[li].name,
        phaseIdx: li,
        x: pos.x,
        y: pos.y,
      });
    }
  }

  // Resolve edge anchor points
  const EDGE_GAP = 6;
  const resolvedEdges: ResolvedEdge[] = edges.map((e) => {
    const fromPos = nodePositions.get(e.fromId)!;
    const toPos = nodePositions.get(e.toId)!;
    const anchors = resolveAnchors(fromPos, toPos, EDGE_GAP);
    return { ...e, ...anchors };
  });

  return {
    nodes: layoutNodes,
    edges,
    resolvedEdges,
    width: maxWidth + PAD_X,
    height: curY - GAP_Y + NODE_H + PAD_Y,
    phaseLabels,
  };
}
