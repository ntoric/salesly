/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'hsl(var(--primary))',
                'primary-light': 'hsl(var(--primary-light))',
                accent: 'hsl(var(--accent))',
                'bg-body': 'hsl(var(--bg-body))',
                'bg-card': 'hsl(var(--bg-card))',
                'text-main': 'hsl(var(--text-main))',
                'text-secondary': 'hsl(var(--text-secondary))',
                'text-muted': 'hsl(var(--text-muted))',
                border: 'hsl(var(--border-light))',
            }
        },
    },
    plugins: [],
}
