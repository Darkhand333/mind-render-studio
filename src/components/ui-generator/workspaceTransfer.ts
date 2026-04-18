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