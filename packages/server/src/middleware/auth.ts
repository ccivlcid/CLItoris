import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Login required' } });
    return;
  }
  next();
}

export function requireSetupComplete(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId && !req.session.pendingGithubProfile) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Login required' } });
    return;
  }
  if (!req.session.userId && req.session.pendingGithubProfile) {
    res.status(403).json({ error: { code: 'SETUP_REQUIRED', message: 'Complete profile setup first' } });
    return;
  }
  next();
}
