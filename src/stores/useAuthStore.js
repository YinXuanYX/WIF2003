import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: {
    name: 'Tan Yin Xuan',
    email: 'yinxuan@finplan.dev',
    isActive: true,
  },
  isAuthenticated: true,

  logout: () => set({ user: null, isAuthenticated: false }),
}))

export default useAuthStore
