import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const apiServerPlugin = () => ({
  name: 'api-server-middleware',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = req.url || '';
      if (url.startsWith('/api/health')) {
        const { default: handler } = await import('./api/health.js');
        return handler(req, res);
      }
      if (url.startsWith('/api/verdicts')) {
        const { default: handler } = await import('./api/verdicts.js');
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              req.body = JSON.parse(body);
            } catch (e) {
              req.body = {};
            }
            handler(req, res);
          });
          return;
        }
        return handler(req, res);
      }
      if (url.startsWith('/api/forexfactory')) {
        const { default: handler } = await import('./api/forexfactory.js');
        return handler(req, res);
      }
      next();
    });
  },
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Expose env variables (DATABASE_URL, etc.) to process.env for local API handlers
  Object.assign(process.env, env);
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/forexfactory': {
          target: 'https://nfs.faireconomy.media',
          changeOrigin: true,
          rewrite: (pathStr) => pathStr.replace(/^\/api\/forexfactory/, '/ff_calendar_thisweek.json'),
        },
        '/api/groq': {
          target: 'https://api.groq.com/openai/v1',
          changeOrigin: true,
          rewrite: (pathStr) => pathStr.replace(/^\/api\/groq/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
