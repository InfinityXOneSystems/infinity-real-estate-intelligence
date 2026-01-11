import express, { Request, Response } from 'express';
const app = express();
app.get('/', (req: Request, res: Response) => res.json({ status: 'mvp-real-estate-intelligence', uptime: process.uptime() }));

if (require.main === module) {
  app.listen(process.env.PORT || 8080, () => console.log('Demo API listening'));
}

export default app;
