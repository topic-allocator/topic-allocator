/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.tsx'],
  theme: {
    extend: {
      keyframes: {
        'pop-in': {
          from: { transform: 'translateY(-10px)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.1s ease-in-out',
      },
    },
  },
  plugins: [require('daisyui')],
};
