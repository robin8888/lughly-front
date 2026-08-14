/**
 * useRegister
 * Alta de cuenta contra POST /v1/auth/register
 *
 * Reglas del README (las valida el backend; aquí se replican para dar
 * respuesta inmediata al usuario):
 * - Rol cliente o profesional; si es profesional: oficio, tarifa y ciudad.
 * - Consentimiento RGPD obligatorio; comunicaciones opcional y desmarcado.
 * - Contraseña mínima de 10 caracteres.
 */

import { useCallback, useState } from 'react'
import { z } from 'zod'
import { authApi } from '@/api'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { useRoleStore } from '@/stores/useRoleStore'
import { toFieldErrors, type FieldErrors } from '@/utils/formErrors'
import { getTrade } from '@/utils/trades'
import { toAuthErrorState } from './useAuthError'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const MIN_PASSWORD_LENGTH = 10
export const MAX_PASSWORD_LENGTH = 128

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Escribe tu nombre completo'),
    email: z
      .string()
      .trim()
      .min(1, 'El email es obligatorio')
      .refine((value) => EMAIL_PATTERN.test(value), 'Email no válido'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Mínimo ${MIN_PASSWORD_LENGTH} caracteres`)
      .max(MAX_PASSWORD_LENGTH, `Máximo ${MAX_PASSWORD_LENGTH} caracteres`),
    role: z.enum(['client', 'pro']),
    /** Solo profesionales */
    trade: z.string().optional(),
    hourlyRate: z.string().optional(),
    city: z.string().optional(),
    acceptTerms: z.boolean(),
    acceptComms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.acceptTerms) {
      ctx.addIssue({
        code: 'custom',
        path: ['acceptTerms'],
        message:
          'Debes aceptar los Términos y la Política de privacidad para continuar.',
      })
    }

    if (data.role !== 'pro') return

    if (!data.trade || !getTrade(data.trade)) {
      ctx.addIssue({
        code: 'custom',
        path: ['trade'],
        message: 'Elige tu oficio principal',
      })
    }

    const rate = Number((data.hourlyRate ?? '').replace(',', '.'))
    if (!data.hourlyRate || Number.isNaN(rate) || rate <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['hourlyRate'],
        message: 'Indica una tarifa orientativa en €/h',
      })
    }

    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['city'],
        message: 'Indica tu ciudad base',
      })
    }
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type RegisterFieldErrors = FieldErrors<RegisterInput>

export interface RegisterResult {
  ok: boolean
}

export interface UseRegisterOptions {
  onSuccess?: (user: User) => void
}

export function useRegister({ onSuccess }: UseRegisterOptions = {}) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setActiveRole = useRoleStore((s) => s.setActiveRole)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const clearErrors = useCallback(() => {
    setFieldErrors({})
    setFormError(null)
  }, [])

  const register = useCallback(
    async (input: RegisterInput): Promise<RegisterResult> => {
      setFormError(null)

      const parsed = registerSchema.safeParse(input)
      if (!parsed.success) {
        setFieldErrors(toFieldErrors<RegisterInput>(parsed.error))
        return { ok: false }
      }

      setFieldErrors({})
      setIsLoading(true)

      try {
        const session = await authApi.register({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
          role: parsed.data.role,
          trade: parsed.data.trade,
          hourlyRate: parsed.data.hourlyRate,
          city: parsed.data.city,
          acceptTerms: parsed.data.acceptTerms,
          acceptComms: parsed.data.acceptComms,
        })

        setAuth(session.user, session.accessToken, session.refreshToken)
        setActiveRole(parsed.data.role)
        onSuccess?.(session.user)

        return { ok: true }
      } catch (error) {
        const state = toAuthErrorState<RegisterInput>(
          error,
          'No hemos podido crear tu cuenta. Inténtalo de nuevo.',
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

  return { register, isLoading, fieldErrors, formError, clearErrors }
}
