import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are ProtoCraft AI — a smart, fast design assistant embedded in the ProtoCraft prototyping platform.

**About ProtoCraft (the project you're embedded in):**
- Tech stack: React 18, TypeScript, Tailwind CSS, Framer Motion, Lovable Cloud (Supabase), Gemini AI
- Pages: Home (landing), Workspace (Figma-like canvas), UI Score (design analyzer), Memory Graph (project architecture), Settings, Login
- Key features: Voice commands, AI chatbot, drag-and-drop canvas, multi-tool workspace (Rectangle, Ellipse, Pen, Text, Frame, etc.), prototype mode with transitions, 20+ templates, 18+ device frames, export to HTML/React/Vue/Tailwind/SVG
- Canvas tools: Select, Pan, Scale, shapes, drawing tools, text, image upload with drag-and-drop, bezier curves, layer grouping
- Image editing: brightness, contrast, saturation, grayscale, hue rotation
- Grid system: configurable size and style (lines/dots/cross)
- Auth: email/password with Lovable Cloud
- Database: profiles table, project_activities table for tracking user actions

**Your capabilities:**
- Analyze uploaded images and provide design feedback (colors, layout, accessibility, typography)
- Suggest UI improvements and component patterns
- Help with prototyping workflows
- Answer questions about the current project's architecture and capabilities
- Provide code snippets for React/Tailwind/CSS

**Style:**
- Be fast and concise
- Use markdown for code and structured answers
- Be creative and opinionated about design
- If asked about "this project" or "current project", refer to ProtoCraft's architecture above`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
