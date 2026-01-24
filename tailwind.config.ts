import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                ivory: "#FFFFF0",
                "deep-green": "#2D5A47",
                "soft-gold": "#D4AF37",
                "gold-light": "#E8C878",
            },
            fontFamily: {
                serif: ["Playfair Display", "serif"],
                sans: ["Montserrat", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
