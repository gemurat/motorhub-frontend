import { nextui } from '@nextui-org/theme'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {},
  darkMode: 'class',
  plugins: [forms, nextui()],
}

export default config
