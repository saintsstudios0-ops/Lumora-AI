
export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido." }),
      { status: 405 }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Configure GEMINI_API_KEY no Netlify." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const { prompt } = await req.json();

    if (typeof prompt !== "string" || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Digite sua ideia." }),
        { status: 400 }
      );
    }

    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt.trim() }]
          }]
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      return new Response(
        JSON.stringify({
          error: dados.error?.message || "Erro na API do Gemini."
        }),
        {
          status: resposta.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const text = dados.candidates?.[0]?.content?.parts
      ?.map(parte => parte.text || "")
      .join("") || "Nenhuma resposta foi gerada.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Erro interno ao processar a solicitação." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
