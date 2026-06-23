import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Shuffle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVisualizer } from "@/hooks/use-visualizer";
import { generateLinearSearchSteps, generateBinarySearchSteps } from "@/algorithms/searching";

type AlgorithmType = "linear" | "binary";

const ALGORITHMS: Record<AlgorithmType, { name: string, fn: any, info: any }> = {
  linear: {
    name: "Linear Search",
    fn: generateLinearSearchSteps,
    info: {
      time: { best: "O(1)", avg: "O(n)", worst: "O(n)" },
      space: "O(1)",
      desc: "Checks each element in the array sequentially until the target is found."
    }
  },
  binary: {
    name: "Binary Search",
    fn: generateBinarySearchSteps,
    info: {
      time: { best: "O(1)", avg: "O(log n)", worst: "O(log n)" },
      space: "O(1)",
      desc: "Efficiently finds an item from a sorted list by repeatedly dividing in half the portion of the list that could contain the item."
    }
  }
};

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
};

export default function Searching() {
  const [arraySize, setArraySize] = useState(20);
  const [initialArray, setInitialArray] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(50);
  const [algo, setAlgo] = useState<AlgorithmType>("linear");

  useEffect(() => {
    const newArr = generateRandomArray(arraySize);
    setInitialArray(newArr);
    setTarget(newArr[Math.floor(Math.random() * newArr.length)]);
  }, [arraySize]);

  const steps = useMemo(() => {
    if (initialArray.length === 0) return [];
    return ALGORITHMS[algo].fn(initialArray, target);
  }, [initialArray, algo, target]);

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
  } = useVisualizer(steps, 400);

  const handleRandomize = () => {
    reset();
    const newArr = generateRandomArray(arraySize);
    setInitialArray(newArr);
    setTarget(newArr[Math.floor(Math.random() * newArr.length)]);
  };

  const algoInfo = ALGORITHMS[algo].info;
  const displayArray = currentStep ? currentStep.array : (algo === "binary" ? [...initialArray].sort((a,b)=>a-b) : initialArray);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[150px]">
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

            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-mono">Target</label>
              <Input 
                type="number" 
                value={target} 
                onChange={(e) => { reset(); setTarget(parseInt(e.target.value) || 0); }}
                disabled={isPlaying}
                className="font-mono"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-mono">Array Size ({arraySize})</label>
              <Slider 
                value={[arraySize]} 
                onValueChange={(v) => { reset(); setArraySize(v[0]); }} 
                min={5} max={50} step={1}
                disabled={isPlaying}
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-mono">Speed</label>
              <Slider 
                value={[1000 - speed]} 
                onValueChange={(v) => setSpeed(1000 - v[0])} 
                min={10} max={990} step={10} 
              />
            </div>

            <Button variant="outline" onClick={handleRandomize} disabled={isPlaying} className="gap-2 font-mono mt-5">
              <Shuffle className="w-4 h-4" /> Randomize
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1 min-h-[400px] flex flex-col overflow-hidden bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="font-mono text-sm">
              <span className="text-primary font-bold">{currentStepIndex}</span> / {steps.length > 0 ? steps.length - 1 : 0} steps
            </div>
            <div className="font-mono text-sm bg-muted/50 px-3 py-1 rounded">
              {currentStep?.description || "Ready to search."}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={reset} disabled={isPlaying}><RotateCcw className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={stepBack} disabled={isPlaying || currentStepIndex === 0}><SkipBack className="w-4 h-4" /></Button>
              <Button variant={isPlaying ? "destructive" : "default"} size="icon" onClick={isPlaying ? pause : play} disabled={steps.length === 0 || currentStepIndex >= steps.length - 1}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={stepForward} disabled={isPlaying || currentStepIndex >= steps.length - 1}><SkipForward className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center content-center flex-wrap gap-2">
            {displayArray.map((val, idx) => {
              let state = "default";
              if (currentStep?.checking.includes(idx)) state = "checking";
              else if (currentStep?.found === idx) state = "found";
              else if (currentStep?.eliminated.includes(idx)) state = "eliminated";

              let bgClass = "bg-card border-border text-foreground";
              if (state === "checking") bgClass = "bg-[hsl(var(--chart-comparing))] border-[hsl(var(--chart-comparing))] text-primary-foreground scale-110 z-10 shadow-[0_0_15px_hsl(var(--chart-comparing))]";
              else if (state === "found") bgClass = "bg-[hsl(var(--chart-sorted))] border-[hsl(var(--chart-sorted))] text-primary-foreground scale-110 z-10 shadow-[0_0_15px_hsl(var(--chart-sorted))]";
              else if (state === "eliminated") bgClass = "bg-muted/30 border-border/30 text-muted-foreground opacity-30";

              return (
                <motion.div
                  key={`${idx}-${val}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: state === "eliminated" ? 0.3 : 1, scale: (state === "checking" || state === "found") ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-12 h-12 flex items-center justify-center rounded-md border-2 font-mono font-bold transition-colors ${bgClass}`}
                >
                  {val}
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>

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
                <div className="w-4 h-4 rounded border-2 border-[hsl(var(--chart-comparing))] bg-[hsl(var(--chart-comparing))] opacity-50" />
                <span className="text-xs font-mono text-muted-foreground">Checking</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded border-2 border-[hsl(var(--chart-sorted))] bg-[hsl(var(--chart-sorted))] opacity-50" />
                <span className="text-xs font-mono text-muted-foreground">Found</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-border/30 bg-muted/30" />
                <span className="text-xs font-mono text-muted-foreground">Eliminated</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}