import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '../utils/api'

const QUERY_KEY = ['goals']

export const useGoals = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => goalsApi.getAll(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const goals = data?.goals ?? []
  const summary = data?.summary ?? null

  const createGoalMutation = useMutation({
    mutationFn: (body) => goalsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, ...body }) => goalsApi.update(id, body),
    onMutate: async ({ id, ...body }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData(QUERY_KEY)
      queryClient.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old
        return {
          ...old,
          goals: old.goals.map((g) => (g.id === id ? { ...g, ...body } : g)),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(QUERY_KEY, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const quickSaveMutation = useMutation({
    mutationFn: ({ id, savedAmount }) => goalsApi.quickSave(id, savedAmount),
    onMutate: async ({ id, savedAmount }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData(QUERY_KEY)
      queryClient.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old
        return {
          ...old,
          goals: old.goals.map((g) =>
            g.id === id ? { ...g, savedAmount } : g
          ),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(QUERY_KEY, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => goalsApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData(QUERY_KEY)
      queryClient.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old
        return {
          ...old,
          goals: old.goals.filter((g) => g.id !== id),
        }
      })
      return { previous }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(QUERY_KEY, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    goals,
    summary,
    isLoading,
    isError,

    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    quickSave: quickSaveMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,

    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isSaving: quickSaveMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  }
}
