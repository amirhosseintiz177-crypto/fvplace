/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-sans)', 'sans-serif'] },
      colors: {
        nebula: '#06111f',
        cyanGlow: '#79f5cf',
        violetGlow: '#86a0ff',
        emberGlow: '#ff8f6b',
        glass: 'rgba(255,255,255,0.08)',
      },
      boxShadow: {
        neon: '0 18px 40px rgba(121,245,207,.22), inset 0 1px 0 rgba(255,255,255,.12)',
        violet: '0 20px 50px rgba(134,160,255,.24)',
        ember: '0 18px 45px rgba(255,143,107,.22)',
      },
      animation: {
        float: 'drift 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        drift: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-18px,0)' } },
        pulseGlow: { '0%,100%': { opacity: '.7' }, '50%': { opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
    },
  },
  plugins: [],
};
