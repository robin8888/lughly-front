/**
 * Encargos pendientes: /encargos
 *
 * La bandeja de quien recibe trabajos encargados a una persona concreta. Un
 * autónomo ve los suyos; una empresa, los de toda su gente.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { InboxPage } from '@/pages/InboxPage'

export default function InboxRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Los encargos son del profesional"
      message="Aquí llegan los trabajos que un cliente encarga eligiendo a alguien en el directorio. Como cliente, lo tuyo es justo lo contrario: elegir."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'inbox-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente."
      testID="inbox-denied"
    >
      <InboxPage onBack={() => router.navigate('/inicio')} />
    </RoleGate>
  )
}
