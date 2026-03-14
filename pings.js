// functions/pings.js
export async function onRequest(context) {
    const { request, env } = context;

    // 1. Gérer l'ajout d'un nouveau point (POST)
    if (request.method === "POST") {
        try {
            const data = await request.json();
            // On insère dans la table D1
            await env.DB.prepare("INSERT INTO pings (x, y, label) VALUES (?, ?, ?)")
                .bind(data.x, data.y, data.label || "Point d'intérêt")
                .run();
            return new Response(JSON.stringify({ success: true }), { status: 201 });
        } catch (err) {
            return new Response(err.message, { status: 500 });
        }
    }

    // 2. Gérer la lecture des points (GET)
    const { results } = await env.DB.prepare("SELECT * FROM pings").all();
    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
    });
}