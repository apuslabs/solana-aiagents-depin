module.exports = {
    content: ["./index.html", './src/**/*.{js,ts,jsx,tsx}'],
    daisyui: {
        themes: [
            {
                florence: {
                    "primary": "#0056B5",
                    "secondary": "#AFAFAF",
                    "accent": "#0A2540",
                    "neutral": "#F8F8F8",
                    "base-100": "#FFFFFF",
                    "info": "#00aafb",
                    "success": "#009e6e",
                    "warning": "#c68e00",
                    "error": "#c80025",
                    "border-base": '#d2d2d2'
                },
            },
        ],
    },
    theme: {
        extend: {
            boxShadow: {
                'dark': '0px 20px 42px -2px rgba(0,0,0,0.25)',
            },
        },
    },
    plugins: [require('daisyui')],
};
