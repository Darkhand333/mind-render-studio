import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Layout, Settings, BarChart3, GitBranch, Home, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const commands = [
  { label: "Home", icon: Home, path: "/", category: "Navigate" },
  { label: "Workspace", icon: Layout, path: "/workspace", category: "Navigate" },
  { label: "UI Score", icon: BarChart3, path: "/ui-score", category: "Navigate" },
  { label: "Memory Graph", icon: GitBranch, path: "/memory-graph", category: "Navigate" },
  { label: "Settings", icon: Settings, path: "/settings", category: "Navigate" },
];

const CommandPalette = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery("");
  };

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101] glass-strong rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, commands..."
                className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "Enter" && filtered.length > 0) handleSelect(filtered[0].path);
                }}
              />
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No results found</p>
              )}
              {filtered.map((cmd) => (
                <button
                  key={cmd.path}
                  onClick={() => handleSelect(cmd.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-secondary/80 transition-colors group"
                >
                  <cmd.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{cmd.label}</p>
                    <p className="text-[10px] text-muted-foreground">{cmd.category}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border/50 flex items-center gap-4 text-[10px] text-muted-foreground">
              <span><kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">Enter</kbd> Select</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
