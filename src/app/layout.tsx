import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

export const metadata: Metadata = {
    title: "Мир Цветов - Премиум букеты с доставкой",
    description: "Эксклюзивные букеты премиум-класса. Доставка за 2 часа или самовывоз. Цветочный бутик Мир Цветов.",
    keywords: "букеты, цветы, доставка цветов, премиум букеты, розы, пионы, мир цветов",
    openGraph: {
        title: "Мир Цветов - Премиум букеты",
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
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
