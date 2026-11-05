import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const appUrl = process.env.APP_URL;
  let isHttps = false;
  let clientPort: number | undefined;

  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      isHttps = parsed.protocol === 'https:';
      clientPort = parsed.port ? parseInt(parsed.port, 10) : (isHttps ? 443 : 80);
    } catch {
      // ignore URL parsing error
    }
  } else if (process.env.K_SERVICE || (process.env.PORT && process.env.PORT !== '3000')) {
    isHttps = true;
    clientPort = 443;
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      ws: {
        clientPort: clientPort || (isHttps ? 443 : undefined),
        protocol: isHttps ? 'wss' : undefined,
      },
      hmr: {
        clientPort: clientPort || (isHttps ? 443 : undefined),
        protocol: isHttps ? 'wss' : undefined,
      },
    },
  };
});
