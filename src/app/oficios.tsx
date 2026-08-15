/**
 * Mis oficios: /oficios
 *
 * Fuera de las pestañas, igual que trabajadores: se entra desde Mi cuenta y
 * es algo que se toca de vez en cuando, no a diario.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { MyTradesPage } from '@/pages/MyTradesPage'

export default function MyTradesRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Los oficios son del profesional"
      message="Aquí se declara lo que uno hace y a qué precio. Como cliente, lo que buscas es justo lo contrario: a alguien que lo haga."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'trades-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. Los oficios aparecen al darse de alta como profesional."
      testID="trades-denied"
    >
      <MyTradesPage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
