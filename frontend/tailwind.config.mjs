// 1. Importar TODOS os plugins usando a sintaxe de Módulo ES
import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
const config = {
  // A seção 'darkMode' é importante para temas escuros no futuro
  darkMode: ["class"],
  
  // A seção 'content' agora escaneia TUDO dentro de 'src'
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // Prefixo opcional, útil se você precisar integrar com outra biblioteca de CSS
  prefix: "",
  
  theme: {
    // Configurações de tema padrão para consistência
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    // A seção 'extend' é onde você adicionará suas próprias cores, fontes, etc.
    extend: {
      colors: {
        // Exemplo de como adicionar cores personalizadas para o PortFlow
        'portflow-teal': {
          '50': '#f0fdfa',
          '100': '#ccfbf1',
          '200': '#99f6e4',
          '300': '#5eead4',
          '400': '#2dd4bf',
          '500': '#14b8a6', // Cor principal
          '600': '#0d9488',
          '700': '#0f766e',
          '800': '#115e59',
          '900': '#134e4a',
          '950': '#042f2e',
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  
  // Plugins essenciais
  plugins: [
    typography, // Para a classe 'prose'
    animate,    // Para animações
  ],
};

export default config;