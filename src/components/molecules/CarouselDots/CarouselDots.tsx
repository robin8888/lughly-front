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
              /**
               * Tres niveles de presencia: el activo entero, el de al lado
               * algo apagado y los dos de los extremos desvanecidos, que es
               * el degradado que buscaba el diseño. Al ser todos blancos, la
               * opacidad es lo que devuelve la jerarquía que antes daba el
               * color del activo.
               */
              opacity: active ? 1 : small ? 0.5 : 0.75,
              /**
               * Blancos, y con sombra.
               *
               * Pasaron por tres fondos: el diseño los ponía en blanco al 30%
               * sobre la home negra; al aclararse la home hubo que invertirlos
               * a oscuro; y ahora caen sobre la foto del carrusel, a la altura
               * del césped. Ahí el oscuro se quedaba en 2,71:1 y el azul del
               * activo en 2,10:1: ninguno de los dos resaltaba.
               *
               * Blanco sobre ese verde tampoco llega por sí solo (1,97:1), así
               * que llevan la misma sombra que las etiquetas. Es lo que se hace
               * con indicadores sobre una foto, y de paso los devuelve al
               * blanco del diseño original.
               *
               * El activo se distingue por forma además de por color: es una
               * píldora de 20 px frente a puntos de 5 y 7.
               */
              backgroundColor: '#ffffff',
              shadowColor: '#000000',
              shadowOpacity: 0.45,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              // Android no usa `shadow*`, sino esto
              elevation: 3,
            }}
          />
        )
      })}
    </View>
  )
}
