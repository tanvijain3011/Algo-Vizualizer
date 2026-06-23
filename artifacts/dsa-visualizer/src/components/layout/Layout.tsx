import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart2, Search, Layers, GitBranch, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sorting", label: "Sorting", icon: BarChart2 },
  { href: "/searching", label: "Searching", icon: Search },
  { href: "/data-structures", label: "Data Structures", icon: Layers },
  { href: "/graph", label: "Graph Traversal", icon: GitBranch },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
            <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-lg font-mono text-primary">
            <Layers className="w-5 h-5" />
            <span>DSA Visualizer</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card md:bg-background">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-14 flex items-center px-4 border-b border-border bg-card">
                  <div className="flex items-center gap-2 font-bold text-lg font-mono text-primary">
                    <Layers className="w-5 h-5" />
                    <span>DSA Visualizer</span>
                  </div>
                </div>
                <nav className="p-4 space-y-1">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
            <div className="font-bold font-mono text-primary">DSA Visualizer</div>
          </div>
          <div className="hidden md:block font-medium text-sm text-muted-foreground">
            {NAV_ITEMS.find(item => item.href === location || (item.href !== "/" && location.startsWith(item.href)))?.label || "Visualizer"}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}