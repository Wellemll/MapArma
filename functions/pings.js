export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // --- SUPPRESSION (Individuelle ou Totale) ---
    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        try {
            if (id === "all") {
                await env.DB.prepare("DELETE FROM pings").run();
                return new Response("Base de données réinitialisée", { status: 200 });
            } else {
                await env.DB.prepare("DELETE FROM pings WHERE id = ?").bind(id).run();
                return new Response("Entité supprimée", { status: 200 });
            }
        } catch (err) {
            return new Response(err.message, { status: 500 });
        }
    }

    // --- AJOUT D'UN POINT (POST) ---
    if (request.method === "POST") {
        try {
            const data = await request.json();
            await env.DB.prepare("INSERT INTO pings (x, y, label, type) VALUES (?, ?, ?, ?)")
                .bind(data.x, data.y, data.label, data.type)
                .run();
            return new Response("Signal enregistré", { status: 201 });
        } catch (err) {
            return new Response(err.message, { status: 500 });
        }
    }

    // --- LECTURE DES POINTS (GET) ---
    try {
        const { results } = await env.DB.prepare("SELECT * FROM pings ORDER BY timestamp DESC").all();
        return new Response(JSON.stringify(results), {
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache" 
            }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}
