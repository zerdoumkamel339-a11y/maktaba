import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyAccessToken(token);

    if (!payload) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Clone the headers and add user info
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", payload.role as string);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Apply this middleware only to sensitive API routes
export const config = {
    matcher: [
        "/api/books/add",
        "/api/orders/:path*",
        "/api/library/:path*",
        "/api/warehouse/:path*",
    ],
};
