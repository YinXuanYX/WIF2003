import { create } from 'zustand'
import goalsMock from '../mocks/goals.mock'

/**
 * Zustand store for local CRUD operations on goals (Phase 1 — mock data).
 * In Phase 2, these mutations will be replaced by TanStack Query useMutation
 * calls hitting the real backend, but the component interface stays the same.
 */
const useGoalsStore = create((set) => ({
  goals: [...goalsMock],

  addGoal: (goal) =>
    set((state) => ({
      goals: [
        ...state.goals,
        {
          ...goal,
          _id: crypto.randomUUID(),
          savedAmount: goal.savedAmount ?? 0,
        },
      ],
    })),

  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g._id === id ? { ...g, ...updates } : g
      ),
    })),

  deleteGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter((g) => g._id !== id),
    })),
}))

export default useGoalsStore
