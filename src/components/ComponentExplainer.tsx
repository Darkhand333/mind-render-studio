import { motion, AnimatePresence } from "framer-motion";
import { Layers, Palette, Move, Type, Info, Lightbulb, HelpCircle } from "lucide-react";

interface Props {
  selectedComponent: { id: number; type: string; label: string } | null;
}

const componentInfo: Record<string, { what: string; why: string; details: string }> = {
  rectangle: {
    what: "A Rectangle is a basic shape used to create containers, backgrounds, cards, and layout sections.",
    why: "Rectangles are the building block of every UI. They define boundaries, create visual separation, and serve as the foundation for cards, buttons, modals, and panels.",
    details: "This shape has configurable width, height, corner radius, fill color, and border. Use it to prototype any box-shaped UI element. Drag to resize, double-click to edit properties.",
  },
  ellipse: {
    what: "An Ellipse is a circular or oval shape used for avatars, icons, decorative elements, and status indicators.",
    why: "Circles and ovals create visual softness and draw attention. They're commonly used for profile pictures, notification badges, loading spinners, and decorative accents.",
    details: "Defined by horizontal and vertical radii. Perfect circles have equal width and height. Often used at small sizes for status dots or large sizes for avatar containers.",
  },
  triangle: {
    what: "A Triangle is a three-sided shape used for arrows, dropdown indicators, play buttons, and decorative elements.",
    why: "Triangles create directional cues and visual tension. They naturally guide the eye and are essential for navigation hints, accordion toggles, and media controls.",
    details: "Can be oriented in any direction by rotating. Common in dropdown arrows, breadcrumb separators, and tooltip pointers.",
  },
  diamond: {
    what: "A Diamond is a rotated square shape used for decorative accents, decision flowchart nodes, and unique UI markers.",
    why: "Diamonds stand out from typical rectangular layouts, making them ideal for highlighting special states, creating visual variety, or representing decision points in diagrams.",
    details: "Essentially a square rotated 45 degrees. Used in flowcharts, infographics, and as decorative elements to break visual monotony.",
  },
  star: {
    what: "A Star shape is used for ratings, favorites, achievements, and decorative highlights.",
    why: "Stars are universally recognized for ratings and favorites. They add playfulness and are essential for review systems, reward badges, and featured content markers.",
    details: "Five-pointed by default with configurable inner/outer radius ratio. Fill states (empty, half, full) are used in rating systems.",
  },
  polygon: {
    what: "A Polygon (hexagon) is a multi-sided shape used for unique layouts, badges, and visual interest.",
    why: "Hexagons and other polygons create distinctive, modern-looking UI elements. Popular in tech dashboards, skill badges, and honeycomb grid layouts.",
    details: "Six-sided by default. Can be configured for different numbers of sides. Often used in tech-focused designs for a futuristic aesthetic.",
  },
  line: {
    what: "A Line is a basic connector or separator used to divide content, show relationships, or create visual structure.",
    why: "Lines create visual hierarchy by separating content sections. As connectors, they show relationships between elements in diagrams and flowcharts.",
    details: "Defined by start and end points. Can be styled with different weights, colors, and dash patterns. Essential for wireframing and diagram creation.",
  },
  arrow: {
    what: "An Arrow is a directional line used to show flow, navigation direction, or connections between elements.",
    why: "Arrows communicate direction and flow. They're essential in user flow diagrams, onboarding sequences, and anywhere you need to guide the user's attention.",
    details: "Combines a line with an arrowhead. Direction indicates flow from source to target. Common in flowcharts, wireframe annotations, and navigation indicators.",
  },
  pen: {
    what: "The Pen tool creates freeform paths by placing anchor points, allowing custom shapes and illustrations.",
    why: "When standard shapes aren't enough, the pen tool lets you create any custom shape. Essential for icons, logos, custom illustrations, and unique UI elements.",
    details: "Click to place points, double-click to finish the path. Creates a connected series of line segments. Advanced usage includes curves and complex vector shapes.",
  },
  text: {
    what: "A Text element displays editable typography — headings, body copy, labels, or any written content.",
    why: "Text is the primary way users consume information. Proper text hierarchy (size, weight, color) guides reading order and communicates importance.",
    details: "Double-click to edit content inline. Supports different sizes and colors. Use for headings, paragraphs, labels, captions, and any textual UI element.",
  },
  frame: {
    what: "A Frame is a layout container (like an artboard) that groups child elements and defines a screen or section boundary.",
    why: "Frames organize your design into logical screens or sections. They act as artboards for different pages, viewports, or component boundaries.",
    details: "Sharp corners distinguish frames from rounded rectangles. They clip content to their bounds and serve as the top-level container for responsive layouts.",
  },
  image: {
    what: "An Image placeholder represents where a photo, illustration, or graphic will be placed in the final design.",
    why: "Images are crucial for engagement and communication. Placeholders help plan layouts before final assets are ready, ensuring proper sizing and positioning.",
    details: "Drag to set dimensions. In production, these become real images with alt text, lazy loading, and responsive sizing.",
  },
  card: {
    what: "A Glass Card is a container that groups related content with a frosted-glass visual style.",
    why: "Cards help users scan content by creating clear visual boundaries. Glassmorphism adds depth and modern aesthetics while maintaining readability.",
    details: "Uses backdrop-blur for the frosted effect, semi-transparent backgrounds, rounded corners, and skeleton placeholders.",
  },
  button: {
    what: "A CTA Button prompts the user to take a specific action like signing up or navigating.",
    why: "CTA buttons guide users toward key actions. The gradient and glow make it visually dominant so users notice it immediately.",
    details: "Uses a gradient with neon glow, generous padding for easy interaction, and smooth hover animations for satisfying feedback.",
  },
  input: {
    what: "A Text Input allows users to type and submit information like emails, names, or search queries.",
    why: "Input fields are essential for collecting user data. The subtle styling guides users on what to enter without overwhelming the design.",
    details: "Semi-transparent background, thin border, and comfortable padding. Designed for accessibility with proper contrast ratios.",
  },
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
              <p className="text-xs text-muted-foreground mt-1 capitalize">{selectedComponent.type} element</p>
            </div>

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

            <div className="mt-5 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs font-medium text-primary">Tips</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use keyboard shortcuts for quick tool switching. Press Delete to remove, Ctrl+D to duplicate, Ctrl+Z to undo.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Select a component on the canvas to inspect it</p>
            <p className="text-xs text-muted-foreground mt-2">Click any shape or draw a new one</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComponentExplainer;
