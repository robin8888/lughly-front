/**
 * Button styles
 * Extraídos de .btn en styles.css
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3] * 1.2,
    /**
     * El tema industrial deja `.btn` cuadrado (styles.css, línea 291) y así
     * estuvo hasta ahora. Se redondea a conciencia, para toda la app: el
     * logotipo son letras gordas de esquinas redondas y un botón en escuadra
     * al lado suyo parece de otro producto.
     *
     * Los demás componentes que el override deja cuadrados —tarjetas, campos,
     * etiquetas, diálogos— siguen igual: aquí solo se pidieron los botones.
     */
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  text: {
    /**
     * `bodyBold` y no `heading`, que es lo que usaba antes.
     *
     * La fuente de titulares es Fredoka: redonda y ancha, estupenda a 29 px y
     * mala a 14, que es a lo que van dos botones en una fila del hero. Con
     * `numberOfLines={1}` no encogería, cortaría. Nunito Bold pesa lo mismo en
     * la jerarquía y ocupa lo que cabe.
     */
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.button,
    lineHeight: theme.typography.sizes.button * theme.typography.lineHeights.button,
    textAlign: 'center',
  },
})

type ButtonVariantStyle = Record<string, ViewStyle>
type TextVariantStyle = Record<string, TextStyle>

export const buttonStyles: ButtonVariantStyle = {
  /**
   * `accent700` y no el `accent` de la marca.
   *
   * El blanco sobre `accent` da 4,15:1 y el texto del botón va a 16 px, por
   * debajo del umbral de "texto grande": WCAG pide 4,5:1 y no llegaba. Con el
   * 700 sube a 6,48:1.
   *
   * Estuvo corrigiéndose a mano en cada sitio que pintaba un botón relleno —la
   * entrada, el hero, los trabajadores— hasta que fueron cuatro. El fallo era
   * del átomo, así que se arregla aquí y esas correcciones desaparecen.
   */
  primary: {
    backgroundColor: theme.colors.accent700,
    borderColor: theme.colors.accent700,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.divider,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: theme.spacing[1],
  },
  default: {},
  small: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
  },
  large: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
}

/**
 * Fondo mientras se mantiene pulsado, por variante.
 *
 * Estaba sin implementar: `styles.pressed` solo encogía el botón, así que al
 * pulsar no cambiaba de color y en un móvil —donde el dedo tapa medio botón—
 * casi no había respuesta. Los valores salen de `.btn-*:active` en styles.css
 * (líneas 157, 160 y 163); los `color-mix` del diseño se traducen a rgba con
 * el mismo porcentaje.
 */
export const pressedStyles: ButtonVariantStyle = {
  primary: {
    backgroundColor: theme.colors.accent800,
    borderColor: theme.colors.accent800,
  },
  // color-mix(in srgb, var(--color-text) 14%, transparent)
  secondary: {
    backgroundColor: 'rgba(29, 31, 32, 0.14)',
  },
  // color-mix(in srgb, var(--color-accent) 18%, transparent)
  ghost: {
    backgroundColor: 'rgba(89, 128, 166, 0.18)',
  },
}

export const textStyles: TextVariantStyle = {
  primary: {
    color: '#ffffff',
  },
  secondary: {
    color: theme.colors.text,
  },
  ghost: {
    color: theme.colors.accent,
  },
  default: {},
  small: {
    fontSize: 13.5,
  },
  large: {
    fontSize: 18,
  },
}
