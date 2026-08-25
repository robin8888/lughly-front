/**
 * Endpoints de autenticación.
 * Contrato: lughly-backend/src/modules/auth/auth.controller.ts
 */

import { apiRequest } from './http'
import type { UserRole } from '@/stores/useAuthStore'

export interface ApiUser {
  id: string
  email: string
  name: string
  role: UserRole
  /** Identidad verificada por backoffice */
  verified: boolean
  /** Email confirmado por enlace */
  emailVerified: boolean
  /** Ruta de la foto de perfil, relativa a la API */
  avatarUrl: string | null
  /**
   * Entró con la contraseña temporal que le puso su empresa y no la ha
   * cambiado. La app debe llevarle a cambiarla antes de dejarle operar.
   */
  mustChangePassword: boolean
  phone: string | null
}

export interface ApiSession {
  user: ApiUser
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  /** Para que el cliente pueda llamar; opcional en el alta */
  phone?: string
  role: 'client' | 'pro'
  /** Los oficios que ejerce, con la tarifa de cada uno. Solo profesionales. */
  trades?: {
    slug: string
    /**
     * Por hora o por visita, nunca los dos: exactamente uno de `hourlyRate` y
     * `visitFee` va puesto, y el otro viaja a `null`. Es el mismo contrato que
     * PUT /v1/pro/trades — el backend comparte `proTradesSchema` entre el alta
     * y "Mis oficios y tarifas".
     */
    hourlyRate?: number | string | null
    /** Lo que cobra por presentarse a evaluar y presupuestar */
    visitFee?: number | null
    /** Vacío o ausente = no atiende urgencias de ese oficio */
    urgencyHourlyRate?: number | null
    /** Qué hace en ese oficio. Vacío = se enseña la general del perfil */
    description?: string | null
  }[]
  city?: string
  acceptTerms: boolean
  acceptComms: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiRequest<ApiSession>('/v1/auth/register', {
      method: 'POST',
      body: payload,
    }),

  login: (payload: LoginPayload) =>
    apiRequest<ApiSession>('/v1/auth/login', { method: 'POST', body: payload }),

  logout: (refreshToken: string) =>
    apiRequest<null>('/v1/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }),

  me: () => apiRequest<ApiUser>('/v1/auth/me', { auth: true }),

  /**
   * Pide el código de recuperación.
   * La respuesta es idéntica exista o no la cuenta: el backend no revela
   * quién está registrado, y la app no debe intentar deducirlo.
   */
  forgotPassword: (email: string) =>
    apiRequest<{ accepted: true }>('/v1/auth/password/forgot', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (code: string, password: string) =>
    apiRequest<{ changed: true }>('/v1/auth/password/reset', {
      method: 'POST',
      body: { code, password },
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<ApiSession>('/v1/me/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
      auth: true,
    }),

  resendVerification: () =>
    apiRequest<{ sent: true }>('/v1/auth/email/verify/resend', {
      method: 'POST',
      auth: true,
    }),
}
