import { NextResponse } from "next/server";
import { BookSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const userId = req.headers.get("x-user-id");
        const role = req.headers.get("x-user-role");

        if (!userId || !role) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Role check
        if (role === "CUSTOMER") {
            return NextResponse.json({ error: "Customers cannot add books" }, { status: 403 });
        }

        // specific role validations
        if (role === "INDIVIDUAL_SELLER") {
            const bookCount = await prisma.book.count({ where: { sellerId: userId } });
            if (bookCount >= 3) {
                return NextResponse.json({ error: "Individual sellers can add max 3 books" }, { status: 403 });
            }
        }

        if (role === "LIBRARY") {
            const bookCount = await prisma.book.count({ where: { sellerId: userId } });
            if (bookCount >= 5000) {
                return NextResponse.json({ error: "Libraries can add max 5000 books" }, { status: 403 });
            }
        }

        const body = await req.json();
        const result = BookSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const { title, author, price, stock } = result.data;

        const book = await prisma.book.create({
            data: {
                title,
                author,
                price,
                sellerId: userId,
                inventory: {
                    create: {
                        totalStock: stock,
                        available: stock,
                        reserved: 0
                    }
                }
            },
            include: { inventory: true }
        });

        // Add initial stock movement
        await prisma.stockMovement.create({
            data: {
                inventoryId: book.inventory!.id,
                quantity: stock,
                type: "IN",
                reference: "Initial Stock"
            }
        });

        return NextResponse.json({ book }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
