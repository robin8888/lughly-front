/**
 * ReceptionStage styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/**
 * El velo del bocadillo, que es **el mismo cristal que la barra de abajo**.
 *
 * La pieza son dos capas, igual que en `BottomTabBar`: un `BlurView`
 * ultrafino que difumina la ilustración, y encima este velo. El valor está en
 * el tema (`navyGlass`) y no aquí precisamente para que las dos sean idénticas:
 * dos materiales parecidos en la misma pantalla se leen como dos cosas.
 *
 * Los números del contraste —6,93:1 el blanco, 4,73:1 la cifra verde, 4,71:1
 * el naranja del oficio— están en el token y en cada color de `colors.ts`.
 *
 * Lo usan el bocadillo **y su pico**: el pico se dibuja con el truco del
 * borde, así que su color se escribe aparte y con otro valor se vería una
 * lengüeta de distinto tono que la caja de la que sale.
 */
const BUBBLE_BG = theme.colors.navyGlass

/**
 * El filo dorado del bocadillo, y de su pico.
 *
 * `rating` es el dorado de la casa —el de las estrellas y el del anillo del
 * botón de mensajes— rebajado hasta donde se intuye más que se ve. Al 42 % y
 * no más: por encima, el hilo compite con la cifra verde y el oficio naranja,
 * que son lo que hay que mirar. Un borde es el marco de lo que se dice, no una
 * de las cosas que se dicen.
 *
 * Va con nombre propio porque lo usan **dos** piezas dibujadas de forma
 * distinta: el borde de la caja y el triángulo del pico, que es un truco de
 * bordes y lleva su color a mano.
 */
const BUBBLE_EDGE = 'rgba(212, 161, 58, 0.42)'

export const styles = StyleSheet.create({
  /**
   * A sangre: sin margen lateral, de canto a canto de la pantalla.
   *
   * Llevaba el mismo `paddingHorizontal` que el resto de la home, y eso lo
   * dejaba como una tarjeta más de la lista. No lo es: es la escena que
   * contesta a la búsqueda, y ocupando el ancho entero se lee como el fondo
   * de la pantalla y no como un elemento apoyado encima de ella.
   *
   * Y sin hueco arriba: pegada al hero, que corta recto y a todo lo ancho por
   * la misma razón —dejó de redondear sus esquinas de abajo—. Los dos son un
   * bloque continuo desde la franja del sistema hasta donde acaba la escena, y
   * una raya de fondo entre medias los partiría en dos tarjetas.
   */
  container: {},
  /*
    Cuadrado a todo el ancho: es justo lo que ocupaban las cuatro casillas que
    había aquí —dos columnas al 48 % y dos filas, con su hueco en medio—, así
    que la home no cambia de largo al sustituirlas por este.

    `aspectRatio` y no un alto fijo, para que el cuadrado siga al ancho del
    móvil sin recalcular nada. Al quitarle el margen al contenedor el cuadrado
    creció con él, así que la escena también es más alta que antes: es el mismo
    dibujo, más grande.

    Sin redondear. Lo estuvo mientras vivía dentro de un margen —una tarjeta
    con sus esquinas—, y a sangre una curva dejaría cuatro medias lunas
    blancas contra el borde de la pantalla.
  */
  stage: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    /*
      El color que se ve mientras carga la ilustración. En `accent800` y no en
      el claro de antes: la pantalla es navy desde que el hero y la escena van
      a sangre, y un cuadrado claro parpadeando en medio se ve como un fallo.
    */
    backgroundColor: theme.colors.accent800,
  },
  /*
    La imagen ocupa el flujo al 100 % y no va en absoluto: con
    `position: absolute` y los cuatro lados a 0 el `Image` no recibe medida y
    se pinta a su tamaño real —1024 px dentro de una caja de 343—, con lo que
    el `overflow: hidden` recorta y solo se ve una esquina.

    `cover` porque las diecinueve —recepción y los dieciocho oficios— son
    cuadradas y llenan exacto.
  */
  image: {
    width: '100%',
    height: '100%',
  },
  /*
    Abajo a la derecha, con el pico apuntando hacia arriba. Estuvo arriba a la
    derecha, que es donde se pone un bocadillo de cómic, y ahí **le tapaba la
    cara**: en las diecinueve ilustraciones Uhiro está centrado y de medio
    cuerpo, así que su cabeza ocupa justo el tercio de arriba del centro. Por
    abajo lo que hay es banco de trabajo, suelo o mostrador.

    Sin sombra a propósito. En Android la sombra es `elevation`, que dibuja
    por el contorno de la vista y se lleva por delante el pico, que sobresale.
    El cristal sobre ilustración ya se despega solo.

    **Va en dos cajas y no en una.** El cristal tiene que recortarse por las
    esquinas redondeadas —si no, el desenfoque se sale por ellas— y el pico
    tiene que quedar fuera de ese recorte, porque sobresale por arriba. Así
    que esta es la caja que sitúa y no recorta, y `card` es la que recorta.
  */
  bubble: {
    position: 'absolute',
    /*
      Separado del canto de la pantalla, no del de una tarjeta: la escena
      perdió su margen y sin este el bocadillo quedaría pegado al borde del
      móvil.
    */
    bottom: theme.spacing[4],
    right: theme.spacing[4],
    /*
      Ancho: con el botón en la misma línea, al 62 % le quedaban tres palabras
      por línea y el bocadillo se hacía una columna.
    */
    /*
      Sube de 86 a 90 desde que la escena va a sangre: la ilustración ganó los
      márgenes que tenía, y con el ancho de antes la frase partía en una línea
      más de las que hace falta.
    */
    maxWidth: '90%',
  },
  /*
    El cristal en sí. Sin relleno propio: lo ponen las dos capas de dentro, en
    este orden —el desenfoque abajo y el velo encima—. Con el color aquí, el
    `BlurView` quedaría por delante de él y acabaría desenfocando su propio
    velo en vez de la ilustración.
  */
  card: {
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    /*
      El filo, en dorado y muy bajito. Lo llevaba blanco al 18 %, que es el de
      la barra de abajo; en dorado el bocadillo deja de ser un trozo de la
      misma barra y pasa a ser algo suyo, sin gritarlo.
    */
    borderWidth: 1,
    borderColor: BUBBLE_EDGE,
    /*
      Más aire a los lados que arriba y abajo: el texto llega hasta el borde
      derecho al partir la línea, y con el mismo relleno en los cuatro lados el
      bloque se veía pegado al canto.
    */
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    /*
      En fila y el botón al otro extremo. Debajo del texto gastaba una franja
      entera del bocadillo para tres letras, y con el bocadillo abajo a la
      derecha lo empujaba contra el canto de la ilustración.
    */
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  /*
    Lo dicho se encoge y el botón no: `flexShrink` en el texto, para que al
    partirse en dos o tres líneas sea el texto el que ceda ancho y "Ver" no
    acabe con una letra por línea.
  */
  said: {
    flexShrink: 1,
    /*
      Sin esto, en Android un hijo de una fila no baja de su ancho de contenido
      y el texto empuja al botón "Ver" fuera del bocadillo en vez de partirse.
    */
    minWidth: 0,
  },
  /**
   * El fantasma: la frase entera, invisible, que es lo que **mide** el
   * bocadillo.
   *
   * Sin esto el bocadillo crecía letra a letra mientras Uhiro escribía —una
   * caja estirándose y saltando de línea a mitad de la frase—, porque lo que
   * lo medía era el trozo escrito hasta ese momento. Ahora lo mide la frase
   * completa desde el primer fotograma y lo único que cambia es cuánto se ve.
   *
   * `opacity: 0` y no `display: none`: hace falta que ocupe.
   */
  ghost: {
    opacity: 0,
  },
  /**
   * Y lo escrito, encima y en absoluto para no medir nada.
   *
   * Los cuatro lados atados al fantasma: mismo ancho, misma fuente y mismo
   * cuerpo, así que parte las líneas por los mismos sitios. Es lo que hace que
   * el texto no baile mientras aparece.
   */
  typed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  /**
   * Blanco sobre el cristal navy: 6,93:1 en el peor caso.
   *
   * **`lineHeight` explícito, y es lo que ordenaba la frase.** Sin él, cada
   * línea se alta lo que pida la fuente más alta que le haya tocado, y en esta
   * frase hay tres —la semi de las palabras, la negrita de la cifra y otra vez
   * la semi del oficio—: dos líneas seguidas con distinta mezcla salían
   * separadas por distinta distancia, y el bloque se leía torcido. Con el
   * interlineado fijo, todas las líneas miden lo mismo, lleven lo que lleven.
   *
   * 1,38 y no el 1,55 del cuerpo de la app: en un bocadillo de dos o tres
   * líneas el interlineado del texto corrido lo desparrama, y aquí el bloque
   * tiene que leerse de un vistazo.
   */
  speech: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: Math.round(theme.typography.sizes.small * 1.38),
    color: '#ffffff',
  },
  /*
    La cifra en verde. Es el dato por el que el cliente decide si sigue, y en
    una frase corrida se pierde: en verde se lee antes que la frase que la
    rodea, que es justo lo que se quiere.

    En `availableOnGlass` y no en el `availableText` de siempre: aquel es un
    verde oscuro para leer sobre blanco, y el bocadillo dejó de ser blanco.
    Sobre este cristal se quedaba en 1,7:1, o sea invisible.
  */
  count: {
    color: theme.colors.availableOnGlass,
    /*
      Mismo cuerpo e interlineado que la frase, dichos a mano. Un `Text`
      anidado hereda el color y la fuente pero **no** el `lineHeight` en
      Android: sin repetirlo, la línea que lleva la cifra se separa de las
      demás y es justo lo que hacía que el bocadillo se viera desordenado.
    */
    fontSize: theme.typography.sizes.small,
    lineHeight: Math.round(theme.typography.sizes.small * 1.38),
    /*
      Y en negrita, no en la semi del resto de la frase. El color solo la
      separa de las palabras de al lado si se mira; el peso la separa antes de
      leer nada, que es lo que hace falta cuando lo único que se busca es si
      hay alguien o no.
    */
    fontFamily: theme.typography.fonts.bodyBold,
  },
  /*
    Y el oficio en naranja. Son los dos datos de la frase que se buscan por
    separado —cuántos hay, y de qué— y cada uno tiene su color: leyendo por
    encima se ve "7" y "carpintería" sin llegar a leer la frase.

    En semibold como el resto, no en negrita: la negrita es de la cifra, que
    es la que decide si se sigue o no. Si los dos fueran negrita volverían a
    pesar lo mismo y no habría dónde mirar primero.
  */
  trade: {
    color: theme.colors.pendingOnGlass,
    // Por lo mismo que la cifra: ver `count`
    fontSize: theme.typography.sizes.small,
    lineHeight: Math.round(theme.typography.sizes.small * 1.38),
  },
  /*
    El triángulo del cómic. React Native no tiene `clip-path`: el pico es una
    caja de 0x0 con dos bordes laterales transparentes y el de arriba del
    color del bocadillo, que es el truco de siempre para dibujar un triángulo
    sin traer un SVG para doce píxeles.

    Lleva el velo a pelo, sin desenfoque: un `BlurView` no se puede recortar en
    triángulo con este truco. Son doce píxeles, y con el velo al 78 % lo que se
    pierde —el difuminado de la ilustración por debajo— no se distingue.
  */
  /**
   * El filo del pico: un segundo triángulo por detrás, un pelo más grande.
   *
   * Con el truco del borde no hay forma de contornear un triángulo, así que se
   * dibuja uno en dorado y el de encima lo tapa dejando ver solo el canto. Sin
   * esto, el hilo dorado de la caja se cortaría justo en el pico y se vería
   * como un borde a medio poner.
   */
  tailEdge: {
    position: 'absolute',
    top: -12.6,
    left: theme.spacing[4] - 1.3,
    width: 0,
    height: 0,
    borderLeftWidth: 10.3,
    borderRightWidth: 10.3,
    borderBottomWidth: 13.7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: BUBBLE_EDGE,
  },
  tail: {
    position: 'absolute',
    top: -11,
    left: theme.spacing[4],
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: BUBBLE_BG,
  },
  /**
   * Pequeño de verdad: cabe en el bocadillo y no compite con lo que dice.
   *
   * En blanco con la letra navy, al revés que un botón normal de la app. El
   * relleno `accent700` del átomo es un azul medio, y sobre el cristal navy
   * del bocadillo se quedaba en 1,5:1 contra el fondo: el botón desaparecía
   * dentro del bocadillo. Invertirlo lo devuelve a 12:1 y además lo empareja
   * con el resto del contenido, que ahora también es claro sobre oscuro.
   */
  see: {
    paddingHorizontal: theme.spacing[4],
    /* Que no lo encoja el texto largo: tres letras no se parten */
    flexShrink: 0,
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  seeText: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent900,
  },
  /**
   * Las dos capas del cristal, las dos a los cuatro lados y en este orden: el
   * desenfoque difumina la ilustración y el velo la tiñe de navy.
   */
  glass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BUBBLE_BG,
  },
})
