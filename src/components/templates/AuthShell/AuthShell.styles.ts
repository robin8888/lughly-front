/**
 * AuthShell styles
 * Según MobileApp.dc.html (STACK: LOGIN / REGISTRO):
 * fondo accent-900, marca en blanco y tarjeta blueprint clara de 320px máx.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.accent900,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
  },
  wrapper: {
    width: '100%',
    maxWidth: 320,
  },
  /**
   * El logotipo, al mismo tamaño que el "LUGHLY" de 22 px que sustituye.
   *
   * Lo que se iguala es la altura de la mayúscula, no la de la imagen: el
   * texto iba en mayúsculas y no bajaba de la línea base, mientras que el
   * logotipo es "Lughly" con la 'g' y la 'y' descendiendo. Igualar el alto
   * total dejaría las letras una cuarta parte más pequeñas que el texto.
   *
   *   mayúscula del texto:  22 × 0,70 (cap height de Barlow) = 15,4
   *   en el PNG la mayúscula ocupa 230 de 308 px = 74,68% (medido)
   *   alto a la par del texto: 15,4 ÷ 0,7468 = 20,6
   *   ×2 por decisión de producto: 41,2 → 120,4 de ancho
   *
   * El ×2 es deliberado: a la par del texto el logotipo se leía como una
   * palabra más y no como la marca de la pantalla.
   *
   * Se fija el alto y el ancho sale de `aspectRatio`, la proporción real del
   * PNG: poner los dos a mano lo deformaría en cuanto se retocara uno.
   */
  brand: {
    height: 41.2,
    aspectRatio: 900 / 308,
    alignSelf: 'center',
    marginBottom: theme.spacing[6],
  },
  card: {
    position: 'relative',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.72,
    marginBottom: theme.spacing[4],
  },
  centered: {
    textAlign: 'center',
  },
  error: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
})
