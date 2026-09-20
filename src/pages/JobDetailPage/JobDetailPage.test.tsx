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
    finished: [] as { jobId: string; chargeExtra: boolean }[],
    completed: [] as string[],
    startApproved: [] as string[],
    /** Los reparos: por qué el cliente no da por bueno */
    held: [] as { jobId: string; reason: string }[],
    /** Las valoraciones que se mandan al cerrar */
    reviewed: [] as { jobId: string; rating: number; comment: string | null }[],
    /** Y los aceptados. Sin tarjeta: desde el 12 sep 2026 esto no cobra (§C6) */
    /** Las horas nuevas propuestas para un trabajo que no empezó (§A9) */
    proposed: [] as { jobId: string; scheduledAt: Date }[],
    /** Y las aceptadas */
    acceptedTimes: [] as string[],
    /** Las sesiones de un contrato fijo que se han saltado (§F7) */
    droppedSessions: [] as { jobId: string; sessionId: string }[],
    /** Lo que devuelve el servidor al saltarse una: lo cobrado y lo que queda */
    dropResult: { fee: 0, refunded: 0, voided: 0, remaining: 17 },
    /** Los trabajos dados por arreglados tras un reparo (§C9) */
    fixed: [] as string[],
    /** Las revisiones pedidas, con el motivo y las pruebas que iban */
    disputes: [] as { jobId: string; reason: string; pruebas: number }[],
    /** Y las pruebas aportadas después */
    evidence: [] as { jobId: string; pruebas: number }[],
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
    useReschedule: () => ({
      proposeTime: (jobId: string, scheduledAt: Date) => {
        soporte.proposed.push({ jobId, scheduledAt })

        return Promise.resolve({ ok: true, error: null, result: null })
      },
      acceptTime: (jobId: string) => {
        soporte.acceptedTimes.push(jobId)

        return Promise.resolve({ ok: true, error: null, result: null })
      },
      isRescheduling: false,
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
      finish: (jobId: string, _photos: unknown[] = [], chargeExtra = false) => {
        soporte.finished.push({ jobId, chargeExtra })
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
    useMarkFixed: () => ({
      markFixed: (jobId: string) => {
        soporte.fixed.push(jobId)

        return Promise.resolve({
          ok: true,
          error: null,
          result: { jobId, status: 'IN_PROGRESS', confirmByAt: '2026-09-13T10:00:00.000Z' },
        })
      },
      isMarkingFixed: false,
    }),
    useOpenDispute: () => ({
      openDispute: (jobId: string, reason: string, pruebas: unknown[] = []) => {
        soporte.disputes.push({ jobId, reason, pruebas: pruebas.length })

        return Promise.resolve({
          ok: true,
          error: null,
          photosFailed: 0,
          result: { disputeId: 'disputa-1', jobId, status: 'DISPUTED', dueAt: '2026-09-27T10:00:00.000Z' },
        })
      },
      isOpeningDispute: false,
    }),
    useAddEvidence: () => ({
      addEvidence: (jobId: string, pruebas: unknown[]) => {
        soporte.evidence.push({ jobId, pruebas: pruebas.length })

        return Promise.resolve({ ok: true, error: null, photosFailed: 0 })
      },
      isAddingEvidence: false,
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

/*
  El selector de fotos, reducido a un botón: el de verdad arrastra la cámara y
  la galería del móvil, que no existen aquí. Lo que hace falta comprobar es que
  el ticket llega, no cómo se hace la foto.
*/
jest.mock('@/components/molecules/PhotoPicker', () => {
  const { Pressable, Text } = require('react-native')

  return {
    PhotoPicker: ({
      value,
      onChange,
      testID,
    }: {
      value: unknown[]
      onChange: (fotos: unknown[]) => void
      testID?: string
    }) => (
      <Pressable testID={testID} onPress={() => onChange([...value, { uri: 'ticket.jpg' }])}>
        <Text>Añadir foto</Text>
      </Pressable>
    ),
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
    retained: 77,
    quoteByAt: null,
    cancelFee: 0,
    commission: 0,
    proNet: 0,
    bookedMinutes: null,
    hourlyRate: null,
    holdReason: null,
    holdAnswerByAt: null,
    dispute: null,
    evidence: [],
    createdAt: '2026-08-29T09:00:00.000Z',
    serviceLines: [],
    lateStart: null,
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
  soporte.droppedSessions.length = 0
  soporte.fixed.length = 0
  soporte.disputes.length = 0
  soporte.evidence.length = 0
  soporte.proposed.length = 0
  soporte.acceptedTimes.length = 0
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

    expect(soporte.finished).toEqual([{ jobId: 'job-1', chargeExtra: false }])
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
 * La visita cerrada a la que le falta el presupuesto (`CICLOS` §C5).
 *
 * Desde el 20 de septiembre de 2026 el presupuesto **no es un flujo de la
 * app**: la visita cierra y cobra el trabajo, y el precio del arreglo llega
 * como un documento por el chat. Lo que se ata aquí es lo único que queda en
 * pantalla, y es lo que evita los dos malentendidos caros: el cliente que cree
 * que ya ha pagado el arreglo, y el profesional que descubre tarde que el hilo
 * por el que tenía que mandarlo se ha callado.
 */
describe('JobDetailPage: la visita que espera presupuesto', () => {
  const visitaCerrada = (cambios: Record<string, unknown> = {}) =>
    ficha({
      type: 'QUOTE',
      status: 'COMPLETED',
      /* Dentro de plazo: es lo que hace que el chat siga abierto */
      quoteByAt: new Date(Date.now() + 5 * 86_400_000).toISOString(),
      ...cambios,
    })

  it('al profesional le dice por dónde mandarlo y hasta cuándo', () => {
    soporte.job = visitaCerrada({ viewer: 'pro' })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-quote-deadline')).toBeTruthy()
    expect(screen.getByText(/mándaselo por el chat/)).toBeTruthy()
  })

  /* Y al cliente, quién cobra el arreglo: es el malentendido caro */
  it('al cliente le dice que el arreglo lo paga fuera de la app', () => {
    soporte.job = visitaCerrada({ viewer: 'client' })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(screen.getByText(/se lo pagas a él directamente/)).toBeTruthy()
  })

  /**
   * Pasado el plazo, nada. La fecha se queda escrita en el trabajo para
   * siempre, y «podéis escribiros hasta el 5 de octubre» leído en noviembre es
   * una mentira — además de que para entonces el chat ya se ha callado.
   */
  it('vencido el plazo ya no se dice nada', () => {
    soporte.job = visitaCerrada({ quoteByAt: '2020-01-01T00:00:00.000Z' })

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-quote-deadline')).toBeNull()
  })

  /* Y en lo que no es una visita no hay plazo ninguno que enseñar */
  it('una reserva por horas no espera ningún presupuesto', () => {
    soporte.job = ficha({ type: 'INSTANT', status: 'COMPLETED' })

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-quote-deadline')).toBeNull()
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

/**
 * En qué se va el dinero, dicho a los dos
 * (decisión de Robin, 20 Septiembre 2026).
 *
 * «Que tanto trabajador como cliente sepan cuánto se lleva de comisión la
 * plataforma». Lo que se ata aquí es que **sea la misma cifra para los dos**
 * —una comisión que cada lado ve distinta es una reclamación esperando— y que
 * no aparezca donde no hay cobro, que sería una cuenta sobre dinero que nadie
 * ha puesto.
 */
describe('JobDetailPage: cómo se reparte el dinero', () => {
  const conCobro = { commission: 4.9, proNet: 25.1 }

  it('al profesional le dice lo que recibe y lo que se lleva Lughly', () => {
    soporte.job = ficha({ viewer: 'pro', ...conCobro })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-commission')).toBeTruthy()
    expect(screen.getByText('Recibes')).toBeTruthy()
    expect(screen.getByText('25,10 €')).toBeTruthy()
    expect(screen.getByText('4,90 €')).toBeTruthy()
  })

  it('y al cliente, las mismas dos cifras', () => {
    soporte.job = ficha({ viewer: 'client', ...conCobro })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-commission')).toBeTruthy()
    expect(screen.getByText('Para el profesional')).toBeTruthy()
    expect(screen.getByText('25,10 €')).toBeTruthy()
    expect(screen.getByText('4,90 €')).toBeTruthy()
  })

  /* Y no se le dice al cliente que pague nada aparte: sale de lo ya pagado */
  it('al cliente se le aclara que no paga nada encima', () => {
    soporte.job = ficha({ viewer: 'client', ...conCobro })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(screen.getByText(/no pagas nada aparte/)).toBeTruthy()
  })

  it('sin cobro todavía no hay reparto que enseñar', () => {
    soporte.job = ficha({ commission: 0, proNet: 0 })

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-commission')).toBeNull()
  })
})

/**
 * Lo que cuesta cancelar, dicho antes de pulsar
 * (`COMO_SE_CONTRATA` §6, 20 Septiembre 2026).
 *
 * Es la diferencia entre una penalización y un cargo sorpresa. Lo segundo
 * acaba en una reclamación aunque el importe sea el correcto, y el número lo
 * pone el servidor: aquí solo se comprueba que **se lee**, y que se lee lo que
 * toca a cada lado.
 */
describe('JobDetailPage: lo que cuesta cancelar', () => {
  it('al cliente se le dice la cifra antes de confirmar', () => {
    soporte.job = ficha({ viewer: 'client', status: 'CONTRACTED', cancelFee: 28 })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-break'))

    expect(screen.getByText(/Cancelar ahora cuesta 28,00 €/)).toBeTruthy()
  })

  /**
   * Y cuando sale gratis **también se dice**. Quien tiene una cancelación
   * delante da por hecho que le va a costar algo, y callarlo hace que no
   * cancele: se limita a no aparecer, que es lo que esto viene a evitar.
   */
  it('y cuando no cuesta nada, también se dice', () => {
    soporte.job = ficha({ viewer: 'client', status: 'CONTRACTED', cancelFee: 0 })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-break'))

    expect(screen.getByText(/no te cuesta nada/)).toBeTruthy()
  })

  /* Al profesional no se le habla de cifras: lo suyo es la marca en su ficha */
  it('al profesional se le dice que queda anotado, no lo que cuesta', () => {
    soporte.job = ficha({ viewer: 'pro', status: 'CONTRACTED', cancelFee: 0 })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-break'))

    expect(screen.getByText(/queda anotado en tu ficha/)).toBeTruthy()
    expect(screen.queryByText(/Cancelar ahora cuesta/)).toBeNull()
  })
})

/**
 * El trabajo que no ha empezado a su hora (§A9).
 *
 * Lo que se ata aquí es **quién ve qué botón**. Aceptar lo ve el que no
 * propuso; quien propuso está esperando, y enseñarle "Aceptar" le dejaría
 * moverle la cita al otro sin preguntarle, que es justo lo que los dos pasos
 * evitan.
 */
describe('JobDetailPage: no ha empezado a su hora', () => {
  const TOQUE = {
    noticedAt: '2026-09-12T10:15:00.000Z',
    decideByAt: '2026-09-12T10:25:00.000Z',
    proposedAt: null,
    proposedByMe: false,
  }

  it('sin retraso no hay nada de esto en pantalla', () => {
    soporte.job = ficha({})

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-late')).toBeNull()
  })

  /** Con el reloj delante: pasados esos minutos el trabajo se cae entero */
  it('con el toque dado, sale primero y con su cuenta atrás', () => {
    soporte.job = ficha({ lateStart: TOQUE })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(getByTestId('job-detail-late')).toBeTruthy()
    expect(getByTestId('job-detail-late-countdown')).toBeTruthy()
  })

  it('sin ninguna hora encima de la mesa no hay nada que aceptar', () => {
    soporte.job = ficha({ lateStart: TOQUE })

    const { queryByTestId, getByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(queryByTestId('job-detail-late-accept')).toBeNull()
    expect(getByTestId('job-detail-late-open')).toBeTruthy()
  })

  it('proponer una hora manda la que se ha elegido', () => {
    soporte.job = ficha({ lateStart: TOQUE })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-late-open'))

    const elegida = new Date('2026-09-12T12:00:00.000Z')
    fireEvent(getByTestId('job-detail-late-picker'), 'onChange', elegida)
    fireEvent.press(getByTestId('job-detail-late-send'))

    expect(soporte.proposed).toEqual([{ jobId: 'job-1', scheduledAt: elegida }])
  })

  /** La propuesta del otro sí se acepta: es la que salva el trabajo */
  it('la hora que propone el otro se puede aceptar', () => {
    soporte.job = ficha({
      lateStart: { ...TOQUE, proposedAt: '2026-09-12T12:00:00.000Z', proposedByMe: false },
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-late-accept'))

    expect(soporte.acceptedTimes).toEqual(['job-1'])
  })

  /**
   * Y la propia no. Aceptar la propia propuesta sería moverle la cita al de
   * enfrente sin su sí; el servidor lo rechaza, y enseñar el botón sería
   * enseñar uno que falla.
   */
  it('quien propuso no ve el botón de aceptar: está esperando', () => {
    soporte.job = ficha({
      lateStart: { ...TOQUE, proposedAt: '2026-09-12T12:00:00.000Z', proposedByMe: true },
    })

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-late-accept')).toBeNull()
  })
})

/**
 * El reparo que ya no es un callejón, y la revisión (`CICLOS` §C9).
 *
 * Lo que se ata aquí es que **las dos partes tengan salida**: el profesional
 * puede decir que ha vuelto o que no está de acuerdo, y el cliente puede pedir
 * que lo miremos. Antes de esto, un reparo dejaba el dinero retenido hasta que
 * el cliente pulsara un botón que podía no pulsar nunca.
 *
 * Y que la ficha diga **qué pasa con ese dinero y hasta cuándo**: es la mitad
 * de lo que necesita saber quien lo tiene parado.
 */
describe('JobDetailPage: el reparo y la revisión', () => {
  const conReparo = (cambios: Partial<ApiJobDetail> = {}) =>
    ficha({
      status: 'IN_PROGRESS',
      appointmentStatus: 'DONE',
      workFinishedAt: '2026-09-11T18:00:00.000Z',
      holdReason: 'El grifo sigue goteando',
      holdAnswerByAt: '2099-09-15T18:00:00.000Z',
      ...cambios,
    })

  const disputa = {
    openedAt: '2026-09-12T10:00:00.000Z',
    dueAt: '2026-09-27T10:00:00.000Z',
    openedByMe: false,
    byDeadline: false,
    reason: 'Ha vuelto dos veces y sigue goteando',
    resolvedAt: null,
    outcome: null,
    decision: null,
    refunded: null,
  }

  it('el profesional puede decir que ha vuelto y lo ha arreglado', () => {
    soporte.job = conReparo({ viewer: 'pro' })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-fixed'))

    expect(soporte.fixed).toEqual(['job-1'])
  })

  it('y si no está de acuerdo, pedir que lo revisemos: es su única salida', async () => {
    soporte.job = conReparo({ viewer: 'pro' })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(screen.getByTestId('job-detail-dispute'))
    await screen.findByTestId('job-detail-dispute-dialog')

    fireEvent.changeText(
      screen.getByTestId('job-detail-dispute-reason'),
      'Volví el martes y lo dejé seco, tengo fotos',
    )
    fireEvent.press(screen.getByTestId('job-detail-dispute-confirm'))

    await waitFor(() => expect(soporte.disputes).toHaveLength(1))
    expect(soporte.disputes[0]).toMatchObject({ jobId: 'job-1' })
  })

  it('sin contar qué ha pasado no se puede pedir: quien lo lea no estuvo allí', async () => {
    soporte.job = conReparo({ viewer: 'client' })

    render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(screen.getByTestId('job-detail-dispute'))
    await screen.findByTestId('job-detail-dispute-dialog')

    fireEvent.changeText(screen.getByTestId('job-detail-dispute-reason'), 'mal')
    fireEvent.press(screen.getByTestId('job-detail-dispute-confirm'))

    expect(soporte.disputes).toHaveLength(0)
  })

  it('el cliente no ve el botón de arreglarlo: no es suyo', () => {
    soporte.job = conReparo({ viewer: 'client' })

    const { queryByTestId, getByTestId } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(queryByTestId('job-detail-fixed')).toBeNull()
    /* Pero sí el de pedir revisión */
    expect(getByTestId('job-detail-dispute')).toBeTruthy()
  });

  it('en revisión se dice el plazo y que no decidimos quién tiene razón', () => {
    soporte.job = ficha({
      status: 'DISPUTED',
      viewer: 'client',
      workFinishedAt: '2026-09-11T18:00:00.000Z',
      dispute: disputa,
    })

    const { getByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByText(/Antes del 27 de septiembre/)).toBeTruthy()
    /* La frase que separa una intermediaria de quien resuelve pleitos ajenos */
    expect(getByTestId('job-detail-dispute-card-rights')).toBeTruthy()
  })

  it('las pruebas se ven con de quién son y de cuándo', () => {
    soporte.job = ficha({
      status: 'DISPUTED',
      viewer: 'pro',
      workFinishedAt: '2026-09-11T18:00:00.000Z',
      dispute: disputa,
      evidence: [
        {
          id: 'prueba-1',
          url: '/m/1',
          fullUrl: '/m/1-full',
          side: 'CLIENT',
          note: 'El goteo del día siguiente',
          createdAt: '2026-09-12T09:30:00.000Z',
        },
      ],
    })

    const { getByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-dispute-card-evidence-0')).toBeTruthy()
    expect(getByText('Cliente')).toBeTruthy()
  })

  it('y se puede aportar algo más mientras siga abierta', async () => {
    soporte.job = ficha({
      status: 'DISPUTED',
      viewer: 'pro',
      workFinishedAt: '2026-09-11T18:00:00.000Z',
      dispute: disputa,
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-evidence-picker'))
    fireEvent.press(getByTestId('job-detail-evidence-send'))

    await waitFor(() => expect(soporte.evidence).toEqual([{ jobId: 'job-1', pruebas: 1 }]))
  })

  it('resuelta, se lee la decisión y ya no se aportan pruebas', () => {
    soporte.job = ficha({
      status: 'CLOSED',
      viewer: 'client',
      workFinishedAt: '2026-09-11T18:00:00.000Z',
      dispute: {
        ...disputa,
        resolvedAt: '2026-09-20T10:00:00.000Z',
        outcome: 'SPLIT',
        decision: 'Falta el remate, el resto está bien.',
        refunded: 50,
      },
    })

    const { getByTestId, queryByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-dispute-card-decision')).toBeTruthy()
    expect(getByText(/Se te devolvieron 50,00 €/)).toBeTruthy()
    expect(queryByTestId('job-detail-evidence-send')).toBeNull()
  })
})

/**
 * El rato de más (§A6, 12 Septiembre 2026).
 *
 * Una reserva de dos horas que dura tres no se cobraba sola, y la tercera la
 * ponía el profesional de su bolsillo. Lo que se ata aquí es que **se ofrezca
 * apagado**: la app no cobra una charla en la puerta por su cuenta.
 *
 * Aquí vivía también el plazo de las 72 horas para presupuestar, que duró ocho
 * días: el 20 de septiembre el presupuesto salió de la app y la visita volvió a
 * cerrar el trabajo. Lo que queda de aquello se prueba más arriba, en «la
 * visita que espera presupuesto».
 */
describe('JobDetailPage: el rato de más', () => {
  it('el rato de más se ofrece con su cifra, y apagado', () => {
    // Reservadas 2 h, empezó hace 2 h 45, a 14 €/h: tres cuartos, 10,50 €
    soporte.job = ficha({
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      viewer: 'pro',
      startedAt: new Date(Date.now() - 165 * 60_000).toISOString(),
      bookedMinutes: 120,
      hourlyRate: 14,
    })

    const { getByTestId, getByText } = render(
      <JobDetailPage jobId="job-1" onBack={() => {}} />,
    )

    expect(getByTestId('job-detail-overtime')).toBeTruthy()
    expect(getByText(/Cobrar los 45 minutos de más \(10,50 €\)/)).toBeTruthy()

    /* Y terminar sin tocarlo no lo cobra */
    fireEvent.press(getByTestId('job-detail-finish'))
    expect(soporte.finished).toEqual([{ jobId: 'job-1', chargeExtra: false }])
  })

  it('marcado, se manda que sí', () => {
    soporte.job = ficha({
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      viewer: 'pro',
      startedAt: new Date(Date.now() - 165 * 60_000).toISOString(),
      bookedMinutes: 120,
      hourlyRate: 14,
    })

    const { getByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    fireEvent.press(getByTestId('job-detail-charge-extra'))
    fireEvent.press(getByTestId('job-detail-finish'))

    expect(soporte.finished).toEqual([{ jobId: 'job-1', chargeExtra: true }])
  })

  it('sin llegar a un cuarto de hora no se ofrece nada', () => {
    soporte.job = ficha({
      status: 'IN_PROGRESS',
      appointmentStatus: 'STARTED',
      viewer: 'pro',
      startedAt: new Date(Date.now() - 130 * 60_000).toISOString(),
      bookedMinutes: 120,
      hourlyRate: 14,
    })

    const { queryByTestId } = render(<JobDetailPage jobId="job-1" onBack={() => {}} />)

    expect(queryByTestId('job-detail-overtime')).toBeNull()
  })
})
