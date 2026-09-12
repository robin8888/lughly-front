/**
 * La cola de revisiones.
 *
 * Es la pantalla donde se mueve el dinero de otros, así que lo que se ata aquí
 * son los dos frenos: **no se resuelve sin motivo escrito** —va dentro del
 * aviso que reciben las dos partes, y el reglamento P2B obliga a motivar lo que
 * afecta a un profesional— y **no se reparte una cifra que no cuadra** con lo
 * que hay retenido.
 */

import { fireEvent, render, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { Alert } from 'react-native'
import type { ApiDisputeQueueItem } from '@/api/admin.api'
import { AdminDisputesPage } from './AdminDisputesPage'

jest.mock('@/hooks/domain/useDisputes', () => {
  const soporte = {
    items: [] as unknown[],
    resueltas: [] as Record<string, unknown>[],
  }

  return {
    soporte,
    useDisputes: () => ({
      disputes: soporte.items,
      isPending: false,
      isError: false,
      refetch: () => {},
    }),
    useResolveDispute: () => ({
      resolve: (input: Record<string, unknown>) => {
        soporte.resueltas.push(input)

        return Promise.resolve({
          ok: true,
          error: null,
          result: { refunded: (input.toClient as number) ?? 0 },
        })
      },
      isResolving: false,
    }),
  }
})

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return {
    InfoCard: ({ children, testID }: { children: ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  }
})

const { soporte } = jest.requireMock('@/hooks/domain/useDisputes')

const revision = (cambios: Partial<ApiDisputeQueueItem> = {}): ApiDisputeQueueItem => ({
  disputeId: 'disputa-1',
  jobId: 'job-1',
  title: 'Grifo del baño',
  type: 'QUOTE',
  clientName: 'Pablo',
  proName: 'Sergio',
  openedBy: 'client',
  openedAt: '2026-09-12T10:00:00.000Z',
  dueAt: '2099-09-27T10:00:00.000Z',
  overdue: false,
  reason: 'Ha vuelto dos veces y sigue goteando',
  holdReason: 'El grifo sigue goteando',
  retained: 200,
  charges: [{ kind: 'QUOTE', amount: 200 }],
  resultPhotos: [],
  evidence: [],
  ...cambios,
})

beforeEach(() => {
  soporte.items = [revision()]
  soporte.resueltas.length = 0
  jest.spyOn(Alert, 'alert').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('AdminDisputesPage', () => {
  it('no deja resolver sin explicar por qué', () => {
    const { getByTestId } = render(<AdminDisputesPage onBack={() => {}} />)

    fireEvent.press(getByTestId('admin-dispute-disputa-1-to-pro'))

    expect(soporte.resueltas).toHaveLength(0)
    expect(Alert.alert).toHaveBeenCalledWith('Falta el motivo', expect.any(String))
  })

  it('con el motivo, paga al profesional', async () => {
    const { getByTestId } = render(<AdminDisputesPage onBack={() => {}} />)

    fireEvent.changeText(
      getByTestId('admin-dispute-disputa-1-decision'),
      'Las fotos enseñan el trabajo terminado y el cliente no ha aportado nada.',
    )
    fireEvent.press(getByTestId('admin-dispute-disputa-1-to-pro'))

    await waitFor(() => expect(soporte.resueltas).toHaveLength(1))
    expect(soporte.resueltas[0]).toMatchObject({ disputeId: 'disputa-1', outcome: 'TO_PRO' })
  })

  it('repartir manda la cifra, y solo si cabe en lo retenido', async () => {
    const { getByTestId } = render(<AdminDisputesPage onBack={() => {}} />)

    fireEvent.changeText(
      getByTestId('admin-dispute-disputa-1-decision'),
      'El trabajo está hecho pero falta el remate del alicatado.',
    )

    /* Más de lo que hay retenido: no se devuelve dinero que no se tiene */
    fireEvent.changeText(getByTestId('admin-dispute-disputa-1-amount'), '500')
    fireEvent.press(getByTestId('admin-dispute-disputa-1-split'))

    expect(soporte.resueltas).toHaveLength(0)

    fireEvent.changeText(getByTestId('admin-dispute-disputa-1-amount'), '50')
    fireEvent.press(getByTestId('admin-dispute-disputa-1-split'))

    await waitFor(() => expect(soporte.resueltas).toHaveLength(1))
    expect(soporte.resueltas[0]).toMatchObject({ outcome: 'SPLIT', toClient: 50 })
  })

  /**
   * Una vencida ya está costando dinero: el barrido va a devolvérselo al
   * cliente sin que nadie haya mirado el caso. Tiene que verse de un vistazo.
   */
  it('las vencidas se ven', () => {
    soporte.items = [revision({ overdue: true, dueAt: '2026-09-01T10:00:00.000Z' })]

    const { getByText } = render(<AdminDisputesPage onBack={() => {}} />)

    expect(getByText(/Vencida/)).toBeTruthy()
  })

  it('sin nada que revisar, se dice y no se enseña una lista vacía', () => {
    soporte.items = []

    const { getByTestId } = render(<AdminDisputesPage onBack={() => {}} />)

    expect(getByTestId('admin-disputes-empty')).toBeTruthy()
  })
})
