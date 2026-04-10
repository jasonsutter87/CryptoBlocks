import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    (monacoEditorPlugin as unknown as { default: typeof monacoEditorPlugin }).default({
      languageWorkers: ['editorWorkerService', 'typescript', 'css'],
    }),
  ],
  optimizeDeps: {
    exclude: ['pyodide'],
  },
})
