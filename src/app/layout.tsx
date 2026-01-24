import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Diana Flowers - Премиум букеты с доставкой",
    description: "Эксклюзивные букеты премиум-класса. Доставка за 2 часа или самовывоз. Цветочный бутик Diana Flowers.",
    keywords: "букеты, цветы, доставка цветов, премиум букеты, розы, пионы",
    openGraph: {
        title: "Diana Flowers - Премиум букеты",
        description: "Эксклюзивные букеты для особых моментов",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
