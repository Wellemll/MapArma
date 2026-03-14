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
        try {
            const data = await request.json();
            // On s'assure que chaque valeur est soit présente, soit NULL
            const x = data.x ?? null;
            const y = data.y ?? null;
            const label = data.label ?? "";
            const type = data.type ?? "inf_blue";
            const points = data.points_json ?? null;

            await env.DB.prepare("INSERT INTO pings (x, y, label, type, points_json) VALUES (?, ?, ?, ?, ?)")
                .bind(x, y, label, type, points)
                .run();
                
            return new Response("OK", { status: 201 });
        } catch (e) {
            return new Response(e.message, { status: 500 });
        }
    }

    // Récupération
    const { results } = await env.DB.prepare("SELECT * FROM pings").all();
    return new Response(JSON.stringify(results), { 
        headers: { "Content-Type": "application/json" } 
    });
}
