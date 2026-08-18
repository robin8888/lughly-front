/**
 * SplashPage styles
 * Según MobileApp.dc.html: pieza cover anclada arriba y bloque de acciones con
 * padding 4px 20px 26px. El degradado inferior del diseño se cambió por un
 * cristal esmerilado tras los botones; ver `BLUR_INTENSITY`.
 *
 * El fondo del diseño era `darkBg` (#04070f), pero la pantalla usa ahora `bg`
 * (#f2f2f3), el mismo de las tarjetas claras —la de Login y Registro dentro de
 * `AuthShell`, RoleGate, QuickSearch—: entrar y pulsar "Registrarse" deja de
 * ser un salto de color.
 *
 * El vídeo es una escena opaca que ahora llena la pantalla entera, así que el
 * color de fondo casi no se ve: queda de respaldo mientras el vídeo carga.
 *
 * Los botones se apartan del handoff en las esquinas redondeadas, que el tema
 * industrial quiere cuadradas. El azul de relleno y el contraste los resuelve
 * ya el átomo `Button`.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/**
 * Fuerza del cristal esmerilado que hay tras los botones.
 *
 * Sustituye al degradado del diseño, que desvanecía el vídeo hacia el color de
 * la pantalla —o sea, lo aclaraba hasta el blanco—. Aquí el vídeo sigue
 * corriendo por debajo y lo que lo tapa es un desenfoque, así que conserva su
 * color y su movimiento.
 *
 * Es el único mando: más intensidad, cristal más opaco y botones más legibles;
 * menos, se ve mejor el vídeo por detrás. Si al bajarlo el texto del botón
 * hueco empieza a costar, el problema es este número.
 */
const BLUR_INTENSITY = 55

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  /**
   * El vídeo ocupa la pantalla entera, botones incluidos.
   *
   * Antes vivía en un hueco que terminaba donde empezaban los botones. Al
   * pasar el fondo de los botones a cristal esmerilado hubo que extenderlo:
   * un desenfoque necesita algo que desenfocar por detrás, y ahí antes solo
   * había color plano.
   */
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  /**
   * Los botones flotan sobre el vídeo, pegados abajo con `marginTop: 'auto'`
   * al ser el único hijo en flujo.
   *
   * Sin `backgroundColor`: lo pone el cristal. Si alguien se lo devuelve, tapa
   * el desenfoque con color plano y se pierde el efecto entero.
   */
  actions: {
    marginTop: 'auto',
    overflow: 'hidden',
    paddingTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[3],
  },
  actionsBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  /**
   * Los dos botones comparten caja: padding simétrico en los cuatro lados.
   *
   * El diseño pone `padding: 13px` (MobileApp.dc.html, líneas 52-53) y aquí
   * solo se aplicaba al alto, dejando el ancho en el 12,24 de `.btn`.
   * `spacing[4]` (13,6) es el token que más se acerca.
   *
   * Ya no fija el redondeo: empezó aquí y luego se subió al átomo `Button`,
   * porque se decidió redondear los botones de toda la app. Repetirlo sería
   * dejar dos sitios donde cambiarlo.
   */
  buttonBase: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
  },
  /**
   * "Iniciar sesión": relleno blanco con el texto y el borde en el azul de la
   * app. Es la pareja hueca del primario —mismo azul, invertido—, y sobre el
   * cristal esmerilado el blanco lo despega del vídeo que corre por detrás.
   *
   * Pasó por tres formas: borde blanco al 35% cuando el fondo era negro,
   * transparente con borde azul cuando la pantalla se aclaró, y ahora sólido.
   * El texto en `accent700` sobre blanco da 6,48:1.
   */
  loginButton: {
    backgroundColor: '#ffffff',
    borderColor: theme.colors.accent700,
  },
  /**
   * Al pintarle el fondo a mano se tapa el velo que `Button` aplica a la
   * variante `secondary`, así que hay que decir aparte cómo se ve hundido.
   * `accent100` es el mismo velo azul que usan las sugerencias del buscador.
   */
  loginButtonPressed: {
    backgroundColor: theme.colors.accent100,
  },
  loginButtonText: {
    color: theme.colors.accent700,
  },
})

export { BLUR_INTENSITY }
