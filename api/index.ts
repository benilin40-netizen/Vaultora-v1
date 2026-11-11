import app from '../server';

export default function handler(req: any, res: any) {
  if (req.query && req.query.all) {
    const subpath = Array.isArray(req.query.all) ? req.query.all.join('/') : req.query.all;
    if (!req.url.startsWith('/api/') || req.url === '/api') {
      req.url = `/api/${subpath}`;
    }
  } else {
    const forwardedUri = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'];
    if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api') && req.url !== forwardedUri) {
      req.url = forwardedUri;
    }
  }

  return (app as any)(req, res);
}
