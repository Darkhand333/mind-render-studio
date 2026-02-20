import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, Link2, Image, Eye, Layout, Type, Palette, CheckCircle, AlertTriangle } from "lucide-react";

type EvaluationResult = {
  score: number;
  breakdown: { contrast: number; spacing: number; hierarchy: number; consistency: number };
  feedback: string;
} | null;

const categories = [
  { icon: Eye, label: "Contrast", key: "contrast" },
  { icon: Layout, label: "Spacing", key: "spacing" },
  { icon: Type, label: "Hierarchy", key: "hierarchy" },
  { icon: Palette, label: "Consistency", key: "consistency" },
];

const UIScorePage = () => {
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadPrompt, setUploadPrompt] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult>(null);

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFileName(file.name);
  };

  const handleEvaluate = () => {
    if (!uploadUrl.trim() && !uploadedFileName) return;
    setEvaluating(true);
    // Simulated AI evaluation
    setTimeout(() => {
      const score = Math.floor(Math.random() * 25) + 70;
      setResult({
        score,
        breakdown: {
          contrast: Math.floor(Math.random() * 20) + 75,
          spacing: Math.floor(Math.random() * 20) + 72,
          hierarchy: Math.floor(Math.random() * 20) + 74,
          consistency: Math.floor(Math.random() * 20) + 73,
        },
        feedback: uploadPrompt
          ? `Based on your focus "${uploadPrompt.slice(0, 60)}": The UI demonstrates solid design principles. Contrast ratios meet accessibility standards. Consider improving spacing consistency between sections for better visual rhythm.`
          : "Overall solid design. Good use of visual hierarchy and color contrast. Spacing between elements could be more consistent. Typography hierarchy is clear. Consider adding more whitespace in dense sections.",
      });
      setEvaluating(false);
    }, 2000);
  };

  const handleReset = () => {
    setResult(null);
    setUploadUrl("");
    setUploadPrompt("");
    setUploadedFileName("");
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold mb-2">
            UI Score <span className="gradient-text">Evaluation</span>
          </h1>
          <p className="text-muted-foreground mb-8">Paste a link, upload a screenshot, and get an AI-powered design quality score</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Paste a website URL
              </label>
              <input
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" /> Or upload a screenshot
              </label>
              <label className="flex items-center justify-center gap-2 w-full h-[42px] bg-secondary/50 rounded-xl border border-dashed border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
                {uploadedFileName ? (
                  <span className="text-sm text-foreground truncate px-2">{uploadedFileName}</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Choose file</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-xs text-muted-foreground">Evaluation prompt (optional)</label>
            <textarea
              value={uploadPrompt}
              onChange={(e) => setUploadPrompt(e.target.value)}
              placeholder="e.g. Focus on mobile usability, color accessibility, button sizing..."
              rows={2}
              className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow resize-none"
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluating || (!uploadUrl.trim() && !uploadedFileName)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-purple text-primary-foreground text-sm font-semibold hover:scale-[1.02] transition-transform neon-glow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {evaluating ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Evaluating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Evaluate Now
              </>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#scoreGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.score / 100) }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--neon-purple))" />
                        <stop offset="100%" stopColor="hsl(var(--neon-pink))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-foreground">{result.score}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {uploadUrl ? new URL(uploadUrl.startsWith("http") ? uploadUrl : `https://${uploadUrl}`).hostname : uploadedFileName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {result.score >= 85 ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-accent" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {result.score >= 85 ? "Strong design quality" : "Room for improvement"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {categories.map((cat, i) => {
                  const val = result.breakdown[cat.key as keyof typeof result.breakdown];
                  return (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="p-4 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <cat.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{cat.label}</span>
                        <span className="ml-auto text-sm font-bold text-foreground">{val}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary">
                        <motion.div
                          className="h-full rounded-full gradient-purple"
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">AI Feedback</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.feedback}</p>
              </div>

              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Evaluate another UI
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UIScorePage;
