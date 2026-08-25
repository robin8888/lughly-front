/**
 * SplashPage styles
 * Según MobileApp.dc.html: pieza cover anclada arriba y bloque de acciones con
 * padding 4px 20px 26px. El degradado inferior del diseño se cambió por
 * cristal esmerilado, primero en una franja bajo los dos botones y ahora en
 * cada botón; ver `BLUR_INTENSITY`.
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
 * Fuerza del cristal esmerilado de los botones.
 *
 * Es la misma pieza de lenguaje que la barra de abajo (`BottomTabBar`): algo
 * que flota sobre el contenido y lo deja ver difuminado por detrás. Pero aquí
 * va **más transparente que allí** —22 contra 40— y a propósito: la barra
 * flota sobre listas y formularios, donde el cristal tiene que separar el
 * fondo de los iconos; esta pantalla es la entrada, y lo que hay detrás es
 * justo lo que se quiere enseñar.
 *
 * A cambio, la letra queda apoyada en un fondo que cambia con cada fotograma.
 * Por eso va en `accent900` y `accent700` y en semibold: si alguien baja más
 * este número, lo primero que se pierde es el botón hueco.
 *
 * Sustituyó antes al degradado del diseño, que desvanecía el vídeo hacia el
 * color de la pantalla —o sea, lo aclaraba hasta el blanco—. Aquí el vídeo
 * sigue corriendo por debajo y lo que lo tapa es un desenfoque, así que
 * conserva su color y su movimiento.
 *
 * Es el único mando: más intensidad, cristal más opaco y texto más legible;
 * menos, se ve mejor el vídeo por detrás.
 */
const BLUR_INTENSITY = 22

/**
 * Y el del fondo de la banda, mucho más fuerte.
 *
 * Ahí no se trata de dejar ver una escena sino de que **haya algo vivo detrás
 * del cristal**: es el mismo vídeo, del que la banda solo puede enseñar una
 * rebanada. Sin desenfoque se vería esa rebanada repetida justo debajo de la
 * escena entera, que se lee como un fallo de pintado. Con él queda un lavado
 * de color en movimiento, con los colores del propio vídeo.
 *
 * 50 y no más: por encima, el cristal de los botones —que ahora es casi
 * transparente— se apoya en una nada gris y vuelve a parecer que no hay vídeo
 * detrás. Por debajo, empieza a distinguirse que la rebanada se repite.
 */
const BACKDROP_BLUR = 50

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  /**
   * El vídeo, a todo el ancho y anclado arriba. **El alto lo pone la
   * pantalla**, no este objeto: es el ancho por 16/9, la proporción exacta
   * del fichero.
   *
   * Estuvo a pantalla completa (los cuatro lados a 0) y ahí se perdía por los
   * lados: el vídeo es 9:16 y un móvil de hoy es 19,5:9, más estrecho, así
   * que `cover` lo escalaba por el alto y se comía un 11% por cada canto. En
   * la pieza anterior daba igual —los bordes eran cielo y césped—, pero en
   * esta hay logotipo y hormigas hasta el borde.
   *
   * Con la caja en la proporción del vídeo no se recorta nada, y lo que sobra
   * de pantalla queda **abajo**, que es donde están los botones. Anclado
   * arriba, además, es lo que pide el diseño (MobileApp.dc.html, SPLASH).
   *
   * Efecto secundario asumido: en un móvil alargado los botones caen sobre el
   * fondo de la pantalla y no sobre el vídeo, así que ahí el cristal
   * esmerilado no esmerila nada —desenfoca color plano—. En uno de proporción
   * 16:9 o más cuadrado el vídeo sí llega hasta abajo y el cristal vuelve a
   * hacer lo suyo.
   */
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    paddingTop: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[3],
  },
  /**
   * La banda que le sobra a la pantalla por debajo del vídeo, en los móviles
   * más alargados que 9:16 —o sea, casi todos—.
   *
   * Estuvo en blanco, y ahí se rompía la idea entera: los botones son cristal
   * esmerilado, y esmerilar un fondo blanco da blanco. Parecían botones
   * descoloridos sobre una pantalla vacía.
   *
   * Ahora la llena el mismo vídeo, desenfocado a fondo. `overflow: hidden` y
   * un margen negativo en la vista de dentro para que la rebanada que se ve
   * sea **la de abajo del fotograma**: así el color casa con el del borde del
   * vídeo de arriba y la costura no se nota.
   */
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  backdropVideo: {
    width: '100%',
  },
  /**
   * Cada botón es su propio cristal, como los iconos de la barra de abajo.
   *
   * Antes el cristal era **uno solo**, una franja bajo los dos botones, y los
   * botones iban rellenos encima: azul el primero, blanco el segundo. Eran dos
   * rectángulos opacos sobre el vídeo. Ahora el relleno es el propio vídeo
   * desenfocado y lo único sólido es el contorno y la letra.
   *
   * `overflow: hidden` con el mismo radio que el átomo `Button`: el
   * desenfoque va en absoluto dentro de esta caja y sin recorte se saldría por
   * las esquinas redondeadas.
   */
  glass: {
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },
  glassFill: {
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
   * Los dos van sin relleno: el fondo es el cristal, y pintarles un color
   * encima lo taparía y devolvería el rectángulo opaco.
   *
   * La jerarquía la lleva **el contorno**, no el relleno: "Registrarse" con
   * dos puntos de azul y "Iniciar sesión" con uno. Los dos en `accent700`,
   * que sobre este cristal claro da 5,79:1 —WCAG 1.4.11 pide 3:1 para el
   * contorno de un control— mientras que el `divider` por defecto de la
   * variante se queda en 1,38:1 y desaparece.
   */
  registerButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.accent700,
    borderWidth: 2,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.accent700,
  },
  /**
   * Hundido: velo azul claro sobre el cristal. Es opaco a propósito —tapa el
   * desenfoque el instante que dura la pulsación—, porque sobre un vídeo en
   * movimiento un cambio translúcido no se ve.
   */
  buttonPressed: {
    backgroundColor: theme.colors.accent100,
  },
  /**
   * Y la letra, que es lo que tiene que resaltar sobre un fondo que se mueve.
   *
   * `accent900` en el principal —13,4:1 sobre el cristal— y `accent700` en el
   * otro —5,79:1—: los dos por encima del 4,5:1 de la WCAG, y la diferencia
   * entre ambos vuelve a decir cuál es cuál sin recurrir a un relleno.
   */
  registerText: {
    color: theme.colors.accent900,
    fontFamily: theme.typography.fonts.bodySemiBold,
  },
  loginButtonText: {
    color: theme.colors.accent700,
    fontFamily: theme.typography.fonts.bodySemiBold,
  },
})

export { BLUR_INTENSITY, BACKDROP_BLUR }
