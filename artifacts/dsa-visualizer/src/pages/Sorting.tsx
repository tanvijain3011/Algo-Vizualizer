import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Shuffle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVisualizer } from "@/hooks/use-visualizer";
import { generateBubbleSortSteps, generateSelectionSortSteps, generateInsertionSortSteps, generateMergeSortSteps, generateQuickSortSteps } from "@/algorithms/sorting";

type AlgorithmType = "bubble" | "selection" | "insertion" | "merge" | "quick";

const ALGORITHMS: Record<AlgorithmType, { name: string, fn: any, info: any }> = {
  bubble: {
    name: "Bubble Sort",
    fn: generateBubbleSortSteps,
    info: {
      time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
      desc: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order."
    }
  },
  selection: {
    name: "Selection Sort",
    fn: generateSelectionSortSteps,
    info: {
      time: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
      desc: "Finds the minimum element from unsorted part and puts it at the beginning."
    }
  },
  insertion: {
    name: "Insertion Sort",
    fn: generateInsertionSortSteps,
    info: {
      time: { best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
      space: "O(1)",
      desc: "Builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into the sorted portion."
    }
  },
  merge: {
    name: "Merge Sort",
    fn: generateMergeSortSteps,
    info: {
      time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)" },
      space: "O(n)",
      desc: "Divides array into two halves, recursively sorts them, and then merges the sorted halves."
    }
  },
  quick: {
    name: "Quick Sort",
    fn: generateQuickSortSteps,
    info: {
      time: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)" },
      space: "O(log n)",
      desc: "Picks an element as pivot and partitions the given array around the picked pivot."
    }
  }
};

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

export default function Sorting() {
  const [arraySize, setArraySize] = useState(20);
  const [initialArray, setInitialArray] = useState<number[]>([]);
  const [algo, setAlgo] = useState<AlgorithmType>("bubble");

  useEffect(() => {
    setInitialArray(generateRandomArray(arraySize));
  }, [arraySize]);

  const steps = useMemo(() => {
    if (initialArray.length === 0) return [];
    return ALGORITHMS[algo].fn(initialArray);
  }, [initialArray, algo]);

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
    setSpeed
  } = useVisualizer(steps, 200);

  const handleRandomize = () => {
    reset();
    setInitialArray(generateRandomArray(arraySize));
  };

  const algoInfo = ALGORITHMS[algo].info;

  const displayArray = currentStep ? currentStep.array : initialArray;
  const maxVal = Math.max(...(displayArray.length ? displayArray : [100]));

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      {/* Visualizer Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Controls */}
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-mono">Algorithm</label>
              <Select value={algo} onValueChange={(v: AlgorithmType) => { reset(); setAlgo(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-mono">Array Size ({arraySize})</label>
              <Slider 
                value={[arraySize]} 
                onValueChange={(v) => { reset(); setArraySize(v[0]); }} 
                min={5} max={100} step={1}
                disabled={isPlaying}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-mono">Speed</label>
              <Slider 
                value={[1000 - speed]} 
                onValueChange={(v) => setSpeed(1000 - v[0])} 
                min={10} max={990} step={10} 
              />
            </div>

            <Button variant="outline" onClick={handleRandomize} disabled={isPlaying} className="gap-2 font-mono">
              <Shuffle className="w-4 h-4" /> Randomize
            </Button>
          </CardContent>
        </Card>

        {/* Chart Area */}
        <Card className="flex-1 min-h-[400px] flex flex-col overflow-hidden bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="font-mono text-sm">
              <span className="text-primary font-bold">{currentStepIndex}</span> / {steps.length - 1} steps
            </div>
            <div className="font-mono text-sm bg-muted/50 px-3 py-1 rounded">
              {currentStep?.description || "Ready to sort."}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={reset} disabled={isPlaying}><RotateCcw className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={stepBack} disabled={isPlaying || currentStepIndex === 0}><SkipBack className="w-4 h-4" /></Button>
              <Button variant={isPlaying ? "destructive" : "default"} size="icon" onClick={isPlaying ? pause : play} disabled={currentStepIndex >= steps.length - 1}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={stepForward} disabled={isPlaying || currentStepIndex >= steps.length - 1}><SkipForward className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-8 flex items-end justify-center gap-[2px] md:gap-1">
            {displayArray.map((val, idx) => {
              let state = "default";
              if (currentStep?.comparing.includes(idx)) state = "comparing";
              else if (currentStep?.swapping.includes(idx)) state = "swapping";
              else if (currentStep?.sorted.includes(idx)) state = "sorted";

              let bgClass = "bg-[hsl(var(--chart-default))]";
              if (state === "comparing") bgClass = "bg-[hsl(var(--chart-comparing))] shadow-[0_0_15px_hsl(var(--chart-comparing))] z-10";
              else if (state === "swapping") bgClass = "bg-[hsl(var(--chart-swapping))] shadow-[0_0_15px_hsl(var(--chart-swapping))] z-10";
              else if (state === "sorted") bgClass = "bg-[hsl(var(--chart-sorted))]";

              return (
                <motion.div
                  key={`${idx}-${val}`}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: `${(val / maxVal) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`w-full rounded-t-sm ${bgClass}`}
                  style={{ minWidth: "2px" }}
                />
              );
            })}
          </div>
        </Card>
      </div>

      {/* Info Panel */}
      <div className="w-full xl:w-80 flex flex-col gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 font-mono text-lg text-primary">
              <Info className="w-5 h-5" />
              {ALGORITHMS[algo].name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">{algoInfo.desc}</p>
            </div>
            
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Best Time</span>
                <span className="text-green-400 font-bold">{algoInfo.time.best}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Avg Time</span>
                <span className="text-yellow-400 font-bold">{algoInfo.time.avg}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Worst Time</span>
                <span className="text-red-400 font-bold">{algoInfo.time.worst}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Space</span>
                <span className="text-blue-400 font-bold">{algoInfo.space}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-comparing))]" />
                <span className="text-xs font-mono text-muted-foreground">Comparing</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-swapping))]" />
                <span className="text-xs font-mono text-muted-foreground">Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-sorted))]" />
                <span className="text-xs font-mono text-muted-foreground">Sorted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}