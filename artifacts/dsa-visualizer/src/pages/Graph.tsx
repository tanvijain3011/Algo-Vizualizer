import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Info, Plus, Minus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVisualizer } from "@/hooks/use-visualizer";
import { generateBFSSteps, generateDFSSteps } from "@/algorithms/graph";
import type { GraphNode, GraphEdge, GraphStep } from "@/algorithms/graph";

// ─── Presets ─────────────────────────────────────────────────────────────────

type Preset = { name: string; nodes: GraphNode[]; edges: GraphEdge[] };

const PRESETS: Preset[] = [
  {
    name: "Simple Path",
    nodes: [
      { id: 1, label: "A", x: 80, y: 200 },
      { id: 2, label: "B", x: 220, y: 200 },
      { id: 3, label: "C", x: 360, y: 200 },
      { id: 4, label: "D", x: 500, y: 200 },
    ],
    edges: [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }],
  },
  {
    name: "Binary Tree",
    nodes: [
      { id: 1, label: "A", x: 300, y: 50 },
      { id: 2, label: "B", x: 160, y: 150 },
      { id: 3, label: "C", x: 440, y: 150 },
      { id: 4, label: "D", x: 80,  y: 260 },
      { id: 5, label: "E", x: 240, y: 260 },
      { id: 6, label: "F", x: 360, y: 260 },
      { id: 7, label: "G", x: 520, y: 260 },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 1, to: 3 },
      { from: 2, to: 4 }, { from: 2, to: 5 },
      { from: 3, to: 6 }, { from: 3, to: 7 },
    ],
  },
  {
    name: "Cycle",
    nodes: [
      { id: 1, label: "A", x: 300, y: 60  },
      { id: 2, label: "B", x: 480, y: 190 },
      { id: 3, label: "C", x: 420, y: 360 },
      { id: 4, label: "D", x: 180, y: 360 },
      { id: 5, label: "E", x: 120, y: 190 },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 1 }, { from: 1, to: 3 },
    ],
  },
  {
    name: "Grid",
    nodes: [
      { id: 1, label: "A", x: 100, y: 100 }, { id: 2, label: "B", x: 260, y: 100 }, { id: 3, label: "C", x: 420, y: 100 },
      { id: 4, label: "D", x: 100, y: 250 }, { id: 5, label: "E", x: 260, y: 250 }, { id: 6, label: "F", x: 420, y: 250 },
      { id: 7, label: "G", x: 100, y: 400 }, { id: 8, label: "H", x: 260, y: 400 }, { id: 9, label: "I", x: 420, y: 400 },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 4, to: 5 }, { from: 5, to: 6 },
      { from: 7, to: 8 }, { from: 8, to: 9 },
      { from: 1, to: 4 }, { from: 4, to: 7 },
      { from: 2, to: 5 }, { from: 5, to: 8 },
      { from: 3, to: 6 }, { from: 6, to: 9 },
    ],
  },
];

type Mode = "none" | "addNode" | "addEdge";

const NODE_R = 24;
const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function nextLabel(nodes: GraphNode[]): string {
  for (const ch of LABELS) {
    if (!nodes.find(n => n.label === ch)) return ch;
  }
  return String(nodes.length + 1);
}

export default function Graph() {
  const [nodes, setNodes] = useState<GraphNode[]>(PRESETS[1].nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(PRESETS[1].edges);
  const [mode, setMode] = useState<Mode>("none");
  const [edgeSource, setEdgeSource] = useState<number | null>(null);
  const [startNodeId, setStartNodeId] = useState<number>(PRESETS[1].nodes[0].id);
  const [algo, setAlgo] = useState<"bfs" | "dfs">("bfs");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const idCounter = useRef(100);

  // ─── Generate steps ─────────────────────────────────────────────────────
  const steps: GraphStep[] = useMemo(() => {
    if (!nodes.length) return [];
    const validStart = nodes.find(n => n.id === startNodeId) ? startNodeId : nodes[0].id;
    return algo === "bfs"
      ? generateBFSSteps(nodes, edges, validStart)
      : generateDFSSteps(nodes, edges, validStart);
  }, [nodes, edges, startNodeId, algo]);

  const {
    currentStep,
    currentStepIndex,
    isPlaying,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    speed,
    setSpeed,
  } = useVisualizer(steps, 700);

  // ─── SVG interaction helpers ─────────────────────────────────────────────
  const getSVGCoords = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const nodeAtPoint = (x: number, y: number): GraphNode | null =>
    nodes.find(n => Math.hypot(n.x - x, n.y - y) <= NODE_R) ?? null;

  // ─── Mouse events ────────────────────────────────────────────────────────
  const handleSVGMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === "line") {
      // Clicked on empty canvas or edge
      if (mode === "addNode") {
        const { x, y } = getSVGCoords(e);
        const id = ++idCounter.current;
        const label = nextLabel(nodes);
        const newNode: GraphNode = { id, label, x, y };
        setNodes(ns => [...ns, newNode]);
        reset();
        if (nodes.length === 0) setStartNodeId(id);
      }
      setEdgeSource(null);
      return;
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    if (isPlaying) return;

    if (mode === "none") {
      // Start drag
      const { x, y } = getSVGCoords(e as unknown as React.MouseEvent<SVGSVGElement>);
      const node = nodes.find(n => n.id === nodeId)!;
      dragOffset.current = { x: x - node.x, y: y - node.y };
      setDraggingId(nodeId);
    } else if (mode === "addEdge") {
      if (edgeSource === null) {
        setEdgeSource(nodeId);
      } else if (edgeSource !== nodeId) {
        const alreadyExists = edges.some(
          ed => (ed.from === edgeSource && ed.to === nodeId) || (ed.from === nodeId && ed.to === edgeSource)
        );
        if (!alreadyExists) {
          setEdges(es => [...es, { from: edgeSource, to: nodeId }]);
          reset();
        }
        setEdgeSource(null);
      } else {
        setEdgeSource(null);
      }
    }
  };

  const handleSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingId === null) return;
    const { x, y } = getSVGCoords(e);
    setNodes(ns =>
      ns.map(n => n.id === draggingId ? { ...n, x: x - dragOffset.current.x, y: y - dragOffset.current.y } : n)
    );
  };

  const handleSVGMouseUp = () => {
    if (draggingId !== null) {
      setDraggingId(null);
      reset();
    }
  };

  const deleteSelectedNode = (nodeId: number) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId));
    setEdges(es => es.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (startNodeId === nodeId) {
      const remaining = nodes.filter(n => n.id !== nodeId);
      if (remaining.length) setStartNodeId(remaining[0].id);
    }
    reset();
  };

  const loadPreset = (preset: Preset) => {
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setStartNodeId(preset.nodes[0].id);
    setEdgeSource(null);
    setMode("none");
    reset();
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setEdgeSource(null);
    setMode("none");
    reset();
  };

  // ─── Node color ─────────────────────────────────────────────────────────
  const getNodeStyle = (node: GraphNode) => {
    if (!currentStep) return { stroke: "hsl(var(--primary))", fill: "hsl(var(--primary) / 0.12)" };
    if (currentStep.currentNode === node.id)
      return { stroke: "hsl(var(--chart-comparing))", fill: "hsl(var(--chart-comparing) / 0.2)", glow: true };
    if (currentStep.visitedNodes.includes(node.id))
      return { stroke: "hsl(var(--chart-sorted))", fill: "hsl(var(--chart-sorted) / 0.15)" };
    if (currentStep.queueOrStack.includes(node.id))
      return { stroke: "hsl(var(--chart-swapping))", fill: "hsl(var(--chart-swapping) / 0.12)" };
    return { stroke: "hsl(var(--primary))", fill: "hsl(var(--primary) / 0.10)" };
  };

  const speedSteps = [900, 700, 500, 300, 150];
  const speedLabel = speed >= 800 ? "Slow" : speed >= 500 ? "Medium" : speed >= 250 ? "Fast" : "Very Fast";

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Graph Traversal</h1>
        <p className="text-sm text-muted-foreground mt-1">Visualize BFS and DFS traversal on an interactive node graph.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 flex-1">
        {/* Left: Canvas + Controls */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Toolbar */}
          <Card className="bg-card">
            <CardContent className="p-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={mode === "addNode" ? "default" : "outline"}
                  onClick={() => { setMode(m => m === "addNode" ? "none" : "addNode"); setEdgeSource(null); }}
                  className="font-mono text-xs gap-1"
                  data-testid="btn-add-node"
                >
                  <Plus className="w-3.5 h-3.5" /> Node
                </Button>
                <Button
                  size="sm"
                  variant={mode === "addEdge" ? "default" : "outline"}
                  onClick={() => { setMode(m => m === "addEdge" ? "none" : "addEdge"); setEdgeSource(null); }}
                  className="font-mono text-xs gap-1"
                  data-testid="btn-add-edge"
                >
                  <GitBranch className="w-3.5 h-3.5" /> Edge
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll} className="font-mono text-xs gap-1" data-testid="btn-clear">
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </Button>
              </div>

              <div className="h-5 w-px bg-border" />

              <div className="flex items-center gap-1 flex-wrap">
                {PRESETS.map(p => (
                  <Button key={p.name} size="sm" variant="ghost" onClick={() => loadPreset(p)} className="font-mono text-xs" data-testid={`preset-${p.name}`}>
                    {p.name}
                  </Button>
                ))}
              </div>

              <div className="h-5 w-px bg-border" />

              <div className="flex items-center gap-2">
                <Select value={algo} onValueChange={(v: "bfs" | "dfs") => { setAlgo(v); reset(); }}>
                  <SelectTrigger className="w-20 h-8 font-mono text-xs" data-testid="algo-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bfs">BFS</SelectItem>
                    <SelectItem value="dfs">DFS</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={String(startNodeId)}
                  onValueChange={v => { setStartNodeId(Number(v)); reset(); }}
                >
                  <SelectTrigger className="w-24 h-8 font-mono text-xs" data-testid="start-node-select">
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map(n => (
                      <SelectItem key={n.id} value={String(n.id)}>Start: {n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mode hint */}
          {mode !== "none" && (
            <div className="text-xs font-mono bg-primary/10 text-primary border border-primary/30 rounded px-3 py-2">
              {mode === "addNode" && "Click anywhere on the canvas to add a node"}
              {mode === "addEdge" && (edgeSource === null
                ? "Click a node to select the edge source"
                : `Source: ${nodes.find(n => n.id === edgeSource)?.label} — now click the destination node`
              )}
            </div>
          )}

          {/* SVG Canvas */}
          <Card className="bg-card flex-1 overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="font-mono text-sm text-muted-foreground">
                Step <span className="text-primary font-bold">{currentStepIndex}</span> / {Math.max(0, steps.length - 1)}
              </div>
              <div className="font-mono text-xs bg-muted/50 px-3 py-1 rounded max-w-xs truncate">
                {currentStep?.description ?? (nodes.length ? "Configure and run traversal" : "Add nodes to start")}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={reset} disabled={isPlaying} data-testid="graph-reset"><RotateCcw className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={stepBack} disabled={isPlaying || currentStepIndex === 0} data-testid="graph-step-back"><SkipBack className="w-3.5 h-3.5" /></Button>
                <Button
                  variant={isPlaying ? "destructive" : "default"}
                  size="icon" className="h-7 w-7"
                  onClick={isPlaying ? pause : play}
                  disabled={!nodes.length || currentStepIndex >= steps.length - 1}
                  data-testid="graph-play"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={stepForward} disabled={isPlaying || currentStepIndex >= steps.length - 1} data-testid="graph-step-forward"><SkipForward className="w-3.5 h-3.5" /></Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-mono text-xs h-7"
                  onClick={() => {
                    const cur = speedSteps.indexOf(speed);
                    const next = cur >= 0 ? speedSteps[(cur + 1) % speedSteps.length] : speedSteps[1];
                    setSpeed(next);
                  }}
                  data-testid="speed-toggle"
                >
                  {speedLabel}
                </Button>
              </div>
            </div>

            <svg
              ref={svgRef}
              className="w-full h-full min-h-[380px]"
              style={{ cursor: mode === "addNode" ? "crosshair" : draggingId !== null ? "grabbing" : "default" }}
              onMouseDown={handleSVGMouseDown}
              onMouseMove={handleSVGMouseMove}
              onMouseUp={handleSVGMouseUp}
              onMouseLeave={handleSVGMouseUp}
              data-testid="graph-canvas"
            >
              {/* Edges */}
              {edges.map((edge, i) => {
                const from = nodes.find(n => n.id === edge.from);
                const to = nodes.find(n => n.id === edge.to);
                if (!from || !to) return null;
                const isActive = currentStep &&
                  ((currentStep.currentNode === edge.from && currentStep.visitedNodes.includes(edge.to)) ||
                   (currentStep.currentNode === edge.to && currentStep.visitedNodes.includes(edge.from)));
                return (
                  <line
                    key={i}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={isActive ? "hsl(var(--chart-sorted))" : "hsl(var(--border))"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                  />
                );
              })}

              {/* Edge being drawn */}
              {/* Nodes */}
              {nodes.map(node => {
                const style = getNodeStyle(node);
                const isEdgeSrc = edgeSource === node.id;
                const isStart = node.id === startNodeId;
                return (
                  <g
                    key={node.id}
                    style={{ cursor: mode === "none" ? "grab" : "pointer" }}
                    onMouseDown={e => handleNodeMouseDown(e, node.id)}
                    onDoubleClick={e => { e.stopPropagation(); deleteSelectedNode(node.id); }}
                    data-testid={`graph-node-${node.label}`}
                  >
                    <circle
                      cx={node.x} cy={node.y} r={NODE_R}
                      fill={isEdgeSrc ? "hsl(var(--chart-comparing) / 0.25)" : style.fill}
                      stroke={isEdgeSrc ? "hsl(var(--chart-comparing))" : style.stroke}
                      strokeWidth={isEdgeSrc || style.glow ? 3 : 2}
                      style={{
                        filter: style.glow ? `drop-shadow(0 0 8px ${style.stroke})` : undefined,
                        transition: "fill 0.3s, stroke 0.3s, filter 0.3s"
                      }}
                    />
                    <text
                      x={node.x} y={node.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={14}
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={style.stroke}
                      style={{ userSelect: "none", transition: "fill 0.3s" }}
                    >
                      {node.label}
                    </text>
                    {isStart && (
                      <text
                        x={node.x} y={node.y - NODE_R - 6}
                        textAnchor="middle"
                        fontSize={9}
                        fontFamily="monospace"
                        fill="hsl(var(--muted-foreground))"
                        style={{ userSelect: "none" }}
                      >
                        START
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </Card>

          <p className="text-xs font-mono text-muted-foreground text-center">
            Drag nodes to reposition • Double-click a node to delete
          </p>
        </div>

        {/* Right: Info Panel */}
        <div className="w-full xl:w-72 flex flex-col gap-4">
          {/* Algorithm Info */}
          <Card className="bg-card">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-sm font-mono text-primary flex items-center gap-2">
                <Info className="w-4 h-4" />
                {algo === "bfs" ? "Breadth-First Search" : "Depth-First Search"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <p className="text-muted-foreground text-xs leading-relaxed">
                {algo === "bfs"
                  ? "Explores all neighbors at the current depth before going deeper. Uses a queue. Finds shortest paths in unweighted graphs."
                  : "Explores as far as possible along each branch before backtracking. Uses a stack (or recursion). Good for topological sorting and cycle detection."}
              </p>
              <div className="font-mono space-y-1 text-xs">
                {[
                  ["Time", "O(V + E)", "V=nodes, E=edges"],
                  ["Space", algo === "bfs" ? "O(V)" : "O(V)", "Visited set"],
                  ["Data Struct", algo === "bfs" ? "Queue" : "Stack", "For frontier"],
                ].map(([k, v, d]) => (
                  <div key={k} className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-primary font-bold">{v}</span>
                    <span className="text-muted-foreground text-[10px]">{d}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-comparing))" }} />
                  <span className="text-muted-foreground">Current node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-swapping))" }} />
                  <span className="text-muted-foreground">In {algo === "bfs" ? "queue" : "stack"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-sorted))" }} />
                  <span className="text-muted-foreground">Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--primary))" }} />
                  <span className="text-muted-foreground">Unvisited</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue/Stack state */}
          <Card className="bg-card">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {algo === "bfs" ? "Queue" : "Stack"} State
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {!currentStep || currentStep.queueOrStack.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground">{currentStep ? "Empty" : "Not started"}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {currentStep.queueOrStack.map((id, i) => {
                    const n = nodes.find(nd => nd.id === id);
                    return (
                      <Badge key={`${id}-${i}`} variant="outline" className="font-mono text-xs" style={{ borderColor: "hsl(var(--chart-swapping))", color: "hsl(var(--chart-swapping))" }}>
                        {n?.label ?? id}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Traversal order */}
          <Card className="bg-card">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Traversal Order</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {!currentStep || currentStep.traversalOrder.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground">No nodes visited yet</p>
              ) : (
                <div className="flex flex-wrap gap-1 items-center">
                  {currentStep.traversalOrder.map((id, i) => {
                    const n = nodes.find(nd => nd.id === id);
                    return (
                      <span key={`${id}-${i}`} className="flex items-center gap-0.5">
                        <Badge className="font-mono text-xs" style={{ background: "hsl(var(--chart-sorted) / 0.2)", color: "hsl(var(--chart-sorted))", border: "1px solid hsl(var(--chart-sorted) / 0.5)" }}>
                          {n?.label ?? id}
                        </Badge>
                        {i < currentStep.traversalOrder.length - 1 && (
                          <span className="text-muted-foreground text-xs">→</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step log */}
          <Card className="bg-card flex-1">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Step Log</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-48">
                <div className="space-y-1 font-mono text-xs">
                  {steps.slice(0, currentStepIndex + 1).reverse().map((s, i) => (
                    <div
                      key={i}
                      className={`px-2 py-1.5 rounded ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                      data-testid={`step-log-${i}`}
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
