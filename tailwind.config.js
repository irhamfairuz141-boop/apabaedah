// Token desain — dipisah dari index.html supaya konfigurasi Tailwind Play CDN
// tetap berjalan (harus dieksekusi tepat setelah <script src="https://cdn.tailwindcss.com">).
tailwind.config = {
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#04382a', dark: '#02241a', light: '#0b5a42' },
        parchment: '#F5F0E4',
        cream: '#FBF8F1',
        ink: '#1E1B16',
        brass: { DEFAULT: '#A9803D', light: '#C9A45F' },
        sage: '#8FA283',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    }
  }
}
