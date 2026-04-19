import { CanvasElement } from "../workspace/types";

export type GeneratedUI = { html: string; css: string; js: string };

export type WorkspaceImportPayload = {
  name: string;
  elements: CanvasElement[];
  pages: { id: number; name: string; active: boolean }[];
  canvasSettings: {
    zoom: number;
    panOffset: { x: number; y: number };
    showGrid: boolean;
    gridSize: number;
    gridStyle: "lines" | "dots" | "cross";
  };
  prompt: string;
  htmlContent: string;
};

const FRAME_FILL = "hsl(0, 0%, 100%)";
const FRAME_STROKE = "hsl(220, 12%, 82%)";
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseColor = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  const normalized = value.trim();
  return normalized || fallback;
};

const parseNumeric = (value: string | null | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractTextContent = (node: Element) => node.textContent?.replace(/\s+/g, " ").trim() || "";

const toEditableElements = (documentNode: Document, prompt: string): CanvasElement[] => {
  const blocks = Array.from(documentNode.body.querySelectorAll("button, a, img, input, textarea, select, h1, h2, h3, h4, h5, h6, p, span, section, article, aside, header, footer, nav, main, div"));
  const elements: CanvasElement[] = [];
  let nextElementId = 1;
  let cursorY = 80;
  const maxWidth = 1280;

  for (const node of blocks) {
    const tag = node.tagName.toLowerCase();
    const text = extractTextContent(node);
    const style = node.getAttribute("style") || "";
    const widthMatch = style.match(/width:\s*([\d.]+)px/i);
    const heightMatch = style.match(/height:\s*([\d.]+)px/i);
    const bgMatch = style.match(/background(?:-color)?:\s*([^;]+)/i);
    const borderMatch = style.match(/border(?:-color)?:\s*([^;]+)/i);
    const radiusMatch = style.match(/border-radius:\s*([\d.]+)px/i);
    const colorMatch = style.match(/color:\s*([^;]+)/i);
    const fontSizeMatch = style.match(/font-size:\s*([\d.]+)px/i);
    const fontWeightMatch = style.match(/font-weight:\s*([^;]+)/i);

    if (tag === "img") {
      const src = node.getAttribute("src");
      if (!src) continue;
      elements.push({
        id: nextElementId++,
        type: "Image",
        x: 80,
        y: cursorY,
        w: clamp(parseNumeric(widthMatch?.[1], 320), 80, maxWidth),
        h: clamp(parseNumeric(heightMatch?.[1], 220), 60, 900),
        label: node.getAttribute("alt") || `${prompt} image`,
        fillColor: "transparent",
        strokeColor: "transparent",
        strokeWidth: 0,
        opacity: 100,
        rotation: 0,
        cornerRadius: parseNumeric(radiusMatch?.[1], 16),
        visible: true,
        locked: false,
        imageUrl: src,
        imageObjectFit: "cover",
      });
      cursorY += clamp(parseNumeric(heightMatch?.[1], 220), 60, 900) + 24;
      continue;
    }

    if (["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "button"].includes(tag) && text) {
      const isButton = tag === "button" || (tag === "a" && node.getAttribute("role") === "button");
      const fontSize = clamp(parseNumeric(fontSizeMatch?.[1], tag === "p" || tag === "span" ? 16 : 32), 12, 72);
      const width = clamp(parseNumeric(widthMatch?.[1], Math.max(180, Math.min(maxWidth, text.length * (fontSize * 0.62)))), 80, maxWidth);
      const height = clamp(parseNumeric(heightMatch?.[1], isButton ? 48 : fontSize * 1.6), 24, 220);

      elements.push({
        id: nextElementId++,
        type: isButton ? "Rectangle" : "Text",
        x: 80,
        y: cursorY,
        w: width,
        h: height,
        label: text.slice(0, 48),
        fillColor: isButton ? parseColor(bgMatch?.[1], "hsl(263, 70%, 58%)") : parseColor(colorMatch?.[1], "hsl(240, 10%, 12%)"),
        strokeColor: isButton ? parseColor(borderMatch?.[1], parseColor(bgMatch?.[1], "hsl(263, 70%, 58%)")) : "transparent",
        strokeWidth: isButton ? 1 : 0,
        opacity: 100,
        rotation: 0,
        cornerRadius: isButton ? parseNumeric(radiusMatch?.[1], 12) : 0,
        visible: true,
        locked: false,
        ...(isButton
          ? { text, fontSize: 14, fontWeight: fontWeightMatch?.[1] || "600", fontFamily: "Inter", textAlign: "center" }
          : { text, fontSize, fontWeight: fontWeightMatch?.[1] || (tag === "p" ? "400" : "700"), fontFamily: "Inter", textAlign: "left" }),
      });

      cursorY += height + 16;
      continue;
    }

    if (["section", "article", "aside", "header", "footer", "nav", "main", "div"].includes(tag)) {
      const width = clamp(parseNumeric(widthMatch?.[1], 1120), 120, maxWidth);
      const height = clamp(parseNumeric(heightMatch?.[1], text ? 120 : 180), 60, 900);
      const background = parseColor(bgMatch?.[1], FRAME_FILL);
      const border = parseColor(borderMatch?.[1], FRAME_STROKE);
      const hasVisibleBox = style.includes("background") || style.includes("border") || !!node.querySelector("img, button, a");
      if (!hasVisibleBox) continue;

      elements.push({
        id: nextElementId++,
        type: "Frame",
        x: 60,
        y: cursorY,
        w: width,
        h: height,
        label: text ? text.slice(0, 48) : `${tag} block`,
        fillColor: background,
        strokeColor: border,
        strokeWidth: 1,
        opacity: 100,
        rotation: 0,
        cornerRadius: parseNumeric(radiusMatch?.[1], 18),
        visible: true,
        locked: false,
      });
      cursorY += height + 24;
    }
  }

  if (elements.length > 0) return elements;

  return [
    {
      id: 1,
      type: "Frame",
      x: 60,
      y: 60,
      w: 1440,
      h: 960,
      label: prompt || "Generated UI",
      fillColor: FRAME_FILL,
      strokeColor: FRAME_STROKE,
      strokeWidth: 1,
      opacity: 100,
      rotation: 0,
      cornerRadius: 24,
      visible: true,
      locked: false,
    },
  ];
};

const buildHtmlDocument = ({ html, css, js }: GeneratedUI) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        min-height: 100%;
        background: white;
      }

      body {
        overflow: auto;
      }

      ${css}
    </style>
  </head>
  <body>
    ${html}
    ${js ? `<script>${js}<\/script>` : ""}
  </body>
</html>`;

export const generatedUiToWorkspacePayload = (
  generatedUI: GeneratedUI,
  prompt: string
): WorkspaceImportPayload => {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(generatedUI.html || "", "text/html");
  const sectionCount = Math.max(
    1,
    documentNode.body.children.length,
    documentNode.querySelectorAll("section, main, article, nav, header, footer, form").length
  );
  const estimatedHeight = clamp(780 + sectionCount * 180, 900, 2600);
  const htmlContent = buildHtmlDocument(generatedUI);
  const elements: CanvasElement[] = [
    {
      id: 1,
      type: "Frame",
      x: 60,
      y: 60,
      w: 1440,
      h: estimatedHeight,
      label: prompt || "Generated UI",
      fillColor: FRAME_FILL,
      strokeColor: FRAME_STROKE,
      strokeWidth: 1,
      opacity: 100,
      rotation: 0,
      cornerRadius: 24,
      visible: true,
      locked: false,
      htmlContent,
    },
  ];

  return {
    name: prompt || "Generated UI",
    elements,
    pages: [{ id: 1, name: "Page 1", active: true }],
    canvasSettings: {
      zoom: 60,
      panOffset: { x: 40, y: 30 },
      showGrid: true,
      gridSize: 40,
      gridStyle: "lines",
    },
    prompt,
    htmlContent,
  };
};