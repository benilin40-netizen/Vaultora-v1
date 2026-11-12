import app from '../server';

export default function handler(req: any, res: any) {
  // Ensure req.url correctly preserves /api prefix across Vercel serverless invocations
  if (req.url) {
    if (req.url === '/' || req.url === '') {
      req.url = '/api/health';
    } else if (!req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
  }

  // Also handle query.all if present from dynamic catch-all route matching
  if (req.query && req.query.all) {
    const subpath = Array.isArray(req.query.all) ? req.query.all.join('/') : req.query.all;
    if (subpath) {
      req.url = `/api/${subpath}`;
    }
  }

  return (app as any)(req, res);
}
