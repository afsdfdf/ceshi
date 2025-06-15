import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		colors: {
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))",
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))",
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))",
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))",
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))",
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))",
  			},
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))",
  			},
  			// XAI主题色彩系统 - 优化版本
  			"xai-purple": {
  				DEFAULT: "hsl(var(--xai-primary))",
  				50: "#faf7ff",
  				100: "#f3f0ff", 
  				200: "#e9e2ff",
  				300: "#d6ccff",
  				400: "#b8a5ff",
  				500: "#8b5cf6",
  				600: "#7c3aed",
  				700: "#6d28d9",
  				800: "#5b21b6",
  				900: "#4c1d95",
  			},
  			"xai-cyan": {
  				DEFAULT: "hsl(var(--xai-secondary))",
  				50: "#ecfeff",
  				100: "#cffafe",
  				200: "#a5f3fc",
  				300: "#67e8f9",
  				400: "#22d3ee",
  				500: "#06b6d4",
  				600: "#0891b2",
  				700: "#0e7490",
  				800: "#155e75",
  				900: "#164e63",
  			},
  			"xai-pink": {
  				DEFAULT: "hsl(var(--xai-pink))",
  				50: "#fdf2f8",
  				100: "#fce7f3",
  				200: "#fbcfe8",
  				300: "#f9a8d4",
  				400: "#f472b6",
  				500: "#ec4899",
  				600: "#db2777",
  				700: "#be185d",
  				800: "#9d174d",
  				900: "#831843",
  			},
  			"xai-green": {
  				DEFAULT: "hsl(var(--xai-accent))",
  				50: "#ecfdf5",
  				100: "#d1fae5",
  				200: "#a7f3d0",
  				300: "#6ee7b7",
  				400: "#34d399",
  				500: "#10b981",
  				600: "#059669",
  				700: "#047857",
  				800: "#065f46",
  				900: "#064e3b",
  			},
  			"xai-orange": {
  				DEFAULT: "hsl(var(--xai-warning))",
  				50: "#fffbeb",
  				100: "#fef3c7",
  				200: "#fde68a",
  				300: "#fcd34d",
  				400: "#fbbf24",
  				500: "#f59e0b",
  				600: "#d97706",
  				700: "#b45309",
  				800: "#92400e",
  				900: "#78350f",
  			},
  			// 背景色彩层次系统
  			"bg-layer": {
  				primary: "hsl(var(--bg-primary))",
  				secondary: "hsl(var(--bg-secondary))",
  				tertiary: "hsl(var(--bg-tertiary))",
  				quaternary: "hsl(var(--bg-quaternary))",
  				quinary: "hsl(var(--bg-quinary))",
  			},
  			// 增强的文字颜色系统
  			"text-enhanced": {
  				primary: "hsl(var(--foreground))",
  				secondary: "hsl(var(--muted-foreground))",
  				muted: "hsl(217 11% 65%)",
  				accent: "hsl(var(--xai-primary))",
  			},
  			// 状态色彩
  			"status": {
  				success: "hsl(var(--xai-accent))",
  				warning: "hsl(var(--xai-warning))",
  				error: "hsl(var(--destructive))",
  				info: "hsl(var(--xai-secondary))",
  			},
  			// 图表色彩
  			chart: {
  				'1': 'hsl(var(--xai-primary))',
  				'2': 'hsl(var(--xai-secondary))',
  				'3': 'hsl(var(--xai-accent))',
  				'4': 'hsl(var(--xai-warning))',
  				'5': 'hsl(var(--xai-pink))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)",
  		},
  		// 优化的动画系统
  		keyframes: {
  			"accordion-down": {
  				from: { height: "0" },
  				to: { height: "var(--radix-accordion-content-height)" },
  			},
  			"accordion-up": {
  				from: { height: "var(--radix-accordion-content-height)" },
  				to: { height: "0" },
  			},
  			float: {
  				"0%, 100%": {
  					transform: "translateY(0px) rotate(0deg)",
  				},
  				"33%": {
  					transform: "translateY(-20px) rotate(2deg)",
  				},
  				"66%": {
  					transform: "translateY(-10px) rotate(-1deg)",
  				},
  			},
  			"gradient-shift": {
  				"0%, 100%": {
  					backgroundPosition: "0% 50%",
  				},
  				"50%": {
  					backgroundPosition: "100% 50%",
  				},
  			},
  			"gradient-flow": {
  				"0%": {
  					backgroundPosition: "0% 50%",
  				},
  				"20%": {
  					backgroundPosition: "100% 50%",
  				},
  				"40%": {
  					backgroundPosition: "100% 100%",
  				},
  				"60%": {
  					backgroundPosition: "50% 100%",
  				},
  				"80%": {
  					backgroundPosition: "0% 100%",
  				},
  				"100%": {
  					backgroundPosition: "0% 50%",
  				},
  			},
  			"pulse-glow": {
  				"0%, 100%": {
  					opacity: "0.3",
  					transform: "scale(1)",
  				},
  				"50%": {
  					opacity: "0.7",
  					transform: "scale(1.05)",
  				},
  			},
  			drift: {
  				"0%": {
  					transform: "translateX(0px) translateY(0px)",
  				},
  				"25%": {
  					transform: "translateX(15px) translateY(-10px)",
  				},
  				"50%": {
  					transform: "translateX(-8px) translateY(-20px)",
  				},
  				"75%": {
  					transform: "translateX(-15px) translateY(-8px)",
  				},
  				"100%": {
  					transform: "translateX(0px) translateY(0px)",
  				},
  			},
  			"rotate-gradient": {
  				"0%": {
  					transform: "rotate(0deg)",
  				},
  				"100%": {
  					transform: "rotate(360deg)",
  				},
  			},
  			shimmer: {
  				"0%": {
  					backgroundPosition: "-200% 0",
  				},
  				"100%": {
  					backgroundPosition: "200% 0",
  				},
  			},
  			"fade-in": {
  				"0%": {
  					opacity: "0",
  					transform: "translateY(10px)",
  				},
  				"100%": {
  					opacity: "1",
  					transform: "translateY(0)",
  				},
  			},
  			"slide-up": {
  				"0%": {
  					opacity: "0",
  					transform: "translateY(20px)",
  				},
  				"100%": {
  					opacity: "1",
  					transform: "translateY(0)",
  				},
  			},
  			"scale-in": {
  				"0%": {
  					opacity: "0",
  					transform: "scale(0.9)",
  				},
  				"100%": {
  					opacity: "1",
  					transform: "scale(1)",
  				},
  			},
  			"bounce-gentle": {
  				"0%, 100%": {
  					transform: "translateY(0)",
  				},
  				"50%": {
  					transform: "translateY(-5px)",
  				},
  			},
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			float: "float 6s ease-in-out infinite",
  			"gradient-shift": "gradient-shift 4s ease-in-out infinite",
  			"gradient-flow": "gradient-flow 20s ease infinite",
  			"pulse-glow": "pulse-glow 2s ease-in-out infinite",
  			drift: "drift 8s ease-in-out infinite",
  			"rotate-gradient": "rotate-gradient 8s linear infinite",
  			shimmer: "shimmer 2s linear infinite",
  			"fade-in": "fade-in 0.5s ease-out",
  			"slide-up": "slide-up 0.5s ease-out",
  			"scale-in": "scale-in 0.3s ease-out",
  			"bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
  		},
  		// 优化的阴影系统
  		boxShadow: {
  			'glow-sm': '0 0 10px hsla(var(--xai-primary), 0.3)',
  			'glow': '0 0 20px hsla(var(--xai-primary), 0.4)',
  			'glow-lg': '0 0 30px hsla(var(--xai-primary), 0.5)',
  			'card': '0 4px 16px hsla(var(--xai-primary), 0.08)',
  			'card-hover': '0 12px 32px hsla(var(--xai-primary), 0.15)',
  			'button': '0 4px 12px hsla(var(--xai-primary), 0.3)',
  			'button-hover': '0 8px 20px hsla(var(--xai-primary), 0.4)',
  		},
  		// 优化的渐变系统
  		backgroundImage: {
  			'gradient-primary': 'linear-gradient(135deg, hsl(var(--xai-primary)), hsl(var(--xai-secondary)))',
  			'gradient-secondary': 'linear-gradient(135deg, hsl(var(--xai-secondary)), hsl(var(--xai-accent)))',
  			'gradient-accent': 'linear-gradient(135deg, hsl(var(--xai-accent)), hsl(var(--xai-warning)))',
  			'gradient-rainbow': 'linear-gradient(45deg, hsl(var(--xai-primary)), hsl(var(--xai-secondary)), hsl(var(--xai-accent)), hsl(var(--xai-warning)), hsl(var(--xai-pink)))',
  			'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
  		},
  		// 优化的透明度系统
  		opacity: {
  			'15': '0.15',
  			'35': '0.35',
  			'65': '0.65',
  			'85': '0.85',
  		},
  	},
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

