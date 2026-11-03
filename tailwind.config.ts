import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	mode: "jit",
	theme: {
    	extend: {
    		spacing: {
    			'0.5': 'var(--space-0_5)',
    			'1': 'var(--space-1)',
    			'1.5': 'var(--space-1_5)',
    			'2': 'var(--space-2)',
    			'2.5': 'var(--space-2_5)',
    			'3': 'var(--space-3)',
    			'3.5': 'var(--space-3_5)',
    			'4': 'var(--space-4)',
    			'5': 'var(--space-5)',
    			'6': 'var(--space-6)',
    			'7': 'var(--space-7)',
    			'8': 'var(--space-8)',
    			'9': 'var(--space-9)',
    			'10': 'var(--space-10)',
    			'11': 'var(--space-11)',
    			'12': 'var(--space-12)',
    			'14': 'var(--space-14)',
    			'16': 'var(--space-16)',
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			warning: {
    				DEFAULT: 'hsl(var(--warning))',
    				foreground: 'hsl(var(--warning-foreground))'
    			},
    			success: {
    				DEFAULT: 'hsl(var(--success))',
    				foreground: 'hsl(var(--success-foreground))'
    			},
    			info: {
    				DEFAULT: 'hsl(var(--info))',
    				foreground: 'hsl(var(--info-foreground))'
    			},
    			border: 'hsl(var(--border) / var(--border-strength))',
    			input: 'hsl(var(--input) / var(--border-strength))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border) / var(--border-strength))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		fontFamily: {
    			sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    			heading: ['var(--font-heading)', 'ui-sans-serif', 'system-ui', 'sans-serif']
    		},
    		fontSize: {
    			xs: ['var(--text-xs)', { lineHeight: 'var(--leading-xs)' }],
    			sm: ['var(--text-sm)', { lineHeight: 'var(--leading-sm)' }],
    			base: ['var(--text-base)', { lineHeight: 'var(--leading-base)' }],
    			lg: ['var(--text-lg)', { lineHeight: 'var(--leading-lg)' }],
    			xl: ['var(--text-xl)', { lineHeight: 'var(--leading-xl)' }],
    			'2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-2xl)' }],
    			'3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-3xl)' }],
    			'4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-4xl)' }]
    		},
    		boxShadow: {
    			sm: 'var(--shadow-sm)',
    			DEFAULT: 'var(--shadow-card)',
    			md: 'var(--shadow-md)',
    			lg: 'var(--shadow-lg)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'var(--radius-button)',
    			sm: 'calc(var(--radius) - 4px)',
    			xl: 'var(--radius-card)',
    			dialog: 'var(--radius-dialog)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			marquee: {
    				from: { transform: 'translateX(0)' },
    				to: { transform: 'translateX(-50%)' }
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			marquee: 'marquee 24s linear infinite'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
