/**
 * QuickSearch styles
 * HOME_MOBILE.md §2: input 13px padding 11/13; sugerencias en absoluto
 * con borde, radio 9 y sombra; nota a 10,5px blanco 60%.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/** Lado de la lupa y su separación del borde izquierdo del campo */
export const ICON_SIZE = 20
const ICON_LEFT = 14

/**
 * La cruz de borrar, en la otra punta. Más pequeña que la lupa a propósito:
 * la lupa dice para qué es el campo y se mira antes de escribir; la cruz es
 * una salida, y a igual tamaño competiría con el texto que va a borrar.
 */
export const CLEAR_SIZE = 18
const CLEAR_RIGHT = 14

export const styles = StyleSheet.create({
  /*
    Sin margen abajo: lo que va debajo es lo que decide cuánto aire quiere. Los
    diez puntos que llevaba se sumaban al margen de los botones del hero y los
    dejaban lejos del campo al que acompañan.
  */
  wrapper: {
    position: 'relative',
    zIndex: 20,
  },
  /** Caja relativa para poder clavar la lupa dentro del campo */
  field: {
    position: 'relative',
    justifyContent: 'center',
  },
  /**
   * La lupa, centrada en vertical con `top/bottom: 0` en vez de un `top` fijo:
   * así sigue centrada aunque cambie la altura del campo.
   */
  icon: {
    position: 'absolute',
    left: ICON_LEFT,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    // No debe robarle el toque al campo que tiene detrás
    pointerEvents: 'none',
  },
  /**
   * El buscador del hero, con más presencia que un campo de formulario.
   *
   * Cuatro cambios sobre el átomo `Input`, todos con motivo:
   *
   * - **Lupa.** Sin ella el campo no se distingue de cualquier otro; con ella
   *   se entiende sin leer el placeholder. El `paddingLeft` le deja el hueco.
   * - **Fondo blanco.** El `surface` del átomo es un gris que sobre la tarjeta
   *   clara del hero se emborrona con ella.
   * - **Borde en `accent`.** El `divider` del átomo —negro al 16%— da 1,3:1
   *   sobre su propio relleno: no se veía dónde acababa el campo. El azul da
   *   4,15:1 y lo empareja con el contorno de las tarjetas.
   * - **Esquinas redondeadas**, como los botones. `Input` sigue cuadrado para
   *   los formularios, que es lo que pide el tema industrial; esto es el
   *   buscador de la portada y juega en otra liga.
   */
  input: {
    fontSize: theme.typography.sizes.small,
    paddingVertical: 13,
    paddingLeft: ICON_LEFT + ICON_SIZE + 10,
    backgroundColor: '#ffffff',
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.card,
    /*
      Hueco a la derecha para la cruz. Se reserva siempre, haya cruz o no: si
      solo se reservara cuando el campo tiene texto, la primera letra que se
      escribiera daría un salto.
    */
    paddingRight: CLEAR_RIGHT + CLEAR_SIZE + 8,
  },
  /** Centrada en vertical con `top/bottom: 0`, igual que la lupa */
  clear: {
    position: 'absolute',
    right: CLEAR_RIGHT,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  /**
   * El desplegable cuelga del campo y se lee como su continuación: mismo
   * blanco, mismo borde azul y mismo radio. Antes iba en el gris de la página,
   * que sobre la tarjeta clara del hero lo dejaba a medio camino entre el
   * campo y el fondo.
   *
   * Cuelga **del campo** y no del bloque entero: en el componente vive dentro
   * de `field`, que es la caja relativa contra la que mide su `top: '100%'`.
   * Estuvo fuera, hermano de la nota de abajo, y ahí ese 100% se medía sobre
   * el bloque completo —campo más nota— y el desplegable salía por debajo de
   * la nota, a un buen trecho de lo que se estaba escribiendo.
   *
   * `marginTop: 4` para que se despegue del campo y se vean dos piezas, no
   * una caja partida. Eran 6 y se acortó al arreglar lo de arriba: con el
   * desplegable ya pegado al campo, esos dos píxeles de más se notan. La
   * sombra hace el resto: esto flota sobre el contenido.
   */
  suggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    zIndex: 20,
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  /**
   * `paddingVertical: 13` con un texto de 16 deja la fila en unos 48 px: por
   * encima de los 44 que pide un objetivo táctil. Con los 10 de antes y el
   * texto a 14 se quedaba justo en el límite.
   */
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  /**
   * La última fila no lleva raya. Con ella quedaba una línea suelta pegada al
   * canto inferior de la caja, que además se ve cortada por el redondeo.
   */
  suggestionLast: {
    borderBottomWidth: 0,
  },
  /** Un velo del azul de la app, no un gris: es una selección, no un apagado */
  suggestionPressed: {
    backgroundColor: theme.colors.accent100,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  /**
   * La palabra por la que ha encajado la sugerencia —"gotelé" para Pintura—.
   * Iba a 11 px y al 60%, que sobre blanco es 3,5:1: se leía peor que el
   * ejemplo del placeholder, siendo lo que explica por qué sale ese oficio.
   * A 13,5 y al 70% llega a 4,6:1.
   */
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.7,
    flexShrink: 1,
    textAlign: 'right',
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    // Iba a pelo en 12 y se quedó fuera de la subida de cuerpos pequeños
    fontSize: theme.typography.sizes.tiny,
    /**
     * "Primero los cercanos que pueden ir ya." Va dentro del hero, que ahora
     * es una tarjeta clara: el blanco al 60% del diseño era para el hero
     * negro y aquí no se vería.
     */
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 7,
  },
})
