/**
 * Horario de urgencias de un trabajador: /horario-urgencias?id=…
 *
 * Ruta suelta y con el trabajador en un parámetro, en vez de anidarla bajo
 * /empleados: el grupo de pestañas ya reclama las rutas de su carpeta y una
 * carpeta nueva bajo `empleados` obligaría a convertir esa pantalla en índice
 * de un directorio para nada.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { UrgencySchedulePage } from '@/pages/UrgencySchedulePage'

export default function UrgencyScheduleRoute() {
  const router = useRouter()
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>()

  return (
    <RoleGate
      allow="pro"
      title="Esto es del profesional"
      message="Aquí se decide cuándo puede atender urgencias la gente que tienes a tu cargo."
      actions={[
        {
          label: 'Volver al inicio',
          onPress: () => router.navigate('/inicio'),
          testID: 'urgency-schedule-denied-home',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente."
      testID="urgency-schedule-denied"
    >
      <UrgencySchedulePage
        employeeId={id}
        employeeName={name}
        onBack={() => router.navigate('/empleados')}
      />
    </RoleGate>
  )
}
