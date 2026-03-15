export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // GESTION DELETE
    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (id === "all") {
            await env.DB.prepare("DELETE FROM pings").run();
        } else {
            await env.DB.prepare("DELETE FROM pings WHERE id = ?").bind(id).run();
        }
        return new Response("OK", { status: 200 });
    }

    // GESTION POST (AJOUT)
    if (request.method === "POST") {
        const data = await request.json();
        // On insère et on récupère le résultat pour confirmer
        const info = await env.DB.prepare(
            "INSERT INTO pings (x, y, label, type, points_json) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(data.x || 0, data.y || 0, data.label || "", data.type, data.points_json || null)
        .run();
        
        return new Response(JSON.stringify({ success: true, id: info.lastRowId }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // GESTION GET (LECTURE)
    const { results } = await env.DB.prepare("SELECT * FROM pings").all();
    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
    });
}
