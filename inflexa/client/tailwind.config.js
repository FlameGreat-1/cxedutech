/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  safelist: [
    /* Mood-board utility classes used across landing page components.
     * Tailwind JIT needs these safelisted because the mood-* tokens
     * were recently introduced and must always be generated. */
    'bg-mood-toke-green',
    'text-mood-toke-green',
    'bg-mood-green',
    'bg-mood-lavender',
    'bg-mood-sage',
    'bg-mood-pink',
    'bg-mood-blue',
    'bg-mood-orange',
    'bg-mood-yellow',
    'text-mood-green',
    'text-mood-yellow-text',
    'border-mood-green',
    'border-mood-lavender',
    'border-mood-sage',
    'border-mood-pink',
  ],
  theme: {
    extend: {
      colors: {

        /* 🟢 Primary — Green (dominant brand identity: growth, learning, adaptability) */
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },

        /* 🟠 Accent — Orange (CTAs, engagement, creativity, action) */
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },

        /* 🔵 Teal — Support (trust, intelligence, info cards, offline reliability) */
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },

        /* 🟡 Highlight — Yellow (playfulness, tags, notifications, youth energy) */
        highlight: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },

        /* 🔵 Blue — Sky/Cobalt (support, trust, stability — from brand colour strip slot 5) */
        blue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        /* 🟢 Lime — Youth/Attention (brand colour strip slot 8: playful, energetic) */
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },

        /* 🎨 Mood Board Custom Colors (Direction 2) */
        mood: {
          'toke-green': '#154c21',    /* Rich dark Toke logo background       */
          green: '#5a9b5a',           /* UI Accent, Buttons, Card 1 panel       */
          'green-dark': '#3e733e',    /* Card 1 accent (label, divider, CTA)    */
          lavender: '#bec7e8',        /* FAQs Card, Footer background           */
          sage: '#d3d2bd',            /* Shipping Card                          */
          pink: '#f0c0d0',            /* Contact Us Card                        */
          blue: '#2b6fd5',            /* Card 2 panel (Vibrant Blue)            */
          'blue-dark': '#1a4e9e',     /* Card 2 accent                          */
          orange: '#ff6b00',          /* Card 3 panel (Vibrant Orange)          */
          'orange-dark': '#cc5500',   /* Card 3 accent                          */
          yellow: '#ebd93f',          /* Card 4 panel (Vibrant Yellow)          */
          'yellow-dark': '#b8a221',   /* Card 4 accent                          */
          'yellow-text': '#2a2612',   /* Dark text for yellow card contrast     */
          'panel-warm': '#f8f8f6',    /* Image panel neutral (warm)             */
          'panel-cool': '#f7f7fa',    /* Image panel neutral (cool)             */
          'panel-blush': '#faf7f8',   /* Image panel neutral (blush)            */
          'panel-mint': '#f6faf8',    /* Image panel neutral (mint)             */
        },

      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

    },
  },
  plugins: [],
};
