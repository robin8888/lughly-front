/**
 * Mi horario: /mi-horario
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, donde hasta ahora había un
 * "Calendario de disponibilidad" que no llevaba a ninguna parte.
 *
 * Solo profesional. Un cliente no tiene horario que poner: es quien reserva,
 * no a quien se reserva.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { AvailabilityPage } from '@/pages/AvailabilityPage'

export default function AvailabilityRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="El horario es del profesional"
      message="Dice a qué horas se le puede reservar. Como cliente eres tú quien elige el hueco, así que no hay ninguno que poner."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'availability-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay horario que poner."
      testID="availability-denied"
    >
      <AvailabilityPage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
