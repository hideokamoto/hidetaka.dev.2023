/** @type {import('tailwindcss').Config} */

// ============================================================
// 折衷 (Setchū) palette — mapped onto Tailwind's colour scales so
// existing utility classes (indigo-*, slate-*, zinc-*, green-*)
// render in the new design system without touching every file.
//   indigo   → 藍青 (indigo-blue, the protagonist)
//   green    → 松葉緑 (pine green, spot accent)
//   yamabuki → 山吹 (gold, spot accent)  [new scale]
//   zinc/slate/gray → 和紙 (washi neutral)
// See src/styles/setchu.css for the canonical CSS-variable tokens.
// ============================================================

// 藍青 — anchored on 600 = #2f5375 (light primary), 400 = #6e9bc0 (dark primary)
const aiao = {
	50: '#eff3f7',
	100: '#dbe4ee',
	200: '#bccedf',
	300: '#93b0cb',
	400: '#6e9bc0',
	500: '#4c7ba0',
	600: '#2f5375',
	700: '#274762',
	800: '#233d53',
	900: '#203645',
	950: '#14222e',
}

// 松葉緑 — anchored on 600 = #3e7a55 (light secondary), 400 = #6fb088 (dark secondary)
const matsuba = {
	50: '#eef5f0',
	100: '#d6e7dd',
	200: '#b0d0bc',
	300: '#8fc3a2',
	400: '#6fb088',
	500: '#4f9269',
	600: '#3e7a55',
	700: '#356547',
	800: '#2c523b',
	900: '#264532',
	950: '#13271c',
}

// 山吹 — anchored on 500 = #e0a63c (light accent), 300 ≈ #ecbe56 (dark accent)
const yamabuki = {
	50: '#fbf4e3',
	100: '#f6e7bf',
	200: '#efd48f',
	300: '#eccb6f',
	400: '#e7b84c',
	500: '#e0a63c',
	600: '#c68a2b',
	700: '#9e6c22',
	800: '#7e561f',
	900: '#69481c',
	950: '#3c280d',
}

// 和紙 — warm neutral; anchors: 100 = bg, 200 = border, 500 = muted,
// 900 = dark surface, 950 = dark bg
const washi = {
	50: '#faf8f3',
	100: '#f5f2ec',
	200: '#e4ded2',
	300: '#cfc8b9',
	400: '#a8a69d',
	500: '#7b7e82',
	600: '#565a61',
	700: '#3b3f46',
	800: '#2e3138',
	900: '#1f2228',
	950: '#16181c',
}

module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// Brand
				indigo: aiao,
				green: matsuba,
				yamabuki,
				matsuba,
				aiao,
				washi,
				// Neutrals unified onto the 和紙 scale
				zinc: washi,
				slate: washi,
				gray: washi,
			},
			fontFamily: {
				display: [
					'"Shippori Mincho"',
					'"Zen Kaku Gothic New"',
					'"Hiragino Mincho ProN"',
					'serif',
				],
				serif: ['"Shippori Mincho"', '"Hiragino Mincho ProN"', 'serif'],
				japanese: [
					'"Zen Kaku Gothic New"',
					'"Hiragino Kaku Gothic ProN"',
					'"Hiragino Sans"',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif',
				],
				sans: [
					'"Zen Kaku Gothic New"',
					'"Hiragino Kaku Gothic ProN"',
					'"Hiragino Sans"',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif',
				],
				mono: ['"SF Mono"', 'ui-monospace', '"JetBrains Mono"', 'monospace'],
			},
		},
	},
	plugins: [],
}
