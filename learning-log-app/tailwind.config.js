/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        charcoal: '#111116',
        onyx: '#080812',
        muted: '#777985',
        pillborder: '#D8D9E0',
        limeAccent: '#B8F58A',
        panelBg: '#FEFEFE',
        cardBg: '#F8F8FB',
        cardBgAlt: '#F2F3F8',
      },
      boxShadow: {
        panel:
          '0 24px 60px -15px rgba(110, 100, 140, 0.15), 0 0 1px rgba(0, 0, 0, 0.05)',
        glassCard:
          '0 8px 30px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
      },
    },
  },
  plugins: [],
}
