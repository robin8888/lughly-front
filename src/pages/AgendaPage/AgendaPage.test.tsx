/**
 * Empezar y terminar donde se vive el día.
 *
 * La agenda es la pantalla que se abre estando en el portal, así que los dos
 * botones que mueven un trabajo —y que acaban soltando el dinero retenido—
 * tienen que salir aquí, y solo cuando toca: empezar con la cita confirmada,
 * terminar con el trabajo empezado, y nada cuando ya se está esperando a que
 * el cliente lo dé por bueno.
 */

import { fireEvent, render } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import type { ApiAssignedJob } from '@/api/assignments.api'
import { AgendaPage } from './AgendaPage'

jest.mock('@/hooks/domain/useInbox', () => {
  const soporte = { jobs: [] as unknown[] }

  return {
    soporte,
    useAssignedJobs: () => ({
      data: { items: soporte.jobs },
      isPending: false,
      isError: false,
      isFetching: false,
      refetch: () => {},
    }),
  }
})

jest.mock('@/hooks/domain/useJob', () => {
  const hechos = { started: [] as string[], finished: [] as string[] }

  return {
    hechos,
    useJobProgress: () => ({
      start: (jobId: string) => {
        hechos.started.push(jobId)
        return Promise.resolve({ ok: true, error: null, result: null })
      },
      finish: (jobId: string) => {
        hechos.finished.push(jobId)
        return Promise.resolve({ ok: true, error: null, result: null })
      },
      isStarting: false,
      isFinishing: false,
    }),
  }
})

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))
jest.mock('@/hooks/ui/useTabBarClearance', () => ({ useTabBarClearance: () => 0 }))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return { InfoCard: ({ children }: { children: ReactNode }) => <View>{children}</View> }
})

const { soporte } = jest.requireMock('@/hooks/domain/useInbox')
const { hechos } = jest.requireMock('@/hooks/domain/useJob')

/** Un trabajo adjudicado con lo justo, y encima lo que cambia en cada caso */
function trabajo(cambios: Partial<ApiAssignedJob>): ApiAssignedJob {
  return {
    id: 'job-1',
    type: 'INSTANT',
    status: 'CONTRACTED',
    appointmentStatus: 'CONFIRMED',
    workFinishedAt: null,
    title: 'Cambiar un grifo',
    description: 'Gotea',
    trade: 'fontaneria',
    tradeLabel: 'Fontanería',
    city: 'Madrid',
    addressLine: 'Calle Mayor 1',
    latitude: null,
    longitude: null,
    preferredDate: null,
    clientName: 'Ana',
    clientPhone: null,
    amount: 60,
    photoCount: 0,
    awardedAt: null,
    createdAt: '2026-08-29T09:00:00.000Z',
    photos: [],
    ...cambios,
  }
}

beforeEach(() => {
  hechos.started.length = 0
  hechos.finished.length = 0
})

describe('AgendaPage: el día del trabajo', () => {
  it('con la cita confirmada, se puede empezar', () => {
    soporte.jobs = [trabajo({})]

    const { getByTestId, queryByTestId } = render(<AgendaPage onBack={() => {}} />)

    fireEvent.press(getByTestId('assigned-job-1-start'))

    expect(hechos.started).toEqual(['job-1'])
    expect(queryByTestId('assigned-job-1-finish')).toBeNull()
  })

  it('empezado, se puede terminar', () => {
    soporte.jobs = [trabajo({ status: 'IN_PROGRESS', appointmentStatus: 'STARTED' })]

    const { getByTestId, queryByTestId } = render(<AgendaPage onBack={() => {}} />)

    fireEvent.press(getByTestId('assigned-job-1-finish'))

    expect(hechos.finished).toEqual(['job-1'])
    expect(queryByTestId('assigned-job-1-start')).toBeNull()
  })

  it('terminado, ni un botón más: se dice a qué se espera', () => {
    soporte.jobs = [
      trabajo({
        status: 'IN_PROGRESS',
        appointmentStatus: null,
        workFinishedAt: '2026-08-29T12:00:00.000Z',
      }),
    ]

    const { getByTestId, queryByTestId } = render(<AgendaPage onBack={() => {}} />)

    expect(queryByTestId('assigned-job-1-start')).toBeNull()
    expect(queryByTestId('assigned-job-1-finish')).toBeNull()
    expect(getByTestId('assigned-job-1-awaiting')).toBeTruthy()
  })
})
