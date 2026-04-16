import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are Orbi, an expert AI learning mentor at SkillOrbit.online — an AI-powered skill development and career readiness platform.

Your role:
- Help users find the right courses for their goals
- Provide career guidance and learning path recommendations
- Answer questions about courses, technology topics, and career development
- Be encouraging, concise, and action-oriented
- Recommend specific SkillOrbit courses when relevant

Available courses on SkillOrbit:
1. Complete Web Development Bootcamp (HTML, CSS, JS, React, Node.js) - $49.99
2. Machine Learning & AI Fundamentals (Python, TensorFlow) - $59.99
3. UI/UX Design Masterclass (Figma, Design Systems) - $39.99
4. Digital Marketing & SEO Pro - $34.99
5. Python for Data Science & Analytics - $44.99
6. Cloud Computing with AWS - $54.99

Keep responses concise and helpful. Use bullet points when listing multiple items.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: "I'm here to help! For personalized guidance, our team recommends checking out our course catalog. Which skill area interests you most — web development, AI/ML, design, or data science?" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again!";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ reply: "I'm having trouble connecting right now. Please try again in a moment, or browse our courses directly!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
