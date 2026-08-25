/**
 * AdminDocumentsPage styles
 *
 * Cabecera propia y fondo claro, como las demás pantallas de pila. La imagen
 * ocupa alto de sobra: revisar un documento en un recuadro pequeño es adivinar.
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
    gap: theme.spacing[2],
    paddingHorizontal: 12,
    /* El hueco del sistema, que ya no lo reserva el `SafeAreaView` */
    paddingTop: 56,
    paddingBottom: theme.spacing[3],
    backgroundColor: theme.colors.accent900,
  },
  back: {
    padding: theme.spacing[2],
  },
  backIcon: {
    fontSize: 27,
    color: '#ffffff',
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: '#ffffff',
  },
  content: {
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    paddingHorizontal: 12,
    // La barra inferior flota por encima del contenido. `SafeAreaView` ya
    // se come el inset de abajo (sin `edges` restringido), así que aquí NO
    // hace falta sumarle `insets.bottom` a mano —eso lo haría dos veces—.
    paddingBottom: 106,
    gap: 12,
  },
  state: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  count: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.4,
    color: theme.colors.accent700,
    marginBottom: 2,
  },
  card: {
    gap: 2,
  },
  type: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.4,
    color: theme.colors.accent700,
    marginBottom: 4,
  },
  owner: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.75,
  },
  /** Rechazar a alguien que ya estaba verificado tiene consecuencias: se avisa */
  warning: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.urgency,
    marginTop: 8,
  },
  /**
   * Alto generoso y `contain`: la imagen viene ya recortada y enderezada por el
   * escáner, así que se ve entera sin recortes y se puede leer el número.
   */
  preview: {
    width: '100%',
    height: 260,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
  },
  reason: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  actions: {
    gap: theme.spacing[2],
    marginTop: 12,
  },
  reject: {
    borderColor: theme.colors.urgency,
    backgroundColor: 'transparent',
  },
  rejectText: {
    color: theme.colors.urgency,
  },
})
