/**
 * EmptyState Molecule
 * "Aquí no hay nada" con salida.
 *
 * Un vacío sin salida es un callejón: el usuario ve que no hay resultados y
 * no sabe qué hacer. Por eso el componente exige un título y admite acciones,
 * y por eso el mensaje debe decir QUÉ falta, no un "sin resultados" genérico.
 *
 * Sirve también para errores: cambia el texto, no la forma.
 *
 * **Siempre lleva a Uhiro y va centrado en la pantalla** (20 Agosto 2026).
 * Antes había tres opciones —dos ilustraciones y ninguna—, y el resultado era
 * que la misma situación se contaba distinta en cada pantalla: en unas con
 * dibujo y en otras con un párrafo suelto arriba del todo, que se lee como si
 * algo hubiera fallado. Un vacío no es un fallo, y con la mascota en medio se
 * nota que la app sabe lo que está pasando.
 */

import { View, Text, Image } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { InfoCard } from '@/components/molecules/InfoCard'
import { images } from '@/images'
import { styles } from './EmptyState.styles'

export interface EmptyStateAction {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  testID?: string
}

export interface EmptyStateProps {
  title: string
  message?: string
  actions?: EmptyStateAction[]
  testID?: string
}

export function EmptyState({
  title,
  message,
  actions = [],
  testID,
}: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      <InfoCard style={styles.card}>
        <Image
          source={images.pulgar}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel=""
        />

        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}

        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((action) => (
              <Button
                key={action.label}
                fullWidth
                variant={action.variant ?? 'primary'}
                onPress={action.onPress}
                testID={action.testID}
              >
                {action.label}
              </Button>
            ))}
          </View>
        )}
      </InfoCard>
    </View>
  )
}
