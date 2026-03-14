export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // --- SUPPRESSION (Individuelle ou Totale) ---
    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        try {
            if (id === "all") {
                await env.DB.prepare("DELETE FROM pings").run();
                return new Response("Carte réinitialisée", { status: 200 });
            } else {
                await env.DB.prepare("DELETE FROM pings WHERE id = ?").bind(id).run();
                return new Response("Élément supprimé", { status: 200 });
            }
        } catch (err) {
            return new Response(err.message, { status: 500 });
        }
    }

    // --- AJOUT D'UN ÉLÉMENT (POST) ---
    if (request.method === "POST") {
        try {
            const data = await request.json();
            
            // On insère, en gérant le cas où c'est un point simple ou une forme
            await env.DB.prepare("INSERT INTO pings (x, y, label, type, points_json) VALUES (?, ?, ?, ?, ?)")
                .bind(
                    data.x || null, // Nul si c't'une forme
                    data.y || null, // Nul si c't'une forme
                    data.label || '',
                    data.type,
                    data.points_json || null // Contient les points si c't'une forme
                )
                .run();
                
            return new Response("Élément enregistré", { status: 201 });
        } catch (err) {
            return new Response(err.message, { status: 500 });
        }
    }

    // --- LECTURE DES ÉLÉMENTS (GET) ---
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
