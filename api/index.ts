import express from 'express';

const apiApp = express();

apiApp.use(express.json({ limit: '50mb' }));
apiApp.use(express.urlencoded({ limit: '50mb', extended: true }));

apiApp.all('*', async (req, res) => {
  try {
    // We import the pre-bundled CommonJS server build which contains all server logic
    // of server.ts, db.ts, gemini.ts, and database connections.
    // This removes any runtime TypeScript transpilation issues on Vercel serverless functions.
    // @ts-ignore
    const serverModule = await import('../dist/server.cjs');
    const app = serverModule.default || serverModule;
    
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Gateway Error] Failed to load server bundle:', err);
    return res.status(500).json({
      error: 'Internal Server Error in Vercel Serverless Function',
      message: err?.message || String(err),
      stack: err?.stack || null,
      cwd: process.cwd()
    });
  }
});

export default apiApp;
