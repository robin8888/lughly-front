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

/**
 * Los niveles de comisión, con los nombres de las castas de un hormiguero.
 *
 * Cuanto más se factura por la plataforma, menos comisión se paga. En inglés
 * como el enum del servidor; el nombre que se lee llega en `name`, y **no se
 * escribe aquí a mano**: un rótulo o un porcentaje pintado en el móvil que no
 * coincida con el que se cobra es la peor clase de error, porque nadie lo mira
 * hasta que alguien reclama.
 */
export type ApiCommissionLevel = 'WORKER' | 'FORAGER' | 'SOLDIER' | 'QUEEN'

/** Un escalón de la escalera */
export interface ApiLevelStep {
  level: ApiCommissionLevel
  /** Obrera, Forrajera, Soldado, Reina */
  name: string
  /** Lo que hay que facturar en la ventana para estar aquí */
  from: number
  /** Porcentaje, no fracción: 10 son diez por ciento */
  rate: number
  /** Lo que se suma al porcentaje, en euros */
  fixedFee: number
  current: boolean
}

export interface ApiCommissionLevelState {
  level: ApiCommissionLevel
  name: string
  /** Lo liberado en la ventana, en euros */
  volume: number
  windowDays: number
  nextLevel: ApiCommissionLevel | null
  nextName: string | null
  /** Lo que falta para el siguiente, o null si ya está arriba del todo */
  missingToNext: number | null
  /**
   * El nivel que **ya le daría su volumen**, cuando es más alto que el que
   * tiene. El nivel se recalcula una vez al mes y el volumen cambia cada día,
   * así que sin esto quien acaba de pasar el umbral leería "te faltan 0,00 €"
   * y seguiría en el nivel de antes, que parece un error.
   */
  earnedLevel: ApiCommissionLevel | null
  earnedName: string | null
  /** ISO, o null si todavía no se ha revisado ninguna vez */
  reviewedAt: string | null
  ladder: ApiLevelStep[]
}

export const paymentsApi = {
  /**
   * Su nivel de comisión, lo que lleva facturado y lo que le falta para el
   * siguiente. Devuelve 404 a quien no tiene cuenta de cobro propia: un
   * trabajador por cuenta ajena —cuya comisión paga su empresa— o quien
   * todavía no la ha activado.
   */
  commissionLevel: () =>
    apiRequest<ApiCommissionLevelState>('/v1/payments/commission-level', {
      auth: true,
    }),

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
