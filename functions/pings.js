export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // DELETE rapide
    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        const query = id === "all" ? "DELETE FROM pings" : "DELETE FROM pings WHERE id = ?";
        await (id === "all" ? env.DB.prepare(query).run() : env.DB.prepare(query).bind(id).run());
        return new Response("OK");
    }

    // POST rapide
    if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare("INSERT INTO pings (x, y, label, type, points_json) VALUES (?, ?, ?, ?, ?)")
            .bind(data.x || 0, data.y || 0, data.label || "", data.type, data.points_json || null)
            .run();
        return new Response("OK");
    }

    // GET optimisé (on ne prend que les 200 derniers pour la vitesse)
    const { results } = await env.DB.prepare("SELECT * FROM pings ORDER BY id DESC LIMIT 200").all();
    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
    });
}
