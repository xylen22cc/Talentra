import serverModule from '../dist/server.cjs';

// Safely extract the Express application instance
const app = (serverModule && (serverModule as any).default && (serverModule as any).default.default)
  || (serverModule && (serverModule as any).default)
  || serverModule;

export default app;

