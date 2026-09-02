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

let mockSlotsResponse: typeof SLOTS = SLOTS
let mockQuoteResponse: typeof QUOTE | undefined = QUOTE

jest.mock('@/hooks/domain/useProProfile', () => ({
  useProProfile: () => ({ data: PRO, isPending: false, isError: false }),
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
  mockSlotsResponse = SLOTS
  mockQuoteResponse = QUOTE
  mockBook.mockClear()
  onBooked.mockClear()
})

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
    expect(screen.getByTestId('book-hours-total')).toHaveTextContent('75,00€')
    expect(screen.getByTestId('book-hours-submit')).toHaveTextContent('Reservar por 75,00 €')
  })

  /**
   * El día sin huecos no se queda en un «no» a secas: lo que tiene libre
   * después ya viene en la misma respuesta y se ofrece para tocarlo.
   */
  it('si ese día no le cabe, ofrece lo más pronto que puede', () => {
    mockSlotsResponse = {
      ...SLOTS,
      slots: [{ startAt: '2026-09-05T08:00:00.000Z', endAt: '2026-09-05T09:00:00.000Z' }],
    }

    abrir()

    expect(screen.getByTestId('book-hours-no-slots')).toBeTruthy()
    expect(screen.getByTestId('book-hours-next-2026-09-05T08:00:00.000Z')).toBeTruthy()
  })

  /** El precio no viaja: lo pone el servidor con la misma cuenta que enseñó */
  it('reserva con el hueco elegido y sin mandar importe', async () => {
    abrir()

    fireEvent.press(screen.getByTestId('book-hours-slot-2026-09-03T08:00:00.000Z'))
    fireEvent.changeText(screen.getByTestId('book-hours-city'), 'Madrid')
    fireEvent(screen.getByTestId('book-hours-address'), 'onChange', {
      label: 'Calle Mayor 14, Madrid',
      city: 'Madrid',
    })

    fireEvent.press(screen.getByTestId('book-hours-submit'))

    await Promise.resolve()

    expect(mockBook).toHaveBeenCalledWith(
      expect.objectContaining({
        tradeSlug: 'electricidad',
        startAt: '2026-09-03T08:00:00.000Z',
        durationMin: 60,
        addressLine: 'Calle Mayor 14, Madrid',
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
