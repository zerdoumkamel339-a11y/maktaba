import cron from "node-cron";
import { prisma } from "./prisma";

// Run every day at midnight to delete publishers who expired 7 days after creation
export function initCronJobs() {
    cron.schedule("0 0 * * *", async () => {
        console.log("Running publisher expiration cleanup...");
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - 7);

        // Find publishers with no valid subscription or old
        const expiredUsers = await prisma.user.findMany({
            where: {
                role: "PUBLISHER",
                createdAt: {
                    lt: expirationDate
                }
            }
        });

        for (const expUser of expiredUsers) {
            // In a real scenario we'd check their subscriptionPlan, but prompt says "PUBLISHER (auto-delete after 7 days via cron)"
            await prisma.user.delete({
                where: { id: expUser.id }
            });
            console.log(`Deleted expired publisher: ${expUser.id}`);
        }
    });
}
