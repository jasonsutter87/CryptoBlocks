/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.{html,md}",
    "./assets/**/*.js",
    "./assets/scss/**/*.scss",
  ],
  safelist: [
    { pattern: /^(w|h)-(full|auto|1\/2|1\/3|2\/3|1\/4|3\/4)$/ },
    { pattern: /^(sm|md|lg|xl):w-(full|1\/2|1\/3|1\/4)$/ },
    { pattern: /^(p|m|py|px|my|mx|pt|pb|mt|mb)-[0-8]$/ },
    { pattern: /^(md|lg):(py|px|p|m|mt|mb)-[0-8]$/ },
    { pattern: /^gap-[0-6]$/ },
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/ },
    { pattern: /^font-(normal|medium|semibold|bold|extrabold)$/ },
    { pattern: /^(hidden|block|flex|grid|inline-flex)$/ },
    { pattern: /^(md|lg):(hidden|block|flex)$/ },
    { pattern: /^text-(left|center|right)$/ },
    { pattern: /^(md|lg):text-(left|center|right)$/ },
    { pattern: /^bg-(gray|red|green|blue|emerald|purple|amber|sky|violet|rose|orange)-(50|100|200|300|400|500|600|700|800)$/ },
    { pattern: /^text-gray-(300|400|500|600|700|800)$/ },
    'bg-white', 'bg-black', 'bg-transparent',
    'text-white', 'text-black',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-white', 'focus:ring-offset-2',
  ],
  theme: {
    extend: {
      colors: {
        // CryptoBlocks brand — bright, playful, kid-friendly
        'primary': '#3B82F6',     // Blue — main brand
        'secondary': '#8B5CF6',   // Purple — code/peek
        'accent': '#F59E0B',      // Amber — CTAs, highlights
        'success': '#10B981',     // Green — run/success
        'danger': '#EF4444',      // Red — errors/stop
        'warning': '#F59E0B',     // Amber
        'info': '#06B6D4',        // Cyan
        'light': '#F8FAFC',       // Slate-50
        'dark': '#1E293B',        // Slate-800

        // Block category colors (from the app)
        'block-basics': '#4C97AF',
        'block-math': '#5B80A5',
        'block-text': '#8B5CF6',
        'block-logic': '#059669',
        'block-lists': '#D97706',
        'block-data': '#0891B2',
        'block-web': '#DC2626',
      },
      fontFamily: {
        'sans': ['Nunito', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      maxWidth: {
        '1340': '1340px',
      },
    },
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
      'xxl': '1400px',
    },
  },
  plugins: [],
}
