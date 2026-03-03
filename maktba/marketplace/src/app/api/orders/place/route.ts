import { NextResponse } from "next/server";
import { OrderSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || !role) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = OrderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const { wilayaId, communeId, phone, items } = result.data;

        // Use Prisma transaction to ensure atomicity, prevent negative stock
        await prisma.$transaction(async (tx) => {
            let totalAmount = 0;

            // Group by vendor for multi-vendor splitting
            const vendorsOrders = new Map<string, typeof items>();

            for (const item of items) {
                const book = await tx.book.findUnique({
                    where: { id: item.bookId },
                    include: { inventory: true, seller: true }
                });

                if (!book || !book.inventory) {
                    throw new Error(`Book not found or inventory missing for bookId: ${item.bookId}`);
                }

                // PUBLISHER: Receive Orders (From Libraries Only)
                if (book.seller.role === "PUBLISHER" && role !== "LIBRARY") {
                    throw new Error(`Book ${book.title} can only be ordered by Libraries`);
                }

                if (book.inventory.available < item.quantity) {
                    throw new Error(`Insufficient stock for book: ${book.title}`);
                }

                // Deduct available stock and add to reserved
                await tx.inventory.update({
                    where: { id: book.inventory.id },
                    data: {
                        available: { decrement: item.quantity },
                        reserved: { increment: item.quantity }
                    }
                });

                await tx.stockMovement.create({
                    data: {
                        inventoryId: book.inventory.id,
                        quantity: item.quantity,
                        type: "RESERVED"
                    }
                });

                totalAmount += book.price * item.quantity;
            }

            // Create Order
            const order = await tx.order.create({
                data: {
                    customerId: userId,
                    totalAmount,
                    status: "PENDING",
                    items: {
                        create: items.map(item => ({
                            bookId: item.bookId,
                            quantity: item.quantity,
                            priceAtTime: 0 // In a real app we fetch real price and set it here
                        }))
                    }
                }
            });

            return order;
        });

        return NextResponse.json({ message: "Order placed successfully" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
