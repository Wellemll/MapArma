export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (id === "all") {
            await env.DB.prepare("DELETE FROM pings").run();
        } else {
            await env.DB.prepare("DELETE FROM pings WHERE id = ?").bind(id).run();
        }
        return new Response("OK", { status: 200 });
    }

    if (request.method === "POST") {
        const data = await request.json();
        await env.DB.prepare("INSERT INTO pings (x, y, label, type, points_json) VALUES (?, ?, ?, ?, ?)")
            .bind(data.x || null, data.y || null, data.label || '', data.type, data.points_json || null)
            .run();
        return new Response("OK", { status: 201 });
    }

    const { results } = await env.DB.prepare("SELECT * FROM pings").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}
