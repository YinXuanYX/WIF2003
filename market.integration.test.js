
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}


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

console.log('========== Module 5 Integration Testing: Market Insights & Analysis ==========');

console.log('\n────────── INTEGRATION TESTS (Static File Check) ──────────');
const staticResult = await runGroups(integrationStaticGroups);


console.log('\n========== Integration Test Summary ==========');
console.log(`Total Test Cases Run: ${staticResult.passed + staticResult.failed}`);
console.log(`Total Passed: ${staticResult.passed}`);
console.log(`Total Failed: ${staticResult.failed}`);

if (staticResult.failed > 0) {
  process.exit(1);
}

console.log('\nAll Module 5 integration tests passed.');
