/**
 * Skeleton Atom
 * Placeholder animado para estados de carga
 */

import { useEffect, useRef } from 'react'
import { Animated, ViewStyle, type DimensionValue } from 'react-native'
import { styles } from './Skeleton.styles'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular'

export interface SkeletonProps {
  variant?: SkeletonVariant
  width?: DimensionValue
  height?: number
  style?: ViewStyle
  testID?: string
}

export function Skeleton({
  variant = 'text',
  width = '100%',
  height,
  style,
  testID,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )

    animation.start()

    return () => animation.stop()
  }, [opacity])

  const getHeight = () => {
    if (height) return height
    if (variant === 'circular') return typeof width === 'number' ? width : 48
    if (variant === 'text') return 14
    return 100
  }

  const getBorderRadius = () => {
    if (variant === 'circular') return 999
    if (variant === 'text') return 4
    return 7
  }

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height: getHeight(),
          borderRadius: getBorderRadius(),
          opacity,
        },
        style,
      ]}
      testID={testID}
    />
  )
}
