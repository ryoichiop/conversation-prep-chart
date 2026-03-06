const ALLOWED_ORIGINS = [
  "https://ryoichiop.github.io",
  "http://localhost:5173",
  "http://localhost:4173",
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    // Only allow /v1/messages
    const url = new URL(request.url);
    if (url.pathname !== "/v1/messages") {
      return new Response("Not found", {
        status: 404,
        headers: corsHeaders(origin),
      });
    }

    // Rate-limit: simple per-IP throttle (optional, Workers has built-in DDoS protection)
    const body = await request.text();

    // Forward to Anthropic
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    const resBody = await anthropicRes.text();

    return new Response(resBody, {
      status: anthropicRes.status,
      headers: {
        ...corsHeaders(origin),
        "Content-Type": "application/json",
      },
    });
  },
};
