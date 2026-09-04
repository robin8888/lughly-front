/**
 * Qué se ha movido, sin tener que leerlo todo.
 *
 * Los trabajos van repartidos en pestañas por forma de contratar, y el aviso
 * al móvil llega una vez: quien lo tenía en silencio abre la lista y no tiene
 * forma de saber cuál de los ocho ha cambiado, ni en qué pestaña está. Eso es
 * lo que ata este fichero: el punto sale **donde hay novedad y solo ahí**, y
 * lo que se ve por primera vez no cuenta como novedad.
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

/* La tarjeta, sin estilos pero con su `testID`: si se lo come, lo que
   envuelve deja de existir para los tests */
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

/** Un trabajo con lo justo, y lo que cambia en cada caso encima */
function trabajo(cambios: Partial<ApiJob>): ApiJob {
  return {
    id: 'job-1',
    type: 'INSTANT',
    status: 'CONTRACTED',
    appointmentStatus: 'CONFIRMED',
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
    ...cambios,
  }
}

beforeEach(() => {
  soporte.items = []
  useSeenJobStatesStore.setState({ states: {} })
  useAuthStore.setState({ user: CLIENTE })
})

describe('MyJobsPage: el punto de las novedades', () => {
  /**
   * De un trabajo que no habíamos visto nunca no sabemos qué cambió. Marcarlo
   * todo al entrar por primera vez sería una lista llena de puntos rojos que
   * no señalan nada.
   */
  it('lo que se ve por primera vez no lleva punto', () => {
    soporte.items = [trabajo({})]

    const { queryByTestId } = render(
      <MyJobsPage onBrowse={() => {}} onBack={() => {}} />,
    )

    expect(queryByTestId('job-job-1-news')).toBeNull()

    // Y queda apuntado tal como se vio, que es contra lo que se comparará
    expect(useSeenJobStatesStore.getState().states['cli-1']).toEqual({
      'job-1': 'CONTRACTED|CONFIRMED|-',
    })
  })

  it('el que ha cambiado desde que se miró lleva su punto', () => {
    useSeenJobStatesStore.setState({
      states: { 'cli-1': { 'job-1': 'CONTRACTED|CONFIRMED|-' } },
    })
    soporte.items = [trabajo({ status: 'IN_PROGRESS' })]

    const { getByTestId } = render(
      <MyJobsPage onBrowse={() => {}} onBack={() => {}} />,
    )

    expect(getByTestId('job-job-1-news')).toBeTruthy()
  })

  /**
   * El paso que el estado no cuenta: el profesional dice que ha terminado y el
   * trabajo sigue `IN_PROGRESS`. Es justo el que hay que contestar.
   */
  it('«ha terminado» también es novedad, aunque el estado no se mueva', () => {
    useSeenJobStatesStore.setState({
      states: { 'cli-1': { 'job-1': 'IN_PROGRESS|CONFIRMED|-' } },
    })
    soporte.items = [
      trabajo({ status: 'IN_PROGRESS', workFinishedAt: '2026-09-04T10:00:00.000Z' }),
    ]

    const { getByTestId } = render(
      <MyJobsPage onBrowse={() => {}} onBack={() => {}} />,
    )

    expect(getByTestId('job-job-1-news')).toBeTruthy()
  })

  /**
   * Lo que no se está mirando es lo que no se sabe: sin el punto en la
   * pestaña cerrada hay que abrirla para descubrir que ahí había algo.
   */
  it('la pestaña dice si lo suyo se ha movido, y la otra no se mancha', () => {
    useSeenJobStatesStore.setState({
      states: {
        'cli-1': {
          'job-1': 'CONTRACTED|CONFIRMED|-',
          'job-2': 'CONTRACTED|CONFIRMED|-',
        },
      },
    })
    soporte.items = [
      trabajo({ id: 'job-1', type: 'QUOTE', status: 'IN_PROGRESS' }),
      trabajo({ id: 'job-2', type: 'INSTANT' }),
    ]

    const { getByTestId, queryByTestId } = render(
      <MyJobsPage onBrowse={() => {}} onBack={() => {}} />,
    )

    expect(getByTestId('my-jobs-tab-QUOTE-news')).toBeTruthy()
    expect(queryByTestId('my-jobs-tab-INSTANT-news')).toBeNull()
  })

  /** El saco es de quien mira: sin sesión no se lee el de nadie */
  it('sin sesión no hay puntos', () => {
    useAuthStore.setState({ user: null })
    useSeenJobStatesStore.setState({
      states: { 'cli-1': { 'job-1': 'CONTRACTED|CONFIRMED|-' } },
    })
    soporte.items = [trabajo({ status: 'IN_PROGRESS' })]

    const { queryByTestId } = render(
      <MyJobsPage onBrowse={() => {}} onBack={() => {}} />,
    )

    expect(queryByTestId('job-job-1-news')).toBeNull()
  })
})
