/**
 * goalApp.js — Self-contained Express + EJS app for Goal-Based Planning.
 *
 * This module exports the Express `app` instance (without calling .listen())
 * so that Supertest can drive it directly in functional tests.
 *
 * It uses in-memory mock data instead of Mongoose so tests run without a
 * database connection.
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();

/* ── View engine ──────────────────────────────── */
app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views'));

/* ── Static files ─────────────────────────────── */
app.use(express.static(path.join(projectRoot, 'public')));

/* ── In-memory goal data (mirrors Goal schema) ── */
const goals = [
  {
    id: 'emergency',
    title: 'Emergency Fund',
    targetAmount: 10000,
    savedAmount: 4500,
    targetDate: '2026-12-31',
    progressPercent: 45,
    isCompleted: false,
  },
  {
    id: 'saving',
    title: 'Saving',
    targetAmount: 5000,
    savedAmount: 5000,
    targetDate: '2026-09-15',
    progressPercent: 100,
    isCompleted: true,
  },
  {
    id: 'japan-trip',
    title: 'Japan Trip',
    targetAmount: 8000,
    savedAmount: 9200,
    targetDate: '2027-03-01',
    progressPercent: 100,
    isCompleted: true,
  },
];

/* ── Routes ───────────────────────────────────── */

// GET /goals — list all goals
app.get('/goals', (req, res) => {
  res.render('goals/index', { goals });
});

// GET /goals/:id — show a single goal
app.get('/goals/:id', (req, res) => {
  const goal = goals.find((g) => g.id === req.params.id);
  if (!goal) {
    return res.status(404).send('Goal not found');
  }
  res.render('goals/show', { goal });
});

/* ── 404 catch-all ────────────────────────────── */
app.use((req, res) => {
  res.status(404).send('Not Found');
});

export default app;
