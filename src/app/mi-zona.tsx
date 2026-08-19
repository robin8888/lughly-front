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

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { CoveragePage } from '@/pages/CoveragePage'

export default function CoverageRoute() {
  const router = useRouter()

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
      <CoveragePage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
