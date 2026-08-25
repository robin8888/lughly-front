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
import { employeesApi } from '@/api/employees.api'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { useRoleStore } from '@/stores/useRoleStore'
import { toFieldErrors, type FieldErrors } from '@/utils/formErrors'
import { getTrade, getTradeLabel } from '@/utils/trades'
import { toAuthErrorState } from './useAuthError'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** La coma decimal es lo que teclea la gente en los campos de tarifa */
const tarifa = (valor: string) => Number(valor.replace(',', '.'))

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
    phone: z.string().optional(),
    role: z.enum(['client', 'pro']),
    /**
     * Solo profesionales: los oficios que ejerce, con la tarifa de cada uno.
     * Una persona que limpia casas también puede cuidar mascotas, y no cobra
     * lo mismo por las dos cosas.
     */
    trades: z
      .array(
        z.object({
          slug: z.string(),
          /**
           * Por hora, o por visita para evaluar y presupuestar. Se declara
           * aquí y no solo en el componente porque `safeParse` descarta lo que
           * el esquema no nombra: sin esta línea, elegir "por visita" en el
           * alta se perdía por el camino y el oficio llegaba al servidor sin
           * ninguna tarifa puesta.
           */
          pricingMode: z.enum(['HOURLY', 'VISIT']).default('HOURLY'),
          hourlyRate: z.string().default(''),
          visitFee: z.string().default(''),
          /*
            Los dos opcionales y como texto, que es lo que hay en el campo. El
            alta usa el mismo formulario que "Mis oficios", así que si no
            viajaran, quien los rellenase aquí los vería desaparecer sin que
            nada se lo dijera.
          */
          urgencyRate: z.string().default(''),
          description: z.string().default(''),
        }),
      )
      .default([]),
    city: z.string().optional(),
    acceptTerms: z.boolean(),
    acceptComms: z.boolean(),

    /**
     * Gente a cargo. No es otro rol: un autónomo con dos oficiales y una
     * empresa de veinte hacen lo mismo en la app. Lo único que cambia es si
     * el identificador fiscal es un NIF o un CIF.
     */
    hasStaff: z.boolean().default(false),
    legalForm: z.enum(['SELF_EMPLOYED', 'COMPANY']).optional(),
    taxId: z.string().optional(),
    legalName: z.string().optional(),
    acceptsStaffResponsibility: z.boolean().default(false),
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

    if (data.trades.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['trades'],
        message: 'Elige al menos un oficio',
      })
    }

    for (const [index, trade] of data.trades.entries()) {
      if (!getTrade(trade.slug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['trades', index, 'slug'],
          message: 'Ese oficio no existe',
        })
      }

      /*
        Se exige la tarifa del modo elegido, y solo esa: quien cobra por visita
        deja el campo de la hora vacío a propósito, y al revés. Mismo criterio
        que "Mis oficios y tarifas" (MyTradesPage: `canSave`).
      */
      const esVisita = trade.pricingMode === 'VISIT'
      const campo = esVisita ? 'visitFee' : 'hourlyRate'
      const escrito = esVisita ? trade.visitFee : trade.hourlyRate

      // La coma decimal es lo que teclea la gente aquí
      const rate = Number(escrito.replace(',', '.'))

      if (!escrito || Number.isNaN(rate) || rate <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['trades', index, campo],
          message: esVisita
            ? `Indica lo que cobras por la visita en ${getTradeLabel(trade.slug).toLowerCase()}`
            : `Indica lo que cobras por hora en ${getTradeLabel(trade.slug).toLowerCase()}`,
        })
      }
    }

    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['city'],
        message: 'Indica tu ciudad base',
      })
    }

    if (!data.hasStaff) return

    if (!data.legalForm) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalForm'],
        message: 'Dinos si eres autónomo o empresa',
      })
    }

    /**
     * Un NIF y un CIF se distinguen por la primera posición, así que la
     * misma expresión vale para los dos. Comprobar que la letra case con el
     * número es cosa del backend: aquí solo se evita el error de dedo.
     */
    if (!data.taxId || !/^([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z]|[A-Z][0-9]{7}[A-Z0-9])$/.test(data.taxId.trim().toUpperCase())) {
      ctx.addIssue({
        code: 'custom',
        path: ['taxId'],
        message:
          data.legalForm === 'COMPANY'
            ? 'Escribe el CIF de la empresa'
            : 'Escribe tu NIF',
      })
    }

    if (!data.legalName || data.legalName.trim().length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['legalName'],
        message:
          data.legalForm === 'COMPANY'
            ? 'Escribe la razón social'
            : 'Escribe tu nombre fiscal',
      })
    }

    if (!data.acceptsStaffResponsibility) {
      ctx.addIssue({
        code: 'custom',
        path: ['acceptsStaffResponsibility'],
        message: 'Tienes que aceptar la responsabilidad sobre tus trabajadores',
      })
    }
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type RegisterFieldErrors = FieldErrors<RegisterInput>

export interface RegisterResult {
  ok: boolean
  /**
   * Si marcó tener gente a cargo, si el alta como empleador llegó a
   * grabarse. La cuenta se crea igual aunque esto falle, así que hay que
   * decírselo: si no, entraría sin el botón de trabajadores y sin saber
   * por qué.
   */
  staffDeclared?: boolean
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

  /**
   * Cambia en cada intento fallido. El mensaje de cabecera se pinta arriba de
   * la tarjeta y el botón de enviar queda al final de un formulario largo:
   * sin algo que cambie en cada pulsación, dos fallos con el mismo mensaje
   * no moverían el scroll y el botón seguiría pareciendo muerto.
   */
  const [errorNonce, setErrorNonce] = useState(0)

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

        /**
         * Y un mensaje de cabecera. Los errores de campo se pintan junto a su
         * campo, que desde el botón —al final del formulario— queda fuera de
         * pantalla; y como este camino sale antes de `setIsLoading(true)`,
         * tampoco hay spinner. Sin esto, pulsar "Crear cuenta" no produce
         * ninguna señal visible.
         */
        setFormError('Revisa los campos marcados.')
        setErrorNonce((n) => n + 1)

        return { ok: false }
      }

      setFieldErrors({})
      setIsLoading(true)

      try {
        const esPro = parsed.data.role === 'pro'
        const ciudad = parsed.data.city?.trim()

        const session = await authApi.register({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
          phone: parsed.data.phone,
          role: parsed.data.role,
          /**
           * Los campos de profesional se **omiten** para un cliente, no se
           * mandan vacíos. En el backend son `optional()`, que permite que
           * falten pero no que lleguen en blanco: `trades` exige al menos un
           * oficio y `city` dos caracteres. Un `[]` y un `''` hacían que el
           * alta de un cliente se rechazara con un 400 pidiéndole oficio y
           * ciudad, campos que su formulario ni siquiera le enseña.
           */
          trades: esPro
            ? parsed.data.trades.map((trade) => {
                const esVisita = trade.pricingMode === 'VISIT'

                /*
                  Exactamente uno de los dos va puesto y el otro a `null`: es lo
                  que exige `proTradeSchema` en el servidor, que rechaza tanto
                  los dos a la vez como ninguno.
                */
                return {
                  slug: trade.slug,
                  hourlyRate: esVisita ? null : tarifa(trade.hourlyRate),
                  visitFee: esVisita ? tarifa(trade.visitFee) : null,
                  urgencyHourlyRate:
                    trade.urgencyRate.trim() === ''
                      ? null
                      : tarifa(trade.urgencyRate),
                  description: trade.description.trim(),
                }
              })
            : undefined,
          city: ciudad ? ciudad : undefined,
          acceptTerms: parsed.data.acceptTerms,
          acceptComms: parsed.data.acceptComms,
        })

        setAuth(session.user, session.accessToken, session.refreshToken)
        setActiveRole(parsed.data.role)
        onSuccess?.(session.user)

        /**
         * El alta como empleador va después y aparte, con la sesión que
         * acaba de emitirse. Meterla en el registro obligaría a que crear
         * una cuenta y declararse empresa fueran la misma transacción, y no
         * lo son: se puede empezar solo y contratar al primero un año
         * después.
         */
        let staffDeclared: boolean | undefined

        if (parsed.data.hasStaff && parsed.data.legalForm && parsed.data.taxId) {
          try {
            await employeesApi.declare({
              legalForm: parsed.data.legalForm,
              taxId: parsed.data.taxId.trim().toUpperCase(),
              legalName: (parsed.data.legalName ?? '').trim(),
              acceptsStaffResponsibility: true,
            })
            staffDeclared = true
          } catch {
            // La cuenta ya existe: no se tumba el alta por esto.
            staffDeclared = false
          }
        }

        return { ok: true, staffDeclared }
      } catch (error) {
        const state = toAuthErrorState<RegisterInput>(
          error,
          'No hemos podido crear tu cuenta. Inténtalo de nuevo.',
        )

        setFieldErrors(state.fieldErrors)
        setFormError(state.formError)
        setErrorNonce((n) => n + 1)

        return { ok: false }
      } finally {
        setIsLoading(false)
      }
    },
    [setAuth, setActiveRole, onSuccess],
  )

  return { register, isLoading, fieldErrors, formError, errorNonce, clearErrors }
}
