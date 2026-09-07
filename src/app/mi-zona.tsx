/**
 * Mi zona: /mi-zona
 *
 * Fuera de las pestañas: se entra desde Mi cuenta. Aquí el profesional fija su
 * base y su radio.
 *
 * **También el que trabaja para una empresa.** Hasta el 7 de septiembre de
 * 2026 esta ruta admitía un `id` en la dirección y entonces lo que se editaba
 * era la zona de ese trabajador, puesta por su empresa. Se quitó porque el
 * reparto estaba al revés de donde está el problema: el alta de un trabajador
 * no pide dirección, así que entraba sin punto en el mapa, fuera de todas las
 * búsquedas por cercanía, y el único que podía sacarle de ahí era alguien que
 * no es él.
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
