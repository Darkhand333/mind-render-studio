import { motion } from "framer-motion";
import { Brain, ArrowRight, Zap, Clock, Layers } from "lucide-react";

const nodes = [
  { id: 1, label: "Login Screen", x: 80, y: 80, type: "page" },
  { id: 2, label: "Hero Section", x: 300, y: 60, type: "component" },
  { id: 3, label: "Purple CTA", x: 520, y: 100, type: "style" },
  { id: 4, label: "Dashboard", x: 200, y: 220, type: "page" },
  { id: 5, label: "Card Layout", x: 440, y: 240, type: "component" },
  { id: 6, label: "Glassmorphism", x: 120, y: 340, type: "style" },
  { id: 7, label: "Pricing Page", x: 380, y: 380, type: "page" },
  { id: 8, label: "Nav Bar", x: 560, y: 340, type: "component" },
];

const edges = [
  [1, 2], [2, 3], [1, 4], [4, 5], [4, 6], [5, 7], [3, 8], [7, 8],
];

const typeColors: Record<string, string> = {
  page: "bg-primary/20 border-primary/40 text-primary",
  component: "bg-neon-blue/20 border-neon-blue/40 text-neon-blue",
  style: "bg-neon-pink/20 border-neon-pink/40 text-neon-pink",
};

const recentIntents = [
  { time: "2m ago", action: "Created login screen with glassmorphism", icon: Layers },
  { time: "5m ago", action: "Applied purple gradient to CTA button", icon: Zap },
  { time: "8m ago", action: "Linked dashboard to pricing page", icon: ArrowRight },
  { time: "12m ago", action: "Added card layout to dashboard", icon: Layers },
];

const MemoryGraphPage = () => {
  return (
    <div className="min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold">
              Intent <span className="gradient-text">Memory Graph</span>
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">
            AI tracks your design decisions to save time and learn your patterns
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph visualization */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-6 relative overflow-hidden"
              style={{ height: 480 }}
            >
              {/* SVG edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ padding: 24 }}>
                {edges.map(([from, to], i) => {
                  const a = nodes.find((n) => n.id === from)!;
                  const b = nodes.find((n) => n.id === to)!;
                  return (
                    <motion.line
                      key={i}
                      x1={a.x + 40} y1={a.y + 16}
                      x2={b.x + 40} y2={b.y + 16}
                      stroke="hsl(var(--primary) / 0.2)"
                      strokeWidth="1.5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.08, zIndex: 10 }}
                  className={`absolute px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-shadow hover:neon-glow-sm ${typeColors[node.type]}`}
                  style={{ left: node.x, top: node.y }}
                >
                  {node.label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Recent intents */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Intents
            </h3>
            <div className="space-y-3">
              {recentIntents.map((intent, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="glass rounded-xl p-4 hover:border-primary/30 transition-colors duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <intent.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground leading-relaxed">{intent.action}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{intent.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 glass rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Node Types</p>
              <div className="space-y-2">
                {[
                  { label: "Page", color: "bg-primary" },
                  { label: "Component", color: "bg-neon-blue" },
                  { label: "Style", color: "bg-neon-pink" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}/40`} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGraphPage;
