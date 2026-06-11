
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
    id: 'IT-02-03',
    module: 'Shared cache aggregation — CashFlowPage ↔ CashFlowCard',
    description:
      'Verifies cache key consistency.',
    preconditions: 'Source files readable from project root.',
    testData: 'File contents of useCashFlow.js, CashFlowPage.jsx, CashFlowCard.jsx',
    cases: [
      {
        description: 'useCashFlow.js declares QUERY_KEY = [\'cashflow\']',
        expected: 'String match found',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/hooks/useCashFlow.js'), 'utf-8');
          assertTrue(
            content.includes("const QUERY_KEY = ['cashflow']"),
            'useCashFlow.js should declare QUERY_KEY = [\'cashflow\']',
          );
        },
      },
      {
        description: 'CashFlowPage.jsx imports useCashFlow from the shared hook',
        expected: 'Import path present',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/pages/CashFlowPage.jsx'), 'utf-8');
          assertTrue(
            content.includes("from '../hooks/useCashFlow'"),
            'CashFlowPage should import from ../hooks/useCashFlow',
          );
        },
      },
      {
        description: 'CashFlowCard.jsx imports useCashFlow from the same shared hook',
        expected: 'Import path present — same hook, same QUERY_KEY',
        run: () => {
          const content = fs.readFileSync(join(__dirname, 'src/components/dashboard/CashFlowCard.jsx'), 'utf-8');
          assertTrue(
            content.includes("from '../../hooks/useCashFlow'"),
            'CashFlowCard should import from ../../hooks/useCashFlow',
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

console.log('========== Module 2 Integration Testing: Cash Flow & Budget Baseline ==========');

console.log('\n────────── INTEGRATION TESTS (Static File Check) ──────────');
const staticResult = await runGroups(integrationStaticGroups);


console.log('\n========== Integration Test Summary ==========');
console.log(`Total Test Cases Run: ${staticResult.passed + staticResult.failed}`);
console.log(`Total Passed: ${staticResult.passed}`);
console.log(`Total Failed: ${staticResult.failed}`);

if (staticResult.failed > 0) {
  process.exit(1);
}

console.log('\nAll Module 2 integration tests passed.');
