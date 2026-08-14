/**
 * Tab Publicar (placeholder), solo para modo cliente.
 * Texto del bloqueo: MobileApp.dc.html (`isPublicarDenied`).
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

export default function PublishRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="client"
      title="Publicar es cosa del cliente"
      message="Estás en modo profesional: aquí tu sitio es pujar por los trabajos publicados. Si además quieres contratar a alguien, cambia a modo cliente."
      actions={[
        {
          label: 'Ver trabajos disponibles',
          onPress: () => router.navigate('/offers'),
          testID: 'publish-denied-offers',
        },
      ]}
      testID="publish-denied"
    >
      <ComingSoonPage
        title="Publicar"
        roadmap="el Día 12 (Publicar trabajos)"
        testID="publish-tab"
      />
    </RoleGate>
  )
}
