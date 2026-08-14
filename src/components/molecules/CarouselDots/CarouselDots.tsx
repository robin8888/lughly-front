/**
 * CarouselDots Molecule
 * Los cuatro puntos del carrusel (HOME_MOBILE.md §1).
 *
 * Con 18 oficios no se pinta un punto por oficio: eso sería ilegible y no
 * diría nada. Son SIEMPRE cuatro puntos que representan la ventana visible,
 * y el activo es siempre el segundo. Pulsar el punto `n` mueve `n - 1`
 * posiciones, así que sirven además como avance rápido.
 */

import { View, Pressable } from 'react-native'
import { theme } from '@/theme'
import { styles } from './CarouselDots.styles'

const SLOTS = [0, 1, 2, 3]
const ACTIVE_SLOT = 1

export interface CarouselDotsProps {
  onPressSlot: (slot: number) => void
  testID?: string
}

export function CarouselDots({ onPressSlot, testID }: CarouselDotsProps) {
  return (
    <View style={styles.container} testID={testID}>
      {SLOTS.map((slot) => {
        const active = slot === ACTIVE_SLOT
        const small = slot === 0 || slot === 3

        return (
          <Pressable
            key={slot}
            onPress={() => onPressSlot(slot)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={active ? 'Oficio actual' : 'Ir a otro oficio'}
            accessibilityState={{ selected: active }}
            testID={testID ? `${testID}-${slot}` : undefined}
            style={{
              width: active ? 20 : small ? 5 : 7,
              height: active ? 7 : small ? 5 : 7,
              borderRadius: theme.radius.pill,
              opacity: small ? 0.45 : 1,
              /**
               * El inactivo va en oscuro: el diseño lo pone en blanco al 30%
               * porque la home era negra, y sobre el fondo claro actual eso
               * es invisible.
               *
               * Al 50% y no al 30%: son botones, y el 30% se quedaba en
               * 1,88:1 sobre la página. Así llega a 3,13:1, que es más de lo
               * que daba el original sobre negro (2,54:1). Los dos puntos
               * exteriores siguen bajando de ahí con su `opacity: 0.45`, que
               * es el desvanecido buscado por el diseño.
               */
              backgroundColor: active
                ? theme.colors.accent600
                : 'rgba(29, 31, 32, 0.5)',
            }}
          />
        )
      })}
    </View>
  )
}
