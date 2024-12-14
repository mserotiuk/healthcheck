import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import { createProxyMiddleware } from 'http-proxy-middleware';

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            router: (req) => {
              const url = req.url.replace(/^\/api\//, '');
              return url;
            },
             onProxyReq: (proxyReq, req) => {
                const url = req.url.replace(/^\/api\//, '');
                proxyReq.path = url;
                console.log('Proxying request to:', proxyReq.path);
              }
          }
        }
      }
    })
