/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        pixel: ['Press Start 2P', 'cursive'],
        'pixel-body': ['VT323', 'monospace'],
        retro: ['Silkscreen', 'cursive'],
      },
      animation: {
        'neon-flicker': 'neon-flicker 3s infinite alternate',
        float: 'float 3s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        'neon-flicker': {
          '0%, 18%, 22%, 25%, 53%, 57%, 100%': {
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
          },
          '20%, 24%, 55%': {
            textShadow: 'none',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-neon': {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 5px currentColor)',
          },
          '50%': {
            filter: 'brightness(1.5) drop-shadow(0 0 15px currentColor)',
          },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
