/**
 * Reservar por horas: que se elija un hueco de verdad y que el precio que se
 * enseña sea el del servidor.
 *
 * Lo que se protege aquí es lo que hacía que este camino no existiera. Hasta
 * el 2 de septiembre de 2026 «Reservar ahora» llevaba al encargo genérico y
 * **no se cobraba nada**: un trabajo entero, terminado y cerrado, sin que a
 * nadie se le pidiera pagar.
 */

import { fireEvent, render, screen } from '@testing-library/react-native'
import { BookHoursPage, formatDuration } from './BookHoursPage'

const PRO = {
  id: 'pro-1',
  name: 'Robinson Rodriguez',
  city: 'Madrid',
  employerName: null,
  /** Lunes a viernes de 9 a 14: sin esto no se le puede reservar nada */
  availability: [1, 2, 3, 4, 5].map((weekday) => ({
    weekday,
    startMinute: 9 * 60,
    endMinute: 14 * 60,
  })),
  trades: [
    {
      slug: 'electricidad',
      label: 'Electricidad',
      hourlyRate: 75,
      minHours: null,
      visitFee: null,
    },
  ],
}

/** Dos huecos el mismo día, y uno de otro día que no debe salir en la rejilla */
const SLOTS = {
  durationMin: 60,
  requestedAvailable: false,
  slots: [
    { startAt: '2026-09-03T08:00:00.000Z', endAt: '2026-09-03T09:00:00.000Z' },
    { startAt: '2026-09-03T10:00:00.000Z', endAt: '2026-09-03T11:00:00.000Z' },
    { startAt: '2026-09-05T08:00:00.000Z', endAt: '2026-09-05T09:00:00.000Z' },
  ],
}

const QUOTE = {
  hourlyRate: 75,
  requestedHours: 1,
  billedHours: 1,
  minHours: null,
  minApplied: false,
  base: 75,
  surcharge: null,
  total: 75,
  startAt: '2026-09-03T08:00:00.000Z',
  durationMin: 60,
  terms: {
    hold: 'Se retiene ahora y se le paga cuando confirmes.',
    freeCancellation: 'Cancelación gratis hasta 24 h antes.',
  },
}

const mockBook = jest.fn().mockResolvedValue({ jobId: 'job-1' })

/** El día que la pantalla trae puesto: hoy. Los huecos se colocan ahí. */
const HOY = new Date('2026-09-03T12:00:00.000Z')

/** Ese día solo le quedan libres dos ratos, y el mayor es de 2 h */
const RANGES = {
  day: '2026-09-03',
  ranges: [
    { startAt: '2026-09-03T08:00:00.000Z', endAt: '2026-09-03T10:00:00.000Z', minutes: 120 },
    { startAt: '2026-09-03T14:00:00.000Z', endAt: '2026-09-03T15:00:00.000Z', minutes: 60 },
  ],
  longestMinutes: 120,
}

let mockPro: typeof PRO = PRO
let mockSlotsResponse: typeof SLOTS = SLOTS
let mockRangesResponse: typeof RANGES | undefined = RANGES
let mockQuoteResponse: typeof QUOTE | undefined = QUOTE

jest.mock('@/hooks/domain/useProProfile', () => ({
  useProProfile: () => ({ data: mockPro, isPending: false, isError: false }),
}))

jest.mock('@/hooks/domain/usePaymentMethods', () => ({
  usePaymentMethods: () => ({
    data: [{ id: 'pm_1', brand: 'visa', last4: '4242' }],
    isPending: false,
    isError: false,
  }),
}))

jest.mock('@/hooks/domain/useFreeSlots', () => ({
  useFreeSlots: () => ({ data: mockSlotsResponse, isFetching: false }),
}))

jest.mock('@/hooks/domain/useDayRanges', () => ({
  useDayRanges: (_proId: string, _day: string, enabled: boolean) => ({
    data: enabled ? mockRangesResponse : undefined,
    isFetching: false,
  }),
}))

jest.mock('@/hooks/domain/useHoursQuote', () => ({
  useHoursQuote: (_proId: string, query: unknown) => ({
    data: query ? mockQuoteResponse : undefined,
    isPending: false,
    error: null,
  }),
}))

jest.mock('@/hooks/domain/useBookHours', () => ({
  useBookHours: () => ({
    book: mockBook,
    isBooking: false,
    fieldErrors: {},
    formError: null,
    reset: jest.fn(),
  }),
}))

const onBooked = jest.fn()

function abrir() {
  return render(
    <BookHoursPage
      proId="pro-1"
      onBack={() => {}}
      onBooked={onBooked}
      onAddPaymentMethod={() => {}}
    />,
  )
}

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(HOY)
})

afterAll(() => {
  jest.useRealTimers()
})

beforeEach(() => {
  mockPro = PRO
  mockSlotsResponse = SLOTS
  mockRangesResponse = RANGES
  mockQuoteResponse = QUOTE
  mockBook.mockClear()
  onBooked.mockClear()
})

/** Ese día lleno: los únicos huecos que salen son de otro día */
function sinHuecosEseDia() {
  mockSlotsResponse = {
    ...SLOTS,
    slots: [{ startAt: '2026-09-05T08:00:00.000Z', endAt: '2026-09-05T09:00:00.000Z' }],
  }

  return abrir()
}

/** El caso real: pide tres horas y ese día solo le caben dos */
function pedirTresHoras() {
  fireEvent.press(screen.getByTestId('book-hours-duration'))
  fireEvent.press(screen.getByTestId('book-hours-duration-option-180'))
}

describe('BookHoursPage', () => {
  it('recién abierta no se puede reservar, y dice qué falta', () => {
    abrir()

    expect(screen.getByTestId('book-hours-submit')).toBeDisabled()
    expect(screen.getByTestId('book-hours-missing')).toHaveTextContent(/la hora/)
    expect(screen.getByTestId('book-hours-missing')).toHaveTextContent(/la dirección/)
  })

  /**
   * La rejilla es del día elegido, no de los primeros huecos que haya. Colar
   * ahí uno de otro día enseñaría «10:00» sin decir de cuándo, y se reserva un
   * jueves creyendo que es martes.
   */
  it('solo enseña los huecos del día elegido', () => {
    abrir()

    expect(screen.getByTestId('book-hours-slot-2026-09-03T08:00:00.000Z')).toBeTruthy()
    expect(screen.getByTestId('book-hours-slot-2026-09-03T10:00:00.000Z')).toBeTruthy()
    expect(screen.queryByTestId('book-hours-slot-2026-09-05T08:00:00.000Z')).toBeNull()
  })

  /**
   * Sin hueco no hay precio: lo que cuesta depende de la hora de inicio —un
   * sábado por la noche no vale lo que un martes— así que no hay respuesta
   * posible hasta que hay hora.
   */
  it('el desglose no aparece hasta elegir hora, y entonces es el del servidor', () => {
    abrir()

    expect(screen.queryByTestId('book-hours-quote')).toBeNull()

    fireEvent.press(screen.getByTestId('book-hours-slot-2026-09-03T08:00:00.000Z'))

    expect(screen.getByTestId('book-hours-quote')).toBeTruthy()
    // El total sale dos veces: en el desglose y en el botón, que es el sitio
    // donde de verdad se mira antes de pulsar.
    // Y cuándo es, escrito entero: es lo que se está comprando
    expect(screen.getByTestId('book-hours-when')).toHaveTextContent(
      'jueves, 3 de septiembre, de 10:00 a 11:00',
    )
    expect(screen.getByTestId('book-hours-total')).toHaveTextContent('75,00€')
    expect(screen.getByTestId('book-hours-submit')).toHaveTextContent('Reservar por 75,00 €')
  })

  /**
   * El día sin huecos no se queda en un «no» a secas: lo que tiene libre
   * después ya viene en la misma respuesta y se ofrece para tocarlo.
   */
  it('si ese día no le cabe, ofrece lo más pronto que puede', () => {
    sinHuecosEseDia()

    expect(screen.getByTestId('book-hours-no-slots')).toBeTruthy()
    expect(screen.getByTestId('book-hours-next-2026-09-05T08:00:00.000Z')).toBeTruthy()
  })

  /**
   * Y **uno por día**, no los tres primeros comienzos que haya.
   *
   * Van en cuadrícula de media hora, así que los tres primeros de una mañana
   * libre son «jueves 09:00, jueves 09:30, jueves 10:00»: tres formas de
   * reservar el mismo rato, que además se leen como un horario de 9 a 10.
   */
  it('lo más pronto es un día distinto en cada píldora', () => {
    mockSlotsResponse = {
      ...SLOTS,
      slots: [
        { startAt: '2026-09-05T08:00:00.000Z', endAt: '2026-09-05T11:00:00.000Z' },
        { startAt: '2026-09-05T08:30:00.000Z', endAt: '2026-09-05T11:30:00.000Z' },
        { startAt: '2026-09-05T09:00:00.000Z', endAt: '2026-09-05T12:00:00.000Z' },
        { startAt: '2026-09-07T08:00:00.000Z', endAt: '2026-09-07T11:00:00.000Z' },
      ],
    }

    abrir()

    expect(screen.getByTestId('book-hours-next-2026-09-05T08:00:00.000Z')).toBeTruthy()
    expect(screen.getByTestId('book-hours-next-2026-09-07T08:00:00.000Z')).toBeTruthy()
    // Los otros dos comienzos del sábado no repiten día
    expect(screen.queryByTestId('book-hours-next-2026-09-05T08:30:00.000Z')).toBeNull()
    expect(screen.queryByTestId('book-hours-next-2026-09-05T09:00:00.000Z')).toBeNull()
  })

  /** Y con la hora de fin: sin ella, la píldora no dice cuánto dura */
  it('la píldora dice el rato entero, no solo el comienzo', () => {
    sinHuecosEseDia()

    expect(
      screen.getByTestId('book-hours-next-2026-09-05T08:00:00.000Z'),
    ).toHaveTextContent(/10:00 – 11:00$/)
  })

  /**
   * Y antes que mandarle a otro día, lo que sí tiene libre **ese** día. Perder
   * una reserva por media hora teniendo la tarde entera libre es la forma más
   * tonta de perderla.
   */
  it('enseña el horario libre de ese día', () => {
    sinHuecosEseDia()

    expect(screen.getByTestId('book-hours-ranges')).toBeTruthy()
    expect(screen.getByText('10:00 – 12:00 · 2 h')).toBeTruthy()
    expect(screen.getByText('16:00 – 17:00 · 1 h')).toBeTruthy()
  })

  /** Y ofrece pedir lo que sí cabe, que es la salida sin cambiar de día */
  it('ofrece el rato más largo que le cabe ese día', () => {
    sinHuecosEseDia()
    pedirTresHoras()

    const oferta = screen.getByTestId('book-hours-shorter')
    expect(oferta).toHaveTextContent('Ver sus horas de 2 h ese día')

    fireEvent.press(oferta)

    // Aceptarlo cambia lo pedido: dos horas, y con eso ya no sobra la oferta
    expect(screen.getByTestId('book-hours-duration')).toHaveTextContent(/^2 h/)
    expect(screen.queryByTestId('book-hours-shorter')).toBeNull()
  })

  /**
   * Y un solo mensaje, no dos. «No le queda hueco de 1 h» y «ese día no
   * trabaja» juntos se contradicen: si no trabaja, no es que le falte una hora.
   */
  it('un día que no trabaja se dice así, y no se ofrece nada', () => {
    mockRangesResponse = { day: '2026-09-03', ranges: [], longestMinutes: 0 }
    sinHuecosEseDia()

    expect(screen.getByText('Ese día no trabaja.')).toBeTruthy()
    expect(screen.queryByText(/no le queda hueco/)).toBeNull()
    expect(screen.queryByTestId('book-hours-shorter')).toBeNull()
  })

  /**
   * Y a quien no ha puesto horario se le pregunta igual: el servidor le supone
   * uno —todos los días de 8 a 18— para que se le pueda contratar mientras
   * tanto. Aquí no se decide nada de eso; lo que se comprueba es que la
   * pantalla no se cierre por su cuenta.
   */
  it('a quien no ha puesto su horario se le pregunta igual', () => {
    mockPro = { ...PRO, availability: [] }

    abrir()

    expect(screen.getByTestId('book-hours-day')).toBeTruthy()
    expect(screen.getByTestId('book-hours-slots')).toBeTruthy()
  })

  /** El precio no viaja: lo pone el servidor con la misma cuenta que enseñó */
  it('reserva con el hueco elegido y sin mandar importe', async () => {
    abrir()

    fireEvent.press(screen.getByTestId('book-hours-slot-2026-09-03T08:00:00.000Z'))
    fireEvent.changeText(screen.getByTestId('book-hours-city'), 'Madrid')
    fireEvent(screen.getByTestId('book-hours-address'), 'onChange', {
      label: 'Calle Mayor, Madrid',
      city: 'Madrid',
      postcode: '28013',
    })

    // El número y el código postal, que es lo que se pide en España
    fireEvent.changeText(screen.getByTestId('book-hours-address-number'), '14')
    fireEvent.changeText(screen.getByTestId('book-hours-address-postcode'), '28013')

    fireEvent.press(screen.getByTestId('book-hours-submit'))

    await Promise.resolve()

    expect(mockBook).toHaveBeenCalledWith(
      expect.objectContaining({
        tradeSlug: 'electricidad',
        startAt: '2026-09-03T08:00:00.000Z',
        durationMin: 60,
        addressLine: 'Calle Mayor 14, 28013 Madrid',
        paymentMethodId: 'pm_1',
      }),
    )
    expect(mockBook.mock.calls[0][0]).not.toHaveProperty('total')
  })
})

describe('formatDuration', () => {
  it('dice las horas como se cuentan', () => {
    expect(formatDuration(30)).toBe('30 min')
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(90)).toBe('1 h 30 min')
    expect(formatDuration(480)).toBe('8 h')
  })
})
