/**
 * A quién llamar para una urgencia, ahora mismo.
 *
 * Lo que se ata aquí es la tarifa de servicio (3 de octubre de 2026): antes
 * del aviso de confirmación solo decía el €/h y asumía que la salida vale
 * lo mismo que una hora. Ahora lo dice el servidor —`callout`,
 * `serviceFee`, `grandTotal`— y el aviso tiene que enseñar el total de
 * verdad, no el €/h a secas.
 */

import { Alert } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { UrgencyProsPage } from './UrgencyProsPage'

const PROS = [
  {
    id: 'pro-1',
    name: 'Sergio',
    avatarUrl: null,
    employerName: null,
    tradeLabel: 'Cerrajería',
    urgencyRate: 60,
    /* La salida es una hora al precio de urgencia: 60 € */
    callout: 60,
    /* 60 € × 7 % */
    serviceFee: 4.2,
    grandTotal: 64.2,
    rating: 4.8,
    reviewCount: 20,
    verified: true,
    distanceKm: 2.5,
  },
]

jest.mock('@/hooks/domain/useUrgencyPros', () => ({
  useUrgencyPros: () => ({
    data: { items: PROS },
    isPending: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useAskUrgency: () => ({
    ask: jest.fn().mockResolvedValue({ ok: true, result: {}, error: null }),
    isAsking: false,
  }),
}))

jest.mock('@/hooks/domain/usePaymentMethods', () => ({
  usePaymentMethods: () => ({
    data: [{ id: 'pm_1', brand: 'visa', last4: '4242' }],
    isPending: false,
  }),
}))

function abrir() {
  return render(
    <UrgencyProsPage
      jobId="job-1"
      tradeSlug="cerrajeria"
      point={{ lat: 40.4, lng: -3.7 }}
      onAsked={() => {}}
      onSeeDirectory={() => {}}
      onAddPaymentMethod={() => {}}
      onBack={() => {}}
    />,
  )
}

describe('UrgencyProsPage', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })

  it('al elegir a alguien, el aviso dice el total que de verdad se retiene, no solo el €/h', () => {
    abrir()

    fireEvent.press(screen.getByTestId('urgency-pro-pro-1'))

    expect(Alert.alert).toHaveBeenCalledWith(
      '¿Llamamos a Sergio?',
      expect.stringContaining('64,20'),
      expect.anything(),
    )
  })

  it('el aviso dice la tarifa de servicio aparte de la salida', () => {
    abrir()

    fireEvent.press(screen.getByTestId('urgency-pro-pro-1'))

    const [, mensaje] = (Alert.alert as jest.Mock).mock.calls[0] as [string, string]

    expect(mensaje).toContain('tarifa de servicio')
    expect(mensaje).toContain('4,20')
  })
})
