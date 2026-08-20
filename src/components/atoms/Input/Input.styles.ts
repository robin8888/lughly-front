/**
 * Input styles
 *
 * Venía de `.input` en styles.css, que en el tema industrial iba cuadrado y a
 * 15,5 px. Se redondea y se agranda (19 Agosto 2026) por lo mismo que se
 * redondearon los botones y subió el texto pequeño: el logotipo y el resto de
 * la app dejaron de ser cuadrados y angulosos, y un campo con la esquina viva
 * al lado de un botón redondo se ve como un descuido.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    width: '100%',
    /*
     * 48 y no 44: es lo que recomiendan las guías de las dos plataformas para
     * algo que se toca con el dedo, y con el texto ya a 16 px el campo de 44
     * quedaba apretado.
     */
    minHeight: 48,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontSize: theme.typography.sizes.small,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.field,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    borderRadius: theme.radius.field,
  },
  /**
   * Mientras se escribe. No lo tenía, y era lo que más se echaba en falta en
   * un formulario de varios campos: sin nada que señale dónde está el cursor,
   * quien vuelve al teléfono después de una interrupción no sabe qué estaba
   * rellenando.
   */
  focused: {
    borderColor: theme.colors.accent,
    borderWidth: 1.5,
    backgroundColor: theme.colors.accent100,
  },
  dark: {
    backgroundColor: theme.colors.darkInputBg,
    color: theme.colors.darkText,
    borderColor: 'rgba(232, 237, 245, 0.18)',
  },
  darkFocused: {
    borderColor: theme.colors.accent500,
    borderWidth: 1.5,
    backgroundColor: 'rgba(116, 157, 196, 0.14)',
  },
  error: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.55,
  },

  /** Envoltorio para poder colgar la unidad dentro del campo */
  wrapper: {
    width: '100%',
    justifyContent: 'center',
  },
  /*
   * Sitio para la unidad. Sin esto el número acabaría escribiéndose debajo de
   * ella en cuanto tuviera tres cifras.
   */
  withSuffix: {
    paddingRight: 46,
  },
  suffix: {
    position: 'absolute',
    right: 14,
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.55,
  },
  suffixDark: {
    color: theme.colors.darkText,
    opacity: 0.6,
  },
})
