/**
 * Tests de ProDirectoryCard.
 *
 * Lo que se fija aquí es que las fotos sean **opcionales de verdad**: sin
 * ninguna, la tarjeta se dibuja como antes de que existieran, sin tira ni hueco
 * gris esperando. Es la diferencia entre "aún no ha subido fotos" y "esta ficha
 * está a medias", y quien se registra en la calle sin las fotos buenas a mano
 * no debería parecer lo segundo.
 */

import { fireEvent, render } from '@testing-library/react-native'
import { ProDirectoryCard } from './ProDirectoryCard'
import type { ApiPro } from '@/api/pros.api'

function makePro(photos: string[]): ApiPro {
  return {
    id: 'pro-1',
    name: 'Ana Gil',
    avatarUrl: null,
    trade: 'fontaneria',
    tradeLabel: 'Fontanería',
    trades: [{ slug: 'fontaneria', label: 'Fontanería', hourlyRate: 28 }],
    photos,
    city: 'Madrid',
    hourlyRate: 28,
    visitFee: null,
    rating: 4.5,
    reviewCount: 10,
    completedJobs: 20,
    availableNow: false,
    verified: true,
    bio: 'Reparaciones y reformas de baño.',
    distanceKm: null,
    employerName: null,
  }
}

function makeProConCarta(): ApiPro {
  const base = makePro([])

  return {
    ...base,
    hourlyRate: null,
    visitFee: 35,
    trades: [
      {
        slug: 'fontaneria',
        label: 'Fontanería',
        hourlyRate: null,
        visitFee: 35,
        services: [
          { id: 'svc-1', name: 'Cambio de grifo', price: 40 },
          { id: 'svc-2', name: 'Desatasco', price: 60 },
        ],
      },
    ],
  }
}

const url = (n: number) => `/v1/media/pro-photos/foto-${n}.webp`

const noopHireCarta = () => {}

describe('ProDirectoryCard', () => {
  it('sin fotos no dibuja la tira: la tarjeta queda como antes', () => {
    const { queryByTestId, getByText } = render(
      <ProDirectoryCard pro={makePro([])} onPress={() => {}} onHireCarta={noopHireCarta} />,
    )

    expect(queryByTestId('pro-card-photos')).toBeNull()
    // Y el resto de la tarjeta sigue en su sitio
    expect(getByText('Ana Gil')).toBeTruthy()
  })

  it('con fotos las enseña', () => {
    const { getByTestId } = render(
      <ProDirectoryCard
        pro={makePro([url(1), url(2)])}
        onPress={() => {}}
        onHireCarta={noopHireCarta}
      />,
    )

    expect(getByTestId('pro-card-photos')).toBeTruthy()
  })

  it('con más de las que caben, resume el resto en un "+N"', () => {
    const photos = [url(1), url(2), url(3), url(4), url(5)]
    const { getByText } = render(
      <ProDirectoryCard pro={makePro(photos)} onPress={() => {}} onHireCarta={noopHireCarta} />,
    )

    // Cuatro caben en la tira; la quinta se anuncia para que se sepa que en la
    // ficha hay más, en vez de cortarla sin avisar
    expect(getByText('+1')).toBeTruthy()
  })

  it('sin carta en el oficio de la tarjeta, no dibuja el desplegable', () => {
    const { queryByTestId } = render(
      <ProDirectoryCard pro={makePro([])} onPress={() => {}} onHireCarta={noopHireCarta} />,
    )

    expect(queryByTestId('pro-card-carta')).toBeNull()
  })

  it('con carta, empieza cerrada y al abrirla se ve la lista, el total y el botón de contratar', () => {
    const { getByTestId, queryByTestId, getByText } = render(
      <ProDirectoryCard pro={makeProConCarta()} onPress={() => {}} onHireCarta={noopHireCarta} />,
    )

    expect(queryByTestId('pro-card-carta-body')).toBeNull()

    fireEvent.press(getByTestId('pro-card-carta-toggle'))

    expect(getByTestId('pro-card-carta-body')).toBeTruthy()
    expect(getByText('Cambio de grifo · 40,00 €')).toBeTruthy()
    // Solo la visita, sin nada marcado todavía
    expect(getByText('35,00€')).toBeTruthy()
    // Contratar está siempre, aunque no se haya marcado ningún servicio
    expect(getByTestId('pro-card-carta-hire')).toBeTruthy()
  })

  it('marcar un servicio no suma la visita: su precio ya lleva el desplazamiento', () => {
    const { getByTestId, getByText } = render(
      <ProDirectoryCard pro={makeProConCarta()} onPress={() => {}} onHireCarta={noopHireCarta} />,
    )

    fireEvent.press(getByTestId('pro-card-carta-toggle'))
    fireEvent.press(getByTestId('pro-card-carta-service-svc-1'))

    expect(getByText('40,00€')).toBeTruthy()
  })

  it('marcar dos servicios suma solo entre ellos', () => {
    const { getByTestId, getByText } = render(
      <ProDirectoryCard pro={makeProConCarta()} onPress={() => {}} onHireCarta={noopHireCarta} />,
    )

    fireEvent.press(getByTestId('pro-card-carta-toggle'))
    fireEvent.press(getByTestId('pro-card-carta-service-svc-1'))
    fireEvent.press(getByTestId('pro-card-carta-service-svc-2'))

    expect(getByText('100,00€')).toBeTruthy()
  })

  it('contratar desde la tarjeta manda el profesional, el oficio y lo marcado', () => {
    const onHireCarta = jest.fn()
    const { getByTestId } = render(
      <ProDirectoryCard pro={makeProConCarta()} onPress={() => {}} onHireCarta={onHireCarta} />,
    )

    fireEvent.press(getByTestId('pro-card-carta-toggle'))
    fireEvent.press(getByTestId('pro-card-carta-service-svc-1'))
    fireEvent.press(getByTestId('pro-card-carta-hire'))

    expect(onHireCarta).toHaveBeenCalledWith('pro-1', 'fontaneria', ['svc-1'])
  })

  it('tocar el resto de la tarjeta con algo marcado lleva la selección al perfil', () => {
    const onPress = jest.fn()
    const { getByTestId, getByText } = render(
      <ProDirectoryCard pro={makeProConCarta()} onPress={onPress} onHireCarta={noopHireCarta} />,
    )

    fireEvent.press(getByTestId('pro-card-carta-toggle'))
    fireEvent.press(getByTestId('pro-card-carta-service-svc-1'))
    // Cualquier otro punto de la tarjeta, como el nombre
    fireEvent.press(getByText('Ana Gil'))

    expect(onPress).toHaveBeenCalledWith({ tradeSlug: 'fontaneria', serviceIds: ['svc-1'] })
  })

  it('tocar la tarjeta sin marcar nada no manda selección', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <ProDirectoryCard pro={makeProConCarta()} onPress={onPress} onHireCarta={noopHireCarta} />,
    )

    fireEvent.press(getByText('Ana Gil'))

    expect(onPress).toHaveBeenCalledWith(undefined)
  })
})
