import { z } from 'zod'

/** Schema for the income configuration form */
export const incomeSchema = z.object({
  netIncome: z.coerce
    .number({ invalid_type_error: 'Income must be a number' })
    .min(0, 'Income cannot be negative')
    .max(1_000_000, 'Please enter a realistic amount'),
})

/** Schema for the add-expense form */
export const expenseSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(50, 'Label must be under 50 characters'),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than zero')
    .max(500_000, 'Please enter a realistic amount'),
})
