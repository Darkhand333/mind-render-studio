import { motion, AnimatePresence } from "framer-motion";
import { Layers, Palette, Move, Type, Info, Lightbulb, HelpCircle } from "lucide-react";

interface Props {
  selectedComponent: { id: number; type: string; label: string } | null;
}

const componentInfo: Record<string, { what: string; why: string; details: string }> = {
  card: {
    what: "A Glass Card is a container that groups related content together using a frosted-glass visual style.",
    why: "Cards help users scan content quickly by creating clear visual boundaries. The glassmorphism effect adds depth and modern aesthetics while maintaining readability.",
    details: "This component uses backdrop-blur for the frosted effect, semi-transparent backgrounds, rounded corners, and skeleton placeholders that indicate where real content will load. Cards are ideal for dashboards, feature highlights, and content previews.",
  },
  button: {
    what: "A CTA (Call-to-Action) Button is an interactive element that prompts the user to take a specific action.",
    why: "CTA buttons guide users toward key actions like signing up, purchasing, or navigating. The gradient and glow make it visually dominant so users notice it immediately.",
    details: "This button uses a purple-to-pink gradient with a subtle neon glow effect. It has generous padding for easy click/tap targets, bold font weight for readability, and smooth hover/press animations for satisfying feedback.",
  },
  input: {
    what: "A Text Input field allows users to type and submit information like emails, names, or search queries.",
    why: "Input fields are essential for collecting user data. The subtle border and muted placeholder text guide users on what to enter without overwhelming the design.",
    details: "This input features a semi-transparent background that blends with the dark theme, a thin border for definition, and comfortable padding. The placeholder text hints at expected content. It's designed for accessibility with proper contrast ratios.",
  },
};

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
  const info = selectedComponent ? componentInfo[selectedComponent.type] : null;

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

            {/* What is it? */}
            {info && (
              <div className="space-y-3 mb-5">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-primary" />
                    <p className="text-xs font-semibold text-primary">What is it?</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{info.what}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-accent" />
                    <p className="text-xs font-semibold text-accent">Why use it?</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{info.why}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Info className="w-3.5 h-3.5 text-neon-blue" />
                    <p className="text-xs font-semibold text-neon-blue">More details</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{info.details}</p>
                </div>
              </div>
            )}

            {/* Properties */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Properties</p>
            <div className="space-y-2">
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

            <div className="mt-5 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-medium text-primary">Live Generation</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click any component on the canvas to see a full breakdown of what it is, why it's used, and how it's styled.
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
