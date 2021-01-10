// @ts-ignore
const defaultTheme = require('tailwindcss/defaultTheme')

const purge = process.env.NODE_ENV === 'production'
  ? {
    content: [
      '../**/*.js',
      './**/*.html',
      './**/*.md',
      './**/*.njk',
      './**/*.yaml',
    ],
    options: {
      whitelistPatterns: [/snap-y-(mandatory|proximity)$/]
    }
  }
  : false

module.exports = {
  theme: {
    extend: {
      zIndex: { '-10': '-10' }
    },
    fontFamily: {
      condensed: ['"Roboto Condensed"', ...defaultTheme.fontFamily.sans],
      sans: ['Roboto', ...defaultTheme.fontFamily.sans]
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    maxWidth: {
      ...defaultTheme.maxWidth,
      '48': '12rem'
    },
    scrollSnapType: {
      'no-snap': 'none',
      'snap-y-mandatory': 'y mandatory',
      'snap-y-proximity': 'y proximity',
    },
    scrollSnapAlign: {
      'snap-none': 'none',
      'snap-start': 'start',
    }
  },
  variants: {
    scrollSnapAlign: ['responsive'],
    textColor: ['responsive', 'hover', 'focus', 'active', 'visited']
  },
  verticalRhythm: {
    defaultLineHeight: 'normal',
    fontCapHeight: {
      // Calculated using https://codepen.io/sebdesign/pen/EKmbGL?editors=0011
      'default': 0.72,
    },
    height: 0.5 // Vertical rhythm in rems
  },
  plugins: [
    // require('tailwindcss-scroll-snap'),
    require('tailwind-vertical-rhythm')
  ],
  purge,
}