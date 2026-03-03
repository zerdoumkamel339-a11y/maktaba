import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Maktba - Book Marketplace",
    description: "RTL Mobile-first SaaS Multi-vendor Book Marketplace",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <main className="min-h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden relative">
                    {children}
                </main>
            </body>
        </html>
    );
}
