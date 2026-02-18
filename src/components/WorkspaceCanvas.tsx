import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Plus, MousePointer, Type, Image, Square, Layout, Circle, Minus, ArrowUpRight, Pen, Hand, ZoomIn, ZoomOut, Users, Move, Copy, Trash2, Layers } from "lucide-react";
import ComponentExplainer from "./ComponentExplainer";
import Chatbot from "./Chatbot";

const toolbarItems = [
  { icon: MousePointer, label: "Select", shortcut: "V" },
  { icon: Hand, label: "Pan", shortcut: "H" },
  { icon: Square, label: "Rectangle", shortcut: "R" },
  { icon: Circle, label: "Ellipse", shortcut: "O" },
  { icon: Minus, label: "Line", shortcut: "L" },
  { icon: ArrowUpRight, label: "Arrow", shortcut: "A" },
  { icon: Pen, label: "Pen", shortcut: "P" },
  { icon: Type, label: "Text", shortcut: "T" },
  { icon: Image, label: "Image", shortcut: "I" },
  { icon: Layout, label: "Frame", shortcut: "F" },
];

const bottomTools = [
  { icon: ZoomOut, label: "Zoom Out" },
  { icon: ZoomIn, label: "Zoom In" },
  { icon: Copy, label: "Duplicate" },
  { icon: Trash2, label: "Delete" },
  { icon: Layers, label: "Layers" },
];

const WorkspaceCanvas = () => {
  const [micActive, setMicActive] = useState(false);
  const [activeTool, setActiveTool] = useState("Select");
  const [showCollab, setShowCollab] = useState(false);
  const [placedComponents, setPlacedComponents] = useState<
    { id: number; type: string; x: number; y: number; label: string }[]
  >([
    { id: 1, type: "card", x: 120, y: 80, label: "Hero Section" },
    { id: 2, type: "button", x: 400, y: 200, label: "CTA Button" },
    { id: 3, type: "input", x: 120, y: 300, label: "Email Input" },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen pt-16 flex">
      {/* Left toolbar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-16 bottom-0 w-14 glass-strong flex flex-col items-center pt-4 pb-4 gap-1 z-30"
      >
        {toolbarItems.map((item) => (
          <button
            key={item.label}
            title={`${item.label} (${item.shortcut})`}
            onClick={() => setActiveTool(item.label)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
              activeTool === item.label
                ? "gradient-purple text-primary-foreground neon-glow-sm"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-8 h-px bg-border/50 my-1" />

        {bottomTools.map((item) => (
          <button
            key={item.label}
            title={item.label}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="flex-1" />

        {/* Collaboration */}
        <button
          title="Collaborate"
          onClick={() => setShowCollab(!showCollab)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
            showCollab ? "gradient-purple text-primary-foreground neon-glow-sm" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          title="Add component"
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </motion.aside>

      {/* Collaboration panel */}
      <AnimatePresence>
        {showCollab && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-16 top-20 w-64 glass-strong rounded-2xl p-4 z-30"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Collaboration</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Invite friends to work together in real-time</p>
            <input
              placeholder="Enter email to invite..."
              className="w-full bg-secondary/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 mb-2"
            />
            <button className="w-full py-2 rounded-xl gradient-purple text-primary-foreground text-xs font-semibold hover:scale-[1.02] transition-transform">
              Send Invite
            </button>
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground mb-2">Online now</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full gradient-purple" />
                <span className="text-xs text-foreground">You</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="flex-1 ml-14 mr-72 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[70vh] rounded-2xl glass overflow-hidden"
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                                linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Active tool indicator */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 backdrop-blur-sm">
            <Move className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground font-medium">{activeTool} Tool</span>
          </div>

          {/* Placed components */}
          {placedComponents.map((comp) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedId(comp.id === selectedId ? null : comp.id)}
              className={`absolute cursor-pointer transition-shadow duration-300 ${
                selectedId === comp.id ? "ring-2 ring-primary neon-glow-sm" : ""
              }`}
              style={{ left: comp.x, top: comp.y }}
            >
              {comp.type === "card" && (
                <div className="w-64 h-36 rounded-xl glass p-4">
                  <div className="h-3 w-20 rounded-full bg-primary/20 mb-3" />
                  <div className="h-2 w-full rounded-full bg-muted-foreground/10 mb-2" />
                  <div className="h-2 w-3/4 rounded-full bg-muted-foreground/10" />
                  <p className="text-xs text-muted-foreground mt-4">{comp.label}</p>
                </div>
              )}
              {comp.type === "button" && (
                <div className="px-8 py-3 rounded-xl gradient-purple text-primary-foreground text-sm font-semibold neon-glow-sm">
                  {comp.label}
                </div>
              )}
              {comp.type === "input" && (
                <div className="w-64">
                  <div className="px-4 py-3 rounded-xl border border-border bg-input/50 text-sm text-muted-foreground">
                    {comp.label}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right panel - Component Explainer */}
      <motion.aside
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-16 bottom-0 w-72 glass-strong z-40 overflow-y-auto"
      >
        <ComponentExplainer
          selectedComponent={
            selectedId
              ? placedComponents.find((c) => c.id === selectedId) || null
              : null
          }
        />
      </motion.aside>

      {/* Floating mic button */}
      <motion.button
        onClick={() => setMicActive(!micActive)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-8 right-80 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
          micActive
            ? "gradient-purple neon-glow"
            : "glass hover:bg-primary/10"
        }`}
      >
        {micActive ? (
          <MicOff className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Mic className="w-5 h-5 text-primary" />
        )}
        {micActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default WorkspaceCanvas;
