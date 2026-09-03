/**
 * El final del ciclo, que es donde está el dinero.
 *
 * Lo que se contrata desde la carta se cobra al contratar y se queda retenido
 * hasta que el trabajo se cierra. Estos botones son el único camino que lleva
 * hasta ahí, así que lo que se ata aquí es que aparezcan **cuando toca y a
 * quien toca**: empezar y terminar solo a quien lo hace, y dar por bueno solo
 * al cliente y solo después de que el otro haya terminado.
 */

import { fireEvent, render } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import type { ApiJobDetail } from '@/api/jobs.api'
import { JobDetailPage } from './JobDetailPage'

jest.mock('@/hooks/domain/useJob', () => {
  /*
   * El soporte va dentro de la factoría: `jest.mock` se eleva al principio del
   * fichero y una constante de fuera todavía no existe cuando esto se ejecuta.
   */
  const soporte = {
    job: null as unknown,
    started: [] as string[],
    finished: [] as string[],
    completed: [] as string[],
    startApproved: [] as string[],
  }

  return {
    soporte,
    useJob: () => ({
      data: soporte.job,
      isPending: false,
      isError: false,
      refetch: () => {},
    }),
    useCancelJob: () => ({ cancel: () => Promise.resolve({ ok: true }), isCancelling: false }),
    useCancelContract: () => ({
      cancelContract: () => Promise.resolve({ ok: true }),
      isCancelling: false,
    }),
    useJobProgress: () => ({
      start: (jobId: string) => {
        soporte.started.push(jobId)
        return Promise.resolve({ ok: true, error: null, result: null })
      },
      finish: (jobId: string) => {
        soporte.finished.push(jobId)
        return Promise.resolve({ ok: true, error: null, result: null })
      },
      isStarting: false,
      isFinishing: false,
    }),
    useCompleteJob: () => ({
      complete: (jobId: string) => {
        soporte.completed.push(jobId)
        return Promise.resolve({ ok: true, result: { released: 77 }, error: null })
      },
      isCompleting: false,
    }),
    useApproveStart: () => ({
      approveStart: (jobId: string) => {
        soporte.startApproved.push(jobId)
        return Promise.resolve({ ok: true, result: null, error: null })
      },
      isApproving: false,
    }),
  }
})

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))
jest.mock('@/hooks/ui/useTabBarClearance', () => ({ useTabBarClearance: () => 0 }))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return { InfoCard: ({ children }: { children: ReactNode }) => <View>{children}</View> }
})

const { soporte } = jest.requireMock('@/hooks/domain/useJob')

/** Una ficha con lo justo, y lo que cambia en cada caso encima */
function ficha(cambios: Partial<ApiJobDetail>): ApiJobDetail {
  return {
    id: 'job-1',
    type: 'INSTANT',
    status: 'CONTRACTED',
    appointmentStatus: 'CONFIRMED',
    title: 'Corte y tinte',
    description: 'A domicilio',
    trade: 'peluqueria',
    tradeLabel: 'Peluquería',
    city: 'Madrid',
    viewer: 'pro',
    cancellation: null,
    addressLine: 'Calle Mayor 1',
    latitude: null,
    longitude: null,
    preferredDate: null,
    respondByAt: null,
    workFinishedAt: null,
    startedAt: null,
    startApprovedAt: null,
    confirmByAt: null,
    completedAt: null,
    maxBudget: null,
    amount: 77,
    assignedPro: null,
    substituteProName: null,
    chatWith: null,
    clientName: 'Ana',
    clientPhone: null,
    photoCount: 0,
    photos: [],
    createdAt: '2026-08-29T09:00:00.000Z',
    serviceLines: [],
    ...cambios,
  }
}

beforeEach(() => {
  soporte.started.length = 0
  soporte.finished.length = 0
  soporte.completed.length = 0
  // Faltaba, y el fallo solo sale en conjunto: un test veía lo que confirmó otro
  soporte.startApproved.length = 0
})

describe('JobDetailPage: terminar y cobrar', () => {
  it('quien lo hace puede empezar cuando la cita está confirmada', () => {
    soporte.job = ficha({})

    const { getByTestId, queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    fireEvent.press(getByTestId('job-detail-start'))

    expect(soporte.started).toEqual(['job-1'])
    // Terminar todavía no: no se cierra lo que no se ha empezado
    expect(queryByTestId('job-detail-finish')).toBeNull()
  })

  it('empezado, puede terminar', () => {
    soporte.job = ficha({ status: 'IN_PROGRESS', appointmentStatus: 'STARTED' })

    const { getByTestId, queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    fireEvent.press(getByTestId('job-detail-finish'))

    expect(soporte.finished).toEqual(['job-1'])
    expect(queryByTestId('job-detail-start')).toBeNull()
  })

  it('ya terminado, al profesional no le queda nada que pulsar', () => {
    soporte.job = ficha({
      status: 'IN_PROGRESS',
      appointmentStatus: 'DONE',
      workFinishedAt: '2026-08-29T12:00:00.000Z',
      confirmByAt: '2026-08-30T12:00:00.000Z',
    })

    const { queryByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(queryByTestId('job-detail-finish')).toBeNull()
    // Y no puede darse por bueno a sí mismo el cobro
    expect(queryByTestId('job-detail-complete')).toBeNull()
    expect(
      getByText(
        'Has terminado. Falta que el cliente lo dé por bueno; si no dice nada, se da por bueno solo y cobras.',
      ),
    ).toBeTruthy()
  })

  /**
   * El reloj lo ven los dos, y desde que empieza. Es lo que se acaba pagando
   * en un trabajo por horas: que solo lo viera una parte sería pedirle a la
   * otra que se fíe.
   */
  it('el reloj corre para el profesional en cuanto empieza', () => {
    soporte.job = ficha({
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      startedAt: '2026-08-29T12:00:00.000Z',
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-timer')).toBeTruthy()
  })

  /**
   * Al cliente **no**, hasta que lo reconozca.
   *
   * Es la línea entre el reloj que cuenta y el reloj que se ve: el primero
   * corre desde que el profesional pulsó Empezar y no lo mueve nadie —si lo
   * moviera esto, un cliente con el móvil en silencio dejaría a alguien
   * trabajando sin horas contadas—; el segundo espera a que dé por cierto que
   * ha llegado. Pintarle un contador corriendo de algo que aún no ha
   * confirmado es enseñarle una factura en marcha sin haber abierto la puerta.
   */
  it('al cliente no se le pinta el reloj hasta que reconoce que ha llegado', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      startedAt: '2026-08-29T12:00:00.000Z',
    })

    const { queryByTestId, getByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(queryByTestId('job-detail-timer')).toBeNull()
    // Y se le pregunta nada más entrar, que es a donde lleva el aviso
    expect(getByTestId('job-detail-approve-start-dialog')).toBeTruthy()
  })

  it('y al confirmarlo desde el modal, se avisa al servidor', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      startedAt: '2026-08-29T12:00:00.000Z',
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-approve-start-confirm'))

    expect(soporte.startApproved).toEqual(['job-1'])
  })

  /**
   * Cerrarlo sin responder es válido —quien abre la app para otra cosa tiene
   * derecho a hacerla— y entonces no vuelve a saltar: lo que quedó pendiente
   * sigue en su botón, más abajo.
   */
  it('si lo cierra sin responder, queda el botón y no se repregunta', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      startedAt: '2026-08-29T12:00:00.000Z',
    })

    const { getByTestId, queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    fireEvent.press(getByTestId('job-detail-approve-start-later'))

    expect(queryByTestId('job-detail-approve-start-dialog')).toBeNull()
    expect(getByTestId('job-detail-approve-start')).toBeTruthy()
    expect(soporte.startApproved).toEqual([])
  })

  it('ya confirmado, el botón desaparece pero el reloj sigue', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      startedAt: '2026-08-29T12:00:00.000Z',
      startApprovedAt: '2026-08-29T12:01:00.000Z',
    })

    const { getByTestId, queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(queryByTestId('job-detail-approve-start')).toBeNull()
    expect(getByTestId('job-detail-timer')).toBeTruthy()
  })

  it('al cliente le sale el botón que paga, con su plazo', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'DONE',
      workFinishedAt: '2026-08-29T12:00:00.000Z',
      confirmByAt: '2026-08-30T12:00:00.000Z',
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-complete')).toBeTruthy()
    expect(getByTestId('job-detail-confirm-countdown')).toBeTruthy()
  })

  it('mientras nadie ha terminado, el cliente no tiene nada que dar por bueno', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
    })

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-complete')).toBeNull()
    // Ni empezar ni terminar: eso es de quien va a la casa
    expect(queryByTestId('job-detail-start')).toBeNull()
    expect(queryByTestId('job-detail-finish')).toBeNull()
  })
})
