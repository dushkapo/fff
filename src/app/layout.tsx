import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const montserrat = Montserrat({
    subsets: ["cyrillic", "latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-montserrat",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["cyrillic", "latin"],
    weight: ["400", "600", "700"],
    variable: "--font-playfair",
    display: "swap",
});

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
        <html lang="ru" className={`${montserrat.variable} ${playfair.variable}`}>
            <body className={`${montserrat.className} antialiased`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
