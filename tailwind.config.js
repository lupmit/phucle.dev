import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
      },
      colors: {
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray.700'),
            '--tw-prose-headings': theme('colors.gray.900'),
            '--tw-prose-links': theme('colors.gray.900'),
            '--tw-prose-bold': theme('colors.gray.900'),
            '--tw-prose-code': theme('colors.gray.900'),
            '--tw-prose-pre-bg': theme('colors.gray.50'),
            fontSize: '1rem !important', // 16px - mobile base
            lineHeight: '1.7 !important',
            maxWidth: 'none',
            'h1, h2, h3, h4, h5, h6': {
              fontWeight: '600 !important',
              letterSpacing: '-0.02em',
            },
            h1: {
              fontSize: '1.5rem !important', // 24px - smaller than page title (28px)
              lineHeight: '1.3 !important',
              marginTop: '0 !important',
              marginBottom: '0.8em !important',
            },
            h2: {
              fontSize: '1.25rem !important', // 20px
              lineHeight: '1.4 !important',
              marginTop: '2em !important',
              marginBottom: '0.75em !important',
            },
            h3: {
              fontSize: '1.125rem !important', // 18px
              lineHeight: '1.5 !important',
              marginTop: '1.6em !important',
              marginBottom: '0.6em !important',
            },
            h4: {
              fontSize: '1rem !important', // 16px
              lineHeight: '1.5 !important',
              marginTop: '1.5em !important',
              marginBottom: '0.5em !important',
            },
            p: {
              marginTop: '1.25em !important',
              marginBottom: '1.25em !important',
            },
            li: {
              marginTop: '0.5em !important',
              marginBottom: '0.5em !important',
            },
            'ul, ol': {
              marginTop: '1.25em !important',
              marginBottom: '1.25em !important',
            },
          },
        },
        lg: {
          css: {
            fontSize: '1.125rem !important', // 18px for desktop
            lineHeight: '1.7 !important',
            h1: {
              fontSize: '2rem !important', // 32px for desktop - smaller than title (40px)
              lineHeight: '1.3 !important',
            },
            h2: {
              fontSize: '1.625rem !important', // 26px
              lineHeight: '1.4 !important',
              marginTop: '1.7777778em !important',
              marginBottom: '0.8888889em !important',
            },
            h3: {
              fontSize: '1.375rem !important', // 22px
              lineHeight: '1.45 !important',
              marginTop: '1.5555556em !important',
              marginBottom: '0.6666667em !important',
            },
            h4: {
              fontSize: '1.125rem !important', // 18px
              lineHeight: '1.5 !important',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray.300'),
            '--tw-prose-headings': theme('colors.gray.100'),
            '--tw-prose-links': theme('colors.gray.100'),
            '--tw-prose-bold': theme('colors.gray.100'),
            '--tw-prose-code': theme('colors.gray.100'),
            '--tw-prose-pre-bg': theme('colors.gray.900'),
          },
        },
      }),
    },
  },
  plugins: [typography],
};
