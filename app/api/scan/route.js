// Server-side proxy so the Gemini API key never reaches the phone/browser.
// The client sends a resized photo + an instruction; we forward it to
// Google's Gemini vision model — free tier, no credit card — and hand back
// the raw text reply.

const MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "La app todavía no tiene su llave de lectura configurada (falta GEMINI_API_KEY en el servidor). Revisa la guía de instalación.",
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const { base64, instruccion } = body || {};
  if (!base64 || !instruccion) {
    return Response.json({ error: "Falta la foto o la instrucción." }, { status: 400 });
  }

  let resp;
  try {
    resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: instruccion },
              { inline_data: { mime_type: "image/jpeg", data: base64 } },
            ],
          },
        ],
      }),
    });
  } catch {
    return Response.json({ error: "No se pudo contactar al servicio de lectura. Intenta de nuevo." }, { status: 502 });
  }

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    return Response.json(
      { error: `La lectura falló (código ${resp.status}). ${detail.slice(0, 200)}` },
      { status: 502 }
    );
  }

  const data = await resp.json();
  const texto = ((data.candidates || [])[0]?.content?.parts || [])
    .filter((p) => typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");

  return Response.json({ texto });
}
