import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowRight, Layers, Palette, Zap, Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Mic, title: "Voice-to-UI", desc: "Speak your ideas, watch them become real interfaces" },
  { icon: Layers, title: "Multi-Page Flows", desc: "Build connected screens with natural language" },
  { icon: Palette, title: "AI Themes", desc: "Mood-based palettes generated instantly" },
  { icon: Brain, title: "Intent Memory", desc: "AI remembers your design patterns" },
];

const stagger = {
  container: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  },
};

const HeroLanding = () => {
  const handleVoiceClick = useCallback(() => {
    // Dispatch custom event to open navbar voice modal
    window.dispatchEvent(new CustomEvent("open-voice-command"));
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger.container}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        <motion.div variants={stagger.item} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-primary" />
            AI-Powered Design Studio
          </span>
        </motion.div>

        <motion.h1
          variants={stagger.item}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6"
        >
          Speak. Design.{" "}
          <span className="gradient-text neon-text">Evolve.</span>
        </motion.h1>

        <motion.p
          variants={stagger.item}
          className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
        >
          ProtoCraft turns your voice into living design — build stunning multi-page
          prototypes with AI, in seconds.
        </motion.p>

        <motion.div variants={stagger.item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/generate"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-purple text-primary-foreground font-semibold neon-glow hover:scale-[1.02] transition-transform duration-300"
          >
            <Sparkles className="w-4 h-4" />
            Generate UI
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          </Link>
          <button
            onClick={handleVoiceClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 glass text-foreground hover:bg-secondary/80"
          >
            <Mic className="w-4 h-4" />
            Voice Command
          </button>
          <Link
            to="/ui-score"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl glass text-foreground font-semibold hover:bg-secondary/80 transition-colors duration-300"
          >
            Evaluate UI
          </Link>
        </motion.div>
      </motion.div>

      {/* Quick intro section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="relative z-10 mt-16 max-w-2xl text-center"
      >
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">How it works</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full gradient-purple text-primary-foreground flex items-center justify-center text-xs font-bold">1</span> Describe your UI by voice or text</div>
            <ArrowRight className="w-4 h-4 text-primary hidden sm:block" />
            <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full gradient-purple text-primary-foreground flex items-center justify-center text-xs font-bold">2</span> AI generates live prototype</div>
            <ArrowRight className="w-4 h-4 text-primary hidden sm:block" />
            <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full gradient-purple text-primary-foreground flex items-center justify-center text-xs font-bold">3</span> Refine, score & export</div>
          </div>
        </div>
      </motion.div>

      {/* Features grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger.container}
        className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 max-w-5xl w-full"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={stagger.item}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass rounded-2xl p-6 group cursor-default"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:neon-glow-sm transition-shadow duration-500">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default HeroLanding;
