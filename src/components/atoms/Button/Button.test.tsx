/**
 * Los botones de la app van redondeados, apartándose del tema industrial.
 *
 * El sistema de diseño los quiere cuadrados (`styles.css` línea 291, y
 * `radius.ts` lo documenta), así que esto es fácil de "corregir" de vuelta
 * creyendo que era un despiste. No lo es: se decidió para que peguen con el
 * logotipo, que es de letras redondas.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'
import { styles, pressedStyles, buttonStyles } from './Button.styles'

describe('Button', () => {
  it('lleva las esquinas redondeadas, y no las del tema industrial', () => {
    const base = StyleSheet.flatten(styles.base)

    expect(base.borderRadius).toBe(theme.radius.card)
    expect(base.borderRadius).not.toBe(theme.radius.none)
  })

  it('cambia de color al pulsarse, no solo de tamaño', () => {
    /*
     * En un móvil el dedo tapa medio botón, así que encogerlo un 4% no es
     * respuesta suficiente. Los colores son los de `.btn-*:active`.
     */
    expect(pressedStyles.primary.backgroundColor).toBe(theme.colors.accent700)
    expect(pressedStyles.secondary.backgroundColor).toBeDefined()
    expect(pressedStyles.ghost.backgroundColor).toBeDefined()

    expect(pressedStyles.primary.backgroundColor).not.toBe(
      buttonStyles.primary.backgroundColor
    )
  })
})
