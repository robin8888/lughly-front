/**
 * Contratar la carta de un profesional.
 *
 * Lo que se ata aquí es la tarifa de servicio (3 de octubre de 2026): va en
 * su propia línea, se suma por encima del total de los servicios marcados
 * —nunca sale de él—, y el botón pide el total con ella dentro, que es lo
 * que de verdad se retiene en la tarjeta.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { HireCartaPage } from './HireCartaPage'

const PRO = {
  id: 'pro-1',
  name: 'Marta Autónoma',
  employerName: null,
  city: 'Madrid',
  trades: [
    {
      slug: 'fontaneria',
      label: 'Fontanería',
      hourlyRate: null,
      visitFee: 30,
      services: [
        { id: 'srv-1', name: 'Cambiar un grifo', price: 45 },
        { id: 'srv-2', name: 'Desatascar un desagüe', price: 35 },
      ],
    },
  ],
}

let mockQuote: { total: number; serviceFee: number; grandTotal: number } | undefined

jest.mock('@/hooks/domain/useProProfile', () => ({
  useProProfile: () => ({ data: PRO, isPending: false, isError: false, refetch: jest.fn() }),
}))

jest.mock('@/hooks/domain/usePaymentMethods', () => ({
  usePaymentMethods: () => ({
    data: [{ id: 'pm_1', brand: 'visa', last4: '4242' }],
    isPending: false,
    isError: false,
  }),
}))

jest.mock('@/hooks/domain/useCartaQuote', () => ({
  useCartaQuote: (_proId: string, query: unknown) => ({
    data: query ? mockQuote : undefined,
  }),
}))

const mockBook = jest.fn().mockResolvedValue({ jobId: 'job-1' })

jest.mock('@/hooks/domain/useBookServices', () => ({
  useBookServices: () => ({
    book: mockBook,
    isBooking: false,
    formError: null,
  }),
}))

function abrir(serviceIds: string[] = []) {
  return render(
    <HireCartaPage
      proId="pro-1"
      tradeSlug="fontaneria"
      serviceIds={serviceIds}
      onBack={() => {}}
      onBooked={() => {}}
      onAddPaymentMethod={() => {}}
    />,
  )
}

describe('HireCartaPage', () => {
  beforeEach(() => {
    /* Solo la visita: 30 € × 7 % = 2,10 € */
    mockQuote = { total: 30, serviceFee: 2.1, grandTotal: 32.1 }
  })

  it('mientras no llega la tarifa, el total es el de los servicios, sin inventar una cifra', async () => {
    mockQuote = undefined
    render(
      <HireCartaPage
        proId="pro-1"
        tradeSlug="fontaneria"
        serviceIds={[]}
        onBack={() => {}}
        onBooked={() => {}}
        onAddPaymentMethod={() => {}}
      />,
    )

    expect(screen.getByTestId('hire-carta-total')).toHaveTextContent('30,00€')
    expect(screen.queryByText('Tarifa de servicio')).toBeNull()
  })

  it('con la tarifa ya calculada, se ve aparte y el total la incluye', async () => {
    abrir()

    await waitFor(() => {
      expect(screen.getByTestId('hire-carta-total')).toHaveTextContent('32,10€')
    })
    expect(screen.getByText('Tarifa de servicio')).toBeTruthy()
    expect(screen.getByTestId('hire-carta-submit')).toHaveTextContent('32,10 €', {
      exact: false,
    })
  })

  it('con servicios marcados, la tarifa se calcula sobre su suma, no sobre la visita', async () => {
    mockQuote = { total: 80, serviceFee: 5.6, grandTotal: 85.6 }
    abrir(['srv-1', 'srv-2'])

    await waitFor(() => {
      expect(screen.getByTestId('hire-carta-total')).toHaveTextContent('85,60€')
    })
    expect(screen.getByText('Cambiar un grifo')).toBeTruthy()
    expect(screen.getByText('Desatascar un desagüe')).toBeTruthy()
    /* Con servicios marcados, la visita no se enseña como línea aparte */
    expect(screen.queryByText('Visita a domicilio')).toBeNull()
  })

  /**
   * El consentimiento a empezar antes de los 14 días de desistimiento
   * (TRLGDCU arts. 97.1.i y 103.a, 3 de octubre de 2026): sin marcarlo, el
   * botón sigue apagado aunque todo lo demás esté relleno.
   */
  it('sin aceptar que el trabajo empiece ya, no se puede contratar', () => {
    abrir()

    fireEvent.changeText(screen.getByTestId('hire-carta-city'), 'Madrid')
    fireEvent(screen.getByTestId('hire-carta-address'), 'onChange', {
      label: 'Calle Mayor, Madrid',
      city: 'Madrid',
      postcode: '28013',
    })
    fireEvent.changeText(screen.getByTestId('hire-carta-address-number'), '14')
    fireEvent.changeText(screen.getByTestId('hire-carta-address-postcode'), '28013')

    expect(screen.getByTestId('hire-carta-submit')).toBeDisabled()

    fireEvent.press(screen.getByTestId('hire-carta-execution-consent'))

    expect(screen.getByTestId('hire-carta-submit')).not.toBeDisabled()
  })
})
