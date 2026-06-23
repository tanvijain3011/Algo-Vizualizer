import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function DataStructures() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <Card className="w-full max-w-md bg-card">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Construction className="w-16 h-16 text-primary mb-6" />
          <h2 className="text-2xl font-bold font-mono mb-2">Under Construction</h2>
          <p className="text-muted-foreground">
            Data structures visualizer is being built. Check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}