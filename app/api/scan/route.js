// Server-side proxy so the Gemini API key never reaches the phone/browser.
// The client sends a resized photo + an instruction; we forward it to
// Google's Gemini vision model — free tier, no credit card — and hand back
// the raw text reply.
//
// Uses the "-latest" alias (not a dated model id) so this keeps working when
// Google retires/renames specific model versions — it always resolves to
// whatever current Flash release is available to this API key.

const MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// The free tier's requests-per-minute limit is easy to brush against when a
// week has several worked days (one request per day, fired close together).
// A short retry absorbs that instead of surfacing it as a hard failure.
const REINTENTOS_429 = [1200, 2800];

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

  const payload = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [
          { text: instruccion },
          { inline_data: { mime_type: "image/jpeg", data: base64 } },
        ],
      },
    ],
  });

  let resp;
  let detail = "";
  for (let intento = 0; intento <= REINTENTOS_429.length; intento++) {
    try {
      resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
      });
    } catch {
      return Response.json({ error: "No se pudo contactar al servicio de lectura. Intenta de nuevo." }, { status: 502 });
    }

    if (resp.ok) break;
    if (resp.status !== 429 || intento === REINTENTOS_429.length) {
      detail = await resp.text().catch(() => "");
      break;
    }
    await esperar(REINTENTOS_429[intento]);
  }

  if (!resp.ok) {
    if (resp.status === 429) {
      return Response.json(
        { error: "Google está saturado por ahora (demasiadas lecturas seguidas en el plan gratis). Espera un minuto y toca \"Intentar de nuevo\"." },
        { status: 429 }
      );
    }
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
