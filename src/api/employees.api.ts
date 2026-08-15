/**
 * Trabajadores a cargo.
 * Contrato: lughly-backend/src/modules/employees/employees.controller.ts
 *
 * No hay rol de empresa: es un profesional que ha declarado tener gente a su
 * cargo. Autónomo y empresa se distinguen solo en el identificador fiscal.
 */

import { apiRequest } from './http'

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
}
