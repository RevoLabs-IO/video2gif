import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
        tsconfigPath: './tsconfig.json',
        exclude: ['tests/**/*', 'example/**/*']
      })
    ],
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/types': resolve(__dirname, 'src/types'),
        '@/utils': resolve(__dirname, 'src/utils')
      }
    },

    build: isLib ? {
      // Library build configuration
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Video2Gif',
        formats: ['es', 'umd'],
        fileName: (format) => `index.${format === 'es' ? 'js' : format === 'umd' ? 'global.js' : 'js'}`
      },
      rollupOptions: {
        // External dependencies that shouldn't be bundled
        external: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
        output: {
          // Global variable names for UMD build
          globals: {
            '@ffmpeg/ffmpeg': 'FFmpeg',
            '@ffmpeg/util': 'FFmpegUtil'
          },
          // Preserve function names for better debugging
          preserveModules: false,
          compact: true
        }
      },
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          keep_fnames: true, // Preserve function names for better debugging
          keep_classnames: true
        }
      }
    } : {
      // Demo build configuration
      outDir: 'dist-demo',
      sourcemap: true,
      minify: 'terser'
    },

    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    },

    server: {
      port: 3000,
      open: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  }
})