/**
 * useLogin
 * Inicio de sesión contra POST /v1/auth/login
 *
 * Responsabilidades:
 * - Validar el formulario en cliente (respuesta inmediata al usuario)
 * - Llamar al backend, que es quien decide de verdad
 * - Guardar user + tokens en useAuthStore (persistido en SecureStore)
 *
 * OWASP M3: la contraseña no se guarda ni se registra en logs.
 * La validación de cliente es comodidad; la autoridad es el servidor.
 */

import { useCallback, useState } from 'react'
import { z } from 'zod'
import { authApi } from '@/api'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { useRoleStore } from '@/stores/useRoleStore'
import { toFieldErrors, type FieldErrors } from '@/utils/formErrors'
import { toAuthErrorState } from './useAuthError'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .refine((value) => EMAIL_PATTERN.test(value), 'Email no válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type LoginFieldErrors = FieldErrors<LoginInput>

export interface LoginResult {
  ok: boolean
}

export interface UseLoginOptions {
  /** Se llama tras guardar la sesión. La navegación vive en la página. */
  onSuccess?: (user: User) => void
}

export function useLogin({ onSuccess }: UseLoginOptions = {}) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setActiveRole = useRoleStore((s) => s.setActiveRole)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const clearErrors = useCallback(() => {
    setFieldErrors({})
    setFormError(null)
  }, [])

  const login = useCallback(
    async (input: LoginInput): Promise<LoginResult> => {
      setFormError(null)

      const parsed = loginSchema.safeParse(input)
      if (!parsed.success) {
        setFieldErrors(toFieldErrors<LoginInput>(parsed.error))
        return { ok: false }
      }

      setFieldErrors({})
      setIsLoading(true)

      try {
        const session = await authApi.login(parsed.data)

        setAuth(session.user, session.accessToken, session.refreshToken)

        /**
         * El modo activo se persiste en el dispositivo, así que hay que
         * ponerlo al del usuario que entra. Si no, quien inicie sesión
         * después hereda el modo del anterior: un cliente vería la interfaz
         * de profesional solo porque en ese móvil se registró uno antes.
         * Administración usa la vista de cliente.
         */
        setActiveRole(session.user.role === 'pro' ? 'pro' : 'client')

        onSuccess?.(session.user)

        return { ok: true }
      } catch (error) {
        const state = toAuthErrorState<LoginInput>(
          error,
          'No hemos podido iniciar sesión. Inténtalo de nuevo.',
        )

        setFieldErrors(state.fieldErrors)
        setFormError(state.formError)

        return { ok: false }
      } finally {
        setIsLoading(false)
      }
    },
    [setAuth, setActiveRole, onSuccess],
  )

  return { login, isLoading, fieldErrors, formError, clearErrors }
}
