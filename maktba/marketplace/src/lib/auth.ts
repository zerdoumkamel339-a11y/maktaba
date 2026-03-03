import * as jose from "jose";
import bcrypt from "bcrypt";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || "access-secret");
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || "refresh-secret");

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function generateTokens(userId: string, role: string) {
    const accessToken = await new jose.SignJWT({ userId, role })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("15m")
        .sign(ACCESS_SECRET);

    const refreshToken = await new jose.SignJWT({ userId, role })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(REFRESH_SECRET);

    return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string) {
    try {
        const { payload } = await jose.jwtVerify(token, ACCESS_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}
