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
  ApiAvailabilityCalendar,
  ApiAvailabilityWindow,
  ApiCalendarDay,
  ApiCoverageSettings,
  ApiDayWindow,
  ApiHoliday,
  ApiHolidayCalendar,
  ApiSurcharges,
} from './pros.api'
import type { TaxIdKind } from '@/utils/taxId'

export type LegalForm = 'SELF_EMPLOYED' | 'COMPANY'

export interface ApiEmployer {
  legalForm: LegalForm
  /**
   * Con qué documento. **Null en las cuentas anteriores a que se preguntara**:
   * de aquellas solo se sabe que pasaron la comprobación de NIF o CIF.
   */
  taxIdKind: TaxIdKind | null
  /** El número: NIF, NIE, pasaporte o CIF, según `taxIdKind` */
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
  /**
   * Con qué documento se identifica. **Se manda, no se deduce del número.**
   *
   * Un pasaporte no se puede comprobar —no lleva dígito de control y cada país
   * numera a su manera—, así que sin la clase habría que aceptar como
   * pasaporte cualquier cosa que no encajara en las formas españolas, incluido
   * un NIF con una cifra de menos. Con ella, cada uno se valida con su regla.
   */
  taxIdKind: TaxIdKind
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
  trades: {
    slug: string
    hourlyRate: number
    /** Qué hace en ese oficio: es lo que lee el cliente en su ficha */
    description?: string | null
  }[]
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

  /**
   * Su calendario, mes a mes. Mismo formato que el propio y por lo mismo: es
   * la misma pantalla y el servidor comparte el código.
   */
  availabilityCalendar: (id: string, month: string) =>
    apiRequest<ApiAvailabilityCalendar>(
      `/v1/employees/${id}/availability/calendar?month=${month}`,
      { auth: true },
    ),

  /** Las horas de un día suelto suyo. La lista vacía es "ese día no trabaja". */
  setAvailabilityDay: (id: string, date: string, windows: ApiDayWindow[]) =>
    apiRequest<ApiCalendarDay>(`/v1/employees/${id}/availability/days/${date}`, {
      method: 'PUT',
      auth: true,
      body: { windows },
    }),

  /** Quita lo puesto a ese día: vuelve a mandar su horario semanal */
  clearAvailabilityDay: (id: string, date: string) =>
    apiRequest<ApiCalendarDay>(`/v1/employees/${id}/availability/days/${date}`, {
      method: 'DELETE',
      auth: true,
    }),

  /** El atajo de varios días de la semana de una vez, sobre su horario semanal */
  setAvailabilityWeekdays: (id: string, weekdays: number[], windows: ApiDayWindow[]) =>
    apiRequest<ApiAvailabilityWindow[]>(
      `/v1/employees/${id}/availability/weekdays`,
      { method: 'PUT', auth: true, body: { weekdays, windows } },
    ),

  /**
   * Los recargos de un trabajador. Los pone la empresa, igual que su horario,
   * su zona y sus ausencias: es ella quien le cobra al cliente y quien
   * factura. Lo que le deba a él por trabajar ese día va por nómina y no se
   * decide aquí.
   */
  surcharges: (id: string) =>
    apiRequest<ApiSurcharges>(`/v1/employees/${id}/surcharges`, { auth: true }),

  setSurcharges: (
    id: string,
    payload: { saturday: number; sunday: number; night: number },
  ) =>
    apiRequest<ApiSurcharges>(`/v1/employees/${id}/surcharges`, {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  /** Sus festivos: los de la comunidad donde la empresa le ha puesto la base */
  holidays: (id: string, year: number) =>
    apiRequest<ApiHolidayCalendar>(`/v1/employees/${id}/holidays?year=${year}`, {
      auth: true,
    }),

  setHolidayChoice: (id: string, date: string, appliesSurcharge: boolean) =>
    apiRequest<ApiHoliday>(`/v1/employees/${id}/holidays/${date}`, {
      method: 'PUT',
      auth: true,
      body: { appliesSurcharge },
    }),

  coverage: (id: string) =>
    apiRequest<ApiCoverageSettings>(`/v1/employees/${id}/coverage`, { auth: true }),

  setCoverage: (
    id: string,
    payload: {
      latitude: number
      longitude: number
      radiusKm: number
      city?: string
      /** `null` lo vacía: mover la base sin saber el nuevo no puede dejar el viejo */
      postcode?: string | null
    },
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
