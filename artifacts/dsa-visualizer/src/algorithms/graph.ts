export type GraphNode = { id: number; label: string; x: number; y: number };
export type GraphEdge = { from: number; to: number };

export type GraphStep = {
  visitedNodes: number[];
  currentNode: number | null;
  queueOrStack: number[];
  traversalOrder: number[];
  description: string;
};

function getNeighbors(nodeId: number, edges: GraphEdge[], allNodes: GraphNode[]): number[] {
  const seen = new Set<number>();
  const neighbors: number[] = [];
  for (const edge of edges) {
    let neighbor: number | null = null;
    if (edge.from === nodeId) neighbor = edge.to;
    else if (edge.to === nodeId) neighbor = edge.from;
    if (neighbor !== null && !seen.has(neighbor)) {
      seen.add(neighbor);
      neighbors.push(neighbor);
    }
  }
  return neighbors.sort((a, b) => {
    const na = allNodes.find(n => n.id === a);
    const nb = allNodes.find(n => n.id === b);
    return (na?.label ?? "").localeCompare(nb?.label ?? "");
  });
}

export function generateBFSSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: number
): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<number>();
  const queue: number[] = [startId];
  const traversalOrder: number[] = [];
  const label = (id: number) => nodes.find(n => n.id === id)?.label ?? String(id);

  visited.add(startId);

  steps.push({
    visitedNodes: [...visited],
    currentNode: null,
    queueOrStack: [...queue],
    traversalOrder: [],
    description: `Initialize: enqueue start node "${label(startId)}"`
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    traversalOrder.push(current);

    steps.push({
      visitedNodes: [...visited],
      currentNode: current,
      queueOrStack: [...queue],
      traversalOrder: [...traversalOrder],
      description: `Dequeue "${label(current)}" — processing neighbors`
    });

    for (const neighbor of getNeighbors(current, edges, nodes)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        steps.push({
          visitedNodes: [...visited],
          currentNode: current,
          queueOrStack: [...queue],
          traversalOrder: [...traversalOrder],
          description: `Discovered "${label(neighbor)}" → enqueue`
        });
      } else {
        steps.push({
          visitedNodes: [...visited],
          currentNode: current,
          queueOrStack: [...queue],
          traversalOrder: [...traversalOrder],
          description: `"${label(neighbor)}" already visited — skip`
        });
      }
    }
  }

  steps.push({
    visitedNodes: [...visited],
    currentNode: null,
    queueOrStack: [],
    traversalOrder: [...traversalOrder],
    description: `BFS complete: ${traversalOrder.map(label).join(" → ")}`
  });

  return steps;
}

export function generateDFSSteps(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: number
): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<number>();
  const stack: number[] = [startId];
  const traversalOrder: number[] = [];
  const label = (id: number) => nodes.find(n => n.id === id)?.label ?? String(id);

  steps.push({
    visitedNodes: [],
    currentNode: null,
    queueOrStack: [...stack],
    traversalOrder: [],
    description: `Initialize: push start node "${label(startId)}" onto stack`
  });

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) {
      steps.push({
        visitedNodes: [...visited],
        currentNode: current,
        queueOrStack: [...stack],
        traversalOrder: [...traversalOrder],
        description: `"${label(current)}" already visited — skip`
      });
      continue;
    }

    visited.add(current);
    traversalOrder.push(current);

    steps.push({
      visitedNodes: [...visited],
      currentNode: current,
      queueOrStack: [...stack],
      traversalOrder: [...traversalOrder],
      description: `Pop & visit "${label(current)}"`
    });

    const neighbors = getNeighbors(current, edges, nodes).reverse();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        steps.push({
          visitedNodes: [...visited],
          currentNode: current,
          queueOrStack: [...stack],
          traversalOrder: [...traversalOrder],
          description: `Push unvisited neighbor "${label(neighbor)}" onto stack`
        });
      }
    }
  }

  steps.push({
    visitedNodes: [...visited],
    currentNode: null,
    queueOrStack: [],
    traversalOrder: [...traversalOrder],
    description: `DFS complete: ${traversalOrder.map(label).join(" → ")}`
  });

  return steps;
}
