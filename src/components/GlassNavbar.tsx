import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, MicOff, Search, Sparkles } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import CommandPalette from "./CommandPalette";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "UI Score", path: "/ui-score" },
  { label: "Memory Graph", path: "/memory-graph" },
  { label: "Workspace", path: "/workspace" },
];

const GlassNavbar = () => {
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const [listening, setListening] = useState(false);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Voice button - Web Speech API
  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    if (listening) {
      setListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice command:", transcript);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    setListening(true);
    recognition.start();
  }, [listening]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
      >
        <div className="flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center neon-glow-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Proto<span className="gradient-text">Craft</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg gradient-purple neon-glow-sm"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-background/50 text-[10px] font-mono">⌘K</kbd>
            </button>
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-colors ${
                listening
                  ? "gradient-purple text-primary-foreground neon-glow-sm"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <ProfileDropdown />
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </motion.header>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
};

export default GlassNavbar;
