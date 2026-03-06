import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Volume2, Loader2, Sparkles, MessageSquare } from "lucide-react";

type VoiceCommandModalProps = {
  open: boolean;
  onClose: () => void;
  onCommand: (transcript: string) => void;
};

const VoiceCommandModal = ({ open, onClose, onCommand }: VoiceCommandModalProps) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const hasSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    setSupported(hasSpeech);
  }, []);

  const speak = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const processCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase().trim();
    let reply = "";

    if (lower.includes("create") || lower.includes("new project") || lower.includes("make")) {
      if (lower.includes("website") || lower.includes("landing")) {
        reply = "Creating a website template for you. What kind of website — portfolio, e-commerce, or blog?";
      } else if (lower.includes("presentation") || lower.includes("slides") || lower.includes("pitch")) {
        reply = "Opening a presentation template. Standard 16:9 or 4:3 aspect ratio?";
      } else if (lower.includes("logo")) {
        reply = "Starting a logo project. Square or wide format?";
      } else if (lower.includes("mobile") || lower.includes("app")) {
        reply = "Creating a mobile app wireframe. iPhone or Android dimensions?";
      } else {
        reply = "What would you like to create? A website, presentation, logo, or mobile app?";
      }
    } else if (lower.includes("draw") || lower.includes("add")) {
      if (lower.includes("rectangle") || lower.includes("box")) {
        reply = "Drawing a rectangle on the canvas.";
        onCommand("draw:rectangle");
      } else if (lower.includes("circle") || lower.includes("ellipse")) {
        reply = "Adding a circle to the canvas.";
        onCommand("draw:ellipse");
      } else if (lower.includes("text")) {
        reply = "Adding a text element.";
        onCommand("draw:text");
      } else if (lower.includes("frame")) {
        reply = "Creating a new frame.";
        onCommand("draw:frame");
      } else if (lower.includes("star")) {
        reply = "Adding a star shape.";
        onCommand("draw:star");
      } else {
        reply = "What shape would you like? Rectangle, circle, star, text, or frame?";
      }
    } else if (lower.includes("zoom in")) {
      reply = "Zooming in.";
      onCommand("zoom:in");
    } else if (lower.includes("zoom out")) {
      reply = "Zooming out.";
      onCommand("zoom:out");
    } else if (lower.includes("undo")) {
      reply = "Undoing last action.";
      onCommand("action:undo");
    } else if (lower.includes("redo")) {
      reply = "Redoing action.";
      onCommand("action:redo");
    } else if (lower.includes("select all")) {
      reply = "Selecting all elements.";
      onCommand("action:selectAll");
    } else if (lower.includes("delete") || lower.includes("remove")) {
      reply = "Deleting selected element.";
      onCommand("action:delete");
    } else if (lower.includes("export")) {
      reply = "Opening the export dialog.";
      onCommand("action:export");
    } else if (lower.includes("save")) {
      reply = "Saving your project.";
      onCommand("action:save");
    } else if (lower.includes("help")) {
      reply = "You can say: create a website, draw a rectangle, add text, zoom in, undo, export, or save. What would you like to do?";
    } else {
      reply = `I heard "${cmd}". Try saying: create a website, draw a rectangle, add text, zoom in, or help.`;
    }

    setResponse(reply);
    speak(reply);
  }, [onCommand, speak]);

  const startListening = useCallback(() => {
    if (!supported) {
      setResponse("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += t;
          } else {
            interim += t;
          }
        }
        if (final) {
          setTranscript(final);
          setInterimTranscript("");
          setHistory(prev => [final, ...prev].slice(0, 10));
          processCommand(final);
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error);
        setListening(false);
        if (e.error === "not-allowed") {
          setResponse("Microphone access denied. Please allow microphone access in your browser settings.");
        } else if (e.error === "no-speech") {
          setResponse("No speech detected. Please try again.");
        } else {
          setResponse(`Error: ${e.error}. Please try again.`);
        }
      };

      recognitionRef.current = recognition;
      setListening(true);
      setResponse("I'm listening... speak your command.");
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setResponse("Failed to start voice recognition. Please try again.");
    }
  }, [supported, processCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopListening();
      setTranscript("");
      setInterimTranscript("");
      setResponse("");
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }
  }, [open, stopListening]);

  // Auto-start listening when modal opens
  useEffect(() => {
    if (open && supported) {
      const timer = setTimeout(() => startListening(), 400);
      return () => clearTimeout(timer);
    }
  }, [open, supported]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-md flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong rounded-3xl p-8 w-full max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Voice Assistant</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!supported && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                Voice recognition is not supported in this browser. Please use Chrome or Edge.
              </div>
            )}

            {/* Mic button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={listening ? stopListening : startListening}
                disabled={!supported}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  listening
                    ? "gradient-purple neon-glow scale-110"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50"
                }`}
              >
                {listening && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/40"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-primary/20"
                      animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                  </>
                )}
                {listening ? <MicOff className="w-8 h-8 text-primary-foreground" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {listening ? "🔴 Listening... Speak your command" : "Tap the microphone to start"}
            </p>

            {/* AI Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 mb-4 text-left"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{response}</p>
                </div>
              </motion.div>
            )}

            {/* Live transcript */}
            {(transcript || interimTranscript) && (
              <div className="glass rounded-xl p-4 mb-4 text-left">
                {transcript && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground font-medium">{transcript}</p>
                  </div>
                )}
                {interimTranscript && (
                  <p className="text-sm text-muted-foreground italic flex items-center gap-2 mt-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {interimTranscript}
                  </p>
                )}
              </div>
            )}

            {/* Quick commands */}
            <div className="text-left">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Try saying:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Create a website",
                  "Draw a rectangle",
                  "Add text",
                  "Zoom in",
                  "Undo",
                  "Help",
                ].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => processCommand(cmd)}
                    className="px-2.5 py-1.5 rounded-lg bg-secondary/40 text-[11px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors text-left"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent commands</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {history.map((h, i) => (
                    <button key={i} onClick={() => processCommand(h)}
                      className="w-full text-left text-[11px] text-muted-foreground px-2 py-1 rounded bg-secondary/30 truncate hover:bg-secondary/50 transition-colors">
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceCommandModal;
