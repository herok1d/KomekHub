/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#17212b',
        mist: '#f5f8f7',
        ocean: '#2f80ed',
        leaf: '#1f9d72',
        mint: '#dcf7ec',
        skysoft: '#eaf4ff',
        warm: '#fff7e7',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 33, 43, 0.08)',
        lift: '0 22px 55px rgba(23, 33, 43, 0.14)',
      },
    },
  },
  plugins: [],
};
