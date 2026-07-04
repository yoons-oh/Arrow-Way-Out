export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        block: '0 12px 24px rgba(54, 67, 120, 0.18)',
      },
    },
  },
  plugins: [],
};
