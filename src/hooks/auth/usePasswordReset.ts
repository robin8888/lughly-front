/**
 * usePasswordReset
 * Recuperación de contraseña en dos pasos:
 *   1. `requestCode`  → el backend envía un código de 6 dígitos por correo
 *   2. `confirmReset` → con el código, fija la contraseña nueva
 *
 * El paso 1 responde igual exista o no la cuenta. La app **no debe** intentar
 * deducir si el email está registrado: sería el mismo agujero de enumeración
 * que el backend evita a propósito.
 */

import { useCallback, useState } from 'react'
import { z } from 'zod'
import { authApi } from '@/api'
import { toFieldErrors, type FieldErrors } from '@/utils/formErrors'
import { toAuthErrorState } from './useAuthError'
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from './useRegister'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .refine((value) => EMAIL_PATTERN.test(value), 'Email no válido'),
})

export const resetPasswordSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'El código son 6 dígitos'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`)
    .max(MAX_PASSWORD_LENGTH, `Máximo ${MAX_PASSWORD_LENGTH} caracteres`),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<ForgotPasswordInput & ResetPasswordInput>
  >({})
  const [formError, setFormError] = useState<string | null>(null)

  const clearErrors = useCallback(() => {
    setFieldErrors({})
    setFormError(null)
  }, [])

  const requestCode = useCallback(
    async (input: ForgotPasswordInput): Promise<boolean> => {
      setFormError(null)

      const parsed = forgotPasswordSchema.safeParse(input)
      if (!parsed.success) {
        setFieldErrors(toFieldErrors<ForgotPasswordInput>(parsed.error))
        return false
      }

      setFieldErrors({})
      setIsLoading(true)

      try {
        await authApi.forgotPassword(parsed.data.email)
        return true
      } catch (error) {
        const state = toAuthErrorState<ForgotPasswordInput>(
          error,
          'No hemos podido enviar el código. Inténtalo de nuevo.',
        )
        setFieldErrors(state.fieldErrors)
        setFormError(state.formError)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const confirmReset = useCallback(
    async (input: ResetPasswordInput): Promise<boolean> => {
      setFormError(null)

      const parsed = resetPasswordSchema.safeParse(input)
      if (!parsed.success) {
        setFieldErrors(toFieldErrors<ResetPasswordInput>(parsed.error))
        return false
      }

      setFieldErrors({})
      setIsLoading(true)

      try {
        await authApi.resetPassword(parsed.data.code, parsed.data.password)
        return true
      } catch (error) {
        const state = toAuthErrorState<ResetPasswordInput>(
          error,
          'No hemos podido cambiar la contraseña. Inténtalo de nuevo.',
        )
        setFieldErrors(state.fieldErrors)
        setFormError(state.formError)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return { requestCode, confirmReset, isLoading, fieldErrors, formError, clearErrors }
}
