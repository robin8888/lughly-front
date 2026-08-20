import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  section: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12.5,
    letterSpacing: 0.66,
    // Va sobre el fondo claro de la página, así que el accent700 del diseño
    color: theme.colors.accent700,
    marginBottom: 10,
  },
  list: {
    gap: 10,
  },
  title: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 15.5,
    color: theme.colors.cardText,
    marginBottom: 4,
  },
  body: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.cardText,
    opacity: 0.85,
  },
})
