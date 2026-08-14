/**
 * EmptyState Molecule
 * "Aquí no hay nada" con salida.
 *
 * Un vacío sin salida es un callejón: el usuario ve que no hay resultados y
 * no sabe qué hacer. Por eso el componente exige un título y admite acciones,
 * y por eso el mensaje debe decir QUÉ falta, no un "sin resultados" genérico.
 *
 * Sirve también para errores: cambia el texto y la ilustración, no la forma.
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
  /** `none` para casos donde la ilustración distrae más que ayuda */
  illustration?: 'pointing' | 'greeting' | 'none'
  actions?: EmptyStateAction[]
  testID?: string
}

const ILLUSTRATIONS = {
  pointing: images.senalando,
  greeting: images.saludando,
} as const

export function EmptyState({
  title,
  message,
  illustration = 'pointing',
  actions = [],
  testID,
}: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      <InfoCard style={styles.card}>
        {illustration !== 'none' && (
          <Image
            source={ILLUSTRATIONS[illustration]}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityLabel=""
          />
        )}

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
