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
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {children}
            </body>
        </html>
    );
}
