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
    /** Si la ficha todavía está cargando: es el primer render de verdad */
    pending: false,
    started: [] as string[],
    finished: [] as string[],
    completed: [] as string[],
    startApproved: [] as string[],
    /** Los reparos: por qué el cliente no da por bueno */
    held: [] as { jobId: string; reason: string }[],
  }

  return {
    soporte,
    useJob: () => ({
      data: soporte.pending ? undefined : soporte.job,
      isPending: soporte.pending,
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
    useHoldJob: () => ({
      hold: (jobId: string, reason: string) => {
        soporte.held.push({ jobId, reason })
        return Promise.resolve({ ok: true, result: null, error: null })
      },
      isHolding: false,
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
    resultPhotos: [],
    holdReason: null,
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
  soporte.held.length = 0
  soporte.pending = false
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

  it('al cliente le salen las dos respuestas, y el plazo con su nombre', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'DONE',
      workFinishedAt: '2026-08-29T12:00:00.000Z',
      confirmByAt: '2026-08-30T12:00:00.000Z',
      assignedPro: {
        id: 'pro-1',
        name: 'Tomás Cerrajero',
        workerName: null,
        avatarUrl: null,
        rating: 4.8,
        reviewCount: 21,
        phone: null,
      },
    })

    const { getByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-complete')).toBeTruthy()
    expect(getByTestId('job-detail-hold-open')).toBeTruthy()

    /*
      Y la cuenta atrás dice de qué es. Suelta entre los botones era un
      número en medio de la pantalla que nadie sabía leer.
    */
    expect(getByTestId('job-detail-confirm-countdown')).toBeTruthy()
    expect(getByText('Para revisarlo')).toBeTruthy()
    expect(getByText('Si no dices nada, se da por bueno y se le paga')).toBeTruthy()
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

/**
 * El visto bueno deja de darse a ciegas.
 *
 * Es el botón que paga, y hasta ahora el cliente lo pulsaba sin ver nada de lo
 * que estaba dando por bueno — o callaba, y callar se trataba igual que decir
 * que sí: a las 24 horas se cerraba y se pagaba. Así que quien no estaba
 * conforme solo podía no responder, y el reloj le corría igual.
 */
describe('JobDetailPage: el visto bueno, con lo que hay que ver', () => {
  const terminado = {
    viewer: 'client' as const,
    status: 'IN_PROGRESS' as const,
    appointmentStatus: 'DONE' as const,
    workFinishedAt: '2026-09-03T12:00:00.000Z',
    confirmByAt: '2026-09-04T12:00:00.000Z',
    assignedPro: {
      id: 'pro-1',
      name: 'Tomás Cerrajero',
      workerName: null,
      avatarUrl: null,
      rating: 4.8,
      reviewCount: 21,
      phone: null,
    },
  }

  it('enseña las fotos de cómo ha quedado antes de pedir el visto bueno', () => {
    soporte.job = ficha({
      ...terminado,
      resultPhotos: [{ url: '/v1/media/a', fullUrl: '/v1/media/a-full' }],
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-result-photos')).toBeTruthy()
    expect(getByTestId('job-detail-result-photo-0')).toBeTruthy()
  })

  /**
   * El diálogo tapa lo único que hay que mirar, así que no puede pedir la
   * decisión: avisa, y las dos respuestas están en la ficha, con las fotos.
   */
  it('el aviso de que ha terminado no trae la decisión dentro', () => {
    soporte.job = ficha({
      ...terminado,
      resultPhotos: [{ url: '/v1/media/a', fullUrl: '/v1/media/a-full' }],
    })

    const { getByTestId, queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-complete-dialog')).toBeTruthy()
    expect(queryByTestId('job-detail-complete-confirm')).toBeNull()
    expect(queryByTestId('job-detail-complete-hold')).toBeNull()

    // Y lo que hace su único botón es quitarse de en medio
    fireEvent.press(getByTestId('job-detail-complete-review'))

    expect(queryByTestId('job-detail-complete-dialog')).toBeNull()
    expect(getByTestId('job-detail-result-photo-0')).toBeTruthy()
    expect(getByTestId('job-detail-complete')).toBeTruthy()
    expect(getByTestId('job-detail-hold-open')).toBeTruthy()
    // Nada se ha cerrado por abrir el aviso
    expect(soporte.completed).toEqual([])
  })

  /** La salida que faltaba: no estar conforme y poder decirlo */
  it('«Falta algo» abre el motivo, y el motivo se manda', () => {
    soporte.job = ficha(terminado)

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-hold-open'))
    fireEvent.changeText(
      getByTestId('job-detail-hold-reason'),
      'El grifo sigue goteando por la junta de abajo',
    )
    fireEvent.press(getByTestId('job-detail-hold-confirm'))

    expect(soporte.held).toEqual([
      { jobId: 'job-1', reason: 'El grifo sigue goteando por la junta de abajo' },
    ])
    // Y no se ha cerrado ni pagado nada
    expect(soporte.completed).toEqual([])
  })

  /**
   * «Mal» no le dice a nadie a qué tiene que volver, y quien lee esto va a
   * coger la furgoneta. Diez caracteres, como al romper un contrato.
   */
  it('un motivo de dos palabras no se puede enviar', () => {
    soporte.job = ficha(terminado)

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-hold-open'))
    fireEvent.changeText(getByTestId('job-detail-hold-reason'), 'mal')

    expect(getByTestId('job-detail-hold-confirm')).toBeDisabled()

    fireEvent.press(getByTestId('job-detail-hold-confirm'))
    expect(soporte.held).toEqual([])
  })

  /** Y el reparo ya puesto se le enseña: a los tres días no se acuerda */
  it('el reparo puesto se ve en la ficha', () => {
    soporte.job = ficha({
      ...terminado,
      holdReason: 'El grifo sigue goteando',
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-hold')).toHaveTextContent(/sigue goteando/)
  })
})

/**
 * Un hook detrás de un `return` no se ejecuta en ese render, y React cuenta los
 * hooks: en cuanto el número baila, la pantalla revienta entera con «Rendered
 * more hooks than during the previous render».
 *
 * Pasó el 3 de septiembre de 2026 al añadir los diálogos: el estado se puso
 * junto a lo que lo usa, que está después de las salidas de cargando y error.
 * **Todos los tests pasaban**, porque ninguno pasaba por «cargando»: se
 * renderizaba siempre con la ficha ya puesta, que es como no se entra nunca.
 */
describe('JobDetailPage: los hooks, por encima de las salidas', () => {
  it('sobrevive a pasar de cargando a cargado, que es como se entra', () => {
    soporte.pending = true
    soporte.job = null

    const { rerender, getByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-loading')).toBeTruthy()

    soporte.pending = false
    soporte.job = ficha({})

    // Si un hook viviera tras un `return`, este render tumbaría la pantalla
    rerender(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-start')).toBeTruthy()
  })
})
