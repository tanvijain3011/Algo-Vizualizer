import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Search, Layers, GitBranch, ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    id: "sorting",
    title: "Sorting Algorithms",
    description: "Visualize comparisons and swaps for popular sorting algorithms like Quick Sort, Merge Sort, and more.",
    icon: BarChart2,
    href: "/sorting",
    algorithms: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort"],
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1) - O(n)"
  },
  {
    id: "searching",
    title: "Searching Algorithms",
    description: "Watch how elements are found or eliminated in linear and binary search.",
    icon: Search,
    href: "/searching",
    algorithms: ["Linear Search", "Binary Search"],
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)"
  },
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Interactive representations of fundamental data structures and their core operations.",
    icon: Layers,
    href: "/data-structures",
    algorithms: ["Stack", "Queue", "Linked List", "Binary Search Tree"],
    timeComplexity: "Varies",
    spaceComplexity: "O(n)"
  },
  {
    id: "graph",
    title: "Graph Traversal",
    description: "Explore Breadth-First and Depth-First Search on a visual node-edge graph.",
    icon: GitBranch,
    href: "/graph",
    algorithms: ["BFS", "DFS"],
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)"
  }
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-mono">Algorithm Visualizer</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          A living textbook for CS students. Watch algorithms execute step-by-step, frame-by-frame. 
          Understand the internal states, comparisons, and structural mutations in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link key={cat.id} href={cat.href}>
              <Card className="h-full hover-elevate cursor-pointer border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-2xl font-mono">{cat.title}</CardTitle>
                  <CardDescription className="text-base mt-2">{cat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {cat.algorithms.map((algo) => (
                      <Badge key={algo} variant="secondary" className="bg-secondary/50 text-secondary-foreground font-mono font-normal">
                        {algo}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono bg-muted/30 p-3 rounded-md">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider opacity-70">Time</span>
                      <span className="font-semibold text-foreground">{cat.timeComplexity}</span>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider opacity-70">Space</span>
                      <span className="font-semibold text-foreground">{cat.spaceComplexity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}