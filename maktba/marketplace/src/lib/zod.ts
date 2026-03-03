import { z } from "zod";

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    role: z.enum(["CUSTOMER", "INDIVIDUAL_SELLER", "PUBLISHER", "LIBRARY"]).default("CUSTOMER"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const BookSchema = z.object({
    title: z.string().min(2),
    author: z.string().min(2),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
});

export const OrderSchema = z.object({
    wilayaId: z.string(),
    communeId: z.string(),
    phone: z.string().regex(/^(05|06|07)[0-9]{8}$/, "Invalid Algerian phone number"),
    items: z.array(z.object({
        bookId: z.string(),
        quantity: z.number().int().positive(),
    })).min(1),
});
