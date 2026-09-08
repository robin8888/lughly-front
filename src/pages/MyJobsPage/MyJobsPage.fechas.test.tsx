/**
 * Cuándo empezó y cuándo acabó cada trabajo.
 *
 * La lista decía en qué estado está cada uno y no decía **cuándo pasó**, que
 * es lo que hace falta para orientarse en una cuenta con unos meses encima:
 * media docena de tarjetas que ponen «Terminada» y ninguna forma de saber cuál
 * es de la semana pasada.
 *
 * Lo que se ata aquí son los tres casos que se cruzan y no son obvios: que
 * «terminó» valga también antes de darlo por bueno, que una cancelación
 * sustituya al fin pero no al inicio, y que un trabajo que no ha empezado no
 * enseñe ninguna.
 */

import { render } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import type { ApiJob } from '@/api/jobs.api'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { useSeenJobStatesStore } from '@/stores/useSeenJobStatesStore'
import { MyJobsPage } from './MyJobsPage'

jest.mock('@/hooks/domain/useMyJobs', () => {
  const soporte = { items: [] as unknown[] }

  return {
    soporte,
    useMyJobs: () => ({
      data: { items: soporte.items, total: soporte.items.length },
      isPending: false,
      isError: false,
      refetch: () => {},
      isFetching: false,
    }),
  }
})

jest.mock('@/hooks/domain/useInbox', () => ({
  useRespondSubstitute: () => ({
    respond: () => Promise.resolve({ ok: true, error: null }),
    isResponding: false,
  }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))
jest.mock('@/hooks/ui/useTabBarClearance', () => ({ useTabBarClearance: () => 0 }))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return {
    InfoCard: ({ children, testID }: { children: ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  }
})

const { soporte } = jest.requireMock('@/hooks/domain/useMyJobs')

const CLIENTE = { id: 'cli-1', name: 'Ana' } as unknown as User

function trabajo(cambios: Partial<ApiJob>): ApiJob {
  return {
    id: 'job-1',
    type: 'INSTANT',
    status: 'COMPLETED',
    appointmentStatus: null,
    title: 'Cambiar el grifo',
    description: 'El de la cocina',
    trade: 'fontaneria',
    tradeLabel: 'Fontanería',
    city: 'Madrid',
    maxBudget: null,
    preferredDate: null,
    photoCount: 0,
    requestedProName: null,
    proId: 'pro-1',
    proName: 'Tomás',
    proAvatarUrl: null,
    substituteProName: null,
    respondByAt: null,
    createdAt: '2026-09-01T09:00:00.000Z',
    workFinishedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    ...cambios,
  }
}

const pintar = (cambios: Partial<ApiJob>) => {
  soporte.items = [trabajo(cambios)]
  return render(<MyJobsPage onBrowse={() => {}} onBack={() => {}} />)
}

beforeEach(() => {
  soporte.items = []
  useSeenJobStatesStore.setState({ states: {} })
  useAuthStore.setState({ user: CLIENTE })
})

describe('las fechas de la tarjeta', () => {
  it('un trabajo hecho enseña cuándo empezó y cuándo terminó', () => {
    const { getByText } = pintar({
      startedAt: '2026-09-03T08:30:00.000Z',
      completedAt: '2026-09-05T17:00:00.000Z',
    })

    expect(getByText(/Empezó el 03\/09\/2026/)).toBeTruthy()
    expect(getByText(/Terminó el 05\/09\/2026/)).toBeTruthy()
  })

  /**
   * El profesional ha dicho que acabó y el cliente todavía no lo ha dado por
   * bueno: el trabajo sigue `IN_PROGRESS`, pero la fecha de fin ya existe.
   * Esperar a `completedAt` dejaría la tarjeta diciendo «Falta darlo por
   * bueno» sin decir desde cuándo, que es justo el dato que hace falta para
   * saber si urge.
   */
  it('vale la fecha en que dijo que había acabado, antes de darlo por bueno', () => {
    const { getByText } = pintar({
      status: 'IN_PROGRESS',
      startedAt: '2026-09-03T08:30:00.000Z',
      workFinishedAt: '2026-09-04T13:00:00.000Z',
    })

    expect(getByText(/Terminó el 04\/09\/2026/)).toBeTruthy()
  })

  /**
   * Cancelado a media faena: la cancelación sustituye al fin —no lo hubo—
   * pero **no** al inicio. Las dos juntas son las que cuentan que alguien
   * empezó y aquello se cayó.
   */
  it('una cancelación sustituye al fin, no al inicio', () => {
    const { getByText, queryByText } = pintar({
      status: 'CANCELLED',
      startedAt: '2026-09-03T08:30:00.000Z',
      cancelledAt: '2026-09-06T10:00:00.000Z',
    })

    expect(getByText(/Empezó el 03\/09\/2026/)).toBeTruthy()
    expect(getByText(/Cancelado el 06\/09\/2026/)).toBeTruthy()
    expect(queryByText(/Terminó el/)).toBeNull()
  })

  it('lo que no ha empezado no enseña ninguna', () => {
    const { queryByText } = pintar({ status: 'PENDING_PRO' })

    expect(queryByText(/Empezó el/)).toBeNull()
    expect(queryByText(/Terminó el/)).toBeNull()
    expect(queryByText(/Cancelado el/)).toBeNull()
  })
})
