import request from 'supertest';
import app from '../index';

describe('GET /', () => {
  it('returns status JSON', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'mvp-real-estate-intelligence');
  });
});
