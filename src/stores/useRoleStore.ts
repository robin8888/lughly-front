/**
 * Role Store
 * Gestiona el modo activo (cliente vs profesional) cuando un usuario tiene ambos roles
 *
 * Según README: "El rol del store es cosmético: la autorización real la decide el backend"
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ActiveRole = 'client' | 'pro'

interface RoleState {
  activeRole: ActiveRole
  setActiveRole: (role: ActiveRole) => void
  switchRole: () => void
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      activeRole: 'client',

      setActiveRole: (role) => set({ activeRole: role }),

      switchRole: () =>
        set((state) => ({
          activeRole: state.activeRole === 'client' ? 'pro' : 'client',
        })),
    }),
    {
      name: 'lughly.role',
      // Este dato NO es sensible: va en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Selectores atómicos
export const useActiveRole = () => useRoleStore((s) => s.activeRole)
export const useIsClientMode = () => useRoleStore((s) => s.activeRole === 'client')
export const useIsProMode = () => useRoleStore((s) => s.activeRole === 'pro')
