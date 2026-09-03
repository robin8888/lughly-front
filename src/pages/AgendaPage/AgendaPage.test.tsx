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

/*
  La tarjeta, sin sus estilos pero **con su `testID`**: se lo comía, y eso hace
  invisible para los tests todo lo que se envuelva en ella.
*/
jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return {
    InfoCard: ({ children, testID }: { children: ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  }
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
    startedAt: null,
    holdReason: null,
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

  /**
   * Uno cada vez. Nadie está en dos casas a la vez, y el reloj lo delata: dos
   * trabajos corriendo cuentan las mismas horas dos veces. La regla la impone
   * el servidor; aquí se apaga el botón y se dice por qué, que es la
   * diferencia entre una norma y un topetazo.
   */
  it('con otro en curso, no se puede empezar el siguiente', () => {
    soporte.jobs = [
      trabajo({
        id: 'job-9',
        status: 'IN_PROGRESS',
        appointmentStatus: 'STARTED',
        startedAt: '2026-08-29T12:00:00.000Z',
        title: 'Fuga en el baño',
      }),
      trabajo({ id: 'job-1' }),
    ]

    const { getByTestId } = render(<AgendaPage onBack={() => {}} />)

    expect(getByTestId('assigned-job-1-start')).toBeDisabled()
    expect(getByTestId('assigned-job-1-blocked')).toHaveTextContent(/Fuga en el baño/)

    fireEvent.press(getByTestId('assigned-job-1-start'))
    expect(hechos.started).toEqual([])
  })

  /** Y el que está en curso no se bloquea a sí mismo */
  it('el que está en curso sigue pudiendo terminarse', () => {
    soporte.jobs = [
      trabajo({
        status: 'IN_PROGRESS',
        appointmentStatus: 'STARTED',
        startedAt: '2026-08-29T12:00:00.000Z',
      }),
    ]

    const { getByTestId, queryByTestId } = render(<AgendaPage onBack={() => {}} />)

    expect(queryByTestId('assigned-job-1-blocked')).toBeNull()
    expect(getByTestId('assigned-job-1-finish')).toBeTruthy()
  })

  /**
   * Y el contador en la propia tarjeta: quien está dentro de una casa
   * trabajando no debería tener que abrir la ficha para ver cuánto lleva.
   */
  it('el trabajo en curso enseña su contador en la agenda', () => {
    soporte.jobs = [
      trabajo({
        status: 'IN_PROGRESS',
        appointmentStatus: 'STARTED',
        startedAt: '2026-08-29T12:00:00.000Z',
      }),
    ]

    const { getByTestId } = render(<AgendaPage onBack={() => {}} />)

    expect(getByTestId('assigned-job-1-timer')).toBeTruthy()
  })

  it('y el que aún no ha empezado, no', () => {
    soporte.jobs = [trabajo({})]

    const { queryByTestId } = render(<AgendaPage onBack={() => {}} />)

    expect(queryByTestId('assigned-job-1-timer')).toBeNull()
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
