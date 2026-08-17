/**
 * Tab Agenda, solo para modo profesional.
 *
 * Los trabajos que tiene asignados, con dirección, día y teléfono del
 * cliente. Era un placeholder hasta que hubo asignación de trabajos: antes no
 * había nada que listar.
 *
 * Lo que sigue faltando del diseño es la otra mitad, marcar en qué días y
 * franjas se trabaja, que es la Fase 6.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { AgendaPage } from '@/pages/AgendaPage'

export default function ScheduleRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="La agenda es del profesional"
      message="Aquí ve un profesional los trabajos que tiene asignados, con la dirección y el día. Como cliente, los tuyos están en Mis trabajos."
      actions={[
        {
          label: 'Ver mis trabajos',
          onPress: () => router.navigate('/jobs'),
          testID: 'schedule-denied-jobs',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. La agenda aparece al darse de alta como profesional."
      testID="schedule-denied"
    >
      <AgendaPage onBack={() => router.navigate('/inicio')} />
    </RoleGate>
  )
}
