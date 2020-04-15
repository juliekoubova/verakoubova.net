const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    fontFamily: {
      condensed: ['"Fira Sans Extra Condensed"', ...defaultTheme.fontFamily.sans],
      sans: ['"Fira Sans Condensed"', ...defaultTheme.fontFamily.sans]
    },
    extend: {
      screens: {
        short: { raw: '(max-height:' }
      }
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    }
  },
  variants: {
    textColor: ['responsive', 'hover', 'focus', 'active', 'visited']
  },
  verticalRhythm: {
    defaultLineHeight: 'normal',
    fontCapHeight: {
      // Calculated using https://codepen.io/sebdesign/pen/EKmbGL?editors=0011
      'default': 0.7,
    },
    height: 0.5 // Vertical rhythm in rems
  },
  plugins: [
    require('tailwind-vertical-rhythm')
  ]
}