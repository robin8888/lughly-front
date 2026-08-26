/**
 * CoveragePage styles
 * Buscador de dirección, radio y mapa, en ese orden: se elige el punto, se
 * elige cuánto se abarca, y el mapa enseña el resultado de las dos cosas.
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
    gap: 6,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkDivider,
    backgroundColor: theme.colors.accent900,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  title: {
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  content: {
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },

  field: {
    marginTop: 16,
  },
  /** Buscar y ubicación actual, a la par: son dos formas de lo mismo */
  /**
   * La fila que tenía "Buscar" y "Usar mi ubicación", y que ahora solo lleva
   * el segundo: las sugerencias salen mientras se escribe y no hay nada que
   * pulsar para buscar. Se queda como fila —y no como botón suelto— porque el
   * de ubicación mantiene `flex: 1` y así ocupa el ancho entero, que es lo que
   * le corresponde ahora que es la única alternativa a escribir.
   */
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  searchButton: {
    flex: 1,
  },

  /*
   * La lista de coincidencias vivía aquí, con su propio borde y su propio
   * relleno. Se fue con el buscador a `AddressInput`, que la pinta como el
   * desplegable del buscador de oficios de la home: flotando sobre el
   * contenido en vez de empujarlo hacia abajo.
   */

  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 10,
  },

  /** La instrucción va encima del mapa, que es donde se está mirando */
  mapHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 16,
    marginBottom: -8,
  },
  /** Por qué no se puede guardar todavía, justo encima del botón */
  blocked: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.urgency,
    marginTop: 14,
  },

  /** Alto fijo: el mapa no decide cuánto ocupa, lo decide la pantalla */
  map: {
    height: 260,
    marginTop: 16,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },

  save: {
    marginTop: 16,
  },
})
