import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, Loader2, Code, Eye, Download, Copy, Check,
  Sparkles, Monitor, Tablet, Smartphone, RotateCcw, Wand2, Layout
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { generatedUiToWorkspacePayload } from "./workspaceTransfer";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ui`;

type GeneratedUI = { html: string; css: string; js: string };

const EXAMPLE_PROMPTS = [
  "Login page with email and password",
  "Dashboard with stats cards and charts",
  "Pricing page with 3 tiers",
  "Portfolio landing page with hero section",
  "E-commerce product card grid",
  "Contact form with map section",
  "Blog post layout with sidebar",
  "Signup page with social login buttons",
];

const UIGeneratorPanel = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUI, setGeneratedUI] = useState<GeneratedUI | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [deviceWidth, setDeviceWidth] = useState<string>("100%");
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ prompt: string; ui: GeneratedUI }[]>([]);
  const recognitionRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const promptBeforeListeningRef = useRef("");
  const finalTranscriptRef = useRef("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const syncPromptWithTranscript = useCallback((interim = "") => {
    const nextPrompt = [promptBeforeListeningRef.current, finalTranscriptRef.current, interim]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    setPrompt(nextPrompt);
    setInterimText(interim);
  }, []);

  const clearRecognitionRestart = useCallback(() => {
    if (restartTimeoutRef.current !== null) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const resetRecognitionState = useCallback(() => {
    clearRecognitionRestart();
    recognitionRef.current = null;
    listeningRef.current = false;
    setIsListening(false);
    setInterimText("");
  }, [clearRecognitionRestart]);

  const handleMicrophoneError = useCallback((error: any) => {
    const code = error?.error || error?.name;

    if (code === "NotAllowedError" || code === "PermissionDeniedError" || code === "not-allowed" || code === "service-not-allowed") {
      toast({ title: "Microphone blocked", description: "Allow microphone access in your browser settings", variant: "destructive" });
      return;
    }

    if (code === "NotFoundError" || code === "DevicesNotFoundError" || code === "audio-capture") {
      toast({ title: "Microphone unavailable", description: "Connect a microphone and try again", variant: "destructive" });
      return;
    }

    if (code === "NotReadableError" || code === "TrackStartError") {
      toast({ title: "Microphone busy", description: "Close any app using the microphone, then try again", variant: "destructive" });
      return;
    }

    if (code === "network") {
      toast({ title: "Speech service interrupted", description: "Trying to reconnect to voice input", variant: "destructive" });
      return;
    }

    toast({ title: "Voice input failed", description: "Please try the microphone again", variant: "destructive" });
  }, [toast]);

  const requestMicrophoneAccess = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      handleMicrophoneError(error);
      return false;
    }
  }, [handleMicrophoneError]);

  const stopListening = useCallback(() => {
    stopRequestedRef.current = true;
    clearRecognitionRestart();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try { recognitionRef.current.abort(); } catch {}
        resetRecognitionState();
      }
    } else {
      resetRecognitionState();
    }
  }, [clearRecognitionRestart, resetRecognitionState]);

  const buildRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listeningRef.current = true;
      setIsListening(true);
      textareaRef.current?.focus();
    };

    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcriptChunk = e.results[i][0]?.transcript || "";
        if (e.results[i].isFinal) {
          finalTranscriptRef.current = [finalTranscriptRef.current, transcriptChunk]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
        } else {
          interim += transcriptChunk;
        }
      }
      syncPromptWithTranscript(interim.trim());
    };

    recognition.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;

      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "audio-capture") {
        stopRequestedRef.current = true;
        handleMicrophoneError(e);
        resetRecognitionState();
      }
    };

    recognition.onend = () => {
      if (stopRequestedRef.current) {
        resetRecognitionState();
        return;
      }

      clearRecognitionRestart();
      restartTimeoutRef.current = window.setTimeout(() => {
        if (stopRequestedRef.current) return;

        const nextRecognition = recognitionRef.current ?? buildRecognition();
        if (!nextRecognition) {
          resetRecognitionState();
          return;
        }

        recognitionRef.current = nextRecognition;

        try {
          nextRecognition.start();
        } catch (error: any) {
          if (error?.name === "InvalidStateError") return;
          stopRequestedRef.current = true;
          handleMicrophoneError(error);
          resetRecognitionState();
        }
      }, 180);
    };

    return recognition;
  }, [clearRecognitionRestart, handleMicrophoneError, resetRecognitionState, syncPromptWithTranscript]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Not supported", description: "Use Chrome, Edge, or Safari for voice input", variant: "destructive" });
      return;
    }

    promptBeforeListeningRef.current = prompt.trim();
    finalTranscriptRef.current = "";
    syncPromptWithTranscript("");
    stopRequestedRef.current = false;

    // CRITICAL: Create + start recognition SYNCHRONOUSLY inside the click handler
    // to preserve the user gesture context. The browser will prompt for mic
    // permission automatically — do NOT await getUserMedia first.
    const recognition = buildRecognition();
    if (!recognition) {
      toast({ title: "Not supported", description: "Voice input unavailable in this browser", variant: "destructive" });
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      try { recognition.abort(); } catch {}
      const fresh = buildRecognition();
      if (fresh) {
        recognitionRef.current = fresh;
        try {
          fresh.start();
        } catch {
          toast({ title: "Voice input failed", description: "Please tap the microphone again", variant: "destructive" });
          stopRequestedRef.current = true;
          resetRecognitionState();
        }
      }
    }
  }, [isListening, prompt, toast, stopListening, syncPromptWithTranscript, resetRecognitionState, buildRecognition]);

  // Stop voice when unmount
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim();
    if (!text) return;

    if (isListening) stopListening();

    setIsGenerating(true);
    setGeneratedUI(null);
    setViewMode("preview");

    try {
      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Failed (${resp.status})`);
      }

      const ui: GeneratedUI = await resp.json();
      setGeneratedUI(ui);
      setHistory((prev) => [{ prompt: text, ui }, ...prev].slice(0, 10));
      toast({ title: "UI Generated!", description: "Your interface is ready in the preview" });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isListening, toast, stopListening]);

  // Convert generated UI to workspace elements
  const handleConvertToWorkspace = useCallback(async () => {
    if (!generatedUI) return;
    try {
      const payload = await generatedUiToWorkspacePayload(generatedUI, prompt || "Generated UI");
      localStorage.setItem("protocraft:imported-ui", JSON.stringify(payload));
      toast({ title: "Converting to Workspace", description: "Opening workspace with your generated UI..." });
      navigate("/workspace?import=generated&source=generator");
    } catch {
      toast({ title: "Workspace transfer failed", description: "Please try opening the generated UI again.", variant: "destructive" });
    }
  }, [generatedUI, prompt, navigate, toast]);

  // Build iframe srcdoc
  const iframeSrc = generatedUI
    ? `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${generatedUI.css}</style>
</head>
<body>
${generatedUI.html}
${generatedUI.js ? `<script>${generatedUI.js}<\/script>` : ""}
</body>
</html>`
    : "";

  const fullCode = generatedUI
    ? `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Generated UI</title>\n<style>\n${generatedUI.css}\n</style>\n</head>\n<body>\n${generatedUI.html}\n${generatedUI.js ? `<script>\n${generatedUI.js}\n</script>` : ""}\n</body>\n</html>`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Full HTML code copied to clipboard" });
  };

  const handleDownload = () => {
    const blob = new Blob([fullCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-ui.html";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "HTML file saved" });
  };

  return (
    <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-4">
          <Wand2 className="w-3.5 h-3.5 text-primary" />
          Protocraft AI Generator
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          Describe it. <span className="gradient-text">Generate it.</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Type or speak your UI idea — Protocraft creates a complete, beautiful interface instantly.
        </p>
      </motion.div>

      {/* Input area */}
      <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6 max-w-3xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Voice button */}
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-xl shrink-0 transition-all ${
              isListening
                ? "gradient-purple neon-glow-sm text-primary-foreground animate-pulse"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            title={isListening ? "Stop listening" : "Start voice input (auto-stops after 2s silence)"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder=""
              rows={2}
              className="w-full rounded-xl border border-card bg-card px-4 py-3 text-sm text-card-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow resize-none"
            />
            {interimText && (
              <p className="absolute bottom-1 left-4 text-xs text-muted-foreground italic truncate max-w-[80%]">
                {interimText}
              </p>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="p-3 rounded-xl gradient-purple text-primary-foreground hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shrink-0"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Voice listening indicator */}
        {isListening && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mt-3 flex items-center gap-2 text-xs text-primary">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Listening — speak now and tap the microphone again when you want to stop.
          </motion.div>
        )}
      </motion.div>

      {/* Example prompts */}
      {!generatedUI && !isGenerating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-8">
          <p className="sr-only">Example prompts</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => { setPrompt(ex); textareaRef.current?.focus(); }}
                className="px-3 py-1.5 rounded-lg border border-card bg-card text-xs text-card-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-sm"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="max-w-3xl mx-auto text-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground mb-1">Protocraft is generating your UI...</p>
          <p className="text-sm text-muted-foreground">Crafting a beautiful interface from your description</p>
        </motion.div>
      )}

      {/* Result area */}
      <AnimatePresence>
        {generatedUI && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "preview" ? "gradient-purple text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "code" ? "gradient-purple text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" /> Code
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Device sizes */}
                {viewMode === "preview" && (
                  <div className="flex items-center gap-1 mr-2">
                    <button onClick={() => setDeviceWidth("100%")} title="Desktop"
                      className={`p-1.5 rounded-lg transition-colors ${deviceWidth === "100%" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}>
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeviceWidth("768px")} title="Tablet"
                      className={`p-1.5 rounded-lg transition-colors ${deviceWidth === "768px" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}>
                      <Tablet className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeviceWidth("375px")} title="Mobile"
                      className={`p-1.5 rounded-lg transition-colors ${deviceWidth === "375px" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}>
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {/* Convert to Workspace */}
                <button onClick={handleConvertToWorkspace}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card bg-card text-sm text-card-foreground font-medium hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-sm">
                  <Layout className="w-3.5 h-3.5" /> Open in Workspace
                </button>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card bg-card text-sm text-card-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-sm">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card bg-card text-sm text-card-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={() => { setGeneratedUI(null); setPrompt(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card bg-card text-sm text-card-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-sm">
                  <RotateCcw className="w-3.5 h-3.5" /> New
                </button>
              </div>
            </div>

            {/* Preview / Code */}
            <div className="max-w-6xl mx-auto glass rounded-2xl overflow-hidden" style={{ minHeight: 500 }}>
              {viewMode === "preview" ? (
                <div className="flex justify-center bg-white" style={{ minHeight: 500 }}>
                  <iframe
                    ref={iframeRef}
                    srcDoc={iframeSrc}
                    title="Generated UI Preview"
                    sandbox="allow-scripts"
                    className="border-0 transition-all duration-300"
                    style={{ width: deviceWidth, height: 600, maxWidth: "100%" }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <pre className="p-6 text-sm text-foreground overflow-auto max-h-[600px] bg-background/50 font-mono leading-relaxed">
                    <code>{fullCode}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Generation history */}
            {history.length > 1 && (
              <div className="max-w-3xl mx-auto mt-8">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Generations</p>
                <div className="space-y-2">
                  {history.slice(1).map((h, i) => (
                    <button key={i} onClick={() => { setGeneratedUI(h.ui); setPrompt(h.prompt); setViewMode("preview"); }}
                      className="w-full text-left px-4 py-2.5 rounded-xl bg-secondary/30 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors truncate">
                      {h.prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UIGeneratorPanel;
