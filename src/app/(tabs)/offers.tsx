/**
 * Tab Ofertas (placeholder), solo para modo profesional.
 *
 * Un cliente que llegue aquí y no tenga cuenta profesional no puede cambiar
 * de modo: se le explica, en vez de ofrecerle un botón que no haría nada.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

export default function OffersRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Pujar es cosa del profesional"
      message="Aquí se pujan los trabajos publicados. Como cliente, lo tuyo es publicar el tuyo y comparar las ofertas que recibas."
      actions={[
        {
          label: 'Publicar un trabajo',
          onPress: () => router.navigate('/publish'),
          testID: 'offers-denied-publish',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. Para pujar hace falta darse de alta como profesional y verificar la identidad."
      testID="offers-denied"
    >
      <ComingSoonPage
        title="Ofertas"
        roadmap="la Fase 6 (Subastas)"
        testID="offers-tab"
      />
    </RoleGate>
  )
}
