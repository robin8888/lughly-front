/**
 * ProUrgenciesPage styles
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
    color: theme.colors.urgency,
  },
  content: {
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
    paddingBottom: 96,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  busyCard: {
    borderWidth: 1,
    borderColor: theme.colors.available,
  },
  busyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.available,
  },
  busyLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.4,
    color: theme.colors.available,
  },
  busyTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h6,
    color: theme.colors.cardText,
    marginTop: 6,
  },
  address: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    marginTop: 4,
  },
  busyBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 8,
  },
  finish: {
    marginTop: 12,
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
  itemTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  itemMeta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 3,
  },
  itemBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.9,
    marginTop: 8,
  },
  itemPhotos: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 6,
  },
  itemSurcharge: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 8,
  },
  accept: {
    marginTop: 10,
    backgroundColor: theme.colors.urgency,
    borderColor: theme.colors.urgency,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 12,
  },
})
