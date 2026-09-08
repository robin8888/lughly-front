/**
 * HowItWorksPage styles
 *
 * Cabecera propia y fondo claro, como el resto de pantallas de pila —Mis
 * fotos, Encargos, Mis oficios—. No usa `ScreenShell` a propósito: ese
 * envoltorio es oscuro y dejaría esta como la única pantalla negra a la que
 * se llega desde una home clara.
 *
 * **Sin scroll**: es un paso por pantalla y tiene que caber entero. Si un
 * texto no cabe en el móvil más pequeño, el texto es demasiado largo —no hace
 * falta un scroll, hace falta cortarlo—. Por eso la imagen se encoge con la
 * pantalla (`flex`) en vez de tener una altura fija.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  /*
    Cabecera en el azul oscuro de los formularios (`AuthShell`), con el título
    en blanco (25 Agosto 2026). Se hizo en las treinta pantallas a la vez: una
    cabecera clara aquí y otra oscura allá no es una variante, es un descuido.
  */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: 12,
    /* El hueco del sistema, que ya no lo reserva el `SafeAreaView` */
    paddingTop: 56,
    paddingBottom: theme.spacing[3],
    backgroundColor: theme.colors.accent900,
  },
  back: {
    padding: theme.spacing[2],
  },
  backIcon: {
    fontSize: 27,
    color: '#ffffff',
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: '#ffffff',
    /* Empuja el contador al otro extremo */
    flex: 1,
  },
  progress: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent300,
    paddingRight: theme.spacing[2],
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    /*
      La barra inferior flota por encima del contenido. `SafeAreaView` ya se
      come el inset de abajo, así que aquí NO hace falta sumarle
      `insets.bottom` a mano —eso lo haría dos veces—.
    */
    paddingBottom: 106,
  },

  /**
   * El hueco de la imagen. Con `flex` y no con una altura: en un móvil
   * pequeño la cara se encoge y el texto sigue cabiendo, que es el orden
   * correcto de prioridades —lo que hay que leer manda sobre lo que
   * acompaña—.
   */
  figure: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing[4],
  },
  image: {
    width: '100%',
    height: '100%',
  },

  text: {
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  stepTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 26,
    lineHeight: 30,
    color: theme.colors.accent700,
    marginBottom: 10,
  },
  stepBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.body,
    color: theme.colors.text,
    opacity: 0.85,
  },

  footer: {
    gap: theme.spacing[3],
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.neutral300,
  },
  /** El del paso actual: relleno y más ancho, que se vea cuál es sin contar */
  dotOn: {
    width: 20,
    backgroundColor: theme.colors.accent,
  },
  skip: {
    alignSelf: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  skipText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
})
