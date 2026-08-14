/**
 * Tab Agenda (placeholder), solo para modo profesional.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

export default function ScheduleRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="La agenda es del profesional"
      message="Aquí se marca en qué días y franjas se trabaja, y si se está disponible ahora mismo para urgencias. Como cliente no tienes disponibilidad que ofrecer."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate('/pros'),
          testID: 'schedule-denied-pros',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. La agenda aparece al darse de alta como profesional."
      testID="schedule-denied"
    >
      <ComingSoonPage
        title="Agenda"
        roadmap="la Fase 8 (Agenda del pro)"
        testID="schedule-tab"
      />
    </RoleGate>
  )
}
