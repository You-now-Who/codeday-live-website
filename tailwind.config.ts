import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#000000',
        'on-primary': '#ffffff',
        'secondary-fixed': '#c3f400',
        'on-secondary-fixed': '#161e00',
        'surface': '#f9f9f9',
        'on-surface': '#1b1b1b',
        'error': '#ba1a1a',
        'outline': '#7e7576',
        'kraft': '#f5e6c8',
        'tape-lime': 'rgba(195, 244, 0, 0.65)',
        'sticky': '#fffde7',
        'pin-red': '#e63946',
        'paper': '#fafafa',
      },
      fontFamily: {
        epilogue: ['var(--font-epilogue)', 'sans-serif'],
        grotesk: ['var(--font-grotesk)', 'sans-serif'],
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px rgba(0,0,0,1)',
        'hard-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'hard-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'paper': '2px 3px 8px rgba(0,0,0,0.12)',
        'paper-lg': '4px 6px 16px rgba(0,0,0,0.15)',
        'tape': 'inset 0 0 0 1px rgba(0,0,0,0.06)',
        'stamp': '3px 3px 0 rgba(0,0,0,0.8)',
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
        'organic-sm': '2px 4px 3px 2px / 3px 2px 4px 3px',
        'organic': '4px 8px 6px 4px / 6px 4px 8px 4px',
        'organic-lg': '8px 14px 10px 8px / 10px 8px 14px 10px',
        'sticker': '50% 45% 50% 48% / 48% 50% 45% 50%',
      },
    },
  },
  plugins: [],
}

export default config
