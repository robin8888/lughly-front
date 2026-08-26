/**
 * AddressInput styles
 *
 * La lista de sugerencias copia la del buscador de oficios de la home
 * (`QuickSearch`): mismo blanco, mismo borde azul, mismo radio y misma
 * sombra. No es ahorro de trabajo, es que son la misma cosa —un campo que
 * propone— y dos desplegables distintos en la misma app se leen como dos
 * mecanismos distintos.
 *
 * Lo que **no** copia es el campo. El de la home es el buscador de la portada
 * y va con lupa, redondeado y a lo grande; estos viven dentro de formularios,
 * donde el resto de campos son los del átomo `Input` y salirse los dejaría
 * descolocados.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/** La chincheta y el indicador de carga, dentro del campo */
export const ICON_SIZE = 18
const STATUS_RIGHT = 12

export const styles = StyleSheet.create({
  /**
   * `zIndex` alto porque el desplegable va en absoluto y tiene que quedar por
   * encima de lo que venga debajo en el formulario. Sin él, en Android la
   * lista aparece **detrás** del siguiente campo: se ve el borde y no el
   * texto, que parece un fallo de pintado.
   */
  wrapper: {
    position: 'relative',
    zIndex: 20,
  },
  field: {
    position: 'relative',
    justifyContent: 'center',
  },
  /**
   * Hueco a la derecha para la chincheta o el indicador. Se reserva siempre,
   * esté o no puesto: si solo se reservara cuando hay icono, el texto daría
   * un salto al elegir una dirección.
   */
  input: {
    paddingRight: STATUS_RIGHT + ICON_SIZE + 8,
  },
  status: {
    position: 'absolute',
    right: STATUS_RIGHT,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  /** El piso y la puerta, pegados debajo de la dirección ya elegida */
  detail: {
    marginTop: theme.spacing[2],
  },
  suggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    zIndex: 20,
    marginTop: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  /**
   * Sin raya entre filas, al contrario que en `QuickSearch`: allí cada fila
   * son dos textos en una línea —oficio a la izquierda, pista a la derecha— y
   * la raya separa filas de columnas. Aquí una dirección puede ocupar dos
   * líneas, y con raya la caja parece una tabla.
   *
   * `paddingVertical: 12` con dos líneas de 16 deja la fila bien por encima
   * de los 44 px de objetivo táctil.
   */
  suggestion: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  /** El azul de la app, no un gris: es una selección, no un apagado */
  suggestionPressed: {
    backgroundColor: theme.colors.accent100,
  },
  suggestionLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  /**
   * El código postal, que es lo que desempata entre dos calles con el mismo
   * nombre en municipios distintos —y en España las hay a cientos—.
   */
  suggestionMeta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: theme.spacing[1],
  },
  /**
   * El fallo de red va en el rojo de error y no en el gris de las demás
   * notas: las otras dos explican un resultado —sigue escribiendo, no está—,
   * esta dice que algo no funciona y que hay que reintentar.
   */
  noteError: {
    color: theme.colors.error,
  },
})
