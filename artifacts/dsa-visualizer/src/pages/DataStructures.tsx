import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, RotateCcw, ArrowRight, Play } from "lucide-react";

// ─── BST Types & Helpers ────────────────────────────────────────────────────

type BSTNode = { val: number; left?: BSTNode; right?: BSTNode };

function bstInsert(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val };
  if (val < root.val) return { ...root, left: bstInsert(root.left ?? null, val) };
  if (val > root.val) return { ...root, right: bstInsert(root.right ?? null, val) };
  return root;
}

function bstDelete(root: BSTNode | null, val: number): BSTNode | null {
  if (!root) return null;
  if (val < root.val) return { ...root, left: bstDelete(root.left ?? null, val) ?? undefined };
  if (val > root.val) return { ...root, right: bstDelete(root.right ?? null, val) ?? undefined };
  if (!root.left) return root.right ?? null;
  if (!root.right) return root.left ?? null;
  let min = root.right;
  while (min.left) min = min.left;
  return { ...root, val: min.val, right: bstDelete(root.right, min.val) ?? undefined };
}

function bstSearch(root: BSTNode | null, val: number): number[] {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.val);
    if (val === cur.val) break;
    cur = val < cur.val ? (cur.left ?? null) : (cur.right ?? null);
  }
  return path;
}

function inorder(node: BSTNode | null, acc: number[] = []): number[] {
  if (!node) return acc;
  inorder(node.left ?? null, acc);
  acc.push(node.val);
  inorder(node.right ?? null, acc);
  return acc;
}

function preorder(node: BSTNode | null, acc: number[] = []): number[] {
  if (!node) return acc;
  acc.push(node.val);
  preorder(node.left ?? null, acc);
  preorder(node.right ?? null, acc);
  return acc;
}

function postorder(node: BSTNode | null, acc: number[] = []): number[] {
  if (!node) return acc;
  postorder(node.left ?? null, acc);
  postorder(node.right ?? null, acc);
  acc.push(node.val);
  return acc;
}

type PositionedNode = { val: number; x: number; y: number; left?: PositionedNode; right?: PositionedNode };

function layoutTree(node: BSTNode | null, xMin: number, xMax: number, y: number): PositionedNode | null {
  if (!node) return null;
  const x = (xMin + xMax) / 2;
  return {
    val: node.val,
    x,
    y,
    left: layoutTree(node.left ?? null, xMin, x, y + 72) ?? undefined,
    right: layoutTree(node.right ?? null, x, xMax, y + 72) ?? undefined,
  };
}

type FlatNode = { val: number; x: number; y: number };
type FlatEdge = { x1: number; y1: number; x2: number; y2: number };

function flattenTree(node: PositionedNode | null, nodes: FlatNode[], edges: FlatEdge[], parent: PositionedNode | null = null): void {
  if (!node) return;
  nodes.push({ val: node.val, x: node.x, y: node.y });
  if (parent) edges.push({ x1: parent.x, y1: parent.y, x2: node.x, y2: node.y });
  flattenTree(node.left ?? null, nodes, edges, node);
  flattenTree(node.right ?? null, nodes, edges, node);
}

// ─── Stack Component ────────────────────────────────────────────────────────

function StackVisualizer() {
  const [stack, setStack] = useState<{ val: number; id: number }[]>([]);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const idRef = useRef(0);

  const push = () => {
    const n = parseInt(input);
    if (isNaN(n)) return;
    const item = { val: n, id: idRef.current++ };
    setStack(s => [item, ...s]);
    setLog(l => [`push(${n})`, ...l]);
    setInput("");
  };

  const pop = () => {
    if (!stack.length) return;
    const top = stack[0];
    setStack(s => s.slice(1));
    setLog(l => [`pop() → ${top.val}`, ...l]);
  };

  const peek = () => {
    if (!stack.length) return;
    setLog(l => [`peek() → ${stack[0].val}`, ...l]);
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">Value</label>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && push()}
                placeholder="Enter number"
                className="w-36 font-mono"
                type="number"
                data-testid="stack-input"
              />
            </div>
            <Button onClick={push} className="gap-2 font-mono" data-testid="stack-push">Push</Button>
            <Button onClick={pop} variant="outline" className="gap-2 font-mono" disabled={!stack.length} data-testid="stack-pop">Pop</Button>
            <Button onClick={peek} variant="ghost" className="gap-2 font-mono" disabled={!stack.length} data-testid="stack-peek">Peek</Button>
            <Button onClick={() => { setStack([]); setLog([]); }} variant="ghost" size="icon" data-testid="stack-reset"><RotateCcw className="w-4 h-4" /></Button>
          </CardContent>
        </Card>

        <Card className="bg-card flex-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2 min-h-[320px] justify-end">
              {stack.length === 0 && (
                <p className="text-muted-foreground font-mono text-sm">Stack is empty</p>
              )}
              <AnimatePresence mode="popLayout">
                {stack.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -30, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`w-full max-w-xs h-12 flex items-center justify-between px-4 rounded border font-mono font-bold text-lg ${
                      idx === 0
                        ? "bg-[hsl(var(--chart-comparing))/15] border-[hsl(var(--chart-comparing))] text-[hsl(var(--chart-comparing))]"
                        : "bg-muted/40 border-border text-foreground"
                    }`}
                    data-testid={`stack-item-${item.id}`}
                  >
                    <span>{item.val}</span>
                    {idx === 0 && <Badge variant="outline" className="font-mono text-xs border-current text-current">TOP</Badge>}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="w-full max-w-xs border-b-2 border-border mt-2" />
              <span className="text-xs font-mono text-muted-foreground">BOTTOM</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-sm font-mono text-primary flex items-center gap-2"><Info className="w-4 h-4" /> Stack (LIFO)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <p className="text-muted-foreground">Last In, First Out. Elements are added (push) and removed (pop) from the same end — the top.</p>
            <div className="font-mono space-y-2 text-xs">
              {[["push(x)", "O(1)", "Add to top"], ["pop()", "O(1)", "Remove from top"], ["peek()", "O(1)", "View top"], ["search(x)", "O(n)", "Find element"]].map(([op, c, d]) => (
                <div key={op} className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-primary">{op}</span>
                  <span className="text-yellow-400">{c}</span>
                  <span className="text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Operation Log</p>
              <ScrollArea className="h-36">
                <div className="space-y-1">
                  {log.length === 0 && <p className="text-xs text-muted-foreground font-mono">No operations yet</p>}
                  {log.map((entry, i) => (
                    <div key={i} className={`text-xs font-mono px-2 py-1 rounded ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{entry}</div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Queue Component ─────────────────────────────────────────────────────────

function QueueVisualizer() {
  const [queue, setQueue] = useState<{ val: number; id: number }[]>([]);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const idRef = useRef(0);

  const enqueue = () => {
    const n = parseInt(input);
    if (isNaN(n)) return;
    const item = { val: n, id: idRef.current++ };
    setQueue(q => [...q, item]);
    setLog(l => [`enqueue(${n})`, ...l]);
    setInput("");
  };

  const dequeue = () => {
    if (!queue.length) return;
    setLog(l => [`dequeue() → ${queue[0].val}`, ...l]);
    setQueue(q => q.slice(1));
  };

  const front = () => {
    if (!queue.length) return;
    setLog(l => [`front() → ${queue[0].val}`, ...l]);
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">Value</label>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && enqueue()}
                placeholder="Enter number"
                className="w-36 font-mono"
                type="number"
                data-testid="queue-input"
              />
            </div>
            <Button onClick={enqueue} className="font-mono" data-testid="queue-enqueue">Enqueue</Button>
            <Button onClick={dequeue} variant="outline" className="font-mono" disabled={!queue.length} data-testid="queue-dequeue">Dequeue</Button>
            <Button onClick={front} variant="ghost" className="font-mono" disabled={!queue.length} data-testid="queue-front">Front</Button>
            <Button onClick={() => { setQueue([]); setLog([]); }} variant="ghost" size="icon" data-testid="queue-reset"><RotateCcw className="w-4 h-4" /></Button>
          </CardContent>
        </Card>

        <Card className="bg-card flex-1">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 min-h-[280px] justify-center">
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {queue.length === 0 && (
                  <p className="text-muted-foreground font-mono text-sm mx-auto">Queue is empty</p>
                )}
                <AnimatePresence mode="popLayout">
                  {queue.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 50, scale: 0.85 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="flex flex-col items-center gap-1 flex-shrink-0"
                      data-testid={`queue-item-${item.id}`}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded border-2 font-mono font-bold text-lg ${
                        idx === 0
                          ? "bg-[hsl(var(--chart-comparing))/15] border-[hsl(var(--chart-comparing))] text-[hsl(var(--chart-comparing))]"
                          : idx === queue.length - 1
                            ? "bg-[hsl(var(--chart-sorted))/15] border-[hsl(var(--chart-sorted))] text-[hsl(var(--chart-sorted))]"
                            : "bg-muted/40 border-border"
                      }`}>{item.val}</div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {idx === 0 ? "FRONT" : idx === queue.length - 1 ? "BACK" : ""}
                      </span>
                    </motion.div>
                  ))}
                  {queue.length > 1 && (
                    <div className="flex items-center mx-1">
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground px-2">
                <span>← Dequeue (FRONT)</span>
                <span>Enqueue (BACK) →</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-sm font-mono text-primary flex items-center gap-2"><Info className="w-4 h-4" /> Queue (FIFO)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <p className="text-muted-foreground">First In, First Out. Elements are added at the back (enqueue) and removed from the front (dequeue).</p>
            <div className="font-mono space-y-2 text-xs">
              {[["enqueue(x)", "O(1)", "Add to back"], ["dequeue()", "O(1)", "Remove from front"], ["front()", "O(1)", "View front"], ["isEmpty()", "O(1)", "Check empty"]].map(([op, c, d]) => (
                <div key={op} className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-primary">{op}</span>
                  <span className="text-yellow-400">{c}</span>
                  <span className="text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Operation Log</p>
              <ScrollArea className="h-36">
                <div className="space-y-1">
                  {log.length === 0 && <p className="text-xs text-muted-foreground font-mono">No operations yet</p>}
                  {log.map((entry, i) => (
                    <div key={i} className={`text-xs font-mono px-2 py-1 rounded ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{entry}</div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Linked List Component ────────────────────────────────────────────────────

function LinkedListVisualizer() {
  const [list, setList] = useState<{ val: number; id: number }[]>([]);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const idRef = useRef(0);

  const flash = (id: number) => {
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 900);
  };

  const insertHead = () => {
    const n = parseInt(input);
    if (isNaN(n)) return;
    const item = { val: n, id: idRef.current++ };
    setList(l => [item, ...l]);
    setLog(l => [`insertHead(${n})`, ...l]);
    setInput("");
    setTimeout(() => flash(item.id), 50);
  };

  const insertTail = () => {
    const n = parseInt(input);
    if (isNaN(n)) return;
    const item = { val: n, id: idRef.current++ };
    setList(l => [...l, item]);
    setLog(l => [`insertTail(${n})`, ...l]);
    setInput("");
    setTimeout(() => flash(item.id), 50);
  };

  const deleteHead = () => {
    if (!list.length) return;
    setLog(l => [`deleteHead() → ${list[0].val}`, ...l]);
    setList(l => l.slice(1));
  };

  const deleteTail = () => {
    if (!list.length) return;
    setLog(l => [`deleteTail() → ${list[list.length - 1].val}`, ...l]);
    setList(l => l.slice(0, -1));
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">Value</label>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && insertTail()}
                placeholder="Enter number"
                className="w-36 font-mono"
                type="number"
                data-testid="ll-input"
              />
            </div>
            <Button onClick={insertHead} className="font-mono text-xs" data-testid="ll-insert-head">Insert Head</Button>
            <Button onClick={insertTail} className="font-mono text-xs" data-testid="ll-insert-tail">Insert Tail</Button>
            <Button onClick={deleteHead} variant="outline" className="font-mono text-xs" disabled={!list.length} data-testid="ll-delete-head">Delete Head</Button>
            <Button onClick={deleteTail} variant="outline" className="font-mono text-xs" disabled={!list.length} data-testid="ll-delete-tail">Delete Tail</Button>
            <Button onClick={() => { setList([]); setLog([]); }} variant="ghost" size="icon" data-testid="ll-reset"><RotateCcw className="w-4 h-4" /></Button>
          </CardContent>
        </Card>

        <Card className="bg-card flex-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-1 min-h-[220px] overflow-x-auto pb-2 flex-wrap">
              {list.length === 0 && (
                <p className="text-muted-foreground font-mono text-sm mx-auto">List is empty — insert a node to begin</p>
              )}
              <AnimatePresence mode="popLayout">
                {list.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="flex items-center gap-1 flex-shrink-0"
                    data-testid={`ll-node-${item.id}`}
                  >
                    <div className={`flex rounded border-2 overflow-hidden transition-colors duration-300 ${
                      highlightId === item.id
                        ? "border-[hsl(var(--chart-comparing))] shadow-[0_0_12px_hsl(var(--chart-comparing))]"
                        : idx === 0
                          ? "border-primary"
                          : "border-border"
                    }`}>
                      <div className={`px-3 py-2 font-mono font-bold text-base ${
                        highlightId === item.id ? "bg-[hsl(var(--chart-comparing))/15] text-[hsl(var(--chart-comparing))]" :
                        idx === 0 ? "bg-primary/10 text-primary" : "bg-muted/30 text-foreground"
                      }`}>
                        {item.val}
                      </div>
                      <div className="px-2 py-2 border-l border-border text-muted-foreground font-mono text-xs flex items-center">
                        {idx < list.length - 1 ? "•→" : "null"}
                      </div>
                    </div>
                    {idx < list.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {list.length > 0 && (
              <div className="flex gap-4 mt-2 text-xs font-mono text-muted-foreground">
                <span className="text-primary">HEAD: {list[0].val}</span>
                <span>TAIL: {list[list.length - 1].val}</span>
                <span>Size: {list.length}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-sm font-mono text-primary flex items-center gap-2"><Info className="w-4 h-4" /> Linked List</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <p className="text-muted-foreground">Each node stores a value and a pointer to the next node. Dynamic size, O(1) head insertions, O(n) access.</p>
            <div className="font-mono space-y-2 text-xs">
              {[["insertHead(x)", "O(1)", "Prepend"], ["insertTail(x)", "O(n)", "Append"], ["deleteHead()", "O(1)", "Remove first"], ["search(x)", "O(n)", "Find value"]].map(([op, c, d]) => (
                <div key={op} className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-primary">{op}</span>
                  <span className="text-yellow-400">{c}</span>
                  <span className="text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Operation Log</p>
              <ScrollArea className="h-36">
                <div className="space-y-1">
                  {log.length === 0 && <p className="text-xs text-muted-foreground font-mono">No operations yet</p>}
                  {log.map((entry, i) => (
                    <div key={i} className={`text-xs font-mono px-2 py-1 rounded ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{entry}</div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── BST Component ────────────────────────────────────────────────────────────

const BST_SVG_W = 600;

function BSTVisualizer() {
  const [root, setRoot] = useState<BSTNode | null>(null);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const [found, setFound] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addVal = () => {
    const n = parseInt(input);
    if (isNaN(n)) return;
    setRoot(r => bstInsert(r, n));
    setLog(l => [`insert(${n})`, ...l]);
    setInput("");
    setHighlighted([]);
    setFound(null);
  };

  const deleteVal = () => {
    const n = parseInt(input);
    if (isNaN(n)) return;
    setRoot(r => bstDelete(r, n));
    setLog(l => [`delete(${n})`, ...l]);
    setInput("");
    setHighlighted([]);
    setFound(null);
  };

  const searchVal = () => {
    const n = parseInt(input);
    if (isNaN(n) || !root || isAnimating) return;
    const path = bstSearch(root, n);
    setHighlighted([]);
    setFound(null);
    setIsAnimating(true);
    setLog(l => [`search(${n}) → ${path.includes(n) ? "found" : "not found"}`, ...l]);

    let idx = 0;
    const animate = () => {
      if (idx >= path.length) {
        setFound(path[path.length - 1] === n ? n : null);
        setIsAnimating(false);
        return;
      }
      setHighlighted(path.slice(0, idx + 1));
      idx++;
      timerRef.current = setTimeout(animate, 600);
    };
    animate();
  };

  const traverse = useCallback((type: "inorder" | "preorder" | "postorder") => {
    if (!root || isAnimating) return;
    const vals = type === "inorder" ? inorder(root) : type === "preorder" ? preorder(root) : postorder(root);
    setHighlighted([]);
    setFound(null);
    setIsAnimating(true);
    setLog(l => [`${type}(): [${vals.join(", ")}]`, ...l]);

    let idx = 0;
    const animate = () => {
      if (idx >= vals.length) { setIsAnimating(false); return; }
      setHighlighted(vals.slice(0, idx + 1));
      idx++;
      timerRef.current = setTimeout(animate, 500);
    };
    animate();
  }, [root, isAnimating]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const positioned = useMemo(() => layoutTree(root, 0, BST_SVG_W, 36), [root]);
  const flatNodes: FlatNode[] = [];
  const flatEdges: FlatEdge[] = [];
  if (positioned) flattenTree(positioned, flatNodes, flatEdges);

  const svgHeight = flatNodes.length
    ? Math.max(...flatNodes.map(n => n.y)) + 60
    : 100;

  const getNodeColor = (val: number) => {
    if (highlighted.includes(val)) {
      if (highlighted[highlighted.length - 1] === val) return "hsl(var(--chart-comparing))";
      return "hsl(var(--chart-sorted))";
    }
    return "hsl(var(--primary))";
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-1">Value</label>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addVal()}
                placeholder="Enter number"
                className="w-36 font-mono"
                type="number"
                data-testid="bst-input"
              />
            </div>
            <Button onClick={addVal} className="font-mono text-xs" data-testid="bst-insert">Insert</Button>
            <Button onClick={deleteVal} variant="outline" className="font-mono text-xs" disabled={!root} data-testid="bst-delete">Delete</Button>
            <Button onClick={searchVal} variant="outline" className="font-mono text-xs" disabled={!root || isAnimating} data-testid="bst-search">Search</Button>
            <Button onClick={() => traverse("inorder")} variant="ghost" className="font-mono text-xs" disabled={!root || isAnimating} data-testid="bst-inorder">In-order</Button>
            <Button onClick={() => traverse("preorder")} variant="ghost" className="font-mono text-xs" disabled={!root || isAnimating} data-testid="bst-preorder">Pre-order</Button>
            <Button onClick={() => traverse("postorder")} variant="ghost" className="font-mono text-xs" disabled={!root || isAnimating} data-testid="bst-postorder">Post-order</Button>
            <Button onClick={() => { setRoot(null); setLog([]); setHighlighted([]); setFound(null); }} variant="ghost" size="icon" data-testid="bst-reset"><RotateCcw className="w-4 h-4" /></Button>
          </CardContent>
        </Card>

        <Card className="bg-card flex-1 overflow-auto">
          <CardContent className="p-4">
            {!root ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground font-mono text-sm">
                Insert values to build the tree
              </div>
            ) : (
              <div className="overflow-x-auto">
                <svg width={BST_SVG_W} height={svgHeight} className="mx-auto">
                  {flatEdges.map((e, i) => (
                    <line
                      key={i}
                      x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                      stroke="hsl(var(--border))"
                      strokeWidth={2}
                    />
                  ))}
                  {flatNodes.map(n => {
                    const color = getNodeColor(n.val);
                    const isCurrentHighlight = highlighted.length > 0 && highlighted[highlighted.length - 1] === n.val;
                    return (
                      <g key={n.val} data-testid={`bst-node-${n.val}`}>
                        <circle
                          cx={n.x} cy={n.y} r={20}
                          fill={`${color}22`}
                          stroke={color}
                          strokeWidth={isCurrentHighlight ? 3 : 2}
                          style={{ filter: isCurrentHighlight ? `drop-shadow(0 0 8px ${color})` : undefined, transition: "all 0.3s ease" }}
                        />
                        <text
                          x={n.x} y={n.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={color}
                          fontSize={12}
                          fontFamily="monospace"
                          fontWeight="bold"
                          style={{ transition: "fill 0.3s ease" }}
                        >{n.val}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-sm font-mono text-primary flex items-center gap-2"><Info className="w-4 h-4" /> Binary Search Tree</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <p className="text-muted-foreground">Each node has at most two children. Left subtree contains only values less than the node; right subtree contains only values greater.</p>
            <div className="font-mono space-y-2 text-xs">
              {[["insert(x)", "O(h)", "h = tree height"], ["delete(x)", "O(h)", "Restructures tree"], ["search(x)", "O(h)", "Follow BST property"], ["traversal", "O(n)", "Visit all nodes"]].map(([op, c, d]) => (
                <div key={op} className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-primary">{op}</span>
                  <span className="text-yellow-400">{c}</span>
                  <span className="text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 text-xs font-mono flex-wrap">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--chart-sorted))]" /> <span className="text-muted-foreground">Visited</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--chart-comparing))]" /> <span className="text-muted-foreground">Current</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-primary" /> <span className="text-muted-foreground">Default</span></div>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Operation Log</p>
              <ScrollArea className="h-36">
                <div className="space-y-1">
                  {log.length === 0 && <p className="text-xs text-muted-foreground font-mono">No operations yet</p>}
                  {log.map((entry, i) => (
                    <div key={i} className={`text-xs font-mono px-2 py-1 rounded ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{entry}</div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const tabs = [
  { value: "stack",   label: "Stack" },
  { value: "queue",   label: "Queue" },
  { value: "linkedlist", label: "Linked List" },
  { value: "bst",     label: "BST" },
];

export default function DataStructures() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Data Structures</h1>
        <p className="text-sm text-muted-foreground mt-1">Interactive visualizations of fundamental data structures with step-by-step operations.</p>
      </div>

      <Tabs defaultValue="stack" className="flex-1 flex flex-col">
        <TabsList className="w-fit font-mono" data-testid="ds-tabs">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} data-testid={`tab-${t.value}`}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 pt-4">
          <TabsContent value="stack" className="mt-0 h-full"><StackVisualizer /></TabsContent>
          <TabsContent value="queue" className="mt-0 h-full"><QueueVisualizer /></TabsContent>
          <TabsContent value="linkedlist" className="mt-0 h-full"><LinkedListVisualizer /></TabsContent>
          <TabsContent value="bst" className="mt-0 h-full"><BSTVisualizer /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
