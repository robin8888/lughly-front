/**
 * MyDocumentsPage styles
 *
 * Cabecera propia y fondo claro, como el resto de pantallas de pila —Mis
 * fotos, Encargos, Cómo funciona—.
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
    gap: theme.spacing[2],
    paddingHorizontal: 12,
    paddingVertical: theme.spacing[3],
  },
  back: {
    padding: theme.spacing[2],
  },
  backIcon: {
    fontSize: 27,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  content: {
    /*
     * Si el contenido no llena la pantalla, se centra en vez de quedarse
     * pegado arriba con un desierto debajo. Cuando sí la llena, `flexGrow`
     * deja el contenedor a la altura del contenido y el centrado no hace
     * nada: por eso no hay que decidir a mano cuál es corta y cuál no.
     */
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    // La barra inferior flota por encima del contenido. `SafeAreaView` ya
    // se come el inset de abajo (sin `edges` restringido), así que aquí NO
    // hace falta sumarle `insets.bottom` a mano —eso lo haría dos veces—.
    paddingBottom: 96,
    gap: 14,
  },
  state: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  card: {
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 4,
  },
  cardBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.8,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  /** Un rechazo no es una nota al pie: es lo que hay que corregir */
  rejected: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.error,
    marginTop: 8,
  },
  retry: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  /** Las dos caras, una al lado de la otra, como en el alta */
  slots: {
    flexDirection: 'row',
    gap: 10,
  },
  slot: {
    flex: 1,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
  },
  send: {
    marginTop: 4,
  },
})
