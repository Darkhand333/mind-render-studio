import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, Presentation, FileText, Share2, Sparkles, Search,
  Layout, Smartphone, Monitor, MessageSquare, Palette, Layers,
  Grid3X3, Zap, PenTool, Image, Columns
} from "lucide-react";

type TemplatePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (template: { name: string; width: number; height: number; type: string; elements?: any[] }) => void;
};

const categories = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "website", label: "Website", icon: Globe },
  { id: "whiteboard", label: "Whiteboard", icon: PenTool },
  { id: "slides", label: "Slides", icon: Presentation },
  { id: "social", label: "Social", icon: Share2 },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "print", label: "Print", icon: FileText },
];

const templates = [
  // Website
  { id: "web-landing", name: "Landing Page", category: "website", emoji: "🌐", width: 1440, height: 900, desc: "Modern landing page layout", elements: [
    { type: "Frame", label: "Page", x: 0, y: 0, w: 1440, h: 900, fillColor: "#1a1a2e", strokeColor: "hsl(263, 70%, 58%)", cornerRadius: 0, strokeWidth: 1 },
    { type: "Rectangle", label: "Nav Bar", x: 0, y: 0, w: 1440, h: 64, fillColor: "#12122088", strokeColor: "#ffffff10", cornerRadius: 0, strokeWidth: 1 },
    { type: "Text", label: "Logo", x: 40, y: 18, w: 120, h: 28, text: "BrandName", fontSize: 20, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Text", label: "Nav Home", x: 800, y: 22, w: 60, h: 20, text: "Home", fontSize: 14, fontWeight: "500", fillColor: "#ffffffaa" },
    { type: "Text", label: "Nav About", x: 880, y: 22, w: 60, h: 20, text: "About", fontSize: 14, fontWeight: "500", fillColor: "#ffffffaa" },
    { type: "Text", label: "Nav Contact", x: 960, y: 22, w: 70, h: 20, text: "Contact", fontSize: 14, fontWeight: "500", fillColor: "#ffffffaa" },
    { type: "Rectangle", label: "CTA Nav", x: 1280, y: 14, w: 120, h: 36, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 8, strokeColor: "hsl(263, 70%, 58%)", strokeWidth: 0 },
    { type: "Text", label: "CTA Nav Text", x: 1300, y: 22, w: 80, h: 20, text: "Sign Up", fontSize: 13, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Text", label: "Hero Title", x: 100, y: 240, w: 600, h: 70, text: "Build Something\nAmazing Today", fontSize: 52, fontWeight: "800", fillColor: "#ffffff" },
    { type: "Text", label: "Hero Subtitle", x: 100, y: 340, w: 480, h: 50, text: "Create beautiful, responsive designs with our powerful design tools. No coding required.", fontSize: 17, fontWeight: "400", fillColor: "#ffffffaa" },
    { type: "Rectangle", label: "Hero CTA", x: 100, y: 420, w: 180, h: 48, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 12, strokeColor: "hsl(263, 70%, 58%)", strokeWidth: 0 },
    { type: "Text", label: "Hero CTA Text", x: 130, y: 432, w: 120, h: 24, text: "Get Started →", fontSize: 15, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Hero Image", x: 780, y: 140, w: 560, h: 400, fillColor: "#ffffff08", cornerRadius: 16, strokeColor: "#ffffff15", strokeWidth: 1 },
    { type: "Text", label: "Image Placeholder", x: 980, y: 320, w: 160, h: 30, text: "Hero Image", fontSize: 16, fontWeight: "500", fillColor: "#ffffff30" },
    { type: "Rectangle", label: "Feature 1", x: 100, y: 600, w: 380, h: 200, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Feature 1 Title", x: 130, y: 640, w: 200, h: 24, text: "⚡ Fast & Easy", fontSize: 18, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Text", label: "Feature 1 Desc", x: 130, y: 675, w: 320, h: 40, text: "Build prototypes in minutes, not hours.", fontSize: 14, fontWeight: "400", fillColor: "#ffffff88" },
    { type: "Rectangle", label: "Feature 2", x: 530, y: 600, w: 380, h: 200, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Feature 2 Title", x: 560, y: 640, w: 200, h: 24, text: "🎨 Beautiful", fontSize: 18, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Text", label: "Feature 2 Desc", x: 560, y: 675, w: 320, h: 40, text: "Stunning themes and components included.", fontSize: 14, fontWeight: "400", fillColor: "#ffffff88" },
    { type: "Rectangle", label: "Feature 3", x: 960, y: 600, w: 380, h: 200, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Feature 3 Title", x: 990, y: 640, w: 200, h: 24, text: "🚀 Export Ready", fontSize: 18, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Text", label: "Feature 3 Desc", x: 990, y: 675, w: 320, h: 40, text: "Export to HTML, React, or Vue instantly.", fontSize: 14, fontWeight: "400", fillColor: "#ffffff88" },
  ]},
  { id: "web-portfolio", name: "Portfolio", category: "website", emoji: "💼", width: 1440, height: 900, desc: "Personal portfolio layout", elements: [
    { type: "Frame", label: "Portfolio", x: 0, y: 0, w: 1440, h: 900, fillColor: "#0f0f1a", strokeColor: "hsl(263, 70%, 58%)", cornerRadius: 0, strokeWidth: 1 },
    { type: "Text", label: "Name", x: 60, y: 60, w: 300, h: 50, text: "Jane Designer", fontSize: 36, fontWeight: "800", fillColor: "#ffffff" },
    { type: "Text", label: "Role", x: 60, y: 115, w: 300, h: 24, text: "UI/UX Designer & Developer", fontSize: 16, fontWeight: "400", fillColor: "#ffffff88" },
    { type: "Rectangle", label: "Work 1", x: 60, y: 200, w: 420, h: 280, fillColor: "hsl(263, 70%, 30%)", cornerRadius: 12, strokeColor: "hsl(263, 70%, 45%)", strokeWidth: 1 },
    { type: "Text", label: "Work 1 Title", x: 80, y: 420, w: 200, h: 20, text: "Project Alpha", fontSize: 14, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Work 2", x: 510, y: 200, w: 420, h: 280, fillColor: "hsl(217, 60%, 25%)", cornerRadius: 12, strokeColor: "hsl(217, 60%, 40%)", strokeWidth: 1 },
    { type: "Text", label: "Work 2 Title", x: 530, y: 420, w: 200, h: 20, text: "Project Beta", fontSize: 14, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Work 3", x: 960, y: 200, w: 420, h: 280, fillColor: "hsl(330, 60%, 30%)", cornerRadius: 12, strokeColor: "hsl(330, 60%, 45%)", strokeWidth: 1 },
    { type: "Text", label: "Work 3 Title", x: 980, y: 420, w: 200, h: 20, text: "Project Gamma", fontSize: 14, fontWeight: "600", fillColor: "#ffffff" },
  ]},
  { id: "web-dashboard", name: "Dashboard", category: "website", emoji: "📊", width: 1440, height: 900, desc: "Admin dashboard UI", elements: [
    { type: "Frame", label: "Dashboard", x: 0, y: 0, w: 1440, h: 900, fillColor: "#0d0d1a", strokeColor: "hsl(217, 91%, 60%)", cornerRadius: 0, strokeWidth: 1 },
    { type: "Rectangle", label: "Sidebar", x: 0, y: 0, w: 240, h: 900, fillColor: "#10101f", strokeColor: "#ffffff08", cornerRadius: 0, strokeWidth: 1 },
    { type: "Text", label: "App Name", x: 24, y: 24, w: 180, h: 28, text: "Dashboard", fontSize: 20, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Nav Item 1", x: 12, y: 80, w: 216, h: 36, fillColor: "hsl(217, 91%, 60%, 0.15)", cornerRadius: 8, strokeColor: "transparent", strokeWidth: 0 },
    { type: "Text", label: "Nav 1 Text", x: 24, y: 88, w: 100, h: 20, text: "📊 Overview", fontSize: 13, fontWeight: "500", fillColor: "hsl(217, 91%, 60%)" },
    { type: "Text", label: "Nav 2 Text", x: 24, y: 130, w: 100, h: 20, text: "👥 Users", fontSize: 13, fontWeight: "500", fillColor: "#ffffff66" },
    { type: "Text", label: "Nav 3 Text", x: 24, y: 162, w: 100, h: 20, text: "📈 Analytics", fontSize: 13, fontWeight: "500", fillColor: "#ffffff66" },
    { type: "Text", label: "Nav 4 Text", x: 24, y: 194, w: 100, h: 20, text: "⚙️ Settings", fontSize: 13, fontWeight: "500", fillColor: "#ffffff66" },
    { type: "Rectangle", label: "Stat 1", x: 280, y: 80, w: 260, h: 120, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Stat 1 Label", x: 304, y: 100, w: 120, h: 16, text: "Total Users", fontSize: 12, fontWeight: "500", fillColor: "#ffffff66" },
    { type: "Text", label: "Stat 1 Value", x: 304, y: 126, w: 120, h: 36, text: "12,459", fontSize: 32, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Stat 2", x: 560, y: 80, w: 260, h: 120, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Stat 2 Label", x: 584, y: 100, w: 120, h: 16, text: "Revenue", fontSize: 12, fontWeight: "500", fillColor: "#ffffff66" },
    { type: "Text", label: "Stat 2 Value", x: 584, y: 126, w: 140, h: 36, text: "$84,230", fontSize: 32, fontWeight: "700", fillColor: "hsl(160, 70%, 50%)" },
    { type: "Rectangle", label: "Stat 3", x: 840, y: 80, w: 260, h: 120, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Stat 3 Label", x: 864, y: 100, w: 120, h: 16, text: "Conversion", fontSize: 12, fontWeight: "500", fillColor: "#ffffff66" },
    { type: "Text", label: "Stat 3 Value", x: 864, y: 126, w: 120, h: 36, text: "3.24%", fontSize: 32, fontWeight: "700", fillColor: "hsl(263, 70%, 58%)" },
    { type: "Rectangle", label: "Chart Area", x: 280, y: 230, w: 820, h: 350, fillColor: "#ffffff04", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Chart Title", x: 304, y: 250, w: 200, h: 20, text: "Revenue Overview", fontSize: 16, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Table", x: 280, y: 610, w: 820, h: 250, fillColor: "#ffffff04", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Table Title", x: 304, y: 630, w: 200, h: 20, text: "Recent Transactions", fontSize: 16, fontWeight: "600", fillColor: "#ffffff" },
  ]},
  { id: "web-ecommerce", name: "E-Commerce", category: "website", emoji: "🛒", width: 1440, height: 900, desc: "Online store layout", elements: [
    { type: "Frame", label: "Store", x: 0, y: 0, w: 1440, h: 900, fillColor: "#0f0f1a", strokeColor: "hsl(45, 90%, 55%)", cornerRadius: 0, strokeWidth: 1 },
    { type: "Rectangle", label: "Header", x: 0, y: 0, w: 1440, h: 60, fillColor: "#12122088", strokeColor: "#ffffff08", cornerRadius: 0, strokeWidth: 1 },
    { type: "Text", label: "Store Name", x: 40, y: 16, w: 120, h: 28, text: "ShopName", fontSize: 20, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Product 1", x: 60, y: 160, w: 300, h: 380, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Rectangle", label: "Prod 1 Image", x: 60, y: 160, w: 300, h: 240, fillColor: "hsl(263, 30%, 25%)", cornerRadius: 12, strokeColor: "transparent", strokeWidth: 0 },
    { type: "Text", label: "Prod 1 Name", x: 80, y: 420, w: 200, h: 20, text: "Product One", fontSize: 15, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Text", label: "Prod 1 Price", x: 80, y: 448, w: 100, h: 20, text: "$49.99", fontSize: 16, fontWeight: "700", fillColor: "hsl(160, 70%, 50%)" },
    { type: "Rectangle", label: "Product 2", x: 400, y: 160, w: 300, h: 380, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Rectangle", label: "Prod 2 Image", x: 400, y: 160, w: 300, h: 240, fillColor: "hsl(217, 30%, 25%)", cornerRadius: 12, strokeColor: "transparent", strokeWidth: 0 },
    { type: "Text", label: "Prod 2 Name", x: 420, y: 420, w: 200, h: 20, text: "Product Two", fontSize: 15, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Text", label: "Prod 2 Price", x: 420, y: 448, w: 100, h: 20, text: "$79.99", fontSize: 16, fontWeight: "700", fillColor: "hsl(160, 70%, 50%)" },
  ]},
  { id: "web-blog", name: "Blog", category: "website", emoji: "📝", width: 1440, height: 900, desc: "Blog/article layout" },
  { id: "web-saas", name: "SaaS App", category: "website", emoji: "🚀", width: 1440, height: 900, desc: "SaaS product page" },

  // Whiteboard (FigJam style)
  { id: "wb-brainstorm", name: "Brainstorm", category: "whiteboard", emoji: "💡", width: 3000, height: 2000, desc: "Open brainstorming board", elements: [
    { type: "Rectangle", label: "Sticky Note 1", x: 200, y: 200, w: 200, h: 200, fillColor: "hsl(45, 90%, 55%)", cornerRadius: 8, strokeColor: "hsl(45, 90%, 45%)", strokeWidth: 1 },
    { type: "Text", label: "Note 1 Text", x: 220, y: 260, w: 160, h: 80, text: "Main Idea\nGoes Here", fontSize: 16, fontWeight: "600", fillColor: "#000000cc" },
    { type: "Rectangle", label: "Sticky Note 2", x: 500, y: 150, w: 200, h: 200, fillColor: "hsl(330, 80%, 60%)", cornerRadius: 8, strokeColor: "hsl(330, 80%, 50%)", strokeWidth: 1 },
    { type: "Text", label: "Note 2 Text", x: 520, y: 210, w: 160, h: 80, text: "Feature\nBrainstorm", fontSize: 16, fontWeight: "600", fillColor: "#ffffffdd" },
    { type: "Rectangle", label: "Sticky Note 3", x: 800, y: 200, w: 200, h: 200, fillColor: "hsl(160, 70%, 50%)", cornerRadius: 8, strokeColor: "hsl(160, 70%, 40%)", strokeWidth: 1 },
    { type: "Text", label: "Note 3 Text", x: 820, y: 260, w: 160, h: 80, text: "Action\nItems", fontSize: 16, fontWeight: "600", fillColor: "#000000cc" },
    { type: "Rectangle", label: "Sticky Note 4", x: 350, y: 500, w: 200, h: 200, fillColor: "hsl(217, 91%, 60%)", cornerRadius: 8, strokeColor: "hsl(217, 91%, 50%)", strokeWidth: 1 },
    { type: "Text", label: "Note 4 Text", x: 370, y: 560, w: 160, h: 80, text: "Research\nNeeded", fontSize: 16, fontWeight: "600", fillColor: "#ffffffdd" },
    { type: "Rectangle", label: "Sticky Note 5", x: 650, y: 500, w: 200, h: 200, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 8, strokeColor: "hsl(263, 70%, 48%)", strokeWidth: 1 },
    { type: "Text", label: "Note 5 Text", x: 670, y: 560, w: 160, h: 80, text: "Design\nConcepts", fontSize: 16, fontWeight: "600", fillColor: "#ffffffdd" },
  ]},
  { id: "wb-flowchart", name: "Flowchart", category: "whiteboard", emoji: "🔀", width: 3000, height: 2000, desc: "Process flow diagram", elements: [
    { type: "Rectangle", label: "Start", x: 400, y: 100, w: 160, h: 60, fillColor: "hsl(160, 70%, 50%)", cornerRadius: 30, strokeColor: "hsl(160, 70%, 40%)", strokeWidth: 2 },
    { type: "Text", label: "Start Text", x: 440, y: 118, w: 80, h: 24, text: "Start", fontSize: 16, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Step 1", x: 380, y: 240, w: 200, h: 80, fillColor: "hsl(217, 91%, 60%)", cornerRadius: 8, strokeColor: "hsl(217, 91%, 50%)", strokeWidth: 2 },
    { type: "Text", label: "Step 1 Text", x: 410, y: 265, w: 140, h: 30, text: "Process Step", fontSize: 14, fontWeight: "500", fillColor: "#ffffff" },
    { type: "Diamond", label: "Decision", x: 400, y: 400, w: 160, h: 120, fillColor: "hsl(45, 90%, 55%)", cornerRadius: 0, strokeColor: "hsl(45, 90%, 45%)", strokeWidth: 2 },
    { type: "Rectangle", label: "Step 2a", x: 200, y: 600, w: 180, h: 80, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 8, strokeColor: "hsl(263, 70%, 48%)", strokeWidth: 2 },
    { type: "Text", label: "Step 2a Text", x: 230, y: 625, w: 120, h: 30, text: "Path A", fontSize: 14, fontWeight: "500", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Step 2b", x: 580, y: 600, w: 180, h: 80, fillColor: "hsl(330, 80%, 60%)", cornerRadius: 8, strokeColor: "hsl(330, 80%, 50%)", strokeWidth: 2 },
    { type: "Text", label: "Step 2b Text", x: 610, y: 625, w: 120, h: 30, text: "Path B", fontSize: 14, fontWeight: "500", fillColor: "#ffffff" },
    { type: "Rectangle", label: "End", x: 400, y: 780, w: 160, h: 60, fillColor: "hsl(0, 80%, 60%)", cornerRadius: 30, strokeColor: "hsl(0, 80%, 50%)", strokeWidth: 2 },
    { type: "Text", label: "End Text", x: 448, y: 798, w: 64, h: 24, text: "End", fontSize: 16, fontWeight: "600", fillColor: "#ffffff" },
  ]},
  { id: "wb-mindmap", name: "Mind Map", category: "whiteboard", emoji: "🧠", width: 3000, height: 2000, desc: "Mind mapping board" },
  { id: "wb-kanban", name: "Kanban Board", category: "whiteboard", emoji: "📋", width: 3000, height: 2000, desc: "Task management board", elements: [
    { type: "Text", label: "Board Title", x: 40, y: 40, w: 300, h: 36, text: "Sprint Board", fontSize: 28, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Todo Column", x: 40, y: 120, w: 300, h: 600, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Todo Header", x: 60, y: 140, w: 100, h: 20, text: "📋 To Do", fontSize: 14, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Todo Card 1", x: 60, y: 180, w: 260, h: 70, fillColor: "#ffffff0a", cornerRadius: 8, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Todo 1 Text", x: 76, y: 200, w: 220, h: 30, text: "Design homepage", fontSize: 13, fontWeight: "500", fillColor: "#ffffffcc" },
    { type: "Rectangle", label: "In Progress Column", x: 380, y: 120, w: 300, h: 600, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "hsl(217, 91%, 60%, 0.2)", strokeWidth: 1 },
    { type: "Text", label: "Progress Header", x: 400, y: 140, w: 140, h: 20, text: "🔄 In Progress", fontSize: 14, fontWeight: "700", fillColor: "hsl(217, 91%, 60%)" },
    { type: "Rectangle", label: "Done Column", x: 720, y: 120, w: 300, h: 600, fillColor: "#ffffff06", cornerRadius: 12, strokeColor: "hsl(160, 70%, 50%, 0.2)", strokeWidth: 1 },
    { type: "Text", label: "Done Header", x: 740, y: 140, w: 100, h: 20, text: "✅ Done", fontSize: 14, fontWeight: "700", fillColor: "hsl(160, 70%, 50%)" },
  ]},
  { id: "wb-retro", name: "Retrospective", category: "whiteboard", emoji: "🔄", width: 3000, height: 2000, desc: "Sprint retrospective board" },

  // Slides
  { id: "sl-pitch", name: "Pitch Deck", category: "slides", emoji: "📊", width: 1920, height: 1080, desc: "Startup pitch deck", elements: [
    { type: "Frame", label: "Slide 1", x: 0, y: 0, w: 1920, h: 1080, fillColor: "#0a0a1a", cornerRadius: 0, strokeColor: "hsl(263, 70%, 58%)", strokeWidth: 1 },
    { type: "Rectangle", label: "Accent Bar", x: 0, y: 0, w: 8, h: 1080, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 0, strokeColor: "transparent", strokeWidth: 0 },
    { type: "Text", label: "Company", x: 140, y: 100, w: 300, h: 24, text: "COMPANY NAME", fontSize: 14, fontWeight: "600", fillColor: "hsl(263, 70%, 58%)" },
    { type: "Text", label: "Title", x: 140, y: 350, w: 900, h: 90, text: "Your Pitch Deck\nTitle Goes Here", fontSize: 64, fontWeight: "800", fillColor: "#ffffff" },
    { type: "Text", label: "Subtitle", x: 140, y: 480, w: 600, h: 30, text: "A compelling subtitle that captures your vision", fontSize: 20, fontWeight: "400", fillColor: "#ffffff88" },
    { type: "Text", label: "Date", x: 140, y: 900, w: 300, h: 20, text: "March 2026 • Confidential", fontSize: 13, fontWeight: "400", fillColor: "#ffffff44" },
  ]},
  { id: "sl-edu", name: "Education", category: "slides", emoji: "🎓", width: 1920, height: 1080, desc: "Educational presentation" },
  { id: "sl-report", name: "Report", category: "slides", emoji: "📈", width: 1920, height: 1080, desc: "Business report slides" },
  { id: "sl-keynote", name: "Keynote", category: "slides", emoji: "🎤", width: 1920, height: 1080, desc: "Conference keynote" },

  // Social Media
  { id: "sm-ig-post", name: "Instagram Post", category: "social", emoji: "📸", width: 1080, height: 1080, desc: "Square social post", elements: [
    { type: "Frame", label: "Post", x: 0, y: 0, w: 1080, h: 1080, fillColor: "hsl(263, 40%, 15%)", cornerRadius: 0, strokeColor: "hsl(263, 70%, 58%)", strokeWidth: 1 },
    { type: "Text", label: "Post Title", x: 80, y: 400, w: 920, h: 80, text: "Your Message\nGoes Here", fontSize: 54, fontWeight: "800", fillColor: "#ffffff", textAlign: "center" },
    { type: "Text", label: "Post Handle", x: 80, y: 960, w: 920, h: 24, text: "@yourbrand", fontSize: 16, fontWeight: "500", fillColor: "#ffffff66", textAlign: "center" },
  ]},
  { id: "sm-ig-story", name: "Instagram Story", category: "social", emoji: "📱", width: 1080, height: 1920, desc: "Vertical story format" },
  { id: "sm-yt-thumb", name: "YouTube Thumbnail", category: "social", emoji: "▶️", width: 1280, height: 720, desc: "Video thumbnail" },
  { id: "sm-twitter", name: "Twitter/X Post", category: "social", emoji: "🐦", width: 1200, height: 675, desc: "Social media post" },
  { id: "sm-linkedin", name: "LinkedIn Banner", category: "social", emoji: "💼", width: 1584, height: 396, desc: "Profile banner" },
  { id: "sm-fb-cover", name: "Facebook Cover", category: "social", emoji: "📘", width: 820, height: 312, desc: "Facebook cover photo" },

  // Mobile
  { id: "mob-ios", name: "iPhone 15 Pro", category: "mobile", emoji: "📱", width: 393, height: 852, desc: "iOS app screen", elements: [
    { type: "Frame", label: "iPhone Screen", x: 0, y: 0, w: 393, h: 852, fillColor: "#0a0a1a", cornerRadius: 40, strokeColor: "#333", strokeWidth: 2 },
    { type: "Rectangle", label: "Status Bar", x: 0, y: 0, w: 393, h: 54, fillColor: "transparent", cornerRadius: 0, strokeColor: "transparent", strokeWidth: 0 },
    { type: "Text", label: "Time", x: 30, y: 16, w: 50, h: 18, text: "9:41", fontSize: 15, fontWeight: "600", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Tab Bar", x: 0, y: 772, w: 393, h: 80, fillColor: "#12122088", cornerRadius: 0, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Text", label: "Tab 1", x: 30, y: 788, w: 60, h: 30, text: "🏠\nHome", fontSize: 10, fontWeight: "500", fillColor: "hsl(263, 70%, 58%)", textAlign: "center" },
    { type: "Text", label: "Tab 2", x: 120, y: 788, w: 60, h: 30, text: "🔍\nSearch", fontSize: 10, fontWeight: "500", fillColor: "#ffffff66", textAlign: "center" },
    { type: "Text", label: "Tab 3", x: 210, y: 788, w: 60, h: 30, text: "➕\nCreate", fontSize: 10, fontWeight: "500", fillColor: "#ffffff66", textAlign: "center" },
    { type: "Text", label: "Tab 4", x: 300, y: 788, w: 60, h: 30, text: "👤\nProfile", fontSize: 10, fontWeight: "500", fillColor: "#ffffff66", textAlign: "center" },
    { type: "Text", label: "Screen Title", x: 20, y: 70, w: 200, h: 30, text: "Home", fontSize: 28, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Rectangle", label: "Card 1", x: 16, y: 120, w: 361, h: 180, fillColor: "#ffffff06", cornerRadius: 16, strokeColor: "#ffffff10", strokeWidth: 1 },
    { type: "Rectangle", label: "Card 2", x: 16, y: 316, w: 361, h: 120, fillColor: "#ffffff06", cornerRadius: 16, strokeColor: "#ffffff10", strokeWidth: 1 },
  ]},
  { id: "mob-android", name: "Android (Pixel)", category: "mobile", emoji: "🤖", width: 412, height: 915, desc: "Android app screen" },
  { id: "mob-ipad", name: "iPad Pro", category: "mobile", emoji: "📲", width: 1024, height: 1366, desc: "Tablet app screen" },

  // Print
  { id: "pr-bizcard", name: "Business Card", category: "print", emoji: "💳", width: 1050, height: 600, desc: "Standard business card", elements: [
    { type: "Frame", label: "Card", x: 0, y: 0, w: 1050, h: 600, fillColor: "#0f0f1a", cornerRadius: 16, strokeColor: "#ffffff15", strokeWidth: 1 },
    { type: "Rectangle", label: "Accent", x: 0, y: 0, w: 10, h: 600, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 0, strokeColor: "transparent", strokeWidth: 0 },
    { type: "Text", label: "Name", x: 60, y: 180, w: 400, h: 40, text: "John Smith", fontSize: 32, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Text", label: "Title", x: 60, y: 230, w: 300, h: 20, text: "Senior Product Designer", fontSize: 14, fontWeight: "400", fillColor: "hsl(263, 70%, 58%)" },
    { type: "Text", label: "Email", x: 60, y: 380, w: 300, h: 18, text: "john@company.com", fontSize: 12, fontWeight: "400", fillColor: "#ffffff88" },
    { type: "Text", label: "Phone", x: 60, y: 410, w: 200, h: 18, text: "+1 (555) 123-4567", fontSize: 12, fontWeight: "400", fillColor: "#ffffff88" },
    { type: "Text", label: "Website", x: 60, y: 440, w: 200, h: 18, text: "www.company.com", fontSize: 12, fontWeight: "400", fillColor: "#ffffff88" },
  ]},
  { id: "pr-poster", name: "Poster A3", category: "print", emoji: "🖼️", width: 1123, height: 1587, desc: "Large format poster" },
  { id: "pr-flyer", name: "Flyer", category: "print", emoji: "📰", width: 612, height: 792, desc: "Standard flyer" },
  { id: "pr-resume", name: "Resume", category: "print", emoji: "📝", width: 816, height: 1056, desc: "Professional resume" },
];

// Mini preview renderer for template thumbnails
const TemplatePreview = ({ template }: { template: typeof templates[0] }) => {
  const elements = template.elements;
  if (!elements || elements.length === 0) {
    return (
      <div className="w-full aspect-video rounded-lg bg-secondary/40 flex items-center justify-center text-3xl">
        {template.emoji}
      </div>
    );
  }

  const tw = template.width;
  const th = template.height;
  const aspectRatio = tw / th;
  const isPortrait = aspectRatio < 1;

  return (
    <div className={`w-full ${isPortrait ? 'aspect-[3/4]' : 'aspect-video'} rounded-lg overflow-hidden relative`}
      style={{ background: elements[0]?.fillColor || '#1a1a2e' }}>
      <svg viewBox={`0 0 ${tw} ${th}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {elements.map((el: any, i: number) => {
          if (el.type === "Text") {
            return (
              <text key={i} x={el.x + 4} y={el.y + (el.fontSize || 16) * 0.8}
                fill={el.fillColor || "#fff"} fontSize={el.fontSize || 14}
                fontWeight={el.fontWeight || "400"} fontFamily="Inter, sans-serif"
                opacity={0.9}>
                {(el.text || el.label || "").split('\n')[0].substring(0, 30)}
              </text>
            );
          }
          if (el.type === "Ellipse") {
            return (
              <ellipse key={i} cx={el.x + (el.w || 100) / 2} cy={el.y + (el.h || 100) / 2}
                rx={(el.w || 100) / 2} ry={(el.h || 100) / 2}
                fill={el.fillColor || "transparent"} stroke={el.strokeColor || "transparent"}
                strokeWidth={el.strokeWidth || 0} />
            );
          }
          if (el.type === "Diamond") {
            const cx = el.x + (el.w || 100) / 2;
            const cy = el.y + (el.h || 100) / 2;
            const hw = (el.w || 100) / 2;
            const hh = (el.h || 100) / 2;
            return (
              <polygon key={i}
                points={`${cx},${el.y} ${el.x + el.w},${cy} ${cx},${el.y + el.h} ${el.x},${cy}`}
                fill={el.fillColor || "transparent"} stroke={el.strokeColor || "transparent"}
                strokeWidth={el.strokeWidth || 0} />
            );
          }
          return (
            <rect key={i} x={el.x} y={el.y} width={el.w || tw} height={el.h || th}
              rx={el.cornerRadius || 0} fill={el.fillColor || "transparent"}
              stroke={el.strokeColor || "transparent"} strokeWidth={el.strokeWidth || 0} />
          );
        })}
      </svg>
    </div>
  );
};

const TemplatePickerModal = ({ open, onClose, onSelect }: TemplatePickerProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const filtered = templates.filter(t => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCustomCreate = () => {
    if (!customPrompt.trim()) return;
    const lower = customPrompt.toLowerCase();
    let width = 1440, height = 900, type = "design";
    if (lower.includes("mobile") || lower.includes("app")) { width = 393; height = 852; }
    else if (lower.includes("slide") || lower.includes("presentation")) { width = 1920; height = 1080; type = "presentation"; }
    else if (lower.includes("poster")) { width = 1123; height = 1587; }
    else if (lower.includes("story") || lower.includes("reel")) { width = 1080; height = 1920; }
    else if (lower.includes("square") || lower.includes("instagram")) { width = 1080; height = 1080; }
    onSelect({ name: customPrompt.trim(), width, height, type });
    setCustomPrompt("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-md flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Choose a Template</h2>
                  <p className="text-xs text-muted-foreground">Start with a template or create something custom</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search + "What do you want to make?" */}
            <div className="px-6 py-3 border-b border-border/20 space-y-2 shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="What do you want to make? e.g. 'A mobile fitness app'..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCustomCreate(); }}
                  className="flex-1 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={handleCustomCreate}
                  disabled={!customPrompt.trim()}
                  className="px-4 py-2 rounded-xl gradient-purple text-primary-foreground text-sm font-medium disabled:opacity-50 hover:scale-[1.02] transition-transform flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Create
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="px-6 py-2 border-b border-border/20 flex gap-1 overflow-x-auto shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Blank canvas option */}
                <button
                  onClick={() => { onSelect({ name: "Untitled", width: 1440, height: 900, type: "design" }); onClose(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-center group"
                >
                  <div className="w-full aspect-video rounded-lg bg-secondary/30 flex items-center justify-center">
                    <Layout className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Blank Canvas</p>
                  <p className="text-[9px] text-muted-foreground/60">1440 × 900</p>
                </button>

                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onSelect({ name: t.name, width: t.width, height: t.height, type: t.category, elements: t.elements }); onClose(); }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all text-center group"
                  >
                    <TemplatePreview template={t} />
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate w-full">{t.name}</p>
                    <p className="text-[9px] text-muted-foreground">{t.desc} • {t.width}×{t.height}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplatePickerModal;
