/**
 * Mis ausencias: /mis-ausencias
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, junto al horario y la zona.
 * Van los tres seguidos porque son lo mismo visto de tres maneras —cuándo,
 * dónde y cuándo no—.
 *
 * Solo profesional: un cliente no tiene disponibilidad que apartar.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { AbsencesPage } from '@/pages/AbsencesPage'

export default function AbsencesRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Las ausencias son del profesional"
      message="Sirven para apartar los días que no va a trabajar. Como cliente no tienes disponibilidad que apartar: pides cuando lo necesitas."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'absences-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay ausencias que marcar."
      testID="absences-denied"
    >
      <AbsencesPage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
