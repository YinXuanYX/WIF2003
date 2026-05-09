// 
// Toggle the default export between populated/empty to demo both states.

export const cashflowPopulated = {
  netIncome: 8500,
  expenses: [
    { id: 'exp-1', label: 'Rent', amount: 1800 },
    { id: 'exp-2', label: 'Utilities', amount: 350 },
    { id: 'exp-3', label: 'Groceries', amount: 600 },
    { id: 'exp-4', label: 'Transportation', amount: 400 },
    { id: 'exp-5', label: 'Insurance', amount: 450 },
    { id: 'exp-6', label: 'Subscriptions', amount: 150 },
  ],
}

export const cashflowEmpty = {
  netIncome: 0,
  expenses: [],
}

// ⬇ Switch to `cashflowEmpty` to demo the new-user empty state
const cashflowMock = cashflowPopulated
export default cashflowMock
