/**
 * Spinner Atom
 * Anillo giratorio del sistema.
 *
 * Réplica del loader del diseño (Home.dc.html):
 *   width:40px; border:3px solid rgba(bg,25%); border-top-color:bg;
 *   animation: loader-spin .8s linear infinite
 *
 * La animación usa `useNativeDriver`: gira en el hilo de UI, así que no se
 * entrecorta aunque el hilo de JavaScript esté ocupado — que es exactamente
 * lo que pasa mientras se espera o se procesa una respuesta.
 */

import { useEffect, useRef } from 'react'
import { Animated, Easing, View, type ViewStyle } from 'react-native'
import { theme } from '@/theme'

const SPIN_DURATION_MS = 800

export interface SpinnerProps {
  size?: number
  /** Color del arco que gira */
  color?: string
  /** Color del anillo de fondo */
  trackColor?: string
  thickness?: number
  style?: ViewStyle
  testID?: string
}

export function Spinner({
  size = 40,
  color = theme.colors.bg,
  trackColor = 'rgba(242, 242, 243, 0.25)',
  thickness = 3,
  style,
  testID,
}: SpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: SPIN_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    animation.start()

    return () => animation.stop()
  }, [rotation])

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View
      style={style}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando"
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: trackColor,
          borderTopColor: color,
          transform: [{ rotate: spin }],
        }}
      />
    </View>
  )
}
