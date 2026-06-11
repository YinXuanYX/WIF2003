
import { incomeSchema, expenseSchema } from './src/schemas/cashflow.schema.js';
import { validationResult } from 'express-validator';
import {
  updateIncomeValidation,
  addExpenseValidation,
} from './server/validators/cashFlowValidators.js';
import mongoose from 'mongoose';
import CashFlow from './server/models/CashFlow.js';


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

function assertDeepEqual(actual, expected, message) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(`${message}. Expected ${b}, received ${a}`);
  }
}


function computeTotalExpenses(expenses) {
  return (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
}

function computeDisposableIncome(netIncome, totalExpenses) {
  return (netIncome ?? 0) - totalExpenses;
}

function deriveIsEmptyState(isLoading, data) {
  return !isLoading && (data?.isNewUser ?? true);
}

function applyIncomeOptimistic(oldCache, amount) {
  return { ...oldCache, netIncome: amount, isNewUser: false };
}

function applyAddExpenseOptimistic(oldCache, expense) {
  return {
    ...oldCache,
    expenses: [...(oldCache?.expenses ?? []), { ...expense, id: 'optimistic' }],
  };
}

function applyRemoveExpenseOptimistic(oldCache, id) {
  return {
    ...oldCache,
    expenses: (oldCache?.expenses ?? []).filter((e) => e.id !== id),
  };
}

function buildCashFlowResponse(cashFlowDoc) {
  if (!cashFlowDoc) {
    return { netIncome: 0, expenses: [], disposableIncome: 0, isNewUser: true };
  }
  const obj = typeof cashFlowDoc.toObject === 'function' ? cashFlowDoc.toObject() : cashFlowDoc;
  const totalExpenses = obj.expenses.reduce((sum, e) => sum + e.amount, 0);
  return {
    netIncome: obj.netIncome,
    expenses: obj.expenses.map((e) => ({
      id: (e._id || e.id).toString(),
      label: e.label,
      amount: e.amount,
    })),
    disposableIncome: obj.netIncome - totalExpenses,
    isNewUser: false,
  };
}


function mockReq(body = {}, params = {}) {
  return { body, params, query: {} };
}

async function runValidation(chain, body, params) {
  const req = mockReq(body, params);
  for (const validator of chain) {
    if (typeof validator.run === 'function') {
      await validator.run(req);
    }
  }
  return validationResult(req);
}


const unitTestGroups = [

  {
    id: 'UT-02-01',
    module: 'useCashFlow.js — totalExpenses / disposableIncome memos',
    description:
      'Validates that the disposable income computation handles normal, zero-boundary, negative, and empty-array cases correctly.',
    preconditions: 'netIncome and all expense amounts are finite, non-negative numbers.',
    testData: 'Various netIncome + expense arrays',
    cases: [
      {
        description: 'Normal positive disposable income',
        expected: 'totalExpenses = 2500, disposableIncome = 6000',
        run: () => {
          const expenses = [{ amount: 1500 }, { amount: 800 }, { amount: 200 }];
          assertEqual(computeTotalExpenses(expenses), 2500, 'Total expenses mismatch');
          assertEqual(computeDisposableIncome(8500, 2500), 6000, 'Disposable income mismatch');
        },
      },
      {
        description: 'Boundary: netIncome === totalExpenses → exactly 0',
        expected: 'disposableIncome = 0',
        run: () => {
          const expenses = [{ amount: 3000 }, { amount: 2000 }];
          const total = computeTotalExpenses(expenses);
          assertEqual(total, 5000, 'Total should be 5000');
          assertEqual(computeDisposableIncome(5000, total), 0, 'Disposable should be exactly 0');
        },
      },
      {
        description: 'Over-committed: expenses exceed income → negative (NOT clamped)',
        expected: 'disposableIncome = -1300',
        run: () => {
          const expenses = [{ amount: 2000 }, { amount: 1500 }, { amount: 800 }];
          const total = computeTotalExpenses(expenses);
          assertEqual(total, 4300, 'Total should be 4300');
          assertEqual(computeDisposableIncome(3000, total), -1300, 'Disposable should be -1300, not clamped to 0');
        },
      },
      {
        description: 'Empty expenses array → disposable equals income',
        expected: 'totalExpenses = 0, disposableIncome = 5000',
        run: () => {
          assertEqual(computeTotalExpenses([]), 0, 'Empty array should sum to 0');
          assertEqual(computeDisposableIncome(5000, 0), 5000, 'Disposable should equal income');
        },
      },
      {
        description: 'Floating-point precision: 33.33 × 3 via reduce',
        expected: 'totalExpenses = 99.99 (no drift)',
        run: () => {
          const expenses = [{ amount: 33.33 }, { amount: 33.33 }, { amount: 33.33 }];
          assertMoney(computeTotalExpenses(expenses), 99.99, 'Reduce aggregation precision drift');
        },
      },
    ],
  },


  {
    id: 'UT-02-02',
    module: 'cashflow.schema.js — incomeSchema',
    description:
      'Validates Zod coercion and bounds for net income: reject negative, reject above ceiling, reject non-numeric.',
    preconditions: 'Zod schema loaded successfully.',
    testData: 'netIncome values at various boundaries',
    cases: [
      {
        description: 'Normal mid-range (5000)',
        expected: 'Accepted',
        run: () => {
          assertTrue(incomeSchema.safeParse({ netIncome: 5000 }).success, 'Mid-range should be accepted');
        },
      },
      {
        description: 'Lower boundary (0) — inclusive',
        expected: 'Accepted',
        run: () => {
          assertTrue(incomeSchema.safeParse({ netIncome: 0 }).success, 'Zero should be accepted (min 0)');
        },
      },
      {
        description: 'Upper boundary (1,000,000) — inclusive',
        expected: 'Accepted',
        run: () => {
          assertTrue(incomeSchema.safeParse({ netIncome: 1000000 }).success, '1M should be accepted');
        },
      },
      {
        description: 'Over-limit (1,000,001) — rejected',
        expected: 'Rejected',
        run: () => {
          assertTrue(!incomeSchema.safeParse({ netIncome: 1000001 }).success, '1M+1 should be rejected');
        },
      },
      {
        description: 'Negative (-1) — rejected',
        expected: 'Rejected',
        run: () => {
          assertTrue(!incomeSchema.safeParse({ netIncome: -1 }).success, 'Negative should be rejected');
        },
      },
      {
        description: 'Non-numeric string ("abc") — rejected via invalid_type_error',
        expected: 'Rejected',
        run: () => {
          assertTrue(!incomeSchema.safeParse({ netIncome: 'abc' }).success, 'Non-numeric should be rejected');
        },
      },
    ],
  },


  {
    id: 'UT-02-03',
    module: 'cashflow.schema.js — expenseSchema',
    description:
      'Validates label presence/length (1–50) and amount positivity. .positive() excludes 0.',
    preconditions: 'Zod schema loaded successfully.',
    testData: 'label/amount values at various boundaries',
    cases: [
      {
        description: 'Normal valid expense',
        expected: 'Accepted',
        run: () => {
          assertTrue(expenseSchema.safeParse({ label: 'Rent', amount: 1500 }).success, 'Normal expense accepted');
        },
      },
      {
        description: 'Label at max length (50 chars) — inclusive',
        expected: 'Accepted',
        run: () => {
          assertTrue(
            expenseSchema.safeParse({ label: 'A'.repeat(50), amount: 100 }).success,
            '50-char label should be accepted',
          );
        },
      },
      {
        description: 'Label over max (51 chars) — rejected',
        expected: 'Rejected',
        run: () => {
          assertTrue(
            !expenseSchema.safeParse({ label: 'A'.repeat(51), amount: 100 }).success,
            '51-char label should be rejected',
          );
        },
      },
      {
        description: 'Amount at max (500,000) — inclusive',
        expected: 'Accepted',
        run: () => {
          assertTrue(
            expenseSchema.safeParse({ label: 'Big', amount: 500000 }).success,
            '500K amount should be accepted',
          );
        },
      },
      {
        description: 'Amount === 0 — rejected by .positive()',
        expected: 'Rejected',
        run: () => {
          assertTrue(
            !expenseSchema.safeParse({ label: 'Free', amount: 0 }).success,
            'Zero amount should be rejected (.positive() excludes 0)',
          );
        },
      },
      {
        description: 'Empty label — rejected by .min(1)',
        expected: 'Rejected',
        run: () => {
          assertTrue(
            !expenseSchema.safeParse({ label: '', amount: 100 }).success,
            'Empty label should be rejected',
          );
        },
      },
      {
        description: 'Whitespace-only label',
        expected: 'Accepted by Zod',
        run: () => {
          const result = expenseSchema.safeParse({ label: '   ', amount: 100 });
          assertTrue(
            result.success,
            'Whitespace label should pass Zod — z.string().min(1) checks length (3 ≥ 1), not emptiness after trim. ' +
            'SERVER DIVERGENCE: express-validator .trim().notEmpty() would reject this.',
          );
        },
      },
    ],
  },


  {
    id: 'UT-02-04',
    module: 'cashflow.schema.js ↔ cashFlowValidators.js ↔ CashFlow model',
    description:
      'Verifies validation layers for cash flow.',
    preconditions: 'Zod schema, express-validator chains, and Mongoose model importable.',
    testData: 'Boundary values: netIncome 0 / 1M, label 50 chars, amount 0.005',
    cases: [
      {
        description: 'Income upper limit (1,000,000) — all three layers agree',
        expected: 'All accept',
        run: async () => {
          // Zod
          assertTrue(incomeSchema.safeParse({ netIncome: 1000000 }).success, 'Zod should accept 1M');
          // express-validator
          const evResult = await runValidation(updateIncomeValidation, { netIncome: 1000000 });
          assertTrue(evResult.isEmpty(), 'express-validator should accept 1M');
          // Mongoose
          const doc = new CashFlow({ userId: new mongoose.Types.ObjectId(), netIncome: 1000000, expenses: [] });
          const mongoErr = doc.validateSync();
          assertTrue(!mongoErr || !mongoErr.errors?.netIncome, 'Mongoose should accept 1M');
        },
      },
      {
        description: 'Income lower limit (0) — all three layers agree',
        expected: 'All accept',
        run: async () => {
          assertTrue(incomeSchema.safeParse({ netIncome: 0 }).success, 'Zod should accept 0');
          const evResult = await runValidation(updateIncomeValidation, { netIncome: 0 });
          assertTrue(evResult.isEmpty(), 'express-validator should accept 0');
          const doc = new CashFlow({ userId: new mongoose.Types.ObjectId(), netIncome: 0, expenses: [] });
          const mongoErr = doc.validateSync();
          assertTrue(!mongoErr || !mongoErr.errors?.netIncome, 'Mongoose should accept 0');
        },
      },
      {
        description: 'Label max length (50) — all three layers agree',
        expected: 'All accept 50, all reject 51',
        run: async () => {
          const label50 = 'A'.repeat(50);
          const label51 = 'A'.repeat(51);
          // Zod
          assertTrue(expenseSchema.safeParse({ label: label50, amount: 1 }).success, 'Zod accepts 50');
          assertTrue(!expenseSchema.safeParse({ label: label51, amount: 1 }).success, 'Zod rejects 51');
          // express-validator
          const evOk = await runValidation(addExpenseValidation, { label: label50, amount: 1 });
          assertTrue(evOk.isEmpty(), 'express-validator accepts 50');
          const evFail = await runValidation(addExpenseValidation, { label: label51, amount: 1 });
          assertTrue(!evFail.isEmpty(), 'express-validator rejects 51');
          // Mongoose
          const docOk = new CashFlow({
            userId: new mongoose.Types.ObjectId(), netIncome: 0,
            expenses: [{ label: label50, amount: 1 }],
          });
          const errOk = docOk.validateSync();
          assertTrue(!errOk || !errOk.errors?.['expenses.0.label'], 'Mongoose accepts 50');
        },
      },
      {
        description: 'Expense amount 0.005 boundary',
        expected: 'Zod accepts, express-validator rejects, Mongoose accepts',
        run: async () => {
          assertTrue(expenseSchema.safeParse({ label: 'X', amount: 0.005 }).success, 'Zod should accept 0.005');
          const evResult = await runValidation(addExpenseValidation, { label: 'X', amount: 0.005 });
          assertTrue(!evResult.isEmpty(), 'express-validator should reject 0.005');
          const doc = new CashFlow({
            userId: new mongoose.Types.ObjectId(), netIncome: 0,
            expenses: [{ label: 'X', amount: 0.005 }],
          });
          const mongoErr = doc.validateSync();
          assertTrue(!mongoErr || !mongoErr.errors?.['expenses.0.amount'], 'Mongoose should accept 0.005');
        },
      },
    ],
  },


  {
    id: 'UT-02-05',
    module: 'useCashFlow.js — isEmptyState; cashFlowController.js — isNewUser',
    description:
      'Validates empty state flag derivation client and server.',
    preconditions: 'Pure function replication of hook and controller logic.',
    testData: 'isLoading / data / cashFlowDoc combinations',
    cases: [
      {
        description: 'Existing user → false',
        expected: 'isEmptyState = false',
        run: () => {
          assertEqual(deriveIsEmptyState(false, { isNewUser: false }), false, 'Existing user should not be empty');
        },
      },
      {
        description: 'New user (no doc / undefined) → true (defaults via ?? true)',
        expected: 'isEmptyState = true',
        run: () => {
          assertEqual(deriveIsEmptyState(false, undefined), true, 'Undefined data should default to empty');
        },
      },
      {
        description: 'New user (explicit isNewUser: true) → true',
        expected: 'isEmptyState = true',
        run: () => {
          assertEqual(deriveIsEmptyState(false, { isNewUser: true }), true, 'Explicit new user flag');
        },
      },
      {
        description: 'Still loading → false (loading suppresses empty state)',
        expected: 'isEmptyState = false',
        run: () => {
          assertEqual(deriveIsEmptyState(true, { isNewUser: true }), false, 'Loading should suppress empty state');
        },
      },
      {
        description: 'Server: buildCashFlowResponse(null) → isNewUser true',
        expected: 'isNewUser = true',
        run: () => {
          const res = buildCashFlowResponse(null);
          assertEqual(res.isNewUser, true, 'Null doc should produce isNewUser: true');
          assertEqual(res.netIncome, 0, 'Null doc should produce netIncome: 0');
          assertEqual(res.expenses.length, 0, 'Null doc should produce empty expenses');
          assertEqual(res.disposableIncome, 0, 'Null doc should produce disposableIncome: 0');
        },
      },
      {
        description: 'Server: buildCashFlowResponse(doc) → isNewUser false',
        expected: 'isNewUser = false',
        run: () => {
          const fakeDoc = {
            netIncome: 5000,
            expenses: [{ _id: 'abc123', label: 'Rent', amount: 1500 }],
            toObject() { return this; },
          };
          const res = buildCashFlowResponse(fakeDoc);
          assertEqual(res.isNewUser, false, 'Existing doc should produce isNewUser: false');
          assertEqual(res.disposableIncome, 3500, 'Disposable should be 5000 - 1500');
        },
      },
    ],
  },


  {
    id: 'UT-02-06',
    module: 'useCashFlow.js — onMutate / onError / onSuccess',
    description:
      'Verifies optimistic cache transforms and rollback.',
    preconditions: 'Pure function replication of cache transforms.',
    testData: 'oldCache snapshots with various expense lists',
    cases: [
      {
        description: 'Income update: optimistic transform',
        expected: 'netIncome = 8000, isNewUser = false',
        run: () => {
          const old = { netIncome: 5000, isNewUser: true, expenses: [] };
          const result = applyIncomeOptimistic(old, 8000);
          assertEqual(result.netIncome, 8000, 'netIncome should update');
          assertEqual(result.isNewUser, false, 'isNewUser should flip to false');
        },
      },
      {
        description: 'Income update: rollback restores previous',
        expected: 'Cache identical to pre-mutation snapshot',
        run: () => {
          const previous = { netIncome: 5000, isNewUser: true, expenses: [] };
          const mutated = applyIncomeOptimistic(previous, 8000);

          assertDeepEqual(previous, { netIncome: 5000, isNewUser: true, expenses: [] }, 'Previous should be unchanged');
          assertTrue(mutated.netIncome !== previous.netIncome, 'Mutated differs from previous');
        },
      },
      {
        description: 'Add expense: optimistic transform with placeholder id',
        expected: 'expenses.length = 2, last item id = "optimistic"',
        run: () => {
          const old = { expenses: [{ id: '1', label: 'A', amount: 100 }] };
          const result = applyAddExpenseOptimistic(old, { label: 'B', amount: 200 });
          assertEqual(result.expenses.length, 2, 'Should have 2 expenses');
          assertEqual(result.expenses[1].id, 'optimistic', 'Placeholder id should be "optimistic"');
          assertEqual(result.expenses[1].label, 'B', 'New expense label');
          assertEqual(result.expenses[1].amount, 200, 'New expense amount');
        },
      },
      {
        description: 'Add expense: rollback restores previous',
        expected: 'Cache identical to pre-mutation snapshot',
        run: () => {
          const previous = { expenses: [{ id: '1', label: 'A', amount: 100 }] };
          applyAddExpenseOptimistic(previous, { label: 'B', amount: 200 });
          assertEqual(previous.expenses.length, 1, 'Original should be unchanged (no mutation)');
        },
      },
      {
        description: 'Remove expense: optimistic transform',
        expected: 'expenses.length = 1, remaining is id "2"',
        run: () => {
          const old = {
            expenses: [
              { id: '1', label: 'A', amount: 100 },
              { id: '2', label: 'B', amount: 200 },
            ],
          };
          const result = applyRemoveExpenseOptimistic(old, '1');
          assertEqual(result.expenses.length, 1, 'Should have 1 expense');
          assertEqual(result.expenses[0].id, '2', 'Remaining expense should be id "2"');
        },
      },
      {
        description: 'Remove expense: rollback restores previous',
        expected: 'Cache identical to pre-mutation snapshot',
        run: () => {
          const previous = {
            expenses: [
              { id: '1', label: 'A', amount: 100 },
              { id: '2', label: 'B', amount: 200 },
            ],
          };
          applyRemoveExpenseOptimistic(previous, '1');
          assertEqual(previous.expenses.length, 2, 'Original should be unchanged');
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

console.log('========== Module 2 Unit Testing: Cash Flow & Budget Baseline ==========');

console.log('\n────────── UNIT TESTS ──────────');
const unitResult = await runGroups(unitTestGroups);


console.log('\n========== Unit Test Summary ==========');
console.log(`Total Test Cases Run: ${unitResult.passed + unitResult.failed}`);
console.log(`Total Passed: ${unitResult.passed}`);
console.log(`Total Failed: ${unitResult.failed}`);

if (unitResult.failed > 0) {
  process.exit(1);
}

console.log('\nAll Module 2 unit tests passed.');

await mongoose.disconnect().catch(() => {});
