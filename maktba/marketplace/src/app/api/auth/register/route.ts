import { NextResponse } from "next/server";
import { RegisterSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTokens } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = RegisterSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const { email, password, firstName, lastName, role } = result.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role: role as any,
                profile: {
                    create: {
                        firstName,
                        lastName,
                    }
                },
                // Automatically create vendor balance for sellers/publishers
                ...(role !== "CUSTOMER" ? {
                    vendorBalance: {
                        create: {
                            currentBalance: 0,
                            pendingBalance: 0
                        }
                    }
                } : {})
            },
        });

        const tokens = await generateTokens(user.id, user.role);

        return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role }, tokens });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
