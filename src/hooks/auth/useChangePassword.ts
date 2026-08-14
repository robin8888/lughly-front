/**
 * useChangePassword
 * Cambio de contraseña desde Mi cuenta (PATCH /v1/me/password).
 *
 * El backend cierra TODAS las sesiones al cambiarla y devuelve una nueva
 * para este dispositivo: hay que guardarla, o la app se quedaría con unos
 * tokens que acaban de ser revocados.
 */

import { useCallback, useState } from 'react'
import { z } from 'zod'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { toFieldErrors, type FieldErrors } from '@/utils/formErrors'
import { toAuthErrorState } from './useAuthError'
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from './useRegister'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Escribe tu contraseña actual'),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`)
      .max(MAX_PASSWORD_LENGTH, `Máximo ${MAX_PASSWORD_LENGTH} caracteres`),
    repeatPassword: z.string().min(1, 'Repite la contraseña nueva'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.repeatPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['repeatPassword'],
        message: 'Las contraseñas no coinciden',
      })
    }

    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'La contraseña nueva debe ser distinta de la actual',
      })
    }
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export function useChangePassword() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ChangePasswordInput>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const clearErrors = useCallback(() => {
    setFieldErrors({})
    setFormError(null)
  }, [])

  const change = useCallback(
    async (input: ChangePasswordInput): Promise<boolean> => {
      setFormError(null)

      const parsed = changePasswordSchema.safeParse(input)
      if (!parsed.success) {
        setFieldErrors(toFieldErrors<ChangePasswordInput>(parsed.error))
        return false
      }

      setFieldErrors({})
      setIsLoading(true)

      try {
        const session = await authApi.changePassword(
          parsed.data.currentPassword,
          parsed.data.newPassword,
        )

        // Sesión nueva: los tokens anteriores ya no valen
        setAuth(session.user, session.accessToken, session.refreshToken)

        return true
      } catch (error) {
        const state = toAuthErrorState<ChangePasswordInput>(
          error,
          'No hemos podido cambiar la contraseña. Inténtalo de nuevo.',
        )

        // El backend responde con el mismo error genérico del login; en esta
        // pantalla sí sabemos qué campo lo ha provocado.
        if (state.formError && Object.keys(state.fieldErrors).length === 0) {
          setFieldErrors({ currentPassword: state.formError })
        } else {
          setFieldErrors(state.fieldErrors)
          setFormError(state.formError)
        }

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [setAuth],
  )

  return { change, isLoading, fieldErrors, formError, clearErrors }
}
