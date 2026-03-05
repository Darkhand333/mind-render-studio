import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Volume2, Loader2 } from "lucide-react";

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
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setTranscript("Voice recognition not supported in this browser.");
      return;
    }
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
        onCommand(final);
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [onCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopListening();
      setTranscript("");
      setInterimTranscript("");
    }
  }, [open, stopListening]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-md flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong rounded-3xl p-8 w-full max-w-md text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Voice Commands</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mic button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? "gradient-purple neon-glow scale-110"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {listening && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {listening ? <MicOff className="w-8 h-8 text-primary-foreground" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {listening ? "Listening... Speak your command" : "Tap the microphone to start"}
          </p>

          {/* Live transcript */}
          {(transcript || interimTranscript) && (
            <div className="glass rounded-xl p-4 mb-4 text-left">
              {transcript && (
                <p className="text-sm text-foreground font-medium">{transcript}</p>
              )}
              {interimTranscript && (
                <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {interimTranscript}
                </p>
              )}
            </div>
          )}

          {/* Command examples */}
          <div className="text-left">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Try saying:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Draw a rectangle",
                "Add a text element",
                "Zoom in",
                "Create a frame",
                "Select all",
                "Undo last action",
              ].map((cmd) => (
                <div key={cmd} className="px-2.5 py-1.5 rounded-lg bg-secondary/40 text-[11px] text-muted-foreground">
                  "{cmd}"
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent commands</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="text-[11px] text-muted-foreground px-2 py-1 rounded bg-secondary/30 truncate">
                    {h}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCommandModal;
