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
 * industrial quiere cuadradas. El relleno tampoco lo pone aquí el átomo
 * `Button`: sus variantes son opacas y estos dos son velos translúcidos sobre
 * el cristal, así que el color va en esta hoja.
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
 * De la letra ya no responde este número. Cada botón tiene ahora su propio
 * velo de color —`REGISTER_GLASS` y `LOGIN_GLASS`— y es ese velo el que la
 * sostiene; este solo decide cuánto vídeo se ve moverse por debajo de los
 * dos.
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

/**
 * El relleno de cada botón, que vuelve —pero translúcido—.
 *
 * Estuvieron huecos: los dos eran cristal a secas y solo el grosor del
 * contorno decía cuál era el principal. Ahora "Registrarse" lleva el azul de
 * los botones rellenos de la app y "Iniciar sesión" lleva blanco, los dos
 * dejando pasar el vídeo desenfocado que corre por debajo.
 *
 * Los números no son redondos por gusto. El velo tiene que ser lo bastante
 * espeso para que su letra se lea **sobre cualquier fotograma**, porque lo que
 * hay detrás se mueve y cambia de color: están calculados contra el caso peor
 * de cada uno —blanco puro detrás del azul, negro puro detrás del blanco— y
 * ahí dan 5,28:1 y 4,57:1, por encima del 4,5:1 que pide la WCAG para un
 * cuerpo de 16 px. Bajarlos enseña más vídeo y se lleva por delante el texto.
 *
 * El azul es `accent800` y no el `accent700` con el que el átomo `Button`
 * rellena un botón normal: a esta opacidad el 700 se queda en 3,4:1 contra su
 * letra blanca. Diluir un color sube su luminancia, así que un relleno
 * translúcido pide arrancar de un tono más oscuro que uno opaco.
 */
const REGISTER_GLASS = 'rgba(44, 69, 93, 0.78)'
const LOGIN_GLASS = 'rgba(255, 255, 255, 0.85)'

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
   * Los dos vuelven a tener relleno, y la jerarquía vuelve a llevarla **el
   * color**: azul el principal, blanco el otro. Lo que no vuelve es el
   * rectángulo opaco —el relleno es un velo, el desenfoque sigue debajo y el
   * vídeo se ve moverse a través de los dos—.
   *
   * El contorno se queda de apoyo, en `accent700`, que sobre este cristal
   * claro da 5,79:1 —WCAG 1.4.11 pide 3:1 para el contorno de un control—
   * mientras que el `divider` por defecto de la variante se queda en 1,38:1 y
   * desaparece.
   */
  registerButton: {
    backgroundColor: REGISTER_GLASS,
    borderColor: theme.colors.accent700,
    borderWidth: 2,
  },
  loginButton: {
    backgroundColor: LOGIN_GLASS,
    borderColor: theme.colors.accent700,
  },
  /**
   * Hundido, y cada uno hacia su lado: el azul se oscurece, el blanco se
   * aclara. Los dos opacos a propósito —tapan el desenfoque el instante que
   * dura la pulsación—, porque sobre un vídeo en movimiento un cambio
   * translúcido no se nota.
   *
   * Ya no pueden compartir estado como cuando estaban huecos: aquel velo azul
   * claro dejaría ahora "Registrarse" en blanco sobre casi blanco, y su letra
   * desaparecería justo al pulsarlo.
   */
  registerPressed: {
    backgroundColor: theme.colors.accent900,
  },
  loginPressed: {
    backgroundColor: theme.colors.accent100,
  },
  /**
   * Y la letra, que ahora se apoya en el relleno de su botón y no en el
   * cristal desnudo: blanca sobre el azul, `accent700` sobre el blanco.
   *
   * Los dos siguen en semibold. El fondo de debajo se mueve, y las opacidades
   * de `REGISTER_GLASS` y `LOGIN_GLASS` están puestas para que estos dos
   * colores aguanten el peor fotograma posible; ahí están los números.
   */
  registerText: {
    color: '#ffffff',
    fontFamily: theme.typography.fonts.bodySemiBold,
  },
  loginButtonText: {
    color: theme.colors.accent700,
    fontFamily: theme.typography.fonts.bodySemiBold,
  },
})

export { BLUR_INTENSITY, BACKDROP_BLUR, REGISTER_GLASS, LOGIN_GLASS }
