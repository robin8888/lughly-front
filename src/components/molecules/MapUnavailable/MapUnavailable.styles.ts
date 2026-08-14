/**
 * MapUnavailable styles
 * Ocupa el hueco del mapa, con el mismo borde para que no parezca un error.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.none,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: 4,
  },
  body: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.text,
    opacity: 0.85,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.6,
    marginTop: 6,
  },
})
