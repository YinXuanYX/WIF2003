# WIF2003 Personal Financial Planning System

A full-stack web application for personal financial planning, built as part of the WIF2003 Web Programming course. The system helps users manage their finances through budgeting, goal tracking, investment analysis, and real-time market insights.

## Tech Stack

**Frontend**
- React 19 with React Router v7
- Vite 8 (dev server & build)
- Bootstrap 5 + Bootstrap Icons
- Chart.js / Recharts for data visualization
- TanStack React Query for server state
- Zustand for client state
- React Hook Form + Zod for form validation

**Backend**
- Node.js with Express 4
- MongoDB Atlas with Mongoose 9
- JWT authentication with HTTP-only cookies
- express-validator for request validation

## Prerequisites

- Node.js (v18 or higher)
- npm
- A MongoDB Atlas cluster (or local MongoDB instance)
- API keys for Finnhub and CoinGecko (Module 5)

## Getting Started

### 1. Clone the repository

git clone https://github.com/YinXuanYX/WIF2003.git
cd WIF2003

### 2. Install dependencies

npm install

### 3. Configure environment variables

Copy the example file and fill in your credentials:

cp .env.example .env

Edit `.env` with your values:

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/financial_planning
JWT_SECRET=<your-secret-key>
FINNHUB_API_KEY=<your-finnhub-key>
COINGECKO_API_KEY=<your-coingecko-key>

### 4. Run the application

Start both the frontend and backend concurrently:

npm run dev:full

Or run them separately:

npm run server   # Backend on port 5000
npm run dev      # Frontend on port 5173

## Testing

Tests are organized by module and type (unit, functional, integration). All tests run with Node's built-in test runner — no additional test framework required.

# Run all tests
node --test *.test.js

# Run by module
node --test cashflow.unit.test.js cashflow.functional.test.js cashflow.integration.test.js
node --test market.unit.test.js market.functional.test.js market.integration.test.js
node --test calculator.unit.test.js calculator.functional.test.js
node --test investmentProfile.test.js

# Run by type across modules
node --test *.unit.test.js
node --test *.functional.test.js
node --test *.integration.test.js
## Team

Team 04 — WIF2003 Web Programming, University of Malaya
