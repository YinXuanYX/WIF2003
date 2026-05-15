import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cashflowApi } from '../utils/api'

const QUERY_KEY = ['cashflow']

/**
 * useCashFlow — single hook for all cash flow CRUD.
 *
 * Reads via useQuery, writes via useMutation with optimistic cache updates.
 * Derived values (totals, disposable, empty-state flag) are computed from cache.
 */
export const useCashFlow = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => cashflowApi.get(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const totalExpenses = useMemo(
    () => (data?.expenses ?? []).reduce((sum, e) => sum + e.amount, 0),
    [data?.expenses],
  )

  const disposableIncome = useMemo(
    () => (data?.netIncome ?? 0) - totalExpenses,
    [data?.netIncome, totalExpenses],
  )

  const isEmptyState =
    !isLoading && data?.netIncome === 0 && (data?.expenses?.length ?? 0) === 0

  /** Update the monthly net income */
  const updateIncomeMutation = useMutation({
    mutationFn: (amount) => cashflowApi.updateIncome(amount),
    onMutate: async (amount) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData(QUERY_KEY)
      queryClient.setQueryData(QUERY_KEY, (old) => ({
        ...old,
        netIncome: amount,
      }))
      return { previous }
    },
    onError: (_err, _amount, context) => {
      queryClient.setQueryData(QUERY_KEY, context.previous)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  /** Add a new recurring expense */
  const addExpenseMutation = useMutation({
    mutationFn: (expense) => cashflowApi.addExpense(expense),
    onMutate: async (expense) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData(QUERY_KEY)
      const newExpense = {
        ...expense,
        id: 'optimistic',
      }
      queryClient.setQueryData(QUERY_KEY, (old) => ({
        ...old,
        expenses: [...(old?.expenses ?? []), newExpense],
      }))
      return { previous }
    },
    onError: (_err, _expense, context) => {
      queryClient.setQueryData(QUERY_KEY, context.previous)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  /** Remove an expense by ID */
  const removeExpenseMutation = useMutation({
    mutationFn: (id) => cashflowApi.removeExpense(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData(QUERY_KEY)
      queryClient.setQueryData(QUERY_KEY, (old) => ({
        ...old,
        expenses: (old?.expenses ?? []).filter((e) => e.id !== id),
      }))
      return { previous }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(QUERY_KEY, context.previous)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    data,
    isLoading,
    isError,

    totalExpenses,
    disposableIncome,
    isEmptyState,

    updateIncome: updateIncomeMutation.mutate,
    isUpdatingIncome: updateIncomeMutation.isPending,
    addExpense: addExpenseMutation.mutate,
    isAddingExpense: addExpenseMutation.isPending,
    removeExpense: removeExpenseMutation.mutate,
  }
}
