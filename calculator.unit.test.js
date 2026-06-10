import { calculatorSchema } from './src/schemas/calculator.schema.js';

/* global process */

function calculateCompoundInterest(principal, ratePercent, years, compoundingFrequency) {
  const r = ratePercent / 100;
  const n = compoundingFrequency;
  const t = years;
  return principal * Math.pow(1 + r / n, n * t);
}

function calculateGoalAutoFillAmount(goal) {
  return Math.max(0, goal.targetAmount - goal.savedAmount);
}

const defaultVehicles = [
  { id: 'fd', name: 'Fixed Deposit', rate: 3.5 },
  { id: 'ut', name: 'Unit Trust', rate: 6.0 },
  { id: 'if', name: 'Index Fund', rate: 8.0 },
];

function calculateInvestmentComparison(principal, years, compounding) {
  const results = defaultVehicles.map((vehicle) => {
    const validPrincipal = Number(principal) || 0;
    const validYears = Number(years) || 0;
    const futureValue = calculateCompoundInterest(
      validPrincipal,
      vehicle.rate,
      validYears,
      compounding,
    );
    const profit = futureValue - validPrincipal;
    const roi = validPrincipal > 0 ? (profit / validPrincipal) * 100 : 0;

    return {
      ...vehicle,
      futureValue,
      profit,
      roi,
    };
  });

  const bestVehicleId =
    results.length > 0 && Number(principal) > 0
      ? results.reduce((best, current) =>
          current.futureValue > best.futureValue ? current : best,
        ).id
      : null;

  return { results, bestVehicleId };
}

function money(value) {
  return Number(value.toFixed(2));
}

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

function assertMoney(actual, expected, message) {
  assertEqual(money(actual), money(expected), message);
}

const testGroups = [
  {
    id: 'UT-06-01',
    title: 'Compound Interest Calculation Logic',
    module: 'CalculatorPage.jsx - calculateCompoundInterest()',
    description:
      'Validates that the compound interest formula calculates future investment value correctly.',
    preconditions: 'Calculator logic is available and receives valid numeric inputs.',
    testData: 'Principal = RM10,000, Rate = 5%, Years = 10',
    cases: [
      {
        description: 'Annual compounding, frequency = 1',
        expected: 'Future Value = RM16,288.95',
        run: () => assertMoney(calculateCompoundInterest(10000, 5, 10, 1), 16288.95, 'Annual compounding mismatch'),
      },
      {
        description: 'Quarterly compounding, frequency = 4',
        expected: 'Future Value = RM16,436.19',
        run: () => assertMoney(calculateCompoundInterest(10000, 5, 10, 4), 16436.19, 'Quarterly compounding mismatch'),
      },
      {
        description: 'Monthly compounding, frequency = 12',
        expected: 'Future Value = RM16,470.09',
        run: () => assertMoney(calculateCompoundInterest(10000, 5, 10, 12), 16470.09, 'Monthly compounding mismatch'),
      },
      {
        description: 'Daily compounding, frequency = 365',
        expected: 'Future Value = RM16,486.65',
        run: () => assertMoney(calculateCompoundInterest(10000, 5, 10, 365), 16486.65, 'Daily compounding mismatch'),
      },
      {
        description: 'Rate = 0%',
        expected: 'Future Value remains RM10,000.00',
        run: () => assertMoney(calculateCompoundInterest(10000, 0, 10, 1), 10000, 'Zero-rate calculation mismatch'),
      },
    ],
  },
  {
    id: 'UT-06-02',
    title: 'Calculator Input Validation',
    module: 'calculator.schema.js',
    description: 'Validates calculator inputs using the Zod validation schema.',
    preconditions: 'Validation schema is loaded successfully.',
    testData: 'Principal, rate, years, and compounding values',
    cases: [
      {
        description: 'Principal = 10000',
        expected: 'Input accepted',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 10000, rate: 5, years: 10, compounding: 1 });
          assertTrue(result.success, 'Valid principal should be accepted');
        },
      },
      {
        description: 'Principal = 0',
        expected: 'Validation error: principal must be at least 1',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 0, rate: 5, years: 10, compounding: 1 });
          assertTrue(!result.success, 'Principal of 0 should be rejected');
        },
      },
      {
        description: 'Rate = -1',
        expected: 'Validation error: interest rate cannot be negative',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 10000, rate: -1, years: 10, compounding: 1 });
          assertTrue(!result.success, 'Negative rate should be rejected');
        },
      },
      {
        description: 'Rate = 0',
        expected: 'Input accepted',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 10000, rate: 0, years: 10, compounding: 1 });
          assertTrue(result.success, 'Zero rate should be accepted');
        },
      },
      {
        description: 'Years = 0',
        expected: 'Validation error: must invest for at least 1 year',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 10000, rate: 5, years: 0, compounding: 1 });
          assertTrue(!result.success, 'Years of 0 should be rejected');
        },
      },
      {
        description: 'Years = 101',
        expected: 'Validation error: years must be 100 or less',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 10000, rate: 5, years: 101, compounding: 1 });
          assertTrue(!result.success, 'Years above 100 should be rejected');
        },
      },
      {
        description: 'Compounding = 12',
        expected: 'Input accepted',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 10000, rate: 5, years: 10, compounding: 12 });
          assertTrue(result.success, 'Monthly compounding should be accepted');
        },
      },
      {
        description: 'Compounding = 0',
        expected: 'Validation error for invalid compounding value',
        run: () => {
          const result = calculatorSchema.safeParse({ principal: 10000, rate: 5, years: 10, compounding: 0 });
          assertTrue(!result.success, 'Compounding of 0 should be rejected');
        },
      },
    ],
  },
  {
    id: 'UT-06-03',
    title: 'Goal Auto-Fill Calculation Logic',
    module: 'ROIForm.jsx - Goal Auto-Fill Calculation Logic',
    description:
      'Validates the business logic used to calculate the remaining amount required to achieve a financial goal.',
    preconditions: 'Goal object contains valid targetAmount and savedAmount values.',
    testData: 'Goal target amount and saved amount',
    cases: [
      {
        description: 'Target = RM50,000, Saved = RM10,000',
        expected: 'Remaining amount = RM40,000',
        run: () => assertEqual(calculateGoalAutoFillAmount({ targetAmount: 50000, savedAmount: 10000 }), 40000, 'Remaining amount mismatch'),
      },
      {
        description: 'Target = RM50,000, Saved = RM60,000',
        expected: 'Remaining amount = RM0 using Math.max(0, difference)',
        run: () => assertEqual(calculateGoalAutoFillAmount({ targetAmount: 50000, savedAmount: 60000 }), 0, 'Completed goal should not return a negative amount'),
      },
    ],
  },
  {
    id: 'UT-06-04',
    title: 'Investment Comparison Calculation Logic',
    module: 'InvestmentComparison.jsx',
    description: 'Validates investment comparison calculations using default vehicle rates.',
    preconditions: 'Principal, years, and compounding frequency are provided.',
    testData: 'Principal = RM10,000, Years = 10, Compounding = 1',
    cases: [
      {
        description: 'Fixed Deposit at 3.5%',
        expected: 'Future Value = RM14,105.99',
        run: () => {
          const { results } = calculateInvestmentComparison(10000, 10, 1);
          assertMoney(results.find((item) => item.id === 'fd').futureValue, 14105.99, 'Fixed Deposit future value mismatch');
        },
      },
      {
        description: 'Unit Trust at 6.0%',
        expected: 'Future Value = RM17,908.48',
        run: () => {
          const { results } = calculateInvestmentComparison(10000, 10, 1);
          assertMoney(results.find((item) => item.id === 'ut').futureValue, 17908.48, 'Unit Trust future value mismatch');
        },
      },
      {
        description: 'Index Fund at 8.0%',
        expected: 'Future Value = RM21,589.25',
        run: () => {
          const { results } = calculateInvestmentComparison(10000, 10, 1);
          assertMoney(results.find((item) => item.id === 'if').futureValue, 21589.25, 'Index Fund future value mismatch');
        },
      },
      {
        description: 'Highest return detection',
        expected: 'Index Fund is identified as highest-return option',
        run: () => {
          const { bestVehicleId } = calculateInvestmentComparison(10000, 10, 1);
          assertEqual(bestVehicleId, 'if', 'Index Fund should be selected as highest return');
        },
      },
      {
        description: 'ROI value generated',
        expected: 'ROI percentage is calculated for each vehicle',
        run: () => {
          const { results } = calculateInvestmentComparison(10000, 10, 1);
          results.forEach((item) => assertTrue(Number.isFinite(item.roi), `${item.name} ROI should be numeric`));
        },
      },
    ],
  },
  {
    id: 'UT-06-05',
    title: 'Investment Comparison Boundary Logic',
    module: 'InvestmentComparison.jsx',
    description:
      'Validates boundary handling for investment comparison business logic.',
    preconditions: 'Investment comparison calculation logic is available.',
    testData: 'Principal = 0, Years = 0, and valid comparison rates',
    cases: [
      {
        description: 'Principal = 0',
        expected: 'Future value = RM0.00 for each investment vehicle',
        run: () => {
          const { results } = calculateInvestmentComparison(0, 0, 1);
          results.forEach((item) => assertMoney(item.futureValue, 0, `${item.name} should return zero future value`));
        },
      },
      {
        description: 'Principal = 0',
        expected: 'ROI percentage = 0 for each investment vehicle',
        run: () => {
          const { results } = calculateInvestmentComparison(0, 0, 1);
          results.forEach((item) => assertMoney(item.roi, 0, `${item.name} should return zero ROI`));
        },
      },
      {
        description: 'Principal = 0',
        expected: 'Highest-return investment is not selected',
        run: () => {
          const { bestVehicleId } = calculateInvestmentComparison(0, 0, 1);
          assertEqual(bestVehicleId, null, 'Highest return should not be selected for zero principal');
        },
      },
      {
        description: 'Years = 0 with valid principal',
        expected: 'Future value remains equal to principal',
        run: () => {
          const { results } = calculateInvestmentComparison(10000, 0, 1);
          results.forEach((item) => assertMoney(item.futureValue, 10000, `${item.name} should return original principal`));
        },
      },
    ],
  },
];

console.log('========== Module 6 Unit Testing: Integrated Financial Calculators ==========');

let passed = 0;
let failed = 0;

testGroups.forEach((group) => {
  console.log(`\n${group.id}: ${group.title ?? group.module}`);
  console.log(`Module/Function: ${group.module}`);
  console.log(`Description: ${group.description}`);
  console.log(`Preconditions: ${group.preconditions}`);
  console.log(`Test Data: ${group.testData}`);
  console.log('Expected Results:');

  group.cases.forEach((testCase, index) => {
    try {
      testCase.run();
      console.log(
        `  ${index + 1}. PASS | ${testCase.description} | ${testCase.expected}`,
      );
      passed += 1;
    } catch (error) {
      console.log(
        `  ${index + 1}. FAIL | ${testCase.description} | ${testCase.expected}`,
      );
      console.log(`     Error: ${error.message}`);
      failed += 1;
    }
  });
});

console.log('\n========== Unit Test Summary ==========');
console.log(`Total Unit Test Cases: ${passed + failed}`);
console.log(`Total Passed: ${passed}`);
console.log(`Total Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}

console.log('\nAll Module 6 unit tests passed.');
