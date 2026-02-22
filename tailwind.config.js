/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./lib/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#6B8599",
                "primary-dark": "#526A7D",
                "background-light": "#F8FAFC",
                "background-dark": "#0F172A",
                "surface-light": "#FFFFFF",
                "surface-dark": "#1E293B",
                "text-light": "#111827",
                "text-dark": "#F8FAFC",
                "subtext-light": "#64748B",
                "subtext-dark": "#94A3B8",
            },
            fontFamily: {
                display: ["Inter_700Bold"],
                sans: ["Inter_400Regular"],
                medium: ["Inter_500Medium"],
                semibold: ["Inter_600SemiBold"],
            },
            fontSize: {
                xs: ["13px", { lineHeight: "18px" }],
                sm: ["15px", { lineHeight: "22px" }],
            },
        },
    },
    plugins: [],
};
