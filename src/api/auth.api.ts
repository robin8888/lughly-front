/**
 * Endpoints de autenticación.
 * Contrato: lughly-backend/src/modules/auth/auth.controller.ts
 */

import { apiRequest } from './http'
import type { ApiGeocodeMatch } from './geocode.api'
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
  /**
   * Su dirección, la que dio en el alta. **Puede ser null**: las cuentas
   * anteriores a que se pidiera no tienen ninguna, y eso no es un error que
   * el usuario pueda arreglar desde una pantalla de aviso.
   *
   * De aquí sale el punto que ordena el directorio por cercanía cuando no hay
   * GPS —o cuando no se le ha dado permiso—, que es la razón entera de
   * pedirla.
   *
   * Solo llega en la sesión propia y en `GET /v1/auth/me`. No es un dato que
   * se enseñe de un usuario a otro, y el backend no lo devuelve en ninguna
   * vista pública.
   */
  address: ApiGeocodeMatch | null
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
  /**
   * Obligatoria, y para los dos roles.
   *
   * Va como objeto y no como texto porque lo que se manda es **la dirección
   * elegida en el autocompletado**, con sus coordenadas: el backend la
   * rechaza sin ellas. Al cliente le sirve para ordenar el directorio por
   * cercanía y al profesional para tener punto de cobertura desde el alta,
   * que antes no tenía hasta pasar por la pantalla de Cobertura.
   */
  address: ApiGeocodeMatch
  /**
   * La ciudad base del profesional, que sale en su ficha.
   *
   * Sigue existiendo aparte de `address.city` porque hay quien tiene la base
   * en un pueblo y se anuncia con el nombre de la ciudad grande de al lado.
   * El formulario la rellena con la del geocodificador y le deja corregirla;
   * si no manda ninguna, el backend usa la de la dirección.
   */
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

  /**
   * @param currentPassword La actual. **Se omite** cuando la cuenta viene con
   *   contraseña temporal: quien está obligado a cambiarla la acaba de
   *   escribir para entrar, y el servidor no la vuelve a pedir. En cualquier
   *   otro caso es obligatoria y omitirla se rechaza.
   */
  changePassword: (currentPassword: string | undefined, newPassword: string) =>
    apiRequest<ApiSession>('/v1/me/password', {
      method: 'PATCH',
      body: currentPassword === undefined ? { newPassword } : { currentPassword, newPassword },
      auth: true,
    }),

  resendVerification: () =>
    apiRequest<{ sent: true }>('/v1/auth/email/verify/resend', {
      method: 'POST',
      auth: true,
    }),
}
