/**
 * DirectoryPage styles
 * Cabecera fija y lista, según MobileApp.dc.html (isProfesionales).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    marginTop: 2,
  },
  /** Alto del mapa del directorio: suficiente para leer la agrupación */
  map: {
    height: 420,
  },
  content: {
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
    gap: 10,
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 20,
  },
  suggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    zIndex: 20,
    marginTop: 4,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: 9,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  suggestionPressed: {
    backgroundColor: theme.colors.surface,
  },
  suggestionLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.text,
  },
  suggestionHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11.5,
    color: theme.colors.text,
    opacity: 0.6,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  /**
   * El filtro de disponibles.
   *
   * Píldora rellena, como el resto de los filtros de la app: era un recuadro
   * de esquinas casi rectas con borde gris, del tema de antes, y al lado del
   * buscador redondeado se veía de otro sitio.
   */
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
  },
  /**
   * Puesto, va en verde relleno: es el color de "está disponible" en toda la
   * app —el anillo, el distintivo de la ficha— y aquí se filtra justo por eso.
   */
  chipActive: {
    backgroundColor: theme.colors.available,
  },
  /** Apagado mientras no se filtra: el punto verde encendido prometía algo */
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.textSoft,
  },
  chipDotActive: {
    backgroundColor: '#ffffff',
  },
  chipText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 14,
    color: theme.colors.textSoft,
  },
  /* Sobre el verde relleno: blanco, que llega a 4,6:1 */
  chipTextActive: {
    color: '#ffffff',
  },
  tradeFilter: {
    flex: 1,
  },
  count: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13.5,
    color: theme.colors.text,
    opacity: 0.6,
  },
  list: {
    gap: 10,
  },
  state: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  stateText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  /** El aviso de que se está buscando sustituto, con su salida */
  reassigning: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.field,
    backgroundColor: theme.colors.pendingSoft,
  },
  reassigningText: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.45,
    color: theme.colors.pendingText,
  },
  /**
   * "Dejarlo", con forma de botón. Era un texto subrayado, y en una pantalla
   * donde cada toque encarga un trabajo, la salida tiene que verse tan clara
   * como lo que se está haciendo.
   */
  reassigningButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.pending,
    backgroundColor: '#ffffff',
  },
  reassigningCancel: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.pendingText,
  },
})
