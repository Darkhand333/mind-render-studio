import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

type ChatMessage = { role: "bot" | "user"; text: string };

const initialMessages: ChatMessage[] = [
  { role: "bot", text: "Hi! I'm ProtoCraft AI. Ask me anything about UI design, components, or how to use the workspace." },
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      const responses = [
        "Great question! You can use voice commands to create any component — just say 'Add a card with rounded corners' and I'll generate it.",
        "The UI Score page evaluates your design based on accessibility, contrast, spacing, and visual hierarchy. Try it with your prototype!",
        "You can link pages by saying 'Link this button to the pricing page'. The Intent Memory Graph tracks all your design decisions.",
        "For glassmorphism effects, I use backdrop-blur combined with semi-transparent backgrounds. Want me to apply it to a component?",
      ];
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: responses[Math.floor(Math.random() * responses.length)] },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 left-8 z-50 w-12 h-12 rounded-full glass neon-glow-sm flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 left-8 z-50 w-80 h-[450px] rounded-2xl glass-strong flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">ProtoCraft AI</p>
                <p className="text-[10px] text-muted-foreground">Design assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "bot" ? "bg-primary/20" : "bg-accent/20"
                    }`}
                  >
                    {msg.role === "bot" ? (
                      <Bot className="w-3 h-3 text-primary" />
                    ) : (
                      <User className="w-3 h-3 text-accent" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === "bot"
                        ? "bg-secondary/80 text-foreground"
                        : "gradient-purple text-primary-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about design..."
                  className="flex-1 bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                />
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
