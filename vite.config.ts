import { defineConfig } from 'vite'
import 'vitest/config'

export default defineConfig({
	test: {
		includeSource: ['src/**/*.test.ts'],
		coverage: {
			// provider: 'istanbul',
		},
	},

	build: {
		lib: {
			entry: 'src/index.ts',
			name: '@san-net/hookable',
			formats: ['es', 'cjs'],
			fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
		},
	},
})
