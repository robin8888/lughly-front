/**
 * Trabajadores a cargo.
 * Contrato: lughly-backend/src/modules/employees/employees.controller.ts
 *
 * No hay rol de empresa: es un profesional que ha declarado tener gente a su
 * cargo. Autónomo y empresa se distinguen solo en el identificador fiscal.
 */

import { apiRequest } from './http'
import type {
  ApiAbsence,
  ApiAvailabilityWindow,
  ApiCoverageSettings,
} from './pros.api'

export type LegalForm = 'SELF_EMPLOYED' | 'COMPANY'

export interface ApiEmployer {
  legalForm: LegalForm
  /** NIF si es autónomo, CIF si es empresa */
  taxId: string
  legalName: string
  employeeCount: number
  /** Los oficios que cubre, derivados de sus trabajadores */
  trades: string[]
  acceptedResponsibilityAt: string | null
}

export interface ApiEmployee {
  id: string
  name: string
  email: string
  phone: string | null
  /** Su oficio principal, el que encabeza su ficha */
  trade: string
  tradeLabel: string
  /** Todos los que ejerce. Sin tarifa: el empleado no la ve. */
  trades: { slug: string; label: string }[]
  city: string
  /** Ha subido su documento y backoffice lo aprobó */
  identityVerified: boolean
  /** Sigue con la contraseña temporal: no ha llegado a entrar */
  pendingFirstLogin: boolean
  createdAt: string
}

export interface BecomeEmployerPayload {
  legalForm: LegalForm
  taxId: string
  legalName: string
  /** Obligatorio: es lo que sostiene no pedir documento a cada empleado */
  acceptsStaffResponsibility: true
}

/**
 * Una franja en la que el trabajador puede atender urgencias.
 *
 * Las horas van en hora local española, "HH:MM". No viaja ninguna zona
 * horaria porque no hay ninguna que elegir: "los sábados a las 22:00" son
 * las diez de la noche en el reloj de la pared, en verano y en invierno.
 */
export interface ApiUrgencyWindow {
  /** 0 domingo … 6 sábado */
  weekday: number
  from: string
  to: string
  /** Tarifa base de urgencia; los recargos se aplican encima */
  hourlyRate: number
}

export interface CreateEmployeePayload {
  name: string
  email: string
  phone: string
  nationalId: string
  /** Sus oficios, con la tarifa que cobra la empresa por cada uno */
  trades: { slug: string; hourlyRate: number }[]
  city: string
  radiusKm?: number
  latitude?: number
  longitude?: number
}

export const employeesApi = {
  employer: () =>
    apiRequest<{ employer: ApiEmployer | null }>('/v1/employer', { auth: true }),

  declare: (payload: BecomeEmployerPayload) =>
    apiRequest<ApiEmployer>('/v1/employer', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  list: () => apiRequest<{ items: ApiEmployee[] }>('/v1/employees', { auth: true }),

  create: (payload: CreateEmployeePayload) =>
    apiRequest<ApiEmployee>('/v1/employees', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  /**
   * Da de baja al trabajador. La cuenta no se borra: sus valoraciones son de
   * los clientes que las escribieron y los trabajos que hizo son parte del
   * historial de esos trabajos.
   */
  remove: (id: string) =>
    apiRequest<null>(`/v1/employees/${id}`, { method: 'DELETE', auth: true }),

  /** El horario de urgencias que tiene puesto ahora mismo */
  urgencyWindows: (id: string) =>
    apiRequest<ApiUrgencyWindow[]>(`/v1/employees/${id}/urgency-windows`, {
      auth: true,
    }),

  /**
   * Guarda la semana completa. No hay alta y baja de franjas sueltas: a
   * medias, el trabajador quedaría de guardia a horas que la empresa ya no
   * quiere, y de guardia significa que puede aparecerle un cliente.
   */
  /**
   * Lo mismo que un profesional se pone a sí mismo, pero de su gente: horario,
   * zona y días fuera. Mismos tipos y mismas reglas —el servidor comparte el
   * código— y lo único que cambia es quién puede.
   */
  availability: (id: string) =>
    apiRequest<ApiAvailabilityWindow[]>(`/v1/employees/${id}/availability`, {
      auth: true,
    }),

  setAvailability: (id: string, windows: ApiAvailabilityWindow[]) =>
    apiRequest<ApiAvailabilityWindow[]>(`/v1/employees/${id}/availability`, {
      method: 'PUT',
      auth: true,
      body: { windows },
    }),

  coverage: (id: string) =>
    apiRequest<ApiCoverageSettings>(`/v1/employees/${id}/coverage`, { auth: true }),

  setCoverage: (
    id: string,
    payload: { latitude: number; longitude: number; radiusKm: number; city?: string },
  ) =>
    apiRequest<ApiCoverageSettings>(`/v1/employees/${id}/coverage`, {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  absences: (id: string) =>
    apiRequest<ApiAbsence[]>(`/v1/employees/${id}/absences`, { auth: true }),

  addAbsence: (
    id: string,
    payload: { startsOn: string; endsOn: string; reason?: string },
  ) =>
    apiRequest<ApiAbsence>(`/v1/employees/${id}/absences`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  removeAbsence: (id: string, absenceId: string) =>
    apiRequest<null>(`/v1/employees/${id}/absences/${absenceId}`, {
      method: 'DELETE',
      auth: true,
    }),

  setUrgencyWindows: (id: string, windows: ApiUrgencyWindow[]) =>
    apiRequest<ApiUrgencyWindow[]>(`/v1/employees/${id}/urgency-windows`, {
      method: 'PUT',
      auth: true,
      body: { windows },
    }),
}
