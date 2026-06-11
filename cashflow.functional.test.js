
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



function computeTotalExpenses(expenses) {
  return (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
}

function computeDisposableIncome(netIncome, totalExpenses) {
  return (netIncome ?? 0) - totalExpenses;
}

function applyIncomeOptimistic(oldCache, amount) {
  return { ...oldCache, netIncome: amount, isNewUser: false };
}

function resolveViewState(isLoading, isEmptyState) {
  if (isLoading) return 'skeleton';
  if (isEmptyState) return 'empty';
  return 'populated';
}

function deriveSummaryState(netIncome, totalExpenses, disposableIncome) {
  const expenseRatio = netIncome > 0 ? (totalExpenses / netIncome) * 100 : 0;
  const isOverBudget = disposableIncome < 0;
  const isHighSpend = expenseRatio >= 80;
  const progressBarWidth = Math.min(expenseRatio, 100);
  const displayedPercent = Math.min(expenseRatio, 100).toFixed(1);
  return { expenseRatio, isOverBudget, isHighSpend, progressBarWidth, displayedPercent };
}



const functionalPureGroups = [

  {
    id: 'FT-02-05',
    module: 'CashFlowPage.jsx — view state branching',
    description:
      'Verifies page view state branching.',
    preconditions: 'Pure function replication of component branching.',
    testData: 'isLoading / isEmptyState combinations',
    cases: [
      {
        description: 'isLoading: true → skeleton',
        expected: 'skeleton',
        run: () => assertEqual(resolveViewState(true, false), 'skeleton', 'Loading should show skeleton'),
      },
      {
        description: 'isEmptyState: true → empty',
        expected: 'empty',
        run: () => assertEqual(resolveViewState(false, true), 'empty', 'Empty state should show empty'),
      },
      {
        description: 'Neither loading nor empty → populated',
        expected: 'populated',
        run: () => assertEqual(resolveViewState(false, false), 'populated', 'Should show populated'),
      },
      {
        description: '"Get Started" seeds transition: updateIncome(0) → isNewUser false',
        expected: 'netIncome = 0, isNewUser = false',
        run: () => {
          const old = { netIncome: 0, isNewUser: true, expenses: [] };
          const result = applyIncomeOptimistic(old, 0);
          assertEqual(result.isNewUser, false, 'isNewUser should flip to false after Get Started');
        },
      },
    ],
  },


  {
    id: 'FT-02-06',
    module: 'CashFlowSummary.jsx — derived summary state',
    description:
      'Verifies derived summary state.',
    preconditions: 'Pure function replication of component derivation.',
    testData: 'netIncome / totalExpenses / disposableIncome combinations',
    cases: [
      {
        description: 'Healthy budget (35.3% expense ratio)',
        expected: 'isOverBudget: false, isHighSpend: false',
        run: () => {
          const s = deriveSummaryState(8500, 3000, 5500);
          assertMoney(s.expenseRatio, 35.29, 'Expense ratio mismatch');
          assertEqual(s.isOverBudget, false, 'Should not be over budget');
          assertEqual(s.isHighSpend, false, 'Should not be high spend');
        },
      },
      {
        description: 'High spend (84% ≥ 80%)',
        expected: 'isHighSpend: true, isOverBudget: false',
        run: () => {
          const s = deriveSummaryState(5000, 4200, 800);
          assertEqual(s.expenseRatio, 84, 'Expense ratio should be 84');
          assertEqual(s.isHighSpend, true, 'Should flag high spend');
          assertEqual(s.isOverBudget, false, 'Should not be over budget');
        },
      },
      {
        description: 'Over budget (negative disposable)',
        expected: 'isOverBudget: true',
        run: () => {
          const s = deriveSummaryState(3000, 4000, -1000);
          assertEqual(s.isOverBudget, true, 'Should be over budget');
        },
      },
      {
        description: 'Zero income guard',
        expected: 'expenseRatio = 0',
        run: () => {
          const s = deriveSummaryState(0, 0, 0);
          assertEqual(s.expenseRatio, 0, 'Zero income should produce 0 ratio');
        },
      },
      {
        description: 'RM formatting check — no data loss',
        expected: '123,456',
        run: () => {
          const formatted = (123456).toLocaleString();
          assertTrue(formatted.includes('123'), 'Formatted should contain 123');
          assertTrue(formatted.includes('456'), 'Formatted should contain 456');
        },
      },
      {
        description: 'Progress bar + text clamping: ratio 150% → bar and text both clamped to 100',
        expected: 'expenseRatio = 150, progressBarWidth = 100, displayedPercent = "100.0"',
        run: () => {
          const s = deriveSummaryState(3000, 4500, -1500);
          assertEqual(s.expenseRatio, 150, 'Raw ratio should be 150');
          assertEqual(s.progressBarWidth, 100, 'Bar width should be clamped to 100');
          assertEqual(s.displayedPercent, '100.0', 'Displayed percent should be clamped to "100.0"');
          assertEqual(s.isOverBudget, true, 'Should be over budget');
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

console.log('========== Module 2 Functional Testing: Cash Flow & Budget Baseline ==========');

console.log('\n────────── FUNCTIONAL TESTS (Pure Logic) ──────────');
const pureFnResult = await runGroups(functionalPureGroups);


console.log('\n========== Functional Test Summary ==========');
console.log(`Total Test Cases Run: ${pureFnResult.passed + pureFnResult.failed}`);
console.log(`Total Passed: ${pureFnResult.passed}`);
console.log(`Total Failed: ${pureFnResult.failed}`);

if (pureFnResult.failed > 0) {
  process.exit(1);
}

console.log('\nAll Module 2 functional tests passed.');
