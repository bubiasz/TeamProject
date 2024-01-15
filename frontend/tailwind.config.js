module.exports = {
  darkMode: false, // or 'media' or 'class'
  content: [
    './src/**/*.{js,jsx,ts,tsx}' ,
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}
