import { verifyWebhook } from "@clerk/express/webhooks";
import { sql } from "../config/db.js";

export const handleClerkWebhook = async (req, res) => {
    try {
        const evt = await verifyWebhook(req);

        const eventType = evt.type;
        const data = evt.data;

        switch (eventType) {
            case "user.created": {
                const userId = data.id;
                const primaryEmail = data.email_addresses?.[0]?.email_address || "";
                // Filter out null/undefined names to avoid "User null"
                const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";
                const image = data.image_url || "";
                const plan = "free";

                await sql`
                    INSERT INTO users (id, name, email, image, plan)
                    VALUES (${userId}, ${name}, ${primaryEmail}, ${image}, ${plan})
                    ON CONFLICT (id) DO UPDATE SET
                    email = COALESCE(NULLIF(EXCLUDED.email, ''), users.email),
                    name = EXCLUDED.name,
                    image = EXCLUDED.image,
                    plan = EXCLUDED.plan,
                    updated_at = NOW()`;
                    break;
            }
            
            case "user.updated": {
                const userId = data.id;
                const primaryEmail = data.email_addresses?.[0]?.email_address || "";
                const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";
                const image = data.image_url || "";

                await sql`
                    INSERT INTO users (id, name, email, image)
                    VALUES (${userId}, ${name}, ${primaryEmail}, ${image})
                    ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    name = EXCLUDED.name,
                    image = EXCLUDED.image,
                    updated_at = NOW()`;
                    break;
            }

            case "user.deleted": {
                const userId = data.id;
                if (userId) {
                    await sql`DELETE FROM users WHERE id = ${userId}`;
                    console.log(`User ${userId} deleted from DB.`);
                }
                break;
            }
        
            default:
                console.log(`Unhandled Clerk webhook event type: ${eventType}`);
        }
        
        return res.status(200).json({ success: true, eventType });

    } catch (error) {
        console.error("Error verifying Clerk webhook:", error.message);
        return res.status(400).json({ error: "Webhook verification failed: " + error.message });
    }
}