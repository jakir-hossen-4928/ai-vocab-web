import { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    const url = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";

    // List of common social media bot user agents
    const botUserAgents = [
        "WhatsApp",
        "facebookexternalhit",
        "Twitterbot",
        "LinkedInBot",
        "Embedly",
        "quora link preview",
        "showyoubot",
        "outbrain",
        "pinterest/0.",
        "developers.google.com/+/web/snippet",
        "slackbot",
        "vkShare",
        "W3C_Validator",
        "Redditbot",
        "Applebot",
        "TelegramBot",
        "Discordbot"
    ];

    const isBot = botUserAgents.some(bot => userAgent.includes(bot));

    // Only run for resource detail pages and for bots
    if (isBot && url.pathname.startsWith("/resources/")) {
        const resourceId = url.pathname.split("/").pop();

        if (!resourceId) return;

        try {
            // Use environment variable for project ID if available, otherwise fallback
            const projectId = Deno.env.get("VITE_FIREBASE_PROJECT_ID") || "ai-vocab-coach";

            let title = "";
            let description = "";
            let imageUrl = "";

            // 1. Try fetching as document by ID
            const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/grammar_images/${resourceId}`;
            const docResponse = await fetch(docUrl);

            if (docResponse.ok) {
                const data = await docResponse.json();
                title = data.fields.title?.stringValue || "";
                description = data.fields.description?.stringValue || "";
                imageUrl = data.fields.imageUrl?.stringValue || "";
            } else {
                // 2. Try fetching by slug using structured query
                const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
                const queryBody = {
                    structuredQuery: {
                        from: [{ collectionId: "grammar_images" }],
                        where: {
                            fieldFilter: {
                                field: { fieldPath: "slug" },
                                op: "EQUAL",
                                value: { stringValue: resourceId }
                            }
                        },
                        limit: 1
                    }
                };

                const queryResponse = await fetch(queryUrl, {
                    method: "POST",
                    body: JSON.stringify(queryBody)
                });

                if (queryResponse.ok) {
                    const results = await queryResponse.json();
                    if (results.length > 0 && results[0].document) {
                        const doc = results[0].document;
                        title = doc.fields.title?.stringValue || "";
                        description = doc.fields.description?.stringValue || "";
                        imageUrl = doc.fields.imageUrl?.stringValue || "";
                    }
                }
            }

            if (title) {
                // Clean description
                const cleanDescription = description.substring(0, 160).replace(/[#*`]/g, '') || "Master English vocabulary with AI-powered coaching";
                const finalImageUrl = imageUrl || `https://${url.hostname}/og_image.png`;

                const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${cleanDescription}">
    
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${request.url}">
    <meta property="og:image" content="${finalImageUrl}">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${finalImageUrl}">
</head>
<body>
    <h1>${title}</h1>
    <p>${cleanDescription}</p>
    <img src="${finalImageUrl}" />
    <script>window.location.href = "${request.url}";</script>
</body>
</html>`;

                return new Response(html, {
                    headers: { "content-type": "text/html" },
                });
            }
        } catch (e) {
            console.error("Edge function error:", e);
        }
    }

    // Fallback to normal rendering (let Netlify handle it)
    return context.next();
};
