import { Router, Request, Response } from 'express';
const router = Router();

router.get('/status', (req: Request, res: Response) => res.json({ ok: true, demo: 'partner' }));
router.post('/run', (req: Request, res: Response) => res.json({ started: true }));
router.get('/properties', (req: Request, res: Response) => res.json({ properties: [] }));

export default router;
