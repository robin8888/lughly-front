/**
 * Mi zona: /mi-zona
 *
 * Fuera de las pestañas: se entra desde Mi cuenta. Aquí el profesional fija su
 * base y su radio, que hasta ahora solo se podían poner al dar de alta a un
 * empleado —un autónomo se quedaba sin punto base para siempre—.
 *
 * Solo profesional. Un cliente no tiene zona: pone la dirección de cada
 * trabajo, que puede ser distinta cada vez.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { CoveragePage } from '@/pages/CoveragePage'

export default function CoverageRoute() {
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
      title="La zona es del profesional"
      message="Dice desde dónde sale y hasta dónde se desplaza. Como cliente pones la dirección de cada trabajo, que puede ser otra cada vez."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'coverage-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay zona que fijar."
      testID="coverage-denied"
    >
      <CoveragePage
        employeeId={id}
        employeeName={name}
        onBack={() => router.navigate(id ? '/empleados' : '/account')}
      />
    </RoleGate>
  )
}
