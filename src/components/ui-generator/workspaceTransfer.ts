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
const CARD_FILL = "hsl(210, 20%, 98%)";
const CARD_STROKE = "hsl(220, 14%, 90%)";
const TEXT_COLOR = "hsl(224, 20%, 12%)";
const MUTED_TEXT = "hsl(220, 10%, 42%)";
const ACCENT = "hsl(221, 83%, 53%)";

const cleanText = (value: string | null | undefined) =>
  (value || "").replace(/\s+/g, " ").trim();

const ownTextContent = (element: Element) =>
  cleanText(
    Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || "")
      .join(" ")
  );

export const generatedUiToWorkspacePayload = (
  generatedUI: GeneratedUI,
  prompt: string
): WorkspaceImportPayload => {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(generatedUI.html || "", "text/html");
  const bodyChildren = Array.from(documentNode.body.children);
  let nextId = 1;
  const elements: CanvasElement[] = [];
  const pages = [{ id: 1, name: "Page 1", active: true }];
  const maxCanvasWidth = 1440;
  let cursorY = 140;
  let contentBottom = 240;
  let nodeBudget = 140;

  const createText = (
    label: string,
    text: string,
    x: number,
    y: number,
    w: number,
    fontSize: number,
    fontWeight: string,
    fillColor = TEXT_COLOR
  ) => {
    const lines = Math.max(1, Math.ceil(text.length / Math.max(18, Math.floor(w / Math.max(fontSize * 0.6, 1)))));
    const h = Math.max(fontSize + 10, lines * (fontSize + 6));
    elements.push({
      id: nextId++,
      type: "Text",
      x,
      y,
      w,
      h,
      label,
      text,
      fontSize,
      fontWeight,
      fontFamily: "Inter",
      textAlign: "left",
      fillColor,
      strokeColor: "transparent",
      strokeWidth: 0,
      opacity: 100,
      rotation: 0,
      cornerRadius: 0,
      visible: true,
      locked: false,
    });
    return h;
  };

  const createRect = (
    type: string,
    label: string,
    x: number,
    y: number,
    w: number,
    h: number,
    fillColor: string,
    strokeColor: string,
    cornerRadius = 12
  ) => {
    elements.push({
      id: nextId++,
      type,
      x,
      y,
      w,
      h,
      label,
      fillColor,
      strokeColor,
      strokeWidth: 1,
      opacity: 100,
      rotation: 0,
      cornerRadius,
      visible: true,
      locked: false,
    });
  };

  const renderNode = (element: Element, x: number, y: number, width: number, depth = 0): number => {
    if (nodeBudget <= 0) return 0;
    nodeBudget -= 1;

    const tag = element.tagName.toLowerCase();
    const children = Array.from(element.children);
    const text = cleanText(element.textContent);
    const selfText = ownTextContent(element);
    const innerX = x + 24;
    const innerWidth = Math.max(200, width - 48);

    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      const sizeMap: Record<string, number> = { h1: 44, h2: 34, h3: 28, h4: 22, h5: 18, h6: 16 };
      return createText(cleanText(text) || tag.toUpperCase(), cleanText(text) || "Heading", x, y, width, sizeMap[tag], "700");
    }

    if (["p", "span", "small", "strong", "em", "a", "label", "li"].includes(tag)) {
      const color = tag === "small" ? MUTED_TEXT : TEXT_COLOR;
      const fontSize = tag === "small" ? 12 : 16;
      return createText(cleanText(text) || tag, cleanText(text) || tag, x, y, width, fontSize, tag === "strong" ? "700" : "400", color);
    }

    if (tag === "button") {
      createRect("Rectangle", cleanText(text) || "Button", x, y, Math.min(220, width), 48, ACCENT, ACCENT, 12);
      createText(`${cleanText(text) || "Button"} Text`, cleanText(text) || "Button", x + 16, y + 14, Math.min(180, width - 32), 14, "600", "hsl(0, 0%, 100%)");
      return 48;
    }

    if (["input", "textarea", "select"].includes(tag)) {
      const placeholder = cleanText(element.getAttribute("placeholder")) || cleanText(element.getAttribute("aria-label")) || tag;
      const height = tag === "textarea" ? 96 : 48;
      createRect("Rectangle", `${placeholder} Field`, x, y, width, height, "hsl(0, 0%, 100%)", CARD_STROKE, 10);
      createText(`${placeholder} Placeholder`, placeholder, x + 16, y + 14, width - 32, 14, "400", MUTED_TEXT);
      return height;
    }

    if (["img", "svg", "canvas", "video"].includes(tag)) {
      createRect("Rectangle", cleanText(element.getAttribute("alt")) || `${tag} Placeholder`, x, y, width, 220, "hsl(210, 16%, 94%)", CARD_STROKE, 16);
      createText(`${tag} Label`, cleanText(element.getAttribute("alt")) || tag.toUpperCase(), x + 24, y + 92, width - 48, 18, "600", MUTED_TEXT);
      return 220;
    }

    if (tag === "hr") {
      createRect("Line", "Divider", x, y + 8, width, 1, "transparent", FRAME_STROKE, 0);
      return 20;
    }

    if (["header", "nav", "section", "main", "article", "aside", "footer", "div", "form", "ul", "ol"].includes(tag)) {
      const title = cleanText(element.getAttribute("aria-label")) || cleanText(element.getAttribute("id")) || cleanText(element.getAttribute("class")) || tag;
      const blockX = depth === 0 ? 100 : x;
      const blockY = y;
      const blockWidth = depth === 0 ? maxCanvasWidth - 200 : width;
      let innerCursorY = blockY + 28;
      let renderedChildren = 0;

      createRect("Frame", title, blockX, blockY, blockWidth, 120, depth === 0 ? FRAME_FILL : CARD_FILL, depth === 0 ? FRAME_STROKE : CARD_STROKE, depth === 0 ? 18 : 14);

      if (selfText && !children.length) {
        innerCursorY += createText(`${title} Text`, selfText, innerX, innerCursorY, innerWidth, depth === 0 ? 18 : 16, depth === 0 ? "600" : "400");
        renderedChildren += 1;
      }

      children.forEach((child) => {
        const consumed = renderNode(child, blockX + 24, innerCursorY, Math.max(220, blockWidth - 48), depth + 1);
        if (consumed > 0) {
          innerCursorY += consumed + 16;
          renderedChildren += 1;
        }
      });

      if (!renderedChildren && text) {
        innerCursorY += createText(`${title} Text`, text, blockX + 24, innerCursorY, Math.max(220, blockWidth - 48), 16, "400");
      }

      const finalHeight = Math.max(depth === 0 ? 140 : 110, innerCursorY - blockY + 12);
      elements[elements.length - (renderedChildren ? renderedChildren + 1 : 1)] = {
        ...elements[elements.length - (renderedChildren ? renderedChildren + 1 : 1)],
        h: finalHeight,
      };
      return finalHeight;
    }

    if (text) {
      return createText(tag, text, x, y, width, 16, "400");
    }

    return 0;
  };

  elements.push({
    id: nextId++,
    type: "Frame",
    x: 60,
    y: 60,
    w: maxCanvasWidth,
    h: 900,
    label: prompt || "Generated UI",
    fillColor: FRAME_FILL,
    strokeColor: FRAME_STROKE,
    strokeWidth: 1,
    opacity: 100,
    rotation: 0,
    cornerRadius: 24,
    visible: true,
    locked: false,
  });

  createText("Generated UI Title", prompt || "Generated UI", 100, 90, maxCanvasWidth - 80, 24, "700");

  bodyChildren.slice(0, 20).forEach((child) => {
    const consumed = renderNode(child, 100, cursorY, maxCanvasWidth - 80, 0);
    if (consumed > 0) {
      cursorY += consumed + 20;
      contentBottom = Math.max(contentBottom, cursorY + 60);
    }
  });

  if (elements.length <= 2) {
    createRect("Rectangle", "Generated Layout", 100, 160, maxCanvasWidth - 80, 640, CARD_FILL, CARD_STROKE, 20);
    createText("Generated Layout Text", cleanText(prompt) || "Generated UI Layout", 140, 220, maxCanvasWidth - 160, 28, "700");
    createText(
      "Generated Layout Description",
      "The generated screen has been transferred as editable blocks. Use the workspace tools to refine sections, replace placeholders, and adjust the layout.",
      140,
      280,
      maxCanvasWidth - 160,
      16,
      "400",
      MUTED_TEXT
    );
  }

  elements[0] = {
    ...elements[0],
    h: Math.max(900, contentBottom - 20),
  };

  return {
    name: prompt || "Generated UI",
    elements,
    pages,
    canvasSettings: {
      zoom: 75,
      panOffset: { x: 40, y: 30 },
      showGrid: true,
      gridSize: 40,
      gridStyle: "lines",
    },
    prompt,
    htmlContent: `<!DOCTYPE html><html><head><style>${generatedUI.css}</style></head><body>${generatedUI.html}${generatedUI.js ? `<script>${generatedUI.js}<\/script>` : ""}</body></html>`,
  };
};