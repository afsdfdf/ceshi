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
  			// XAI主题色彩系统
  			"xai-purple": {
  				DEFAULT: "#8b5cf6",
  				50: "#f3f0ff",
  				100: "#e9e2ff", 
  				200: "#d6ccff",
  				300: "#b8a5ff",
  				400: "#9575ff",
  				500: "#8b5cf6",
  				600: "#7c3aed",
  				700: "#6d28d9",
  				800: "#5b21b6",
  				900: "#4c1d95",
  			},
  			"xai-cyan": {
  				DEFAULT: "#06b6d4",
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
  				DEFAULT: "#ec4899",
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
  				DEFAULT: "#10b981",
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
  				DEFAULT: "#f59e0b",
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
  			// 深色主题专用背景色
  			"dark-bg": {
  				primary: "#0f0f23",    // 深蓝紫色
  				secondary: "#1a1a2e",  // 稍浅的深蓝紫色
  				tertiary: "#16213e",   // 带紫色调的深色
  			},
  			// 浅色主题专用背景色
  			"light-bg": {
  				primary: "#ffffff",
  				secondary: "#f8fafc",
  				tertiary: "#f1f5f9",
  			},
  			// 增强的文字颜色
  			"text-enhanced": {
  				primary: "#f8fafc",    // 高对比度白色
  				secondary: "#cbd5e1",  // 中等对比度灰色
  				muted: "#94a3b8",      // 低对比度灰色
  			},
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
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)",
  		},
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
  					transform: "translateY(0px)",
  				},
  				"50%": {
  					transform: "translateY(-20px)",
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
  			"pulse-glow": {
  				"0%, 100%": {
  					boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
  				},
  				"50%": {
  					boxShadow: "0 0 40px rgba(139, 92, 246, 0.8), 0 0 60px rgba(6, 182, 212, 0.6)",
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
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			float: "float 6s ease-in-out infinite",
  			"gradient-shift": "gradient-shift 4s ease-in-out infinite",
  			"rotate-gradient": "rotate-gradient 8s linear infinite",
  			shimmer: "shimmer 2s infinite",
  			"pulse-glow": "pulse-glow 3s ease-in-out infinite",
  			"fade-in": "fade-in 0.5s ease-out",
  		},
  		backgroundImage: {
  			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
  			"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
  			"xai-gradient": "linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981, #f59e0b)",
  			"dark-gradient": "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f23 100%)",
  			"light-gradient": "linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%, #ffffff 100%)",
  		},
  		boxShadow: {
  			"xai-glow": "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)",
  			"xai-glow-cyan": "0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)",
  			"xai-glow-green": "0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)",
  			"card-enhanced": "0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.2)",
  			"card-enhanced-dark": "0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 8px rgba(0, 0, 0, 0.5)",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

