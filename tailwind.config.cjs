/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-zen-kaku)', 'var(--font-inter-tight)', 'system-ui', 'sans-serif'],
				serif: ['var(--font-shippori)', 'var(--font-inter-tight)', 'Georgia', 'serif'],
				mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
				japanese: [
					'"Noto Sans JP"',
					'"Hiragino Kaku Gothic ProN"',
					'"Hiragino Sans"',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif',
				],
			},
			colors: {
				vermilion: '#ff5b29',
			},
		},
	},
	plugins: [],
}
