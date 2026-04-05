import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, Zap, Clock, HelpCircle, X, Activity, GitBranch, Code2, Palette, Layout, Shield,
  TrendingUp, BarChart3, Eye, FileCode, Component, Cpu, Database, Globe, Lock,
  Smartphone, Monitor, TabletSmartphone, ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ── Icon map for dynamic rendering ── */
const iconMap: Record<string, any> = {
  Brain, Zap, Activity, GitBranch, Code2, Palette, Layout, Shield,
  Eye, FileCode, Component, Cpu, Database, Globe, Lock, Smartphone, Monitor,
  TrendingUp, BarChart3,
};

/* ── Static Node Data ── */
const projectNodes = [
  { id: 1, label: "Home Page", x: 60, y: 70, type: "page" },
  { id: 2, label: "Workspace", x: 300, y: 50, type: "page" },
  { id: 3, label: "UI Score", x: 520, y: 90, type: "page" },
  { id: 4, label: "Memory Graph", x: 180, y: 190, type: "page" },
  { id: 5, label: "Settings", x: 420, y: 210, type: "page" },
  { id: 6, label: "Login", x: 60, y: 300, type: "page" },
  { id: 7, label: "Glass Navbar", x: 300, y: 310, type: "component" },
  { id: 8, label: "AI Chatbot", x: 160, y: 380, type: "component" },
  { id: 9, label: "Cmd Palette", x: 460, y: 320, type: "component" },
  { id: 10, label: "Living BG", x: 540, y: 380, type: "style" },
  { id: 11, label: "Profile", x: 60, y: 200, type: "component" },
  { id: 12, label: "Canvas", x: 540, y: 200, type: "component" },
  { id: 13, label: "Voice Cmd", x: 380, y: 400, type: "component" },
];

const projectEdges = [
  [1, 2], [1, 3], [1, 4], [2, 5], [1, 7], [2, 7], [7, 3], [7, 4],
  [10, 1], [7, 9], [8, 7], [6, 1], [11, 5], [12, 2], [8, 2], [13, 7],
];

const typeColors: Record<string, string> = {
  page: "bg-primary/20 border-primary/40 text-primary",
  component: "bg-neon-blue/20 border-neon-blue/40 text-neon-blue",
  style: "bg-neon-pink/20 border-neon-pink/40 text-neon-pink",
};

const categoryColors: Record<string, string> = {
  ai: "bg-primary/15 text-primary",
  feature: "bg-neon-blue/15 text-neon-blue",
  style: "bg-neon-pink/15 text-neon-pink",
  tooling: "bg-accent/15 text-accent",
  backend: "bg-primary/15 text-primary",
};

const projectOverview = {
  name: "ProtoCraft",
  description: "A Figma-like prototyping platform with AI-powered design assistance, real-time collaboration, and intelligent memory tracking. Built with React, TypeScript, Tailwind CSS, and Framer Motion.",
  stats: [
    { label: "Pages", value: "7", icon: Layout },
    { label: "Components", value: "25+", icon: Component },
    { label: "Routes", value: "8", icon: GitBranch },
    { label: "Design Tokens", value: "40+", icon: Palette },
  ],
  techStack: [
    { name: "React 18", icon: Code2 },
    { name: "TypeScript", icon: FileCode },
    { name: "Tailwind CSS", icon: Palette },
    { name: "Framer Motion", icon: Activity },
    { name: "Lovable Cloud", icon: Database },
    { name: "Gemini AI", icon: Cpu },
  ],
  features: [
    "Voice commands for hands-free prototyping",
    "AI chatbot with image analysis and file upload",
    "Drag-and-drop canvas with multi-tool support",
    "Real-time collaboration with live cursors",
    "UI Score analyzer for design quality",
    "18+ device frame presets",
    "20+ project templates",
    "Export to HTML, React, Vue, Tailwind, SVG",
  ],
};

type DBActivity = {
  id: string;
  action: string;
  category: string;
  icon_name: string;
  created_at: string;
};

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let relative: string;
  if (mins < 1) relative = "Just now";
  else if (mins < 60) relative = `${mins}m ago`;
  else if (hours < 24) relative = `${hours}h ago`;
  else relative = `${days}d ago`;

  const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeFormatted = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return { relative, dateFormatted, timeFormatted };
};

/* ── Component ── */
const MemoryGraphPage = () => {
  const [showGuide, setShowGuide] = useState(true);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "overview" | "health">("graph");
  const [activities, setActivities] = useState<DBActivity[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch real activities from database
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) setActivities(data as DBActivity[]);
      setLoading(false);
    };
    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("activities-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "project_activities" }, (payload) => {
        setActivities((prev) => [payload.new as DBActivity, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const connectedNodes = selectedNode
    ? projectEdges.filter(([a, b]) => a === selectedNode || b === selectedNode).map(([a, b]) => (a === selectedNode ? b : a))
    : [];

  const displayedActivities = showAllActivities ? activities : activities.slice(0, 5);

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="sticky top-20 z-10 bg-background/80 backdrop-blur-sm pb-4 -mx-2 px-2">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold">
              Intent <span className="gradient-text">Memory Graph</span>
            </h1>
          </div>
          <p className="text-muted-foreground mb-2">
            AI tracks your design decisions, maps project architecture, and provides intelligent insights
          </p>
        </motion.div>

        {/* Guide */}
        {showGuide && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-6 border-primary/20">
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
                <p>Visualizes every page, component, and style in your project as an interactive node map showing how everything connects.</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-semibold text-accent mb-1">⚡ Why it matters</p>
                <p>The AI tracks your decisions automatically, learning patterns to speed up future work and prevent design inconsistencies.</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-semibold text-neon-blue mb-1">🔗 How to read it</p>
                <p><strong className="text-primary">Purple</strong> = Pages, <strong className="text-neon-blue">Blue</strong> = Components, <strong className="text-neon-pink">Pink</strong> = Styles. Click nodes to see connections.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "graph" as const, label: "Node Graph", icon: GitBranch },
            { key: "overview" as const, label: "Project Overview", icon: BarChart3 },
            { key: "health" as const, label: "Health & Insights", icon: TrendingUp },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? "gradient-purple text-primary-foreground neon-glow-sm" : "glass text-muted-foreground hover:text-foreground"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "graph" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Architecture Map</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium animate-pulse">● Live</span>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6 relative overflow-hidden" style={{ height: 500 }}>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ padding: 24 }}>
                    {projectEdges.map(([from, to], i) => {
                      const a = projectNodes.find((n) => n.id === from)!;
                      const b = projectNodes.find((n) => n.id === to)!;
                      const isHighlighted = selectedNode !== null && (from === selectedNode || to === selectedNode);
                      return (
                        <motion.line key={i} x1={a.x + 40} y1={a.y + 16} x2={b.x + 40} y2={b.y + 16}
                          stroke={isHighlighted ? "hsl(var(--primary) / 0.7)" : "hsl(var(--primary) / 0.15)"}
                          strokeWidth={isHighlighted ? 2.5 : 1.5}
                          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                        />
                      );
                    })}
                  </svg>

                  {projectNodes.map((node, i) => {
                    const isSelected = selectedNode === node.id;
                    const isConnected = connectedNodes.includes(node.id);
                    return (
                      <motion.div key={node.id}
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        onClick={() => setSelectedNode(isSelected ? null : node.id)}
                        className={`absolute px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${typeColors[node.type]} ${
                          isSelected ? "neon-glow ring-2 ring-primary/50 scale-110 z-10" : ""} ${isConnected ? "ring-1 ring-primary/30" : ""} ${
                          selectedNode !== null && !isSelected && !isConnected ? "opacity-30" : ""}`}
                        style={{ left: node.x, top: node.y }}>
                        {node.label}
                      </motion.div>
                    );
                  })}

                  {selectedNode && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 text-xs">
                      <p className="font-semibold text-foreground mb-1">{projectNodes.find((n) => n.id === selectedNode)?.label}</p>
                      <p className="text-muted-foreground">
                        Connected to {connectedNodes.length} node{connectedNodes.length !== 1 ? "s" : ""}:{" "}
                        {connectedNodes.map((id) => projectNodes.find((n) => n.id === id)?.label).join(", ")}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </>
            )}

            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{projectOverview.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{projectOverview.description}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {projectOverview.stats.map((s) => (
                      <div key={s.label} className="glass rounded-xl p-3 text-center">
                        <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Tech Stack</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {projectOverview.techStack.map((t) => (
                      <div key={t.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 text-xs text-foreground">
                        <t.icon className="w-4 h-4 text-primary" />
                        {t.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Key Features</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {projectOverview.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg text-xs text-muted-foreground">
                        <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "health" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Project Health Score</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Accessibility", score: 92, color: "text-green-400" },
                      { label: "Performance", score: 88, color: "text-neon-blue" },
                      { label: "Consistency", score: 95, color: "text-primary" },
                      { label: "Responsiveness", score: 90, color: "text-neon-pink" },
                    ].map((m) => (
                      <div key={m.label} className="glass rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold ${m.color}`}>{m.score}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Device Coverage</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Desktop", icon: Monitor, status: "Full support" },
                      { label: "Tablet", icon: TabletSmartphone, status: "Full support" },
                      { label: "Mobile", icon: Smartphone, status: "Full support" },
                    ].map((d) => (
                      <div key={d.label} className="glass rounded-xl p-3 flex flex-col items-center gap-2 text-center">
                        <d.icon className="w-6 h-6 text-primary" />
                        <p className="text-xs font-medium text-foreground">{d.label}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Architecture Insights</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {[
                      { icon: Globe, label: "Routes configured", value: "8" },
                      { icon: Shield, label: "Auth-protected routes", value: "4" },
                      { icon: Database, label: "Database tables", value: "2" },
                      { icon: Cpu, label: "Backend functions", value: "1 (AI chat)" },
                      { icon: Lock, label: "RLS policies", value: "6 active" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50">
                        <span className="flex items-center gap-2"><item.icon className="w-3.5 h-3.5 text-primary" /> {item.label}</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right sidebar - Real Activities */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 glass rounded-xl">
                <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No activities yet</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Activities will appear here as you work</p>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {displayedActivities.map((activity, i) => {
                    const IconComp = iconMap[activity.icon_name] || Zap;
                    const { relative, dateFormatted, timeFormatted } = formatDateTime(activity.created_at);
                    return (
                      <motion.div key={activity.id}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                        className="glass rounded-xl p-3.5 hover:border-primary/30 transition-colors duration-300"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${categoryColors[activity.category] || "bg-primary/10"}`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-foreground leading-relaxed">{activity.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-muted-foreground">{relative}</p>
                              <span className="text-[9px] text-muted-foreground/60">·</span>
                              <p className="text-[10px] text-muted-foreground/60">{dateFormatted} {timeFormatted}</p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${categoryColors[activity.category]}`}>
                                {activity.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* More button */}
                {activities.length > 5 && !showAllActivities && (
                  <button onClick={() => setShowAllActivities(true)}
                    className="w-full mt-3 py-2 rounded-xl glass text-xs font-medium text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5" />
                    Show all {activities.length} activities
                  </button>
                )}
                {showAllActivities && activities.length > 5 && (
                  <button onClick={() => setShowAllActivities(false)}
                    className="w-full mt-3 py-2 rounded-xl glass text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Show less
                  </button>
                )}
              </>
            )}

            {/* Node Type Legend */}
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

            {/* Quick Stats */}
            <div className="mt-4 glass rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Quick Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total nodes</span>
                  <span className="text-foreground font-medium">{projectNodes.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="text-foreground font-medium">{projectEdges.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Activities logged</span>
                  <span className="text-foreground font-medium">{activities.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGraphPage;
