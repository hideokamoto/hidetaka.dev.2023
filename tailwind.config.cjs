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
				heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
				body: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
				japanese: [
					'"Noto Sans JP"',
					'"Hiragino Kaku Gothic ProN"',
					'"Hiragino Sans"',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif',
				],
			},
			fontSize: {
				'heading-xl': ['clamp(36px, 6vw, 56px)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'heading-lg': ['clamp(24px, 4vw, 32px)', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
				'heading-md': ['clamp(18px, 3vw, 24px)', { lineHeight: '1.4' }],
				'body-lg': ['17px', { lineHeight: '1.7', letterSpacing: '-0.003em' }],
				'tech-mono': ['15px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
			},
			colors: {
				'bg-primary': 'var(--bg-primary)',
				'bg-secondary': 'var(--bg-secondary)',
				'bg-tertiary': 'var(--bg-tertiary)',
				'text-primary': 'var(--text-primary)',
				'text-secondary': 'var(--text-secondary)',
				'text-tertiary': 'var(--text-tertiary)',
				'accent-stripe': 'var(--accent-stripe)',
				'accent-aws': 'var(--accent-aws)',
				'accent-cloudflare': 'var(--accent-cloudflare)',
				'accent-success': 'var(--accent-success)',
			},
		},
	},
	plugins: [],
}
