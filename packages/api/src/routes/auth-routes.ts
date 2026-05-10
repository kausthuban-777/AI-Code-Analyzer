import { Router, Request, Response, NextFunction } from 'express';
import { AuthController, authMiddleware } from '../controllers/auth-controller';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/verify', authMiddleware, (req: Request, res: Response) => {
  res.json({ valid: true, user: (req as any).user });
});

export default router;
