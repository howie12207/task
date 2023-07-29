import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return {
        plugins: [react()],
        base: `${process.env.VITE_BASE_URL}/`,
        define: {
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            proxy: {
                '/proxyBase': {
                    target: 'http://localhost:7071/api',
                    changeOrigin: true,
                    secure: false,
                    rewrite: path => path.replace(/^\/proxyBase/, ''),
                },
            },
        },
    };
});
