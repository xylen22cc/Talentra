import express from 'express';

const apiApp = express();

apiApp.use(express.json({ limit: '50mb' }));
apiApp.use(express.urlencoded({ limit: '50mb', extended: true }));

// Lazy load the main server app to handle and catch any initialization / importing / path errors gracefully
apiApp.all('*', async (req, res) => {
  try {
    // Dynamically import the real Express application
    const { default: app } = await import('../server');
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Gateway Error] Failed to load server:', err);
    return res.status(500).json({
      error: 'Internal Server Error in Vercel Serverless Function',
      message: err?.message || String(err),
      stack: err?.stack || null,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL
      }
    });
  }
});

export default apiApp;
