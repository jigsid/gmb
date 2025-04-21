/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Keep the class mode but we'll force dark class to always be applied
  theme: {
    extend: {
      colors: {
        // Modern Professional SaaS Color Palette
        primary: {
          50: '#eef5ff',
          100: '#d9eaff',
          200: '#b5d4ff',
          300: '#7ab4ff',
          400: '#3d8eff',
          500: '#1a6efa', // Primary blue
          600: '#0a52ef',
          700: '#0c41d6',
          800: '#1236ad',
          900: '#142e89',
        },
        secondary: {
          50: '#f1f1fe',
          100: '#e4e4fd',
          200: '#cdcdfb',
          300: '#b1b2f8',
          400: '#9594f4',
          500: '#6366f1', // Indigo secondary
          600: '#4d43e9',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          50: '#fdeef6',
          100: '#fcdeed',
          200: '#fac0e0',
          300: '#f897cd',
          400: '#f471b5',
          500: '#ec4899', // Pink accent
          600: '#d61f80',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
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
          800: '#1a2236', // SaaS dark background
          900: '#0f1729', // Deeper SaaS background
          950: '#0a1120', // Almost black with a hint of blue
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
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'float': '0 20px 40px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(26, 110, 250, 0.6)',
        'inner-glow': 'inset 0 0 15px rgba(26, 110, 250, 0.35)',
        'card': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'dropdown': '0 8px 16px rgba(0, 0, 0, 0.25)',
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
              letterSpacing: '-0.02em',
            },
            h2: {
              fontWeight: '700',
              letterSpacing: '-0.015em',
            },
            h3: {
              fontWeight: '600',
              letterSpacing: '-0.01em',
            },
            code: {
              fontWeight: '500',
              borderRadius: '0.25rem',
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