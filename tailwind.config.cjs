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
				japanese: [
					'"Noto Sans JP"',
					'"Hiragino Kaku Gothic ProN"',
					'"Hiragino Sans"',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif',
				],
			},
		},
	},
	plugins: [],
}
