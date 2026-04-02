import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((configEnv) => {
    // If your vite.config.ts uses a callback (defineConfig(({ mode }) => ...)),
    // you must call it with the appropriate configEnv
    const resolvedViteConfig = typeof viteConfig === 'function' 
        ? viteConfig(configEnv) 
        : viteConfig

    return mergeConfig(
        resolvedViteConfig,
        defineConfig({
            test: {
                environment: 'jsdom',
                globals: true,
                setupFiles: ['./src/tests/setup.ts'],
            },
        })
    )
})
