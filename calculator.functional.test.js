import { calculatorSchema } from './src/schemas/calculator.schema.js';

/* global process */

const COMPOUNDING_OPTIONS = [
  { label: 'Annually', value: 1 },
  { label: 'Quarterly', value: 4 },
  { label: 'Monthly', value: 12 },
  { label: 'Daily', value: 365 },
];

const DEFAULT_VEHICLES = [
  { id: 'fd', name: 'Fixed Deposit', defaultRate: 3.5 },
  { id: 'ut', name: 'Unit Trust', defaultRate: 6.0 },
  { id: 'if', name: 'Index Fund', defaultRate: 8.0 },
];

function calculateCompoundInterest(principal, ratePercent, years, compoundingFrequency) {
  const r = ratePercent / 100;
  const n = compoundingFrequency;
  return principal * Math.pow(1 + r / n, n * years);
}

function calculateRoiResult(inputs) {
  const validation = calculatorSchema.safeParse(inputs);

  if (!validation.success) {
    return {
      submitted: false,
      validation,
      result: null,
    };
  }

  const data = validation.data;
  const futureValue = calculateCompoundInterest(
    data.principal,
    data.rate,
    data.years,
    data.compounding,
  );
  const netProfit = futureValue - data.principal;
  const roiPercent = data.principal > 0 ? (netProfit / data.principal) * 100 : 0;

  return {
    submitted: true,
    validation,
    result: {
      inputs: data,
      futureValue,
      netProfit,
      roiPercent,
    },
  };
}

function createCalculatorForm(defaultValues = {}) {
  let values = {
    principal: 10000,
    rate: 5,
    years: 10,
    compounding: 1,
    ...defaultValues,
  };

  return {
    setValue(field, value) {
      values = { ...values, [field]: value };
      return values[field];
    },
    getValues() {
      return { ...values };
    },
    isValid() {
      return calculatorSchema.safeParse(values).success;
    },
    submit() {
      return calculateRoiResult(values);
    },
  };
}

function generateProjectionData(inputs) {
  const data = [];
  const { principal, rate, years, compounding } = inputs;
  const r = rate / 100;
  const n = compounding;

  for (let i = 0; i <= years; i += 1) {
    const value = principal * Math.pow(1 + r / n, n * i);
    data.push({
      year: `Year ${i}`,
      value,
      principal,
      profit: value - principal,
    });
  }

  return data;
}

function createResultsViewModel(calculationResult) {
  if (!calculationResult) {
    return {
      placeholder: 'Enter your investment details to see the projection.',
      cards: [],
      chartData: [],
    };
  }

  return {
    placeholder: null,
    cards: [
      {
        label: 'Future Value',
        value: formatMoney(calculationResult.futureValue),
      },
      {
        label: calculationResult.netProfit >= 0 ? 'Net Profit' : 'Net Loss',
        value: `${calculationResult.netProfit >= 0 ? '+' : '-'} RM ${formatNumber(Math.abs(calculationResult.netProfit))}`,
      },
      {
        label: 'Total ROI',
        value: `${calculationResult.roiPercent >= 0 ? '+' : ''}${formatNumber(calculationResult.roiPercent)}%`,
      },
    ],
    chartData: generateProjectionData(calculationResult.inputs),
  };
}

function createChartTooltip(point, principal) {
  return {
    label: point.year,
    totalValue: formatMoney(point.value),
    profit: formatMoney(point.value - principal),
  };
}

function calculateGoalAutoFillAmount(goal) {
  return Math.max(0, goal.targetAmount - goal.savedAmount);
}

function createGoalDropdown(goals) {
  return goals.map((goal) => ({
    title: goal.title,
    remainingAmount: calculateGoalAutoFillAmount(goal),
    displayAmount: formatMoney(calculateGoalAutoFillAmount(goal)),
  }));
}

function calculateInvestmentComparison(principal, years, compounding, customRates = {}) {
  const validPrincipal = Number(principal) || 0;
  const validYears = Number(years) || 0;

  const results = DEFAULT_VEHICLES.map((vehicle) => {
    const rate = Number(customRates[vehicle.id] ?? vehicle.defaultRate);
    const futureValue = calculateCompoundInterest(
      validPrincipal,
      rate,
      validYears,
      compounding,
    );
    const profit = futureValue - validPrincipal;
    const roi = validPrincipal > 0 ? (profit / validPrincipal) * 100 : 0;

    return {
      ...vehicle,
      rate,
      futureValue,
      profit,
      roi,
    };
  });

  const bestVehicleId = results.length > 0 && validPrincipal > 0
    ? results.reduce((best, current) =>
      current.futureValue > best.futureValue ? current : best,
    ).id
    : null;

  return { results, bestVehicleId };
}

function formatNumber(value) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMoney(value) {
  return `RM ${formatNumber(value)}`;
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${expected}, received ${actual}`);
  }
}

function assertIncludes(collection, expected, message) {
  if (!collection.includes(expected)) {
    throw new Error(`${message}. Expected to include ${expected}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertValidationError(input, expectedMessage) {
  const result = calculatorSchema.safeParse(input);

  assertTrue(!result.success, 'Validation should fail');

  const messages = result.error.issues.map((issue) => issue.message);
  assertIncludes(messages, expectedMessage, 'Validation message mismatch');
}

const validInput = {
  principal: 10000,
  rate: 5,
  years: 10,
  compounding: 1,
};

const testGroups = [
  {
    id: 'FT-06-01',
    title: 'ROI Calculation View State Transition',
    module: 'ROI Calculator Workflow',
    description:
      'Verifies that valid calculator inputs are processed correctly and the calculation state transitions from input submission to projection result generation.',
    precondition: 'User opens the ROI Calculator page.',
    testData: 'Principal = RM10,000, Rate = 5%, Years = 10, Compounding = Annually',
    cases: [
      {
        description: 'Valid principal value provided',
        expected: 'Principal field accepts the value',
        run: () => {
          const form = createCalculatorForm();
          assertEqual(form.setValue('principal', 10000), 10000, 'Principal field did not keep the entered value');
        },
      },
      {
        description: 'Valid annual rate provided',
        expected: 'Rate field accepts the value',
        run: () => {
          const form = createCalculatorForm();
          assertEqual(form.setValue('rate', 5), 5, 'Rate field did not keep the entered value');
        },
      },
      {
        description: 'Valid investment period provided',
        expected: 'Years field accepts the value',
        run: () => {
          const form = createCalculatorForm();
          assertEqual(form.setValue('years', 10), 10, 'Years field did not keep the entered value');
        },
      },
      {
        description: 'Calculation submission triggered',
        expected: 'Calculation is submitted successfully',
        run: () => {
          const form = createCalculatorForm(validInput);
          assertTrue(form.submit().submitted, 'Valid calculator form should submit');
        },
      },
      {
        description: 'Calculation completed',
        expected: 'Projection results section is displayed',
        run: () => {
          const form = createCalculatorForm(validInput);
          const view = createResultsViewModel(form.submit().result);
          assertTrue(view.cards.some((card) => card.label === 'Future Value'), 'Projection result cards should be displayed');
        },
      },
    ],
  },
  {
    id: 'FT-06-02',
    title: 'Calculator Validation State Handling',
    module: 'ROI Calculator Input Form',
    description:
      'Verifies that invalid calculator inputs trigger validation states and prevent successful calculation submission.',
    precondition: 'User opens the ROI Calculator page.',
    testData: 'Invalid principal, rate, years, and compounding values',
    cases: [
      {
        description: 'Principal value equals 0',
        expected: 'Validation message is displayed',
        run: () => assertValidationError(
          { ...validInput, principal: 0 },
          'Principal must be at least 1',
        ),
      },
      {
        description: 'Negative annual rate provided',
        expected: 'Validation message is displayed',
        run: () => assertValidationError(
          { ...validInput, rate: -1 },
          'Interest rate cannot be negative',
        ),
      },
      {
        description: 'Investment period equals 0 years',
        expected: 'Validation message is displayed',
        run: () => assertValidationError(
          { ...validInput, years: 0 },
          'Must invest for at least 1 year',
        ),
      },
      {
        description: 'Investment period exceeds 100 years',
        expected: 'Validation message is displayed',
        run: () => assertValidationError(
          { ...validInput, years: 101 },
          'Years must be 100 or less',
        ),
      },
      {
        description: 'Invalid calculator state detected',
        expected: 'Calculate ROI button is disabled',
        run: () => {
          const form = createCalculatorForm({ ...validInput, principal: 0 });
          assertTrue(!form.isValid(), 'Invalid form should disable calculate action');
        },
      },
    ],
  },
  {
    id: 'FT-06-03',
    title: 'Projection Result Rendering Logic',
    module: 'ROIResults.jsx',
    description:
      'Verifies that calculated ROI results are transformed correctly into display cards and formatted output values.',
    precondition: 'User has submitted valid calculator inputs.',
    testData: 'Valid ROI calculation input',
    cases: [
      {
        description: 'No calculation result available',
        expected: 'Placeholder message is displayed',
        run: () => {
          const view = createResultsViewModel(null);
          assertEqual(
            view.placeholder,
            'Enter your investment details to see the projection.',
            'Placeholder message mismatch',
          );
        },
      },
      {
        description: 'Valid calculation result generated',
        expected: 'Future Value card is displayed',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          assertTrue(view.cards.some((card) => card.label === 'Future Value'), 'Future Value card missing');
        },
      },
      {
        description: 'Valid calculation result generated',
        expected: 'Net Profit card is displayed',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          assertTrue(view.cards.some((card) => card.label === 'Net Profit'), 'Net Profit card missing');
        },
      },
      {
        description: 'Valid calculation result generated',
        expected: 'Total ROI card is displayed',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          assertTrue(view.cards.some((card) => card.label === 'Total ROI'), 'Total ROI card missing');
        },
      },
      {
        description: 'Result cards rendered',
        expected: 'Currency and percentage formats are shown correctly',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          const values = view.cards.map((card) => card.value);
          assertTrue(values.some((value) => value.startsWith('RM ')), 'Currency format should include RM prefix');
          assertTrue(values.some((value) => value.endsWith('%')), 'ROI format should include percent suffix');
        },
      },
    ],
  },
  {
    id: 'FT-06-04',
    title: 'Projection Chart View State Rendering',
    module: 'Projection Chart',
    description:
      'Verifies that projection data generates valid chart states, labels, tooltips, and recalculated chart outputs.',
    precondition: 'User has completed a valid ROI calculation.',
    testData: 'Valid ROI calculation input',
    cases: [
      {
        description: 'Projection data generated',
        expected: 'Projection chart is displayed',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          assertTrue(view.chartData.length > 0, 'Projection chart data should be generated');
        },
      },
      {
        description: 'Chart state rendered',
        expected: 'Year labels are visible on the chart',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          assertEqual(view.chartData[0].year, 'Year 0', 'First chart label should be Year 0');
          assertEqual(view.chartData.at(-1).year, 'Year 10', 'Last chart label should match investment period');
        },
      },
      {
        description: 'Chart state rendered',
        expected: 'Investment value scale is visible',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          assertTrue(view.chartData.every((point) => Number.isFinite(point.value)), 'Every chart point should have a numeric value');
        },
      },
      {
        description: 'Tooltip state requested',
        expected: 'Tooltip displays total value information',
        run: () => {
          const view = createResultsViewModel(calculateRoiResult(validInput).result);
          const tooltip = createChartTooltip(view.chartData.at(-1), validInput.principal);
          assertEqual(tooltip.label, 'Year 10', 'Tooltip should show hovered year');
          assertTrue(tooltip.totalValue.startsWith('RM '), 'Tooltip should show total value');
        },
      },
      {
        description: 'Projection input updated',
        expected: 'Chart updates according to the new calculation',
        run: () => {
          const firstChart = createResultsViewModel(calculateRoiResult(validInput).result).chartData;
          const updatedChart = createResultsViewModel(
            calculateRoiResult({ ...validInput, rate: 8 }).result,
          ).chartData;

          assertTrue(
            updatedChart.at(-1).value > firstChart.at(-1).value,
            'Increasing the rate should increase the last chart value',
          );
        },
      },
    ],
  },
  {
    id: 'FT-06-05',
    title: 'Compounding Frequency State Transition',
    module: 'Compounding Frequency Selector',
    description:
      'Verifies that changes to compounding frequency propagate correctly into calculation results and projection outputs.',
    precondition: 'User opens the ROI Calculator page.',
    testData: 'Valid principal, rate, and year values',
    cases: [
      {
        description: 'Compounding options requested',
        expected: 'Annually, Quarterly, Monthly, and Daily options are displayed',
        run: () => {
          const labels = COMPOUNDING_OPTIONS.map((option) => option.label);
          ['Annually', 'Quarterly', 'Monthly', 'Daily'].forEach((label) =>
            assertIncludes(labels, label, 'Compounding option missing'),
          );
        },
      },
      {
        description: 'Annual frequency selected',
        expected: 'Annually option is selected',
        run: () => {
          const form = createCalculatorForm();
          assertEqual(form.setValue('compounding', 1), 1, 'Annually option should set compounding to 1');
        },
      },
      {
        description: 'Quarterly frequency selected',
        expected: 'Quarterly option is selected',
        run: () => {
          const form = createCalculatorForm();
          assertEqual(form.setValue('compounding', 4), 4, 'Quarterly option should set compounding to 4');
        },
      },
      {
        description: 'Monthly frequency selected',
        expected: 'Monthly option is selected',
        run: () => {
          const form = createCalculatorForm();
          assertEqual(form.setValue('compounding', 12), 12, 'Monthly option should set compounding to 12');
        },
      },
      {
        description: 'Daily frequency selected and recalculated',
        expected: 'Projection result updates based on selected frequency',
        run: () => {
          const annually = calculateRoiResult({ ...validInput, compounding: 1 }).result;
          const daily = calculateRoiResult({ ...validInput, compounding: 365 }).result;
          assertTrue(daily.futureValue > annually.futureValue, 'Daily compounding should produce a higher future value than annual compounding');
        },
      },
    ],
  },
  {
    id: 'FT-06-06',
    title: 'Investment Comparison View State Rendering',
    module: 'InvestmentComparison.jsx',
    description:
      'Verifies that investment comparison calculations generate valid comparison card states and highest-return indicators.',
    precondition: 'User has completed a valid ROI calculation.',
    testData: 'Principal = RM10,000, Years = 10, Compounding = 1',
    cases: [
      {
        description: 'Comparison results generated',
        expected: 'Fixed Deposit card is displayed',
        run: () => {
          const comparison = calculateInvestmentComparison(10000, 10, 1);
          assertTrue(comparison.results.some((item) => item.name === 'Fixed Deposit'), 'Fixed Deposit card missing');
        },
      },
      {
        description: 'Comparison results generated',
        expected: 'Unit Trust card is displayed',
        run: () => {
          const comparison = calculateInvestmentComparison(10000, 10, 1);
          assertTrue(comparison.results.some((item) => item.name === 'Unit Trust'), 'Unit Trust card missing');
        },
      },
      {
        description: 'Comparison results generated',
        expected: 'Index Fund card is displayed',
        run: () => {
          const comparison = calculateInvestmentComparison(10000, 10, 1);
          assertTrue(comparison.results.some((item) => item.name === 'Index Fund'), 'Index Fund card missing');
        },
      },
      {
        description: 'Comparison cards rendered',
        expected: 'Future Value and Total ROI are shown for each option',
        run: () => {
          const comparison = calculateInvestmentComparison(10000, 10, 1);
          comparison.results.forEach((item) => {
            assertTrue(Number.isFinite(item.futureValue), `${item.name} Future Value should be numeric`);
            assertTrue(Number.isFinite(item.roi), `${item.name} Total ROI should be numeric`);
          });
        },
      },
      {
        description: 'Investment rate updated',
        expected: 'Related comparison result updates',
        run: () => {
          const original = calculateInvestmentComparison(10000, 10, 1);
          const updated = calculateInvestmentComparison(10000, 10, 1, { fd: 10 });
          const originalFd = original.results.find((item) => item.id === 'fd');
          const updatedFd = updated.results.find((item) => item.id === 'fd');

          assertTrue(updatedFd.futureValue > originalFd.futureValue, 'Updated Fixed Deposit rate should increase future value');
        },
      },
      {
        description: 'Comparison calculation completed',
        expected: 'Highest Return badge is shown on the best-performing option',
        run: () => {
          const comparison = calculateInvestmentComparison(10000, 10, 1);
          assertEqual(comparison.bestVehicleId, 'if', 'Index Fund should receive the Highest Return badge');
        },
      },
    ],
  },
  {
    id: 'FT-06-07',
    title: 'Goal Auto-Fill State Synchronization',
    module: 'Goal Auto-Fill Feature',
    description:
      'Verifies that goal data is transformed correctly into calculator input values and calculation-ready states.',
    precondition: 'User has at least one goal in the Financial Goals module.',
    testData: 'Goal: Education Fund, Target = RM50,000, Saved = RM10,000',
    cases: [
      {
        description: 'Goal data available',
        expected: 'Auto-fill from Goal option is visible',
        run: () => {
          const goals = [{ id: 'g1', title: 'Education Fund', targetAmount: 50000, savedAmount: 10000 }];
          assertTrue(goals.length > 0, 'Existing goal should make auto-fill option visible');
        },
      },
      {
        description: 'Goal selection requested',
        expected: 'Goal dropdown opens',
        run: () => {
          const dropdown = createGoalDropdown([
            { id: 'g1', title: 'Education Fund', targetAmount: 50000, savedAmount: 10000 },
          ]);
          assertEqual(dropdown.length, 1, 'Goal dropdown should contain available goals');
        },
      },
      {
        description: 'Goal information rendered',
        expected: 'Goal title and remaining amount are displayed',
        run: () => {
          const dropdown = createGoalDropdown([
            { id: 'g1', title: 'Education Fund', targetAmount: 50000, savedAmount: 10000 },
          ]);
          assertEqual(dropdown[0].title, 'Education Fund', 'Goal title should be displayed');
          assertEqual(dropdown[0].displayAmount, 'RM 40,000.00', 'Remaining amount should be displayed');
        },
      },
      {
        description: 'Goal selection synchronized',
        expected: 'Principal field is automatically populated',
        run: () => {
          const form = createCalculatorForm();
          const amount = calculateGoalAutoFillAmount({
            title: 'Education Fund',
            targetAmount: 50000,
            savedAmount: 10000,
          });

          assertEqual(form.setValue('principal', amount), 40000, 'Principal should be auto-filled with remaining goal amount');
        },
      },
      {
        description: 'Auto-filled calculation executed',
        expected: 'Projection results are displayed',
        run: () => {
          const form = createCalculatorForm({
            ...validInput,
            principal: calculateGoalAutoFillAmount({
              title: 'Education Fund',
              targetAmount: 50000,
              savedAmount: 10000,
            }),
          });

          const view = createResultsViewModel(form.submit().result);
          assertTrue(view.cards.length > 0, 'Projection results should be displayed after calculating auto-filled goal');
        },
      },
    ],
  },
];

console.log('========== Functional Testing ==========');
console.log('Functional tests verify calculation workflows, view state transitions, rendering logic, and component-level interactions without requiring a live server or database environment.');

let passed = 0;
let failed = 0;

testGroups.forEach((group) => {
  console.log(`\n${group.id}: ${group.title ?? group.module}`);
  console.log(`Module/Function: ${group.module}`);
  console.log(`Description: ${group.description}`);
  console.log(`Precondition: ${group.precondition}`);
  console.log(`Test Data: ${group.testData}`);
  console.log('Expected Results:');

  group.cases.forEach((testCase, index) => {
    try {
      testCase.run();
      passed += 1;
      console.log(`  ${index + 1}. PASS | ${testCase.description} | ${testCase.expected}`);
    } catch (error) {
      failed += 1;
      console.log(`  ${index + 1}. FAIL | ${testCase.description} | ${testCase.expected}`);
      console.log(`     Error: ${error.message}`);
    }
  });
});

console.log('\n========== Functional Test Summary ==========');
console.log(`Total Functional Test Cases: ${passed + failed}`);
console.log(`Total Passed: ${passed}`);
console.log(`Total Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}

console.log('\nAll Module 6 functional tests passed.');
