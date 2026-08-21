/**
 * Tests de ProDirectoryCard.
 *
 * Lo que se fija aquí es que las fotos sean **opcionales de verdad**: sin
 * ninguna, la tarjeta se dibuja como antes de que existieran, sin tira ni hueco
 * gris esperando. Es la diferencia entre "aún no ha subido fotos" y "esta ficha
 * está a medias", y quien se registra en la calle sin las fotos buenas a mano
 * no debería parecer lo segundo.
 */

import { render } from '@testing-library/react-native'
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

const url = (n: number) => `/v1/media/pro-photos/foto-${n}.webp`

describe('ProDirectoryCard', () => {
  it('sin fotos no dibuja la tira: la tarjeta queda como antes', () => {
    const { queryByTestId, getByText } = render(
      <ProDirectoryCard pro={makePro([])} onPress={() => {}} />,
    )

    expect(queryByTestId('pro-card-photos')).toBeNull()
    // Y el resto de la tarjeta sigue en su sitio
    expect(getByText('Ana Gil')).toBeTruthy()
  })

  it('con fotos las enseña', () => {
    const { getByTestId } = render(
      <ProDirectoryCard pro={makePro([url(1), url(2)])} onPress={() => {}} />,
    )

    expect(getByTestId('pro-card-photos')).toBeTruthy()
  })

  it('con más de las que caben, resume el resto en un "+N"', () => {
    const photos = [url(1), url(2), url(3), url(4), url(5)]
    const { getByText } = render(
      <ProDirectoryCard pro={makePro(photos)} onPress={() => {}} />,
    )

    // Cuatro caben en la tira; la quinta se anuncia para que se sepa que en la
    // ficha hay más, en vez de cortarla sin avisar
    expect(getByText('+1')).toBeTruthy()
  })
})
