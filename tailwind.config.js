/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 PROFESSIONAL PORTFOLIO MANAGER COLORS

        // Primary - Modern Blue (Professional & Trustworthy)
        primary: {
          50: "#eff6ff", // Very light blue
          100: "#dbeafe", // Light blue
          200: "#bfdbfe", // Lighter blue
          300: "#93c5fd", // Medium light blue
          400: "#60a5fa", // Medium blue
          500: "#3b82f6", // Main primary - vibrant blue
          600: "#2563eb", // Darker blue
          700: "#1d4ed8", // Dark blue
          800: "#1e40af", // Very dark blue
          900: "#1e3a8a", // Darkest blue
          950: "#172554", // Ultra dark blue
        },

        // Secondary - Elegant Purple (Premium feel)
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7", // Main secondary - rich purple
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },

        // Success - Fresh Green (Clear positive feedback)
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Main success - vibrant green
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },

        // Error - Clear Red (Strong warning/error indication)
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444", // Main error - clear red
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },

        // Warning - Vibrant Orange (Attention-grabbing)
        warning: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Main warning - vibrant orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },

        // Info - Calming Cyan (Informational feedback)
        info: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4", // Main info - bright cyan
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },

        // Gray - Perfect neutral scale (Better than surface)
        gray: {
          50: "#f9fafb", // Almost white
          100: "#f3f4f6", // Very light gray
          200: "#e5e7eb", // Light gray
          300: "#d1d5db", // Medium light gray
          400: "#9ca3af", // Medium gray
          500: "#6b7280", // Main gray
          600: "#4b5563", // Dark gray
          700: "#374151", // Darker gray
          800: "#1f2937", // Very dark gray
          900: "#111827", // Almost black
          950: "#030712", // Ultra dark
        },

        // Financial colors for portfolio app
        financial: {
          // Profit/Loss colors
          profit: "#22c55e", // Same as success-500
          loss: "#ef4444", // Same as error-500
          neutral: "#6b7280", // Same as gray-500

          // Market colors
          bullish: "#16a34a", // Success-600 - market up
          bearish: "#dc2626", // Error-600 - market down

          // Portfolio status
          positive: "#15803d", // Success-700 - positive performance
          negative: "#b91c1c", // Error-700 - negative performance
        },

        // Background system - Clean & modern
        background: {
          primary: "#ffffff", // Pure white
          secondary: "#f9fafb", // Gray-50 - subtle background
          tertiary: "#f3f4f6", // Gray-100 - card backgrounds
          inverse: "#111827", // Gray-900 - dark mode
        },

        // Border system - Subtle yet defined
        border: {
          light: "#e5e7eb", // Gray-200 - light borders
          medium: "#d1d5db", // Gray-300 - medium borders
          strong: "#9ca3af", // Gray-400 - strong borders
          focus: "#3b82f6", // Primary-500 - focus states
        },

        // Text system - Perfect readability
        text: {
          primary: "#111827", // Gray-900 - main text
          secondary: "#374151", // Gray-700 - secondary text
          tertiary: "#6b7280", // Gray-500 - muted text
          inverse: "#ffffff", // White - inverse text
          link: "#2563eb", // Primary-600 - links
          linkHover: "#1d4ed8", // Primary-700 - link hover
        },
      },

      // Enhanced typography
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Menlo", "Monaco", "monospace"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },

      // Professional spacing
      spacing: {
        18: "4.5rem", // 72px
        22: "5.5rem", // 88px
        26: "6.5rem", // 104px
        30: "7.5rem", // 120px
        72: "18rem", // 288px
        84: "21rem", // 336px
        96: "24rem", // 384px
      },

      // Modern shadows - Subtle & elegant
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

        // Custom portfolio shadows
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "card-hover":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        modal:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(59, 130, 246, 0.5)",
      },

      // Smooth animations
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-out": "fadeOut 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "bounce-gentle": "bounceGentle 1s ease-in-out",
        "spin-slow": "spin 3s linear infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },

      // Border radius system
      borderRadius: {
        xs: "0.125rem", // 2px
        sm: "0.25rem", // 4px
        md: "0.375rem", // 6px
        lg: "0.5rem", // 8px
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
        "3xl": "1.5rem", // 24px
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
