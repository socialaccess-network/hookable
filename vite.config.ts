import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		emptyOutDir: true,
		lib: {
			entry: new URL('./src/index.ts', import.meta.url).pathname,
			name: '@sa-net/hookable',
			fileName: format => (format === 'es' ? 'index.mjs' : 'index.cjs'),
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			external: ['@sa-net/utils'],
		},
	},
	plugins: [dts()],
})
