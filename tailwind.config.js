/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './libs/**/*.{ts,tsx,js,jsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      colors: {
        'saubio-forest': '#0F3D34',
        'saubio-moss': '#1F6F5B',
        'saubio-leaf': '#2A7F66',
        'saubio-emerald': '#3CB78B',
        'saubio-sun': '#F6C945',
        'saubio-cream': '#F5F0E6',
        'saubio-mist': '#F8F8F4',
        'saubio-slate': '#1F2A2A',
      },
      maxWidth: {
        '8xl': '96rem',
      },
      boxShadow: {
        'soft-lg': '0 30px 60px -40px rgba(15, 61, 52, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, rgba(15,61,52,1) 0%, rgba(31,111,91,1) 100%)',
      },
    },
  },
  plugins: [],
};
