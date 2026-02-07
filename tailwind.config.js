import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-links': theme('colors.blue.600'),
            maxWidth: 'none',
          },
        },
        invert: {
          css: {
            '--tw-prose-links': theme('colors.blue.400'),
          },
        },
      }),
    },
  },
  plugins: [typography],
};
