// ============================================================
// market.test.js — Module 5: Market Insights & Analysis
// WIF2003 Personal Financial Planning System · Team 04
// ============================================================
// Run:  node market.test.js
// ============================================================

// --- Imports ---
import { validationResult } from 'express-validator';
import {
  validateCryptoChart,
  validateEquityQuote,
  validateMarketNews,
} from './server/validators/marketValidators.js';
import CURRENCY_CONFIG, {
  CURRENCY_SYMBOLS,
  CURRENCY_LABELS,
  CURRENCY_LIST,
  CURRENCY_OPTIONS,
} from './src/utils/currencies.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- TestHelpers ---
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function money(value) {
  return Number(value.toFixed(2));
}

function assertMoney(actual, expected, message) {
  assertEqual(money(actual), money(expected), message);
}

// --- ReplicatedPureFunctions ---

function computeConversions(rates, sourceCurrency, parsedAmount, currencyConfigKeys) {
  if (!rates || !rates[sourceCurrency]) return null;
  const sourceRate = rates[sourceCurrency];
  return currencyConfigKeys
    .filter((key) => key !== sourceCurrency)
    .map((key) => {
      const targetRate = rates[key];
      const converted = parsedAmount * (targetRate / sourceRate);
      return { key, converted };
    });
}

function formatConverted(value, config) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (Math.abs(value) >= 1000000) {
    return `${config.prefix}${(value / 1000000).toFixed(2)}M`;
  }
  const decimals = config.code === 'JPY' ? 0 : 2;
  return `${config.prefix}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function normalizeDaysKey(daysKey) {
  if (!daysKey) return '30d';
  const value = String(daysKey);
  return value.endsWith('d') ? value : `${value}d`;
}

function computeTrendDelta(prices) {
  const currentPrice = prices[prices.length - 1][1];
  const prevPrice = prices[prices.length - 2][1];
  const priceChange = currentPrice - prevPrice;
  const changePercent = ((priceChange / prevPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;
  return { currentPrice, prevPrice, priceChange, changePercent, isPositive };
}

function resolveTrendViewState(isLoading, isError, data) {
  if (isLoading) return 'skeleton';
  if (isError || !data?.prices?.length) return 'fallback';
  return 'chart';
}

function resolveMarketPageProps(currency, rates) {
  return {
    cryptoChart: { currency },
    equityCard1: { currency, rate: rates?.[currency] ?? null },
    equityCard2: { currency, rate: rates?.[currency] ?? null },
    converterCard: { rates },
  };
}

function resolveConverterViewState(rates) {
  return rates === null ? 'skeleton' : 'loaded';
}

// --- MockRequestHelper(express-validatorisolation) ---
function mockReq({ params = {}, query = {}, body = {} } = {}) {
  return { params, query, body };
}

async function runValidation(chain, reqOpts) {
  const req = mockReq(reqOpts);
  for (const validator of chain) {
    if (typeof validator.run === 'function') {
      await validator.run(req);
    }
  }
  return validationResult(req);
}

const SERVER_ALLOWED = ['usd', 'eur', 'gbp', 'jpy', 'myr', 'sgd'];

// UNIT TEST GROUPS

const unitTestGroups = [
  // ── UT-05-01 ─────────────────────────────────────────────
  {
    id: 'UT-05-01',
    module: 'CurrencyConverterCard.jsx — conversions memo',
    description:
      'Validates cross-rate arithmetic, zero-amount edge, missing-source null guard, and self-exclusion.',
    preconditions: 'Pure function replication of conversion memo.',
    testData: 'rates objects, source currency, amount',
    cases: [
      {
        description: 'Normal cross-rate: 100 USD → MYR ≈ 447, EUR ≈ 92',
        expected: 'Correct converted amounts',
        run: () => {
          const rates = { usd: 1, myr: 4.47, eur: 0.92 };
          const result = computeConversions(rates, 'usd', 100, Object.keys(rates));
          assertTrue(result !== null, 'Should not be null');
          const myr = result.find((r) => r.key === 'myr');
          const eur = result.find((r) => r.key === 'eur');
          assertMoney(myr.converted, 447, 'MYR conversion');
          assertMoney(eur.converted, 92, 'EUR conversion');
        },
      },
      {
        description: 'Amount === 0 → all conversions are 0',
        expected: 'Every converted value = 0',
        run: () => {
          const rates = { usd: 1, myr: 4.47, eur: 0.92 };
          const result = computeConversions(rates, 'usd', 0, Object.keys(rates));
          assertTrue(result !== null, 'Should return an array');
          result.forEach((r) => {
            assertEqual(r.converted, 0, `${r.key} should be 0 when amount is 0`);
          });
        },
      },
      {
        description: 'Missing sourceRate → returns null',
        expected: 'null',
        run: () => {
          const rates = { myr: 4.47 };
          const result = computeConversions(rates, 'usd', 100, ['usd', 'myr']);
          assertEqual(result, null, 'Should return null when source currency not in rates');
        },
      },
      {
        description: 'Self-exclusion: source currency not in output array',
        expected: 'usd excluded from output',
        run: () => {
          const rates = { usd: 1, myr: 4.47, eur: 0.92 };
          const result = computeConversions(rates, 'usd', 100, Object.keys(rates));
          const hasUsd = result.some((r) => r.key === 'usd');
          assertTrue(!hasUsd, 'Source currency should be excluded from output');
        },
      },
    ],
  },

  // ── UT-05-02 ─────────────────────────────────────────────
  {
    id: 'UT-05-02',
    module: 'CurrencyConverterCard.jsx — formatConverted()',
    description:
      'Validates null/NaN guard, JPY zero-decimal, 1M+ abbreviation, and standard 2-decimal formatting.',
    preconditions: 'Pure function replication.',
    testData: 'Various values and config objects',
    cases: [
      {
        description: 'Normal 2-decimal formatting',
        expected: '$1,234.56',
        run: () => {
          const result = formatConverted(1234.56, { prefix: '$', code: 'USD' });
          assertEqual(result, '$1,234.56', 'Standard 2-decimal format');
        },
      },
      {
        description: 'null input → dash',
        expected: '—',
        run: () => {
          assertEqual(formatConverted(null, { prefix: '$', code: 'USD' }), '—', 'Null should return dash');
        },
      },
      {
        description: 'NaN input → dash',
        expected: '—',
        run: () => {
          assertEqual(formatConverted(NaN, { prefix: '$', code: 'USD' }), '—', 'NaN should return dash');
        },
      },
      {
        description: 'Large value (≥1M) → abbreviated with M suffix',
        expected: '$2.50M',
        run: () => {
          assertEqual(formatConverted(2500000, { prefix: '$', code: 'USD' }), '$2.50M', '2.5M abbreviation');
        },
      },
      {
        description: 'JPY: 0 decimal places, rounded',
        expected: '¥1,235 (rounded from 1234.56)',
        run: () => {
          const result = formatConverted(1234.56, { prefix: '¥', code: 'JPY' });
          assertEqual(result, '¥1,235', 'JPY should round to 0 decimals');
        },
      },
    ],
  },

  // ── UT-05-03 ─────────────────────────────────────────────
  {
    id: 'UT-05-03',
    module: 'useMarketChart.js — normalizeDaysKey()',
    description:
      'Validates passthrough, default fallback, and d-suffix appending.',
    preconditions: 'Pure function replication.',
    testData: 'daysKey strings and undefined',
    cases: [
      {
        description: 'Passthrough: "30d" → "30d"',
        expected: '30d',
        run: () => assertEqual(normalizeDaysKey('30d'), '30d', 'Should passthrough'),
      },
      {
        description: 'Undefined → "30d" (default)',
        expected: '30d',
        run: () => assertEqual(normalizeDaysKey(undefined), '30d', 'Undefined should default to 30d'),
      },
      {
        description: '"7" → "7d" (appends d)',
        expected: '7d',
        run: () => assertEqual(normalizeDaysKey('7'), '7d', 'Should append d suffix'),
      },
      {
        description: '"365d" → "365d" (already suffixed)',
        expected: '365d',
        run: () => assertEqual(normalizeDaysKey('365d'), '365d', 'Should passthrough'),
      },
      {
        description: 'queryFn strips d suffix: "30d".replace("d","") → "30"',
        expected: '30',
        run: () => assertEqual('30d'.replace('d', ''), '30', 'Suffix strip for API param'),
      },
    ],
  },

  // ── UT-05-04 ─────────────────────────────────────────────
  {
    id: 'UT-05-04',
    module: 'marketValidators.js — validator chains in isolation',
    description:
      'Runs express-validator chains via chain.run(mockReq) — no server, no auth, no DB. ' +
      'All /api/market/* routes are behind router.use(protect), so HTTP-level tests would ' +
      'get 401 before the validators execute.',
    preconditions: 'express-validator importable, chains exported.',
    testData: 'Mock req objects with valid/invalid params/query',
    cases: [
      {
        description: 'validateCryptoChart: valid params + query → no errors',
        expected: 'result.isEmpty() === true',
        run: async () => {
          const result = await runValidation(validateCryptoChart, {
            params: { coinId: 'bitcoin' },
            query: { days: '30', currency: 'usd' },
          });
          assertTrue(result.isEmpty(), 'Valid crypto chart request should pass all validators');
        },
      },
      {
        description: 'validateCryptoChart: days=15 not in allowlist (coinId supplied to isolate)',
        expected: 'result.isEmpty() === false (days only)',
        run: async () => {
          const result = await runValidation(validateCryptoChart, {
            params: { coinId: 'bitcoin' },
            query: { days: '15' },
          });
          assertTrue(!result.isEmpty(), 'days=15 should fail — not in [1,7,14,30,90,365]');
          const errors = result.array();
          assertTrue(
            errors.some((e) => e.path === 'days'),
            'Error should be on the "days" field specifically',
          );
        },
      },
      {
        description: 'validateCryptoChart: currency=xyz not in allowlist (coinId supplied to isolate)',
        expected: 'result.isEmpty() === false (currency only)',
        run: async () => {
          const result = await runValidation(validateCryptoChart, {
            params: { coinId: 'bitcoin' },
            query: { currency: 'xyz' },
          });
          assertTrue(!result.isEmpty(), 'currency=xyz should fail');
          const errors = result.array();
          assertTrue(
            errors.some((e) => e.path === 'currency'),
            'Error should be on the "currency" field specifically',
          );
        },
      },
      {
        description: 'validateCryptoChart: empty coinId → .notEmpty() rejects',
        expected: 'result.isEmpty() === false',
        run: async () => {
          const result = await runValidation(validateCryptoChart, {
            params: { coinId: '' },
          });
          assertTrue(!result.isEmpty(), 'Empty coinId should be rejected');
        },
      },
      {
        description: 'validateCryptoChart: coinId 51 chars → maxLength:50 exceeded',
        expected: 'result.isEmpty() === false',
        run: async () => {
          const result = await runValidation(validateCryptoChart, {
            params: { coinId: 'A'.repeat(51) },
          });
          assertTrue(!result.isEmpty(), '51-char coinId should be rejected');
        },
      },
      {
        description: 'validateEquityQuote: lowercase "aapl" → .isUppercase() rejects',
        expected: 'result.isEmpty() === false',
        run: async () => {
          const result = await runValidation(validateEquityQuote, {
            params: { symbol: 'aapl' },
          });
          assertTrue(!result.isEmpty(), 'Lowercase symbol should be rejected');
        },
      },
      {
        description: 'validateEquityQuote: 6-char "ABCDEF" → maxLength:5 exceeded',
        expected: 'result.isEmpty() === false',
        run: async () => {
          const result = await runValidation(validateEquityQuote, {
            params: { symbol: 'ABCDEF' },
          });
          assertTrue(!result.isEmpty(), '6-char symbol should be rejected');
        },
      },
      {
        description: 'validateMarketNews: category=sports → not in allowlist',
        expected: 'result.isEmpty() === false',
        run: async () => {
          const result = await runValidation(validateMarketNews, {
            query: { category: 'sports' },
          });
          assertTrue(!result.isEmpty(), '"sports" not in [general,forex,crypto,merger]');
        },
      },
    ],
  },

  // ── UT-05-05 ─────────────────────────────────────────────
  {
    id: 'UT-05-05',
    module: 'currencies.js — configuration structural integrity',
    description:
      'Verifies all derived exports are consistent and client keys match server ALLOWED_CURRENCIES.',
    preconditions: 'currencies.js importable (pure .js, no React deps).',
    testData: 'CURRENCY_CONFIG, CURRENCY_SYMBOLS, CURRENCY_LIST, etc.',
    cases: [
      {
        description: 'CURRENCY_CONFIG has exactly 6 entries',
        expected: '6 keys: usd, eur, gbp, jpy, myr, sgd',
        run: () => {
          const keys = Object.keys(CURRENCY_CONFIG);
          assertEqual(keys.length, 6, 'Should have 6 currencies');
        },
      },
      {
        description: 'CURRENCY_SYMBOLS keys match CURRENCY_CONFIG keys',
        expected: 'Exact set equality',
        run: () => {
          const configKeys = Object.keys(CURRENCY_CONFIG).sort().join(',');
          const symbolKeys = Object.keys(CURRENCY_SYMBOLS).sort().join(',');
          assertEqual(symbolKeys, configKeys, 'CURRENCY_SYMBOLS keys should match CURRENCY_CONFIG');
        },
      },
      {
        description: 'CURRENCY_LIST length matches CURRENCY_CONFIG length',
        expected: '6 entries',
        run: () => {
          assertEqual(CURRENCY_LIST.length, 6, 'CURRENCY_LIST should have 6 entries');
        },
      },
      {
        description: 'Client keys match server allowed currencies',
        expected: 'Exact match with server allowlist',
        run: () => {
          const clientKeys = Object.keys(CURRENCY_CONFIG).sort().join(',');
          const serverKeys = SERVER_ALLOWED.sort().join(',');
          assertEqual(
            clientKeys,
            serverKeys,
            'Client CURRENCY_CONFIG keys must match server ALLOWED_CURRENCIES — a mismatch means a UI-selectable currency the API would reject',
          );
        },
      },
    ],
  },

  // ── UT-05-06 ─────────────────────────────────────────────
  {
    id: 'UT-05-06',
    module: 'MarketTrendsCard.jsx — priceChange / changePercent / isPositive',
    description:
      'Validates trend delta computation.',
    preconditions: 'Pure function replication of component logic.',
    testData: 'Price arrays of various lengths',
    cases: [
      {
        description: 'Normal uptrend: 95000 → 96000 → 97000',
        expected: 'priceChange = 1000, changePercent = "1.04", isPositive = true',
        run: () => {
          const r = computeTrendDelta([[0, 95000], [1, 96000], [2, 97000]]);
          assertEqual(r.priceChange, 1000, 'priceChange mismatch');
          assertEqual(r.changePercent, '1.04', 'changePercent mismatch');
          assertEqual(r.isPositive, true, 'Should be positive');
        },
      },
      {
        description: 'Flat prices: 50000 → 50000 → priceChange = 0, isPositive = true (>= 0)',
        expected: 'priceChange = 0, changePercent = "0.00", isPositive = true',
        run: () => {
          const r = computeTrendDelta([[0, 50000], [1, 50000]]);
          assertEqual(r.priceChange, 0, 'priceChange should be 0');
          assertEqual(r.changePercent, '0.00', 'changePercent should be 0.00');
          assertEqual(r.isPositive, true, 'Flat is >= 0, so isPositive = true');
        },
      },
      {
        description: 'Downtrend: 100000 → 95000',
        expected: 'priceChange = -5000, isPositive = false',
        run: () => {
          const r = computeTrendDelta([[0, 100000], [1, 95000]]);
          assertEqual(r.priceChange, -5000, 'priceChange mismatch');
          assertEqual(r.isPositive, false, 'Should be negative');
        },
      },
      {
        description: 'Single price point handling',
        expected: 'Produces NaN',
        run: () => {
          assertEqual(
            resolveTrendViewState(false, false, { prices: [[0, 50000]] }),
            'chart',
            'Guard allows single-element array'
          );
          let crashed = false;
          try {
            computeTrendDelta([[0, 50000]]);
          } catch (e) {
            crashed = true;
          }
          assertTrue(crashed, 'Should throw error');
        },
      },
    ],
  },
];

// FUNCTIONAL TEST GROUPS — Pure Logic (no server needed)

const functionalPureGroups = [
  // ── FT-05-04 ─────────────────────────────────────────────
  {
    id: 'FT-05-04',
    module: 'MarketInsightsPage.jsx — currency view-state transition',
    description:
      'Verifies CurrencySelector value fans out to CryptoChart, EquityQuoteCard, CurrencyConverterCard.',
    preconditions: 'Pure function replication of prop wiring.',
    testData: 'currency + rates combinations',
    cases: [
      {
        description: 'currency = "usd", rates present → all props populated',
        expected: 'cryptoChart.currency = "usd", equityCard.rate = 1',
        run: () => {
          const props = resolveMarketPageProps('usd', { usd: 1, myr: 4.47, eur: 0.92 });
          assertEqual(props.cryptoChart.currency, 'usd', 'Crypto chart currency');
          assertEqual(props.equityCard1.rate, 1, 'Equity card rate');
          assertTrue(props.converterCard.rates !== null, 'Converter should have rates');
        },
      },
      {
        description: 'currency = "myr" → rate changes to 4.47',
        expected: 'equityCard.rate = 4.47',
        run: () => {
          const props = resolveMarketPageProps('myr', { usd: 1, myr: 4.47, eur: 0.92 });
          assertEqual(props.cryptoChart.currency, 'myr', 'Crypto chart currency should be myr');
          assertEqual(props.equityCard1.rate, 4.47, 'Equity card rate should be 4.47');
        },
      },
      {
        description: 'rates = null → equityCard.rate = null (null-safe via ??)',
        expected: 'equityCard.rate = null',
        run: () => {
          const props = resolveMarketPageProps('jpy', null);
          assertEqual(props.equityCard1.rate, null, 'Rate should be null when rates is null');
        },
      },
    ],
  },

  // ── FT-05-05 ─────────────────────────────────────────────
  {
    id: 'FT-05-05',
    module: 'MarketTrendsCard.jsx — fallback view-state routing',
    description:
      'Verifies skeleton → fallback → chart view state transitions.',
    preconditions: 'Pure function replication of branching.',
    testData: 'isLoading / isError / data combinations',
    cases: [
      {
        description: 'isLoading: true → skeleton',
        expected: 'skeleton',
        run: () => assertEqual(resolveTrendViewState(true, false, null), 'skeleton', 'Loading → skeleton'),
      },
      {
        description: 'isError: true → fallback',
        expected: 'fallback',
        run: () => assertEqual(resolveTrendViewState(false, true, null), 'fallback', 'Error → fallback'),
      },
      {
        description: 'Empty prices array → fallback',
        expected: 'fallback',
        run: () =>
          assertEqual(
            resolveTrendViewState(false, false, { prices: [] }),
            'fallback',
            'Empty prices → fallback',
          ),
      },
      {
        description: 'Valid prices → chart',
        expected: 'chart',
        run: () =>
          assertEqual(
            resolveTrendViewState(false, false, { prices: [[0, 50000], [1, 51000]] }),
            'chart',
            'Valid prices → chart',
          ),
      },
    ],
  },

  // ── FT-05-06 ─────────────────────────────────────────────
  {
    id: 'FT-05-06',
    module: 'CurrencyConverterCard.jsx — loading view state',
    description:
      'Verifies skeleton vs loaded state based on rates prop.',
    preconditions: 'Pure function replication of branching.',
    testData: 'rates: null | object',
    cases: [
      {
        description: 'rates = null → skeleton',
        expected: 'skeleton',
        run: () => assertEqual(resolveConverterViewState(null), 'skeleton', 'Null rates → skeleton'),
      },
      {
        description: 'rates = { usd: 1, myr: 4.47 } → loaded',
        expected: 'loaded',
        run: () =>
          assertEqual(resolveConverterViewState({ usd: 1, myr: 4.47 }), 'loaded', 'Rates present → loaded'),
      },
    ],
  },
];

// ── IT-05-02 + IT-05-03 (static file checks — no server needed) ──
const integrationStaticGroups = [
  {
    id: 'IT-05-02',
    module: 'Shared market cache — CryptoChart ↔ MarketTrendsCard',
    description:
      'Verifies React Query cache key consistency.',
    preconditions: 'Source files readable from project root.',
    testData: 'File contents of useMarketChart.js, CryptoChart.jsx, MarketTrendsCard.jsx',
    cases: [
      {
        description: 'useMarketChart.js uses query key ["market", coinId, normalizedKey, currency]',
        expected: 'queryKey pattern found in source',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/hooks/useMarketChart.js'), 'utf-8');
          assertTrue(
            content.includes("queryKey: ['market', coinId, normalizedKey, currency]"),
            'useMarketChart should use queryKey: [\'market\', coinId, normalizedKey, currency]',
          );
        },
      },
      {
        description: 'CryptoChart imports useMarketChart',
        expected: 'Import path present',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/components/market/CryptoChart.jsx'), 'utf-8');
          assertTrue(
            content.includes("from '../../hooks/useMarketChart'"),
            'CryptoChart should import from ../../hooks/useMarketChart',
          );
        },
      },
      {
        description: 'MarketTrendsCard imports useMarketChart',
        expected: 'Import path present — same hook, same cache at default state',
        run: () => {
          const content = fs.readFileSync(
            join(__dirname, 'src/components/dashboard/MarketTrendsCard.jsx'),
            'utf-8',
          );
          assertTrue(
            content.includes("from '../../hooks/useMarketChart'"),
            'MarketTrendsCard should import from ../../hooks/useMarketChart',
          );
        },
      },
      {
        description: 'staleTime check',
        expected: 'staleTime: 5 * 60 * 1000 found',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/hooks/useMarketChart.js'), 'utf-8');
          assertTrue(
            content.includes('staleTime: 5 * 60 * 1000'),
            'staleTime should be 5 * 60 * 1000',
          );
        },
      },
    ],
  },

  // ── IT-05-03 ─────────────────────────────────────────────
  {
    id: 'IT-05-03',
    module: 'Rate-limit signal → client retry flow',
    description:
      'Verifies retry policies.',
    preconditions: 'Source files readable.',
    testData: 'File contents of useEquityQuote.js, useMarketNews.js',
    cases: [
      {
        description: 'useEquityQuote retry conditional logic',
        expected: 'Retry pattern found in source',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/hooks/useEquityQuote.js'), 'utf-8');
          assertTrue(
            content.includes('error?.status === 429') && content.includes('failureCount < 1'),
            'useEquityQuote should have retry conditional on status 429 && failureCount < 1',
          );
        },
      },
      {
        description: 'useEquityQuote retryDelay',
        expected: 'retryDelay: 60 * 1000 pattern found',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/hooks/useEquityQuote.js'), 'utf-8');
          assertTrue(
            content.includes('60 * 1000'),
            'useEquityQuote retryDelay should include 60 * 1000',
          );
        },
      },
      {
        description: 'useMarketNews retry policy',
        expected: 'Same retry pattern found',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/hooks/useMarketNews.js'), 'utf-8');
          assertTrue(
            content.includes('error?.status === 429') && content.includes('failureCount < 1'),
            'useMarketNews should have same retry policy as useEquityQuote',
          );
          assertTrue(
            content.includes('60 * 1000'),
            'useMarketNews retryDelay should include 60 * 1000',
          );
        },
      },
    ],
  },
];

// TEST RUNNER

async function runGroups(groups) {
  let passed = 0;
  let failed = 0;

  for (const group of groups) {
    console.log(`\n${group.id}: ${group.module}`);
    console.log(`Description: ${group.description}`);
    console.log(`Preconditions: ${group.preconditions}`);
    console.log(`Test Data: ${group.testData}`);
    console.log('Expected Results:');

    for (let i = 0; i < group.cases.length; i++) {
      const tc = group.cases[i];
      try {
        await tc.run();
        console.log(`  ${i + 1}. PASS | ${tc.description} | ${tc.expected}`);
        passed += 1;
      } catch (error) {
        console.log(`  ${i + 1}. FAIL | ${tc.description} | ${tc.expected}`);
        console.log(`     Error: ${error.message}`);
        failed += 1;
      }
    }
  }

  return { passed, failed };
}

console.log('========== Module 5 Testing: Market Insights & Analysis ==========');

let totalPassed = 0;
let totalFailed = 0;

// 1. Unit tests (always run — no server dependency)
console.log('\n────────── UNIT TESTS ──────────');
const unitResult = await runGroups(unitTestGroups);
totalPassed += unitResult.passed;
totalFailed += unitResult.failed;

// 2. Pure functional tests (no server dependency)
console.log('\n────────── FUNCTIONAL TESTS (Pure Logic) ──────────');
const pureFnResult = await runGroups(functionalPureGroups);
totalPassed += pureFnResult.passed;
totalFailed += pureFnResult.failed;

// 3. Static integration tests (file-text checks, no server)
console.log('\n────────── INTEGRATION TESTS (Static File Check) ──────────');
const staticResult = await runGroups(integrationStaticGroups);
totalPassed += staticResult.passed;
totalFailed += staticResult.failed;

// Summary
console.log('\n========== Module 5 Test Summary ==========');
console.log(`Total Test Cases Run: ${totalPassed + totalFailed}`);
console.log(`Total Passed: ${totalPassed}`);
console.log(`Total Failed: ${totalFailed}`);

if (totalFailed > 0) {
  process.exit(1);
}

console.log('\nAll Module 5 tests passed.');
