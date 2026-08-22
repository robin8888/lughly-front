/**
 * MyJobsPage styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  content: {
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  count: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.65,
    marginBottom: 10,
  },
  list: {
    gap: 10,
  },
  publish: {
    marginTop: 14,
  },
  pending: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 12,
  },

  /** El grupo abierto */
  group: {
    gap: 12,
  },

  /**
   * Las pestañas: una por tipo de contratación, con cuántos hay.
   *
   * Píldoras y no una barra segmentada: son cuatro nombres largos que no
   * caben repartidos a lo ancho, y en fila que se desliza caben todos sin
   * abreviar ninguno.
   */
  /** Mide lo que miden las píldoras, no lo que quede de pantalla */
  tabsScroll: {
    flexGrow: 0,
  },
  tabs: {
    flexDirection: 'row',
    /* Y que cada píldora mida lo suyo, en vez de estirarse a lo alto */
    alignItems: 'center',
    gap: 8,
    paddingBottom: 14,
    paddingRight: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
  },
  tabOpen: {
    /* El azul oscuro, que es el que sostiene texto blanco encima */
    backgroundColor: theme.colors.accent700,
  },
  /**
   * La urgencia, en su propio rojo —mismo `urgency` que la pestaña de
   * Urgencias de la barra inferior (`NavItem`, `danger`)—, cerrada o
   * abierta: es lo que la distingue de un vistazo entre pestañas.
   */
  tabUrgent: {
    borderWidth: 1.5,
    borderColor: theme.colors.urgency,
  },
  tabUrgentOpen: {
    backgroundColor: theme.colors.urgency,
    borderColor: theme.colors.urgency,
  },
  tabText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  tabTextUrgent: {
    color: theme.colors.urgency,
  },
  tabTextOpen: {
    color: '#ffffff',
  },
})
