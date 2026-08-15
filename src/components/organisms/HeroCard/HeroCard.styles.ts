/**
 * HeroCard styles
 * Valores literales de HOME_MOBILE.md §2.
 *
 * Dos paletas para la misma pieza:
 *
 * - `dark`: la del diseño, tarjeta #04070f sobre el fondo negro de la home
 *   del cliente. Es la de HOME_MOBILE.md y no se toca.
 * - `light`: tarjeta clara para la home del profesional, que va sobre el
 *   fondo claro de la app. Ahí una tarjeta negra se lee como un bloque
 *   pegado, no como la cabecera de la pantalla.
 *
 * Lo que cambia es solo el color: tamaños, espaciados y estructura son los
 * mismos en las dos. Por eso hay un `base` compartido y dos mapas de color,
 * en vez de dos hojas de estilos que habría que mantener en paralelo.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native'
import { theme } from '@/theme'

export type HeroVariant = 'dark' | 'light'

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 12,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 26,
  },
  brand: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.caps,
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
  },
  /**
   * El nombre de quien ha entrado, encima del titular. Mismo cuerpo que el
   * título y en azul: forma con él un bloque de dos líneas, "Robin / Encuentra
   * tu próximo trabajo", en vez de parecer una etiqueta suelta.
   *
   * No lleva `marginBottom`: se lo pone el título con su `marginTop`, y
   * duplicarlo separaría las dos mitades de la misma frase.
   */
  userName: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 29,
    lineHeight: 32.5,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 29,
    lineHeight: 32.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
  },
  body: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14.5,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    flex: 1,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  /**
   * En el diseño los botones del hero son de 12,5 px, más pequeños que un
   * botón normal, porque van dos en una fila con textos largos
   * ("Ver trabajos disponibles"). Con el tamaño de botón por defecto el texto
   * partiría en dos líneas y el botón doblaría su altura.
   * 14 = los 12,5 del diseño con la subida del 12%.
   */
  actionText: {
    fontSize: 14,
  },
  actionSecondaryText: {
    fontSize: 14,
  },
  urgent: {
    marginTop: 8,
    backgroundColor: theme.colors.urgency,
    borderColor: theme.colors.urgency,
  },
})

interface HeroPalette {
  brand: TextStyle
  tag: ViewStyle
  tagText: TextStyle
  userName: TextStyle
  title: TextStyle
  body: TextStyle
  actionSecondary: ViewStyle
  actionSecondaryText: TextStyle
}

export const palettes: Record<HeroVariant, HeroPalette> = {
  dark: {
    brand: { color: theme.colors.cardBg },
    tag: {
      backgroundColor: 'rgba(89, 128, 166, 0.22)',
      borderColor: theme.colors.accent600,
    },
    tagText: { color: theme.colors.accent300 },
    /**
     * `accent300` y no el azul de marca: sobre el negro de la home del
     * cliente, `accent` se queda en 2,4:1 y el nombre no se lee. Es el mismo
     * azul de la app aclarado hasta que contrasta.
     */
    userName: { color: theme.colors.accent300 },
    title: { color: theme.colors.cardBg },
    body: { color: 'rgba(255, 255, 255, 0.75)' },
    actionSecondary: { borderColor: 'rgba(255, 255, 255, 0.4)' },
    actionSecondaryText: { color: theme.colors.cardBg },
  },
  light: {
    brand: { color: theme.colors.cardText },
    tag: {
      // Mismo gesto que en oscuro —un velo del acento— pero al revés:
      // acento muy diluido sobre claro, con el borde marcando el contorno.
      backgroundColor: theme.colors.accent100,
      // accent600 y no accent400: sobre accent100, el 400 se queda en 1,8:1
      // y el borde desaparece. El 600 da 3,9:1 y el contorno se ve.
      borderColor: theme.colors.accent600,
    },
    tagText: { color: theme.colors.accent700 },
    /** Sobre claro es el 700 el que contrasta, igual que el resto de rótulos */
    userName: { color: theme.colors.accent700 },
    title: { color: theme.colors.cardText },
    // 0.8 y no 0.75: sobre claro el mismo porcentaje se lee más lavado.
    body: { color: 'rgba(28, 43, 51, 0.8)' },
    actionSecondary: { borderColor: theme.colors.accent600 },
    actionSecondaryText: { color: theme.colors.accent700 },
  },
}
