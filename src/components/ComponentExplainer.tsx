import { motion, AnimatePresence } from "framer-motion";
import { Layers, Palette, Move, Type } from "lucide-react";

interface Props {
  selectedComponent: { id: number; type: string; label: string } | null;
}

const properties = {
  card: [
    { icon: Layers, label: "Type", value: "Glass Card" },
    { icon: Palette, label: "Background", value: "card/60 + blur" },
    { icon: Move, label: "Size", value: "256 × 144px" },
    { icon: Type, label: "Content", value: "Skeleton placeholders" },
  ],
  button: [
    { icon: Layers, label: "Type", value: "CTA Button" },
    { icon: Palette, label: "Style", value: "Gradient Purple→Pink" },
    { icon: Move, label: "Padding", value: "12 × 32px" },
    { icon: Type, label: "Font", value: "600 / 14px" },
  ],
  input: [
    { icon: Layers, label: "Type", value: "Text Input" },
    { icon: Palette, label: "Border", value: "1px border/50" },
    { icon: Move, label: "Width", value: "256px" },
    { icon: Type, label: "Placeholder", value: "Email Input" },
  ],
};

const ComponentExplainer = ({ selectedComponent }: Props) => {
  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Component Inspector
      </h3>

      <AnimatePresence mode="wait">
        {selectedComponent ? (
          <motion.div
            key={selectedComponent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 mb-4">
              <p className="text-sm font-semibold text-foreground">{selectedComponent.label}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{selectedComponent.type} component</p>
            </div>

            <div className="space-y-3">
              {(properties[selectedComponent.type as keyof typeof properties] || []).map((prop, i) => (
                <motion.div
                  key={prop.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <prop.icon className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{prop.label}</p>
                    <p className="text-sm text-foreground truncate">{prop.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Live generation indicator */}
            <div className="mt-6 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-medium text-primary">Live Generation</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This component uses glassmorphism with backdrop-blur, rounded corners, and skeleton content placeholders for loading states.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Select a component on the canvas to inspect its properties</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComponentExplainer;
