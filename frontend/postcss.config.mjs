/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // A mudança é aqui: em vez de 'tailwindcss', usamos '@tailwindcss/postcss'
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;