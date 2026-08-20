/**
 * CoverageMap styles
 * El mapa llena su contenedor; la altura la fija quien lo usa.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.field,
    backgroundColor: theme.colors.surface,
  },
  map: {
    flex: 1,
  },
})
