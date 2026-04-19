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
				sans: [
					'Zen Kaku Gothic New',
					'Inter Tight',
					'system-ui',
					'sans-serif',
				],
				serif: [
					'Shippori Mincho',
					'Inter Tight',
					'Georgia',
					'serif',
				],
				mono: [
					'JetBrains Mono',
					'ui-monospace',
					'Cascadia Code',
					'monospace',
				],
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
				ds: {
					bg:          'var(--color-bg)',
					surface:     'var(--color-surface)',
					'surface-2': 'var(--color-surface-2)',
					ink:         'var(--color-ink)',
					'ink-2':     'var(--color-ink-2)',
					muted:       'var(--color-muted)',
					accent:      'var(--color-accent)',
					'accent-fg': 'var(--color-accent-fg)',
				},
			},
			letterSpacing: {
				'tight-ds':   '-0.025em',
				'wide-ds':     '0.06em',
				'wider-ds':    '0.14em',
				'widest-ds':   '0.22em',
			},
		},
	},
	plugins: [],
}
