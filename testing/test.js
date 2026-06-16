import request from 'supertest';
import app from '../server/server.js';

describe('FT-05: Static File Delivery', () => {

  test('Returns 200 for /app.css', async () => {

    const res = await request(app).get('/app.css');

    expect(res.statusCode).toBe(200);

  });

});