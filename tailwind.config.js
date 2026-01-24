/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tc-bg': 'var(--tc-bg)',
        'tc-panel': 'var(--tc-panel)',
        'tc-green': 'var(--tc-green)',
        'tc-green-2': 'var(--tc-green-2)',
        'tc-green-dark': 'var(--tc-green-dark)',
        'tc-line-soft': 'var(--tc-line-soft)',
        'tc-shadow': 'var(--tc-shadow)',
        'header-bg': 'var(--header-bg)',
        'header-border': 'var(--header-border)',
        'text-main': 'var(--text-main)',
        'text-sub': 'var(--text-sub)',
        'text-disabled': 'var(--text-disabled)',
        'card-bg-start': 'var(--card-bg-start)',
        'card-bg-end': 'var(--card-bg-end)',
        'controls-bg-start': 'var(--controls-bg-start)',
        'controls-bg-end': 'var(--controls-bg-end)',
        'btn-bg': 'var(--btn-bg)',
        'btn-border': 'var(--btn-border)',
        'btn-text': 'var(--btn-text)',
        'input-bg': 'var(--input-bg)',
        'dropdown-bg': 'var(--dropdown-bg)',
        'modal-bg-start': 'var(--modal-bg-start)',
        'modal-bg-end': 'var(--modal-bg-end)',
        'char-item-bg': 'var(--char-item-bg)',
        'char-item-border': 'var(--char-item-border)',
      },
      boxShadow: {
        'tc-card': 'var(--tc-card-shadow)',
        'tc-btn': 'var(--tc-btn-shadow)',
        'tc-btn-active': 'var(--tc-btn-active)',
      },
      fontFamily: {
        'one-mobile': ['"ONE Mobile POP"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
