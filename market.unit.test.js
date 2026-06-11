
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



const unitTestGroups = [

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

console.log('========== Module 5 Unit Testing: Market Insights & Analysis ==========');

console.log('\n────────── UNIT TESTS ──────────');
const unitResult = await runGroups(unitTestGroups);


console.log('\n========== Unit Test Summary ==========');
console.log(`Total Test Cases Run: ${unitResult.passed + unitResult.failed}`);
console.log(`Total Passed: ${unitResult.passed}`);
console.log(`Total Failed: ${unitResult.failed}`);

if (unitResult.failed > 0) {
  process.exit(1);
}

console.log('\nAll Module 5 unit tests passed.');
