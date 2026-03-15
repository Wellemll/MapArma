export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // GESTION DES SUPPRESSIONS
    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        try {
            if (id === "all") {
                await env.DB.prepare("DELETE FROM pings").run();
            } else {
                await env.DB.prepare("DELETE FROM pings WHERE id = ?").bind(id).run();
            }
            return new Response("OK", { status: 200 });
        } catch (e) {
            return new Response(e.message, { status: 500 });
        }
    }

    // GESTION DES AJOUTS
    if (request.method === "POST") {
        try {
            const data = await request.json();
            await env.DB.prepare(
                "INSERT INTO pings (x, y, label, type, points_json) VALUES (?, ?, ?, ?, ?)"
            )
            .bind(
                data.x || 0, 
                data.y || 0, 
                data.label || "", 
                data.type, 
                data.points_json || null
            )
            .run();
            
            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            return new Response(e.message, { status: 500 });
        }
    }

    // GESTION DE LA LECTURE (GET)
    try {
        const { results } = await env.DB.prepare("SELECT * FROM pings").all();
        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}
