/**
 * Mi carta: /mi-carta
 *
 * Fuera de las pestañas, igual que oficios: se entra desde Mi cuenta y es
 * algo que se toca de vez en cuando, no a diario.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { CartaPage } from '@/pages/CartaPage'

export default function CartaRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="La carta es del profesional"
      message="Aquí se pone la tarifa de visita y los servicios a precio fijo de cada oficio. Como cliente, la ves y la eliges en la ficha de a quien contratas."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'carta-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. La carta aparece al darse de alta como profesional."
      testID="carta-denied"
    >
      <CartaPage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
