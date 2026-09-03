/**
 * Que pedir presupuesto avise de lo que cuesta, antes de pedirlo.
 *
 * Es lo que se protege aquí, y protege dinero por los dos lados. Hasta el 3 de
 * septiembre de 2026 «Presupuesto» era el camino gratis abierto a todo el
 * directorio: el profesional se recorría la ciudad, daba el presupuesto, y no
 * se cobraba nada. Ahora se paga la visita — y un botón que hasta ayer era
 * gratis y hoy cobra **no puede** llevar directo al formulario: eso es un
 * cobro a traición, aunque el importe salga después en pantalla.
 *
 * El diálogo dice las tres cosas que el cliente no puede deducir: que alguien
 * va a ir a su casa, cuánto cuesta eso, y que se cobra aunque el presupuesto no
 * le convenza.
 */

import { fireEvent, render, screen } from '@testing-library/react-native'
import { ProProfilePage } from './ProProfilePage'

let mockPro: Record<string, unknown> | null = null

jest.mock('@/hooks/domain/useProProfile', () => ({
  useProProfile: () => ({
    data: mockPro,
    isPending: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

jest.mock('@/hooks/auth/useEffectiveRole', () => ({
  useEffectiveRole: () => 'client',
}))

jest.mock('@/hooks/domain/useFavorites', () => ({
  useFavoriteIds: () => new Set<string>(),
  useToggleFavorite: () => ({ toggle: jest.fn() }),
}))

jest.mock('@/components/organisms/ReviewList', () => ({
  ReviewList: () => null,
}))

function perfil(trades: Record<string, unknown>[]) {
  return {
    id: 'pro-1',
    name: 'Rocío Vega',
    avatarUrl: null,
    trade: 'fontaneria',
    tradeLabel: 'Fontanería',
    city: 'Madrid',
    employerName: null,
    bio: null,
    hourlyRate: null,
    visitFee: null,
    rating: 4.9,
    reviewCount: 30,
    verified: true,
    availableNow: false,
    absentUntil: null,
    radiusKm: 20,
    photos: [],
    availability: [],
    trades,
  }
}

const onQuote = jest.fn()
const onBookHours = jest.fn()
const onHireCarta = jest.fn()

function abrir() {
  return render(
    <ProProfilePage
      id="pro-1"
      onBack={() => {}}
      onBookHours={onBookHours}
      onQuote={onQuote}
      onHireCarta={onHireCarta}
      onReport={() => {}}
    />,
  )
}

beforeEach(() => {
  onQuote.mockClear()
  onBookHours.mockClear()
  onHireCarta.mockClear()
})

describe('ProProfilePage: el aviso de que la visita se paga', () => {
  it('pedir presupuesto no lleva al formulario sin avisar antes', () => {
    mockPro = perfil([
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: 30 },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-quote'))

    // No se ha ido a ninguna parte: primero hay que leer lo que cuesta
    expect(onQuote).not.toHaveBeenCalled()
    expect(screen.getByTestId('pro-quote-dialog')).toBeTruthy()
  })

  it('el aviso dice el importe, que va a ir a tu dirección, y que se cobra igual', () => {
    mockPro = perfil([
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: 30 },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-quote'))

    expect(screen.getByText(/La visita son 30,00 €/)).toBeTruthy()
    expect(screen.getByText(/acercarse a tu dirección/)).toBeTruthy()
    // La que evita el enfado de verdad: el viaje se paga aunque no aceptes
    expect(screen.getByText(/aunque no lo aceptes/)).toBeTruthy()
  })

  /**
   * Y a quien cobra por horas **no se le pide presupuesto**, que es la
   * corrección del mismo día: no vende precios cerrados, vende ratos de su
   * agenda. Se intentó calcularle una visita con su mínimo para que el camino
   * cobrara —cobraba, pero vendía algo que en ese oficio nadie ofrece—.
   *
   * No se esconde el botón: se explica y se le lleva a su puerta, que existe y
   * también cobra. Un botón desaparecido deja al cliente buscándolo.
   */
  it('a quien cobra por horas no se le pide presupuesto: se le reservan horas', () => {
    mockPro = perfil([
      { slug: 'limpieza', label: 'Limpieza', hourlyRate: 14, visitFee: null },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-quote'))

    expect(onQuote).not.toHaveBeenCalled()
    expect(screen.getByTestId('pro-hourly-dialog')).toBeTruthy()
    expect(screen.getByText(/no se trabaja con presupuestos cerrados/)).toBeTruthy()

    fireEvent.press(screen.getByTestId('pro-hourly-book'))
    expect(onBookHours).toHaveBeenCalledWith('limpieza')
  })

  /**
   * Y si ejerce los dos, el botón presupuesta el que sí puede: se le puede
   * pedir algo a esa persona, aunque no sea por el oficio que estaba abierto.
   */
  it('con un oficio por horas y otro con visita, presupuesta el de la visita', () => {
    mockPro = perfil([
      { slug: 'limpieza', label: 'Limpieza', hourlyRate: 14, visitFee: null },
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: 30 },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-quote'))

    expect(screen.getByText(/La visita son 30,00 €/)).toBeTruthy()

    fireEvent.press(screen.getByTestId('pro-quote-confirm'))
    expect(onQuote).toHaveBeenCalledWith('fontaneria')
  })

  it('al confirmar, se va al formulario con el oficio del precio', () => {
    mockPro = perfil([
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: 30 },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-quote'))
    fireEvent.press(screen.getByTestId('pro-quote-confirm'))

    expect(onQuote).toHaveBeenCalledWith('fontaneria')
  })

  it('«Ahora no» no lleva a ninguna parte', () => {
    mockPro = perfil([
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: 30 },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-quote'))
    fireEvent.press(screen.getByTestId('pro-quote-cancel'))

    expect(onQuote).not.toHaveBeenCalled()
  })

  /**
   * Y el oficio manda sobre el profesional: se pide presupuesto del oficio con
   * el que venía mirando, no del principal, porque no cobra lo mismo por ir a
   * ver una cosa que la otra.
   */
  it('el precio es del oficio con el que venía mirando', () => {
    mockPro = perfil([
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: 30 },
      { slug: 'cerrajeria', label: 'Cerrajería', hourlyRate: null, visitFee: 55 },
    ])

    render(
      <ProProfilePage
        id="pro-1"
        onBack={() => {}}
        onBookHours={onBookHours}
        onQuote={onQuote}
        onHireCarta={onHireCarta}
        onReport={() => {}}
        initialSelection={{ tradeSlug: 'cerrajeria', serviceIds: [] }}
      />,
    )

    fireEvent.press(screen.getByTestId('pro-quote'))

    expect(screen.getByText(/La visita son 55,00 €/)).toBeTruthy()

    fireEvent.press(screen.getByTestId('pro-quote-confirm'))
    expect(onQuote).toHaveBeenCalledWith('cerrajeria')
  })
})

/**
 * El otro lado de la misma regla: un oficio sin tarifas no se contrata.
 *
 * No debería existir —el alta exige una de las dos— pero llega de fichas
 * viejas, y antes «Reservar ahora» caía en el encargo genérico que no cobraba
 * nada. Ahora se dice lo que pasa de verdad en vez de abrir la puerta de atrás.
 */
describe('ProProfilePage: un oficio sin precios', () => {
  it('reservar dice que no tiene precios, en vez de contratar gratis', () => {
    mockPro = perfil([
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: null },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-book'))

    expect(screen.getByTestId('pro-no-price-dialog')).toBeTruthy()
    expect(onBookHours).not.toHaveBeenCalled()
    expect(onHireCarta).not.toHaveBeenCalled()
  })

  it('y pedir presupuesto, lo mismo', () => {
    mockPro = perfil([
      { slug: 'fontaneria', label: 'Fontanería', hourlyRate: null, visitFee: null },
    ])

    abrir()
    fireEvent.press(screen.getByTestId('pro-quote'))

    expect(screen.getByTestId('pro-no-price-dialog')).toBeTruthy()
    expect(onQuote).not.toHaveBeenCalled()
  })
})
