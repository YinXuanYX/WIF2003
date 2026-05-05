import { z } from 'zod'

export const calculatorSchema = z.object({
  principal: z.coerce
    .number({ invalid_type_error: 'Principal must be a number' })
    .min(1, 'Principal must be at least 1'),
  rate: z.coerce
    .number({ invalid_type_error: 'Interest rate must be a number' })
    .min(0, 'Interest rate cannot be negative'),
  years: z.coerce
    .number({ invalid_type_error: 'Years must be a number' })
    .min(1, 'Must invest for at least 1 year')
    .max(100, 'Years must be 100 or less'),
  compounding: z.coerce
    .number()
    .int()
    .min(1)
})
