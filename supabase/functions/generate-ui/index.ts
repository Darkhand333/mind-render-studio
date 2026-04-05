import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, framework = "html" } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Protocraft UI Generator — an expert frontend developer and UI designer.

Your task: Given a user's description, generate a COMPLETE, BEAUTIFUL, PRODUCTION-READY single-page UI.

RULES:
1. Return ONLY a valid JSON object with these exact keys: "html", "css", "js"
2. The "html" should be the inner body content (no <html>, <head>, <body> tags)
3. The "css" should be complete CSS including a modern reset and all styles
4. The "js" should be any interactivity JavaScript (can be empty string if not needed)
5. Use modern CSS (flexbox, grid, gradients, shadows, rounded corners, transitions)
6. Make it RESPONSIVE and BEAUTIFUL with a professional color scheme
7. Include hover effects, smooth transitions, and micro-interactions
8. Use system fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
9. Add proper spacing, typography hierarchy, and visual rhythm
10. Include placeholder content that makes sense for the UI type
11. For forms, add proper labels, placeholders, and styled inputs
12. Make buttons look clickable with hover/active states
13. Use a cohesive color palette (e.g., modern blues, purples, or the user's preference)
14. NEVER include markdown, code fences, or explanation — ONLY the JSON object

IMPORTANT: Your entire response must be a single valid JSON object. No text before or after it.

Example response format:
{"html":"<div class=\\"container\\">...</div>","css":"* { margin: 0; } ...","js":"document.querySelector..."}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a beautiful UI for: ${prompt}\n\nFramework preference: ${framework}` },
        ],
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
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
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

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the AI response
    let uiResult: { html: string; css: string; js: string };
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = raw.trim();
      // Remove markdown code fences if present
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      uiResult = JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, try to find JSON in the response
      const jsonMatch = raw.match(/\{[\s\S]*"html"[\s\S]*"css"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          uiResult = JSON.parse(jsonMatch[0]);
        } catch {
          uiResult = {
            html: `<div style="padding:40px;text-align:center;font-family:sans-serif"><h1>Generated UI</h1><p>The AI generated content but it couldn't be parsed. Raw output:</p><pre style="text-align:left;background:#f5f5f5;padding:20px;border-radius:8px;overflow:auto;max-height:400px">${raw.replace(/</g, "&lt;")}</pre></div>`,
            css: "body { margin: 0; background: #fafafa; }",
            js: "",
          };
        }
      } else {
        uiResult = {
          html: `<div style="padding:40px;text-align:center;font-family:sans-serif"><h1>Generated UI</h1><pre style="text-align:left;background:#f5f5f5;padding:20px;border-radius:8px;overflow:auto">${raw.replace(/</g, "&lt;")}</pre></div>`,
          css: "body { margin: 0; background: #fafafa; }",
          js: "",
        };
      }
    }

    return new Response(JSON.stringify(uiResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ui error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
