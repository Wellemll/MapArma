export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // EFFACER TOUT ou UN SEUL point
    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (id === "all") {
            await env.DB.prepare("DELETE FROM pings").run();
            return new Response("Carte vidée", { status: 200 });
        } else {
            await env.DB.prepare("DELETE FROM pings WHERE id = ?").bind(id).run();
            return new Response("Supprimé", { status: 200 });
        }
    }

    // AJOUTER un point (POST)
    if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare("INSERT INTO pings (x, y, label, type) VALUES (?, ?, ?, ?)")
            .bind(data.x, data.y, data.label, data.type)
            .run();
        return new Response("Ajouté", { status: 201 });
    }

    // VOIR les points (GET)
    const { results } = await env.DB.prepare("SELECT * FROM pings ORDER BY timestamp DESC").all();
    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
    });
}
