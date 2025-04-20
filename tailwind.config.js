/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // 2025 trend: Neo-brutalism with vibrant accents
        primary: {
          50: '#e6f9f1',
          100: '#ccf3e2',
          200: '#99e7c5',
          300: '#66dba8',
          400: '#33cf8b',
          500: '#10b981', // Base primary
          600: '#0da46f',
          700: '#0a8f5e',
          800: '#087a4d',
          900: '#05653c',
        },
        secondary: {
          50: '#e7f5ff',
          100: '#cfebff',
          200: '#9fd7ff',
          300: '#6fc3ff',
          400: '#3fafff',
          500: '#0f9bff', // Base secondary
          600: '#0d8ce6',
          700: '#0b7bcc',
          800: '#096ab3',
          900: '#075999',
        },
        accent: {
          50: '#fff0f7',
          100: '#ffe1ef',
          200: '#ffc2df',
          300: '#ffa4d0',
          400: '#ff85c0',
          500: '#ff67b0', // Vibrant accent
          600: '#e65d9e',
          700: '#cc538c',
          800: '#b3487a',
          900: '#993e68',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0a0a',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      borderRadius: {
        // 2025 trend: Adaptive rounded corners
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'pill': '9999px',
        'blob': '76% 24% 40% 60% / 58% 49% 51% 42%', // Organic shapes
      },
      boxShadow: {
        // 2025 trend: Dimensional shadows with depth
        'neo': '5px 5px 0px 0px rgba(0,0,0,0.9)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 40px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.6)',
        'inner-glow': 'inset 0 0 15px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        // 2025 trend: Micro-interactions
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 2.5s infinite',
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        blob: {
          '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--foreground)',
            p: {
              lineHeight: '1.75',
            },
            h1: {
              fontWeight: '800',
            },
            h2: {
              fontWeight: '700',
            },
            h3: {
              fontWeight: '600',
            },
            code: {
              fontWeight: '500',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 