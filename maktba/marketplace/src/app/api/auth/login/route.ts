import { NextResponse } from "next/server";
import { LoginSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import { comparePasswords, generateTokens } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = LoginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors }, { status: 400 });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isMatch = await comparePasswords(password, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const tokens = await generateTokens(user.id, user.role);

        return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role }, tokens });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
