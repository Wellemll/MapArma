export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        id === "all" ? await env.DB.prepare("DELETE FROM pings").run() : await env.DB.prepare("DELETE FROM pings WHERE id = ?").bind(id).run();
        return new Response("OK");
    }

    if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare("INSERT INTO pings (x, y, label, type, points_json) VALUES (?, ?, ?, ?, ?)")
            .bind(data.x || 0, data.y || 0, data.label || "", data.type, data.points_json || null)
            .run();
        return new Response("OK");
    }

    const { results } = await env.DB.prepare("SELECT * FROM pings").all();
    return new Response(JSON.stringify(results));
}
