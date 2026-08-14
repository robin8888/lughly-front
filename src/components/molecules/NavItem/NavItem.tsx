/**
 * NavItem Molecule
 * Un botón de la barra inferior (BOTTOM_NAV_MOBILE.md §4).
 *
 * El estado activo NO cambia de color ni pinta fondo: solo opacidad, 1 o 0,55.
 * La excepción es "Urgente", que va siempre en rojo, activa o no.
 */

import { Pressable, Text } from 'react-native'
import { Icon, type IconName } from '@/components/atoms/Icon'
import { styles, ACTIVE_OPACITY, INACTIVE_OPACITY } from './NavItem.styles'
import { theme } from '@/theme'

export interface NavItemProps {
  label: string
  icon: IconName
  active: boolean
  onPress: () => void
  /** "Urgente" va en rojo, no en blanco */
  danger?: boolean
  testID?: string
}

export function NavItem({
  label,
  icon,
  active,
  onPress,
  danger = false,
  testID,
}: NavItemProps) {
  const color = danger ? theme.colors.urgency : '#ffffff'
  const opacity = active ? ACTIVE_OPACITY : INACTIVE_OPACITY

  return (
    <Pressable
      onPress={onPress}
      style={[styles.item, { opacity }]}
      testID={testID}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Icon name={icon} size={21} color={color} strokeWidth={1.8} />
      <Text
        style={[styles.label, { color }]}
        numberOfLines={1}
        testID={testID ? `${testID}-label` : undefined}
      >
        {label}
      </Text>
    </Pressable>
  )
}
