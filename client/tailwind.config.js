/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6F00',
          dark: '#9e4200',
          tint: '#FFF3E0',
        },
        secondary: {
          DEFAULT: '#1B4332',
          mid: '#2D6A4F',
          tint: '#D8F3DC',
        },
        background: '#F7F5F0',
        surface: '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'text-muted': '#6B6B6B',
        'text-tertiary': '#9E9E9E',
        border: {
          DEFAULT: '#E0E0E0',
          light: '#E8E8E8',
        },
        success: '#2E7D32',
        warning: '#E65100',
        danger: '#BA1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        'card-lg': '16px',
        btn: '10px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1)',
        nav: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'bottom-bar': '0 -2px 12px rgba(0, 0, 0, 0.06)',
        modal: '0 16px 48px rgba(0, 0, 0, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
