import { nextui } from '@nextui-org/theme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {},
  plugins: [require('@tailwindcss/forms')],
  darkMode: 'class',
  plugins: [nextui()],
}
