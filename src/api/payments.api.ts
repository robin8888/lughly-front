/**
 * Cobros: cuenta de cobro del empleador y métodos de pago del cliente.
 * Contrato: lughly-backend/src/modules/payments/payments.controller.ts
 *
 * `Charge`, liberar y reembolsar no tienen espejo aquí: no tienen ruta HTTP
 * propia en el backend — las llaman los casos de uso de reserva de las fases
 * siguientes de COMO_SE_CONTRATA.md v3, no directamente el móvil.
 */

import { apiRequest } from './http'

/** Respuesta de POST /v1/payments/connect/onboarding-link */
export interface ApiOnboardingLink {
  url: string
}

/**
 * Estado de la cuenta Connect del `Employer`, tal y como lo ve Stripe.
 *
 * `transfersEnabled` es lo que de verdad bloquea contratar (COMO_SE_CONTRATA.md
 * v3 §9): sin él nadie puede recibir lo que libera un `Charge`. `payoutsEnabled`
 * es poder sacar ese saldo al banco, y puede llegar después.
 */
export interface ApiAccountStatus {
  hasAccount: boolean
  transfersEnabled: boolean
  payoutsEnabled: boolean
}

/** Respuesta de POST /v1/payments/setup-intent */
export interface ApiSetupIntent {
  clientSecret: string
}

/** Una tarjeta guardada, tal y como la devuelve GET /v1/payments/methods */
export interface ApiPaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export const paymentsApi = {
  /**
   * Crea la cuenta Connect del `Employer` si no existe todavía, y devuelve el
   * enlace de onboarding de Stripe. Solo para quien es empleador (autónomo o
   * empresa), nunca para un trabajador por cuenta ajena.
   */
  onboardingLink: (returnUrl: string, refreshUrl: string) =>
    apiRequest<ApiOnboardingLink>('/v1/payments/connect/onboarding-link', {
      method: 'POST',
      auth: true,
      body: { returnUrl, refreshUrl },
    }),

  /** Pregunta a Stripe si la cuenta ya puede recibir transferencias y retirar */
  accountStatus: () =>
    apiRequest<ApiAccountStatus>('/v1/payments/connect/account-status', {
      auth: true,
    }),

  /**
   * `client_secret` para que el móvil confirme el `SetupIntent` con el
   * PaymentSheet de Stripe. Crea el `Customer` en Stripe si hace falta.
   */
  setupIntent: () =>
    apiRequest<ApiSetupIntent>('/v1/payments/setup-intent', {
      method: 'POST',
      auth: true,
    }),

  /** Las tarjetas guardadas. Vacío si nunca ha guardado ninguna. */
  methods: () => apiRequest<ApiPaymentMethod[]>('/v1/payments/methods', { auth: true }),
}
