import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, ArrowRight, Zap, Clock, Layers, HelpCircle, X } from "lucide-react";

const projectNodes = [
  { id: 1, label: "Home Page", x: 80, y: 80, type: "page" },
  { id: 2, label: "Workspace", x: 320, y: 60, type: "page" },
  { id: 3, label: "UI Score", x: 540, y: 100, type: "page" },
  { id: 4, label: "Memory Graph", x: 200, y: 200, type: "page" },
  { id: 5, label: "Settings", x: 440, y: 220, type: "page" },
  { id: 6, label: "Glass Navbar", x: 100, y: 320, type: "component" },
  { id: 7, label: "Chatbot", x: 340, y: 350, type: "component" },
  { id: 8, label: "Living BG", x: 540, y: 320, type: "style" },
];

const projectEdges = [
  [1, 2], [1, 3], [1, 4], [2, 5], [1, 6], [2, 7], [6, 2], [6, 3], [6, 4], [8, 1],
];

const typeColors: Record<string, string> = {
  page: "bg-primary/20 border-primary/40 text-primary",
  component: "bg-neon-blue/20 border-neon-blue/40 text-neon-blue",
  style: "bg-neon-pink/20 border-neon-pink/40 text-neon-pink",
};

const recentIntents = [
  { time: "Just now", action: "Auto-mapped ProtoCraft project structure", icon: Brain },
  { time: "2m ago", action: "Created Settings page with themes", icon: Layers },
  { time: "5m ago", action: "Added back button to all pages", icon: Zap },
  { time: "8m ago", action: "Improved component inspector explanations", icon: ArrowRight },
];

const MemoryGraphPage = () => {
  const [showGuide, setShowGuide] = useState(true);

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
          <p className="text-muted-foreground mb-6">
            AI tracks your design decisions to save time and learn your patterns
          </p>
        </motion.div>

        {/* New User Guide */}
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 mb-6 border-primary/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">What is the Memory Graph?</h3>
              </div>
              <button onClick={() => setShowGuide(false)} className="p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-semibold text-primary mb-1">🧠 What it does</p>
                <p>The Memory Graph visualizes every page, component, and style in your project as an interactive node map. It shows how things connect.</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-semibold text-accent mb-1">⚡ Why it matters</p>
                <p>Instead of remembering which components go where, the AI tracks your decisions automatically. It learns your patterns to speed up future work.</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-semibold text-neon-blue mb-1">🔗 How to read it</p>
                <p><strong className="text-primary">Purple nodes</strong> = Pages, <strong className="text-neon-blue">Blue</strong> = Components, <strong className="text-neon-pink">Pink</strong> = Styles. Lines show connections between them.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph visualization */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Project Structure</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Auto-generated</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="glass rounded-2xl p-6 relative overflow-hidden"
              style={{ height: 480 }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ padding: 24 }}>
                {projectEdges.map(([from, to], i) => {
                  const a = projectNodes.find((n) => n.id === from)!;
                  const b = projectNodes.find((n) => n.id === to)!;
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

              {projectNodes.map((node, i) => (
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

          {/* Right sidebar */}
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
                  { label: "Page", color: "bg-primary", desc: "App screens & routes" },
                  { label: "Component", color: "bg-neon-blue", desc: "Reusable UI elements" },
                  { label: "Style", color: "bg-neon-pink", desc: "Visual patterns & themes" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}/40`} />
                    <span className="text-xs text-foreground font-medium">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">— {item.desc}</span>
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
