/**
 * El final del ciclo, que es donde está el dinero.
 *
 * Lo que se contrata desde la carta se cobra al contratar y se queda retenido
 * hasta que el trabajo se cierra. Estos botones son el único camino que lleva
 * hasta ahí, así que lo que se ata aquí es que aparezcan **cuando toca y a
 * quien toca**: empezar y terminar solo a quien lo hace, y dar por bueno solo
 * al cliente y solo después de que el otro haya terminado.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import type { ApiJobDetail } from '@/api/jobs.api'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { useSeenJobStatesStore } from '@/stores/useSeenJobStatesStore'
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
    /** Las valoraciones que se mandan al cerrar */
    reviewed: [] as { jobId: string; rating: number; comment: string | null }[],
    /** Los presupuestos rechazados, con el motivo (`CICLOS` §C5) */
    rejectedQuotes: [] as { jobId: string; reason: string }[],
    /** Y los aceptados, con la tarjeta que se usó (§C6) */
    acceptedQuotes: [] as { jobId: string; paymentMethodId: string }[],
    /** Las sesiones de un contrato fijo que se han saltado (§F7) */
    droppedSessions: [] as { jobId: string; sessionId: string }[],
    /** Lo que devuelve el servidor al saltarse una: lo cobrado y lo que queda */
    dropResult: { fee: 0, refunded: 0, voided: 0, remaining: 17 },
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
      cancelContract: () =>
        Promise.resolve({
          ok: true,
          error: null,
          result: { refunded: 0, voided: 0, releasedCharges: 0, cancelledSessions: 18 },
        }),
      isCancelling: false,
    }),
    useCancelSession: () => ({
      cancelSession: (jobId: string, sessionId: string) => {
        soporte.droppedSessions.push({ jobId, sessionId })

        return Promise.resolve({
          ok: true,
          error: null,
          result: { jobId, sessionId, ...soporte.dropResult },
        })
      },
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
    useReviewJob: () => ({
      review: (jobId: string, rating: number, comment: string | null) => {
        soporte.reviewed.push({ jobId, rating, comment })
        return Promise.resolve({ ok: true, result: null, error: null })
      },
      isReviewing: false,
    }),
    useRejectQuote: () => ({
      rejectQuote: (jobId: string, reason: string) => {
        soporte.rejectedQuotes.push({ jobId, reason })
        return Promise.resolve({ ok: true, result: null, error: null })
      },
      isRejecting: false,
    }),
    useAcceptQuote: () => ({
      acceptQuote: (jobId: string, paymentMethodId: string) => {
        soporte.acceptedQuotes.push({ jobId, paymentMethodId })
        return Promise.resolve({ ok: true, result: null, error: null })
      },
      isAccepting: false,
    }),
  }
})

/*
  Las tarjetas guardadas. Se simula entero porque el de verdad arrastra el SDK
  de Stripe, que no existe fuera de un móvil: sin esto la suite no arranca.
  `soporteTarjetas.hay` decide si el cliente tiene una, que es lo que separa
  "aceptar y pagar" de "guárdate una tarjeta primero".
*/
export const soporteTarjetas = { hay: true }

jest.mock('@/hooks/domain/usePaymentMethods', () => ({
  usePaymentMethods: () => ({
    data: soporteTarjetas.hay ? [{ id: 'pm_1', brand: 'visa', last4: '4242' }] : [],
    isPending: false,
    isError: false,
  }),
}))

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
    canStartAt: null,
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
    quotes: [],
    recurrence: null,
    sessions: [],
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
  soporte.reviewed.length = 0
  soporte.rejectedQuotes.length = 0
  soporte.acceptedQuotes.length = 0
  soporte.droppedSessions.length = 0
  soporte.dropResult = { fee: 0, refunded: 0, voided: 0, remaining: 17 }
  soporteTarjetas.hay = true
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

/**
 * Mirar la ficha es enterarse, y eso apaga el punto rojo de Mis trabajos.
 *
 * Se apunta aquí y no en la lista a propósito: en la lista se ve el rótulo del
 * estado, no lo que ha pasado. Dar por leído lo que solo se ha rozado deja al
 * cliente sin la única señal que le decía dónde mirar.
 */
describe('JobDetailPage: abrirla cuenta como haberlo visto', () => {
  const CLIENTE = { id: 'cli-1', name: 'Ana' } as unknown as User

  beforeEach(() => {
    useSeenJobStatesStore.setState({ states: {} })
    useAuthStore.setState({ user: CLIENTE })
  })

  it('apunta en qué estado se vio el trabajo', () => {
    soporte.job = ficha({
      viewer: 'client',
      status: 'IN_PROGRESS',
      appointmentStatus: 'DONE',
      workFinishedAt: '2026-09-03T12:00:00.000Z',
    })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(useSeenJobStatesStore.getState().states['cli-1']).toEqual({
      'job-1': 'IN_PROGRESS|DONE|fin',
    })
  })

  /** La lista de los puntos es la del cliente; el profesional tiene su agenda */
  it('del lado del profesional no se apunta nada', () => {
    soporte.job = ficha({ viewer: 'pro', status: 'IN_PROGRESS' })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(useSeenJobStatesStore.getState().states['cli-1']).toBeUndefined()
  })
})

/**
 * La valoración, nada más dar por bueno el trabajo.
 *
 * Es el único momento en que alguien se acuerda de cómo fue: al día siguiente
 * no entra nadie a valorar, y un profesional sin valoraciones no se distingue
 * en el directorio de uno malo.
 *
 * Lo que se ata aquí es que **el trabajo se cierra y se paga igual**: valorar
 * no es una condición de nada, y por eso se puede cerrar el diálogo sin
 * contestar.
 */
describe('JobDetailPage: valorar al dar por bueno', () => {
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

  beforeEach(() => {
    soporte.completed = []
    soporte.reviewed = []
  })

  it('al darlo por bueno se pregunta cómo ha ido', async () => {
    soporte.job = ficha(terminado)

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(screen.getByTestId('job-detail-complete'))

    // Primero se cierra y se paga, que es lo que no puede quedarse a medias
    await waitFor(() => expect(soporte.completed).toEqual(['job-1']))

    expect(await screen.findByTestId('job-detail-review-dialog')).toBeTruthy()
    expect(screen.getByTestId('job-detail-review-stars')).toBeTruthy()
  })

  it('sin estrellas no se puede enviar; con ellas, se manda', async () => {
    soporte.job = ficha(terminado)

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    fireEvent.press(screen.getByTestId('job-detail-complete'))
    await screen.findByTestId('job-detail-review-dialog')

    expect(screen.getByTestId('job-detail-review-send')).toBeDisabled()

    fireEvent.press(screen.getByTestId('job-detail-review-stars-star-5'))
    fireEvent.changeText(
      screen.getByTestId('job-detail-review-comment'),
      'Puntual y lo dejó todo limpio',
    )
    fireEvent.press(screen.getByTestId('job-detail-review-send'))

    await waitFor(() =>
      expect(soporte.reviewed).toEqual([
        { jobId: 'job-1', rating: 5, comment: 'Puntual y lo dejó todo limpio' },
      ]),
    )
  })

  /** El comentario es opcional: exigirlo solo produce un "bien" de relleno */
  it('la nota sola vale, sin comentario', async () => {
    soporte.job = ficha(terminado)

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    fireEvent.press(screen.getByTestId('job-detail-complete'))
    await screen.findByTestId('job-detail-review-dialog')

    fireEvent.press(screen.getByTestId('job-detail-review-stars-star-4'))
    fireEvent.press(screen.getByTestId('job-detail-review-send'))

    await waitFor(() =>
      expect(soporte.reviewed).toEqual([
        { jobId: 'job-1', rating: 4, comment: null },
      ]),
    )
  })

  /** Y quien no quiera valorar se va: el trabajo ya está cerrado y pagado */
  it('se puede cerrar sin valorar', async () => {
    soporte.job = ficha(terminado)

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    fireEvent.press(screen.getByTestId('job-detail-complete'))
    await screen.findByTestId('job-detail-review-dialog')

    fireEvent.press(screen.getByTestId('job-detail-review-later'))

    await waitFor(() =>
      expect(screen.queryByTestId('job-detail-review-dialog')).toBeNull(),
    )
    expect(soporte.reviewed).toEqual([])
    // Cerrado y pagado igual
    expect(soporte.completed).toEqual(['job-1'])
  })
})

/**
 * El presupuesto en la ficha (`CICLOS` §C5).
 *
 * Es el paso que faltaba del ciclo de la visita: hasta ahora el precio del
 * arreglo se daba fuera de la app, y todo lo que viene detrás —aceptarlo,
 * pagarlo, discutir un extra— colgaba de una cifra que no estaba en ninguna
 * parte.
 *
 * Lo que se ata aquí es que **los dos lados vean el mismo papel** y que el
 * motivo del rechazo llegue entero: es lo único que le dice al profesional
 * qué cambiar en la versión siguiente.
 */
describe('JobDetailPage: el presupuesto', () => {
  const presupuesto = (cambios: Record<string, unknown> = {}) => ({
    id: 'quote-1',
    version: 1,
    status: 'SENT' as const,
    lines: [
      {
        kind: 'LABOUR' as const,
        concept: 'Cambiar pastillas',
        quantity: 2,
        unitPrice: 45,
        amount: 90,
      },
      {
        kind: 'MATERIALS' as const,
        concept: 'Juego de pastillas',
        quantity: 1,
        unitPrice: 138,
        amount: 138,
      },
    ],
    linesTotal: 228,
    visitCredit: 30,
    total: 198,
    validUntil: '2099-01-01T00:00:00.000Z',
    materialsUpfront: false,
    rejectionReason: null,
    rejectedAt: null,
    acceptedAt: null,
    createdAt: '2026-09-07T10:00:00.000Z',
    ...cambios,
  })

  const visita = {
    type: 'QUOTE' as const,
    status: 'QUOTED' as const,
    viewer: 'client' as const,
  }

  it('el cliente ve las líneas, el descuento de la visita y el total', () => {
    soporte.job = ficha({ ...visita, quotes: [presupuesto()] })

    const { getByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-quote-1')).toBeTruthy()
    expect(getByText('Cambiar pastillas')).toBeTruthy()
    // El descuento se dice: si no, el total no cuadra con la columna
    expect(getByText('Visita ya pagada')).toBeTruthy()
    expect(getByText('198,00 €')).toBeTruthy()
  })

  it('rechazarlo manda el motivo, que es lo que permite la v2', async () => {
    soporte.job = ficha({ ...visita, quotes: [presupuesto()] })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    fireEvent.press(screen.getByTestId('job-detail-quote-reject'))
    await screen.findByTestId('job-detail-quote-reject-dialog')

    fireEvent.changeText(
      screen.getByTestId('job-detail-quote-reject-reason'),
      'El material me parece caro',
    )
    fireEvent.press(screen.getByTestId('job-detail-quote-reject-confirm'))

    await waitFor(() =>
      expect(soporte.rejectedQuotes).toEqual([
        { jobId: 'job-1', reason: 'El material me parece caro' },
      ]),
    )
  })

  it('sin motivo no se manda: un "no" a secas no dice qué cambiar', async () => {
    soporte.job = ficha({ ...visita, quotes: [presupuesto()] })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    fireEvent.press(screen.getByTestId('job-detail-quote-reject'))
    await screen.findByTestId('job-detail-quote-reject-dialog')

    fireEvent.press(screen.getByTestId('job-detail-quote-reject-confirm'))

    expect(soporte.rejectedQuotes).toEqual([])
  })

  it('uno caducado ya no se contesta: no decidía nada', () => {
    soporte.job = ficha({
      ...visita,
      quotes: [presupuesto({ validUntil: '2020-01-01T00:00:00.000Z' })],
    })

    const { queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(queryByTestId('job-detail-quote-reject')).toBeNull()
  })

  it('al profesional se le ofrece hacerlo, y al cliente no', () => {
    soporte.job = ficha({
      type: 'QUOTE',
      status: 'CONTRACTED',
      viewer: 'pro',
      quotes: [],
    })

    const conPro = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} onQuote={() => {}} />,
    )
    expect(conPro.getByTestId('job-detail-quote')).toBeTruthy()
    conPro.unmount()

    soporte.job = ficha({ type: 'QUOTE', status: 'CONTRACTED', viewer: 'client' })
    const conCliente = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    expect(conCliente.queryByTestId('job-detail-quote')).toBeNull()
  })

  it('después de un rechazo, el botón invita a mandar otro', () => {
    soporte.job = ficha({
      type: 'QUOTE',
      status: 'QUOTE_REJECTED',
      viewer: 'pro',
      quotes: [
        presupuesto({ status: 'REJECTED', rejectionReason: 'Es mucho para lo que es' }),
      ],
    })

    const { getByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} onQuote={() => {}} />,
    )

    expect(getByText('Mandarle otro presupuesto')).toBeTruthy()
    // Y el motivo del cliente, con sus palabras: es lo que dice qué cambiar
    expect(getByTestId('job-detail-quote-1-reason')).toBeTruthy()
  })

  it('una reserva por horas no se presupuesta', () => {
    // Su precio se pactó antes de que nadie se moviera
    soporte.job = ficha({ type: 'INSTANT', status: 'CONTRACTED', viewer: 'pro' })

    const { queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} onQuote={() => {}} />,
    )

    expect(queryByTestId('job-detail-quote')).toBeNull()
  })
})

/**
 * Aceptar el presupuesto (`CICLOS` §C6).
 *
 * Lo que se ata aquí es lo que Robin pidió que no se perdiera: **la visita
 * pagada se descuenta, y se dice**. El diálogo enseña la resta entera —lo que
 * vale el arreglo, lo que ya puso, lo que queda— porque un total a secas, con
 * una visita pagada dos semanas antes, se lee como si se cobrara dos veces el
 * mismo viaje.
 */
describe('JobDetailPage: aceptar el presupuesto', () => {
  const conPresupuesto = () =>
    ficha({
      type: 'QUOTE',
      status: 'QUOTED',
      viewer: 'client',
      quotes: [
        {
          id: 'quote-1',
          version: 1,
          status: 'SENT' as const,
          lines: [
            {
              kind: 'LABOUR' as const,
              concept: 'Cambiar pastillas',
              quantity: 2,
              unitPrice: 45,
              amount: 90,
            },
          ],
          linesTotal: 228,
          visitCredit: 30,
          total: 198,
          validUntil: '2099-01-01T00:00:00.000Z',
          materialsUpfront: false,
          rejectionReason: null,
          rejectedAt: null,
          acceptedAt: null,
          createdAt: '2026-09-07T10:00:00.000Z',
        },
      ],
    })

  it('el botón dice lo que se paga, no "aceptar" a secas', () => {
    soporte.job = conPresupuesto()

    const { getByText } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByText('Aceptar y pagar 198,00 €')).toBeTruthy()
  })

  it('el diálogo enseña la resta de la visita antes de cobrar', async () => {
    soporte.job = conPresupuesto()

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    fireEvent.press(screen.getByTestId('job-detail-quote-accept'))
    await screen.findByTestId('job-detail-quote-accept-dialog')

    expect(
      screen.getByText(/menos los 30,00 € de la visita que ya pagaste/),
    ).toBeTruthy()
  })

  it('al confirmar, se retiene con la tarjeta guardada', async () => {
    soporte.job = conPresupuesto()

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)
    fireEvent.press(screen.getByTestId('job-detail-quote-accept'))
    await screen.findByTestId('job-detail-quote-accept-dialog')
    fireEvent.press(screen.getByTestId('job-detail-quote-accept-confirm'))

    await waitFor(() =>
      expect(soporte.acceptedQuotes).toEqual([
        { jobId: 'job-1', paymentMethodId: 'pm_1' },
      ]),
    )
  })

  it('sin tarjeta guardada, lleva a guardar una en vez de fallar al pagar', async () => {
    soporte.job = conPresupuesto()
    soporteTarjetas.hay = false
    const onAddPaymentMethod = jest.fn()

    render(
      <JobDetailPage
        jobId="job-1"
        onBack={() => {}}
        onAddPaymentMethod={onAddPaymentMethod}
      />,
    )
    fireEvent.press(screen.getByTestId('job-detail-quote-accept'))
    await screen.findByTestId('job-detail-quote-accept-dialog')

    fireEvent.press(screen.getByTestId('job-detail-quote-accept-card'))

    expect(onAddPaymentMethod).toHaveBeenCalled()
    expect(soporte.acceptedQuotes).toEqual([])
  })

  it('al profesional no se le ofrece aceptar su propio presupuesto', () => {
    soporte.job = { ...conPresupuesto(), viewer: 'pro' as const }

    const { queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} onQuote={() => {}} />,
    )

    expect(queryByTestId('job-detail-quote-accept')).toBeNull()
  })
})

/**
 * El contrato fijo en la ficha (`CICLOS_DE_CONTRATACION.md` §F).
 *
 * Lo que se ata aquí es que **las dos salidas no se confundan**: saltarse un
 * día y romper el acuerdo de meses son dos botones distintos, y en una
 * pantalla que acaba de enseñar dieciocho fechas es fácil que el segundo se
 * lea como el primero.
 */
describe('JobDetailPage: el contrato fijo', () => {
  const SERIE = {
    id: 'serie-1',
    weekdays: [1, 3, 5],
    startMinute: 600,
    durationMin: 120,
    startsOn: '2026-09-14',
    generatedUntil: '2026-11-09',
    active: true,
  }

  const sesion = (id: string, cambios: Partial<ApiJobDetail['sessions'][number]> = {}) => ({
    id,
    scheduledAt: '2026-09-14T08:00:00.000Z',
    durationMin: 120,
    status: 'CONFIRMED' as const,
    amount: 28,
    held: false,
    freeCancel: true,
    ...cambios,
  })

  it('un trabajo de una vez no enseña nada de contratos', () => {
    soporte.job = ficha({})

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-recurrence')).toBeNull()
  })

  /** Primero el acuerdo en una frase: es lo que se viene a comprobar */
  it('un contrato fijo dice qué días y a qué hora', () => {
    soporte.job = ficha({ recurrence: SERIE, sessions: [sesion('s1')] })

    const { getByText } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByText('Los lunes, miércoles y viernes, de 10:00 a 12:00')).toBeTruthy()
  })

  it('y lista sus sesiones, cada una con lo que cuesta', () => {
    soporte.job = ficha({
      recurrence: SERIE,
      sessions: [sesion('s1'), sesion('s2', { scheduledAt: '2026-09-16T08:00:00.000Z' })],
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-session-s1')).toBeTruthy()
    expect(getByTestId('job-detail-session-s2')).toBeTruthy()
  })

  /**
   * Una cancelada se queda a la vista y sin botón: el hueco **es** la
   * información —así se ve qué semana se quedó sin limpieza— y volver a
   * cancelar lo cancelado no significa nada.
   */
  it('una sesión cancelada sigue a la vista, pero ya no se puede cancelar', () => {
    soporte.job = ficha({
      recurrence: SERIE,
      sessions: [sesion('s1', { status: 'CANCELLED' })],
    })

    const { getByTestId, queryByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-session-s1')).toBeTruthy()
    expect(queryByTestId('job-detail-session-drop-s1')).toBeNull()
  })

  /** Se pregunta antes: el toque de al lado cancela otra semana */
  it('saltarse una sesión se confirma antes, y manda esa y no otra', () => {
    soporte.job = ficha({
      recurrence: SERIE,
      sessions: [sesion('s1'), sesion('s2', { scheduledAt: '2026-09-16T08:00:00.000Z' })],
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-session-drop-s2'))
    fireEvent.press(getByTestId('job-detail-session-confirm'))

    expect(soporte.droppedSessions).toEqual([{ jobId: 'job-1', sessionId: 's2' }])
  })

  /**
   * Y romper el contrato se llama por su nombre. "Cancelar el trabajo", en
   * una pantalla que acaba de enseñar el botón de cancelar una sesión, se lee
   * como "cancelar esta cita", y lo que hace es llevarse dieciocho.
   */
  it('cortar el contrato entero se dice que es el contrato', () => {
    soporte.job = ficha({ viewer: 'client', recurrence: SERIE, sessions: [sesion('s1')] })

    const { getByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-break')).toBeTruthy()
    expect(getByText('Cancelar el contrato fijo')).toBeTruthy()
  })
})
