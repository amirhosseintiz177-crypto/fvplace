/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'] },
      colors: {
        nebula: '#07111f',
        cyanGlow: '#55f7d8',
        violetGlow: '#9d7cff',
        glass: 'rgba(255,255,255,0.08)',
      },
      boxShadow: {
        neon: '0 0 40px rgba(85,247,216,.24), inset 0 1px 0 rgba(255,255,255,.12)',
        violet: '0 0 60px rgba(157,124,255,.22)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        pulseGlow: { '0%,100%': { opacity: '.65' }, '50%': { opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
    },
  },
  plugins: [],
};
