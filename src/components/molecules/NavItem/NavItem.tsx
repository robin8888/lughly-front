/**
 * NavItem Molecule
 * Un botón de la barra inferior (BOTTOM_NAV_MOBILE.md §4).
 *
 * El estado activo NO cambia de color ni pinta fondo: solo opacidad. La
 * excepción es "Urgente", que lleva siempre su rojo, activa o no.
 *
 * **El apagado subió de 0,55 a 0,75** al volverse azul la barra. No es un
 * retoque de gusto: sobre el cristal navy, un rótulo blanco al 55 % se queda
 * en 3,36:1 y la WCAG pide 4,5:1 para un texto de 11,5 px. Al 75 % llega a
 * 4,75:1 y sigue leyéndose como apagado —el activo está en 6,93:1—.
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
  /*
   * Blanco: la barra volvió a llevar velo, ahora en el navy de `navyGlass`, y
   * sobre él un icono oscuro no se ve. Estuvo en `accent900` mientras la barra
   * fue un material claro del sistema.
   */
  const color = '#ffffff'

  /**
   * Y "Urgente" se distingue por **el dibujo**, no por el rótulo.
   *
   * El `urgency` de siempre sobre este cristal da 1,13:1 y desaparece;
   * aclarado (`urgencyOnGlass`) llega a 3,09:1, que basta para un icono y no
   * para una letra —la WCAG pide 3:1 para un objeto gráfico y 4,5:1 para un
   * texto—. Así que el icono va en rojo y el rótulo en blanco como los demás.
   * Un rojo que llegase a 4,5 sobre este fondo ya sería rosa.
   */
  const iconColor = danger ? theme.colors.urgencyOnGlass : color
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
      <Icon name={icon} size={24} color={iconColor} strokeWidth={1.8} />
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
