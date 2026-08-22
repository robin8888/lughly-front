/**
 * RoleGate Organism
 * Deja pasar o explica por qué no, según MobileApp.dc.html
 * (`isPublicarDenied` e `isUrgenciaDenied`).
 *
 * El diseño no usa un "no tienes permiso" genérico, y con razón: cada
 * pantalla bloqueada dice qué le toca a esa persona *en su lugar*. Al
 * profesional que abre una pantalla de cliente no se le dice "prohibido", se
 * le dice cuál es su sitio y se le enseña dónde. Por eso el título, el texto
 * y las alternativas llegan por props: un mensaje genérico sería más fácil
 * de escribir y mucho peor de leer.
 *
 * El botón de cambiar de modo lo pone el propio componente, porque es la
 * salida que siempre aplica; las demás acciones las decide cada pantalla.
 */

import type { ReactNode } from 'react'
import { View, Text } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useRoleGate } from '@/hooks/auth/useRoleGate'
import type { EffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { styles } from './RoleGate.styles'

export interface RoleGateAction {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  testID?: string
}

export interface RoleGateProps {
  /** Modo al que pertenece la pantalla */
  allow: EffectiveRole
  /** Titular del bloqueo: "Publicar es cosa del cliente" */
  title: string
  /** Por qué, y qué le toca a esta persona en su lugar */
  message: string
  /**
   * Qué puede hacer en vez de esto. Van antes del botón de cambiar de modo
   * porque casi siempre son mejor opción que cambiarse.
   */
  actions?: RoleGateAction[]
  /**
   * Qué se le dice a quien NO puede cambiar de modo, porque su cuenta no es
   * profesional. Sin esto se le ofrecería un botón que no hace nada.
   */
  unavailableMessage?: string
  children: ReactNode
  testID?: string
}

export function RoleGate({
  allow,
  title,
  message,
  actions = [],
  unavailableMessage,
  children,
  testID,
}: RoleGateProps) {
  const { allowed, canSwitch, switchToRequired } = useRoleGate(allow)

  if (allowed) return <>{children}</>

  return (
    <View style={styles.screen} testID={testID ?? 'role-gate'}>
      <InfoCard style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? 'secondary'}
            fullWidth
            onPress={action.onPress}
            style={styles.action}
            testID={action.testID}
          >
            {action.label}
          </Button>
        ))}

        {canSwitch ? (
          <Button
            variant="primary"
            fullWidth
            onPress={switchToRequired}
            style={styles.action}
            testID="role-gate-switch"
          >
            {allow === 'client' ? 'Cambiar a modo cliente' : 'Cambiar a modo profesional'}
          </Button>
        ) : (
          unavailableMessage && (
            <Text style={styles.unavailable} testID="role-gate-unavailable">
              {unavailableMessage}
            </Text>
          )
        )}
      </InfoCard>
    </View>
  )
}
