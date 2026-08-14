/**
 * Tab Urgente (placeholder), solo para modo cliente.
 * Texto del bloqueo: MobileApp.dc.html (`isUrgenciaDenied`).
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

export default function UrgentRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="client"
      title="Las urgencias las publica el cliente"
      message="Estás en modo profesional: tú recibes los avisos de urgencia cuando estás disponible. Si además quieres contratar, cambia a modo cliente."
      actions={[
        {
          label: 'Ver trabajos disponibles',
          onPress: () => router.navigate('/offers'),
          testID: 'urgent-denied-offers',
        },
        {
          label: 'Activar "disponible ahora"',
          onPress: () => router.navigate('/schedule'),
          testID: 'urgent-denied-schedule',
        },
      ]}
      testID="urgent-denied"
    >
      <ComingSoonPage
        title="Urgente"
        roadmap="la Fase 5 (Urgencias)"
        testID="urgent-tab"
      />
    </RoleGate>
  )
}
