/**
 * ServiceItemsField styles
 *
 * Una etiqueta de columna ("Servicios") y una fila por servicio, cada una
 * separada de la siguiente por una línea fina — igual que un oficio se
 * separa del siguiente en `TradeRatesField`, para que la lista se lea como
 * lista y no como un bloque de campos sueltos.
 *
 * El formulario de añadir va en su propia caja, con las dos etiquetas
 * ("Nombre del servicio", "Tarifa") arriba de cada campo — el mismo patrón
 * que "Hora normal"/"Hora en urgencia" en `TradeRatesField`, para que se lea
 * como parte de la misma pantalla y no como un añadido suelto.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  listLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    marginBottom: 6,
  },
  list: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  nameInput: {
    flex: 1,
  },
  /**
   * Justo para cinco cifras y el símbolo: un servicio no llega a costar
   * 100.000 €, así que sobraba ancho que le hacía falta al nombre.
   * `paddingRight` va por debajo del que trae `Input` con `suffix` —pensado
   * para algo como "€/h", tres letras— porque aquí es un solo símbolo.
   */
  priceInput: {
    width: 80,
    paddingRight: 24,
    textAlign: 'right',
  },
  remove: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
    opacity: 0.55,
  },
  empty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 10,
  },

  /**
   * Su propia caja, blanca sobre el fondo tintado del bloque de carta: así
   * se ve que es un formulario aparte —lo que se añade, no lo ya guardado—
   * y no unos campos más sueltos entre el listado y el botón.
   */
  add: {
    padding: 12,
    borderRadius: theme.radius.field,
    backgroundColor: theme.colors.bg,
  },
  addLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: 10,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  addNameField: {
    flex: 1,
  },
  addPriceField: {
    width: 80,
  },
  addFieldLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    marginBottom: 5,
  },
  addPriceInput: {
    paddingRight: 24,
    textAlign: 'right',
  },
  addButton: {
    alignSelf: 'flex-start',
  },
})
