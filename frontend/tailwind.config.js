/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#050508',
          900: '#0c0c12',
          850: '#111118',
          800: '#16161f',
          700: '#1f1f2b',
          600: '#2a2a38',
        },
        accent: {
          DEFAULT: '#5b5ef7',
          light: '#7c7ff9',
          dark: '#4346d4',
          muted: 'rgba(91, 94, 247, 0.12)',
        },
        success: '#22c55e',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(0,0,0,0.3), 0 8px 24px -4px rgba(0,0,0,0.4)',
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px -8px rgba(0,0,0,0.5)',
        'card-hover': '0 0 0 1px rgba(91,94,247,0.2), 0 16px 48px -12px rgba(0,0,0,0.6)',
        input: '0 0 0 3px rgba(91, 94, 247, 0.15)',
      },
      backgroundImage: {
        'mesh-auth':
          'radial-gradient(at 20% 30%, rgba(91,94,247,0.25) 0, transparent 50%), radial-gradient(at 80% 70%, rgba(99,102,241,0.15) 0, transparent 50%), radial-gradient(at 50% 50%, rgba(30,27,75,0.4) 0, transparent 70%)',
        'hero-gradient':
          'linear-gradient(135deg, rgba(91,94,247,0.08) 0%, transparent 50%, rgba(99,102,241,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
