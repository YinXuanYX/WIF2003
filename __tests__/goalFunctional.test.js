//Module 3: Goal-Based Planning — Functional Tests (Supertest)//
 

import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../server/goalApp.js';

 // FT-01  Root Goal Route (GET /goals)
 
describe('FT-01 Root Goal Route (GET /goals)', () => {
  test('returns 200 status code', async () => {
    const res = await request(app).get('/goals');
    expect(res.status).toBe(200);
  });

  test('returns text/html content type', async () => {
    const res = await request(app).get('/goals');
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  test('body contains "My Goals"', async () => {
    const res = await request(app).get('/goals');
    expect(res.text).toContain('My Goals');
  });

  test('body lists all goal titles', async () => {
    const res = await request(app).get('/goals');
    expect(res.text).toContain('Emergency Fund');
    expect(res.text).toContain('Saving');
    expect(res.text).toContain('Japan Trip');
  });
});


 // FT-02  Dynamic Route (GET /goals/:id)
 
describe('FT-02 Dynamic Route (GET /goals/:id)', () => {
  test('renders the correct goal when "saving" is the ID', async () => {
    const res = await request(app).get('/goals/saving');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('Saving');
  });

  test('renders goal details including target amount', async () => {
    const res = await request(app).get('/goals/saving');
    expect(res.text).toContain('5,000');
  });

  test('extracts the :id parameter correctly for a different goal', async () => {
    const res = await request(app).get('/goals/emergency');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Emergency Fund');
  });
});

 // FT-03  Logic Rendering (completed goal → "Goal Achieved")

describe('FT-03 Logic Rendering', () => {
  test('completed goal detail page contains "Goal Achieved"', async () => {
 
    const res = await request(app).get('/goals/saving');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Goal Achieved');
  });

  test('over-achieved goal detail page also contains "Goal Achieved"', async () => {
    
    const res = await request(app).get('/goals/japan-trip');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Goal Achieved');
  });

  test('pending goal detail page does NOT contain "Goal Achieved"', async () => {

    const res = await request(app).get('/goals/emergency');
    expect(res.status).toBe(200);
    expect(res.text).not.toContain('Goal Achieved');
    expect(res.text).toContain('In Progress');
  });

  test('goals list page renders "Goal Achieved" badge for completed goals', async () => {
    const res = await request(app).get('/goals');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Goal Achieved');
  });
});


 // FT-04  Invalid Route Handling 

describe('FT-04 Invalid Route Handling', () => {
  test('GET /goals/invalid-page returns 404', async () => {
    const res = await request(app).get('/goals/invalid-page');
    expect(res.status).toBe(404);
  });

  test('GET /goals/nonexistent-id returns 404', async () => {
    const res = await request(app).get('/goals/nonexistent-id');
    expect(res.status).toBe(404);
  });

  test('GET /completely-unknown returns 404', async () => {
    const res = await request(app).get('/completely-unknown');
    expect(res.status).toBe(404);
  });
});

// FT-05  Static File Delivery 

describe('FT-05 Static File Delivery', () => {
  test('GET /app.css returns 200 status', async () => {
    const res = await request(app).get('/app.css');
    expect(res.status).toBe(200);
  });

  test('GET /app.css returns text/css content type', async () => {
    const res = await request(app).get('/app.css');
    expect(res.headers['content-type']).toMatch(/text\/css/);
  });

  test('GET /app.css body contains actual CSS content', async () => {
    const res = await request(app).get('/app.css');
    expect(res.text).toContain('font-family');
  });

  test('GET /nonexistent.css returns 404', async () => {
    const res = await request(app).get('/nonexistent.css');
    expect(res.status).toBe(404);
  });
});
