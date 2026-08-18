/**
 * La tarjeta de estadística solo pinta estrellas cuando lo que mide es una
 * valoración. En kilómetros o en euros no significarían nada.
 */

import { render } from '@testing-library/react-native'
import { theme } from '@/theme'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('no pinta estrellas si no se le pasa valoración', () => {
    const { queryByTestId } = render(
      <StatCard label="Cobertura" value="25 km" testID="stat-radius" />
    )

    expect(queryByTestId('stat-radius-stars')).toBeNull()
  })

  it('las pinta cuando mide una valoración', () => {
    const { getByTestId } = render(
      <StatCard label="Valoración" value="4.0" rating={4} testID="stat-rating" />
    )

    expect(getByTestId('stat-rating-stars')).toBeTruthy()
  })

  it('pinta en amarillo tantas como diga la valoración, y el resto en gris', () => {
    const { getByTestId } = render(
      <StatCard label="Valoración" value="4.0" rating={4} testID="stat-rating" />
    )

    // `typeof type === 'string'` deja solo los nodos nativos: sin ese filtro
    // cada estrella aparece dos veces, como componente y como elemento.
    const glyphs = getByTestId('stat-rating-stars').findAll(
      (node) => typeof node.type === 'string' && node.props.children === '★'
    )
    const colores = glyphs.map(
      (g) => (g.props.style as { color?: string }[]).flat().at(-1)?.color
    )

    expect(colores).toHaveLength(5)
    expect(colores.filter((c) => c === theme.colors.rating)).toHaveLength(4)
    expect(colores.filter((c) => c === theme.colors.neutral300)).toHaveLength(1)
  })

  it('con 5 las pinta todas', () => {
    const { getByTestId } = render(
      <StatCard label="Valoración" value="5.0" rating={5} testID="stat-rating" />
    )

    // `typeof type === 'string'` deja solo los nodos nativos: sin ese filtro
    // cada estrella aparece dos veces, como componente y como elemento.
    const glyphs = getByTestId('stat-rating-stars').findAll(
      (node) => typeof node.type === 'string' && node.props.children === '★'
    )
    const amarillas = glyphs.filter((g) =>
      (g.props.style as { color?: string }[])
        .flat()
        .some((s) => s?.color === theme.colors.rating)
    )

    expect(amarillas).toHaveLength(5)
  })
})
