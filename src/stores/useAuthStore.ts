/**
 * Auth Store
 * Gestiona tokens y estado de autenticación
 *
 * OWASP M9: Los tokens se persisten en expo-secure-store mediante secureStorage
 * OWASP M3: Access token corto (15 min) + refresh con rotación
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { secureStorage, SECURE_KEYS } from '@/security'

export type UserRole = 'client' | 'pro' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  /** Identidad verificada por backoffice: es la que habilita a operar */
  verified: boolean
  /** Email confirmado mediante el enlace del correo */
  emailVerified: boolean
  /** Ruta de la foto de perfil, relativa a la API */
  avatarUrl: string | null
  /**
   * Entró con la contraseña temporal que le puso su empleador y aún no la ha
   * cambiado. Mientras siga así no se le deja pasar del cambio: si el
   * empleador conoce la contraseña, nada de lo que haga esa cuenta prueba
   * quién lo hizo.
   */
  mustChangePassword: boolean
  /** Teléfono de contacto; null si no lo ha puesto */
  phone: string | null
  /**
   * Su dirección, la que dio en el alta. De aquí sale el punto que ordena el
   * directorio por cercanía cuando no hay posición del GPS.
   *
   * **Puede ser null** y hay que contar con ello: las cuentas anteriores a que
   * la dirección se pidiera en el alta no tienen ninguna. Para esas, el
   * directorio sigue saliendo sin ordenar por distancia, igual que antes.
   */
  address: {
    label: string
    lat: number
    lng: number
    city: string | null
    postcode: string | null
  } | null
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  /**
   * SecureStore es asíncrono: hasta que no termina de leerse, `isAuthenticated`
   * es false aunque haya sesión guardada. Sin esta bandera, al abrir la app un
   * usuario con sesión vería el splash un instante antes de saltar a las tabs.
   */
  hasHydrated: boolean

  // Acciones
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  updateUser: (user: Partial<User>) => void
  clearAuth: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
    }),
    {
      name: 'lughly.auth',
      storage: createJSONStorage(() => secureStorage),
      // Solo persistir tokens y user básico. `hasHydrated` queda fuera a
      // propósito: describe esta ejecución, no la sesión.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Se ejecuta al terminar la lectura, haya sesión o no (incluso si falla)
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Selectores atómicos
export const useHasHydrated = () => useAuthStore((s) => s.hasHydrated)
export const useUser = () => useAuthStore((s) => s.user)
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated)
export const useAccessToken = () => useAuthStore((s) => s.accessToken)
export const useUserRole = () => useAuthStore((s) => s.user?.role)

/**
 * `?? false` y no `?? true`: una sesión guardada de antes de esta bandera no
 * trae el campo, y dar por hecho que hay que cambiar la contraseña dejaría a
 * esos usuarios encerrados en una pantalla que no les corresponde.
 */
export const useMustChangePassword = () =>
  useAuthStore((s) => s.user?.mustChangePassword ?? false)
