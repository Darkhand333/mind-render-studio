import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Plus, MousePointer, Type, Image, Square, Layout } from "lucide-react";
import ComponentExplainer from "./ComponentExplainer";
import Chatbot from "./Chatbot";

const toolbarItems = [
  { icon: MousePointer, label: "Select" },
  { icon: Square, label: "Rectangle" },
  { icon: Type, label: "Text" },
  { icon: Image, label: "Image" },
  { icon: Layout, label: "Layout" },
];

const WorkspaceCanvas = () => {
  const [micActive, setMicActive] = useState(false);
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
        className="fixed left-0 top-16 bottom-0 w-14 glass-strong flex flex-col items-center pt-12 pb-4 gap-2 z-30"
      >
        {toolbarItems.map((item) => (
          <button
            key={item.label}
            title={item.label}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="flex-1" />
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </motion.aside>

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
