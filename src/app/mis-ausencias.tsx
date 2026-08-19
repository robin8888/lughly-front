/**
 * Mis ausencias: /mis-ausencias
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, junto al horario y la zona.
 * Van los tres seguidos porque son lo mismo visto de tres maneras —cuándo,
 * dónde y cuándo no—.
 *
 * Solo profesional: un cliente no tiene disponibilidad que apartar.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { AbsencesPage } from '@/pages/AbsencesPage'

export default function AbsencesRoute() {
  const router = useRouter()

  /**
   * Con `id` en la dirección, lo que se edita es lo de ese trabajador y quien
   * lo edita es su empresa. Se reutiliza la ruta en vez de crear otra porque la
   * pantalla es la misma y las reglas también: solo cambia de quién es lo que
   * se guarda. Y se vuelve a la lista de trabajadores, no a Mi cuenta, que es
   * de donde se ha venido.
   */
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>()

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
      <AbsencesPage
        employeeId={id}
        employeeName={name}
        onBack={() => router.navigate(id ? '/empleados' : '/account')}
      />
    </RoleGate>
  )
}
