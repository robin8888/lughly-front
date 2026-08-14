/**
 * Switch Atom
 * Toggle switch sin lógica de negocio
 */

import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native'
import { theme } from '@/theme'

export interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor'> {
  value: boolean
  onValueChange: (value: boolean) => void
}

export function Switch({ value, onValueChange, ...props }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: theme.colors.neutral300,
        true: theme.colors.accent,
      }}
      thumbColor={value ? '#ffffff' : theme.colors.neutral100}
      ios_backgroundColor={theme.colors.neutral300}
      {...props}
    />
  )
}
