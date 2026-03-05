export type CanvasElement = {
  id: number;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  cornerRadius: number;
  visible: boolean;
  locked: boolean;
  flipH?: boolean;
  flipV?: boolean;
  points?: { x: number; y: number }[];
  // Bezier control points for each point: [cp1x, cp1y, cp2x, cp2y]
  controlPoints?: { cp1x: number; cp1y: number; cp2x: number; cp2y: number }[];
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
  blendMode?: string;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  blurAmount?: number;
  strokeDash?: string;
  strokeCap?: string;
  strokeJoin?: string;
  constraintH?: string;
  constraintV?: string;
  autoLayout?: boolean;
  layoutDirection?: string;
  layoutGap?: number;
  layoutPadding?: number;
  imageUrl?: string;
  imageBrightness?: number;
  imageContrast?: number;
  imageSaturation?: number;
  imageObjectFit?: string;
  imageGrayscale?: number;
  imageHueRotate?: number;
  // Grouping
  groupId?: number;
  isGroup?: boolean;
  children?: number[];
};

export type LeftTab = "pages" | "layers" | "assets" | "find" | "inspector";

export type ProjectType = "design" | "presentation" | "doc" | "custom";

export type ProjectTemplate = {
  id: string;
  name: string;
  type: ProjectType;
  width: number;
  height: number;
  thumbnail: string;
  category: string;
};

export type DeviceFrame = {
  id: string;
  name: string;
  width: number;
  height: number;
  category: "mobile" | "tablet" | "desktop" | "watch";
  icon: string;
};

export type DraftProject = {
  id: string;
  name: string;
  type: ProjectType;
  updatedAt: string;
  thumbnail?: string;
};

export const defaultColors = [
  "hsl(263, 70%, 58%)", "hsl(330, 80%, 60%)", "hsl(217, 91%, 60%)",
  "hsl(160, 70%, 50%)", "hsl(45, 90%, 55%)", "hsl(0, 80%, 60%)",
];

export const presetColors = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1", "#a855f7",
];

export const fontFamilies = [
  "Inter", "Arial", "Helvetica", "Georgia", "Times New Roman",
  "Courier New", "Verdana", "Trebuchet MS", "Comic Sans MS", "Impact",
  "Palatino", "Garamond", "Bookman", "Avant Garde",
];

export const blendModes = ["Normal", "Multiply", "Screen", "Overlay", "Darken", "Lighten", "Color Dodge", "Color Burn", "Hard Light", "Soft Light", "Difference", "Exclusion"];

export const strokeDashOptions = [
  { label: "Solid", value: "" },
  { label: "Dash", value: "8 4" },
  { label: "Dot", value: "2 4" },
  { label: "Dash-Dot", value: "8 4 2 4" },
];

export const deviceFrames: DeviceFrame[] = [
  { id: "iphone15", name: "iPhone 15 Pro", width: 393, height: 852, category: "mobile", icon: "📱" },
  { id: "iphone15max", name: "iPhone 15 Pro Max", width: 430, height: 932, category: "mobile", icon: "📱" },
  { id: "iphoneSE", name: "iPhone SE", width: 375, height: 667, category: "mobile", icon: "📱" },
  { id: "pixel8", name: "Pixel 8", width: 412, height: 915, category: "mobile", icon: "📱" },
  { id: "galaxyS24", name: "Galaxy S24", width: 360, height: 780, category: "mobile", icon: "📱" },
  { id: "ipadPro12", name: "iPad Pro 12.9\"", width: 1024, height: 1366, category: "tablet", icon: "📲" },
  { id: "ipadPro11", name: "iPad Pro 11\"", width: 834, height: 1194, category: "tablet", icon: "📲" },
  { id: "ipadMini", name: "iPad Mini", width: 768, height: 1024, category: "tablet", icon: "📲" },
  { id: "surfacePro", name: "Surface Pro 9", width: 912, height: 1368, category: "tablet", icon: "📲" },
  { id: "galaxyTab", name: "Galaxy Tab S9", width: 800, height: 1280, category: "tablet", icon: "📲" },
  { id: "macbook14", name: "MacBook Pro 14\"", width: 1512, height: 982, category: "desktop", icon: "💻" },
  { id: "macbook16", name: "MacBook Pro 16\"", width: 1728, height: 1117, category: "desktop", icon: "💻" },
  { id: "imac24", name: "iMac 24\"", width: 2048, height: 1152, category: "desktop", icon: "🖥️" },
  { id: "desktop1080", name: "Desktop 1080p", width: 1920, height: 1080, category: "desktop", icon: "🖥️" },
  { id: "desktop1440", name: "Desktop 1440p", width: 2560, height: 1440, category: "desktop", icon: "🖥️" },
  { id: "desktop4k", name: "Desktop 4K", width: 3840, height: 2160, category: "desktop", icon: "🖥️" },
  { id: "appleWatch", name: "Apple Watch 49mm", width: 205, height: 251, category: "watch", icon: "⌚" },
  { id: "appleWatch41", name: "Apple Watch 41mm", width: 176, height: 215, category: "watch", icon: "⌚" },
];

export const projectTemplates: ProjectTemplate[] = [
  { id: "pres-16-9", name: "Presentation 16:9", type: "presentation", width: 1920, height: 1080, thumbnail: "🎞️", category: "Presentation" },
  { id: "pres-4-3", name: "Presentation 4:3", type: "presentation", width: 1024, height: 768, thumbnail: "🎞️", category: "Presentation" },
  { id: "pres-pitch", name: "Pitch Deck", type: "presentation", width: 1920, height: 1080, thumbnail: "📊", category: "Presentation" },
  { id: "doc-a4", name: "A4 Document", type: "doc", width: 794, height: 1123, thumbnail: "📄", category: "Document" },
  { id: "doc-letter", name: "US Letter", type: "doc", width: 816, height: 1056, thumbnail: "📄", category: "Document" },
  { id: "doc-resume", name: "Resume", type: "doc", width: 816, height: 1056, thumbnail: "📝", category: "Document" },
  { id: "ig-post", name: "Instagram Post", type: "design", width: 1080, height: 1080, thumbnail: "📸", category: "Social Media" },
  { id: "ig-story", name: "Instagram Story", type: "design", width: 1080, height: 1920, thumbnail: "📸", category: "Social Media" },
  { id: "fb-cover", name: "Facebook Cover", type: "design", width: 820, height: 312, thumbnail: "📘", category: "Social Media" },
  { id: "yt-thumbnail", name: "YouTube Thumbnail", type: "design", width: 1280, height: 720, thumbnail: "▶️", category: "Social Media" },
  { id: "twitter-post", name: "Twitter/X Post", type: "design", width: 1200, height: 675, thumbnail: "🐦", category: "Social Media" },
  { id: "linkedin-banner", name: "LinkedIn Banner", type: "design", width: 1584, height: 396, thumbnail: "💼", category: "Social Media" },
  { id: "logo-sq", name: "Logo Square", type: "design", width: 500, height: 500, thumbnail: "🎨", category: "Logo" },
  { id: "logo-wide", name: "Logo Wide", type: "design", width: 800, height: 300, thumbnail: "🎨", category: "Logo" },
  { id: "logo-icon", name: "App Icon", type: "design", width: 1024, height: 1024, thumbnail: "📱", category: "Logo" },
  { id: "favicon", name: "Favicon", type: "design", width: 64, height: 64, thumbnail: "🔷", category: "Logo" },
  { id: "poster-a3", name: "Poster A3", type: "design", width: 1123, height: 1587, thumbnail: "🖼️", category: "Print" },
  { id: "flyer", name: "Flyer", type: "design", width: 612, height: 792, thumbnail: "📰", category: "Print" },
  { id: "bizcard", name: "Business Card", type: "design", width: 1050, height: 600, thumbnail: "💳", category: "Print" },
  { id: "wireframe-web", name: "Web Wireframe", type: "design", width: 1440, height: 900, thumbnail: "🔲", category: "Wireframe" },
  { id: "wireframe-mobile", name: "Mobile Wireframe", type: "design", width: 375, height: 812, thumbnail: "🔲", category: "Wireframe" },
];

export const toolGroups = [
  {
    label: "Select",
    tools: [
      { icon: "MousePointer", label: "Select", shortcut: "V" },
      { icon: "Hand", label: "Pan", shortcut: "H" },
      { icon: "Scale", label: "Scale", shortcut: "K" },
    ],
  },
  {
    label: "Shapes",
    tools: [
      { icon: "Square", label: "Rectangle", shortcut: "R" },
      { icon: "Circle", label: "Ellipse", shortcut: "O" },
      { icon: "Triangle", label: "Triangle", shortcut: "T" },
      { icon: "Diamond", label: "Diamond", shortcut: "D" },
      { icon: "Star", label: "Star", shortcut: "S" },
      { icon: "Hexagon", label: "Polygon", shortcut: "G" },
    ],
  },
  {
    label: "Draw",
    tools: [
      { icon: "Minus", label: "Line", shortcut: "L" },
      { icon: "ArrowUpRight", label: "Arrow", shortcut: "A" },
      { icon: "Pen", label: "Pen", shortcut: "P" },
      { icon: "Pencil", label: "Pencil", shortcut: "B" },
      { icon: "Paintbrush", label: "Brush", shortcut: "E" },
    ],
  },
  {
    label: "Insert",
    tools: [
      { icon: "Type", label: "Text", shortcut: "X" },
      { icon: "Image", label: "Image", shortcut: "I" },
      { icon: "Layout", label: "Frame", shortcut: "F" },
      { icon: "Box", label: "Component", shortcut: "C" },
      { icon: "Slice", label: "Slice", shortcut: "W" },
      { icon: "Navigation", label: "Section", shortcut: "N" },
    ],
  },
];
