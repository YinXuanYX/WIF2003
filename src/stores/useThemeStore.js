import { create } from 'zustand'

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('finplan-theme') || 'light',

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('finplan-theme', next)
      document.documentElement.setAttribute('data-bs-theme', next)
      return { theme: next }
    }),
}))

export default useThemeStore
