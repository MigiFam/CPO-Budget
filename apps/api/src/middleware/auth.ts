import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import passport from 'passport';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    organizationId: string;
    status: string;
  };
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      res.status(500).json({ success: false, error: 'Authentication error' });
      return;
    }
    
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireDirector = requireRole([UserRole.DIRECTOR]);
export const requireFinance = requireRole([UserRole.DIRECTOR, UserRole.FINANCE]);
export const requirePM = requireRole([UserRole.DIRECTOR, UserRole.PROJECT_MANAGER]);
export const requireTeamAccess = requireRole([
  UserRole.DIRECTOR,
  UserRole.PROJECT_MANAGER,
  UserRole.TEAM_MEMBER
]);
