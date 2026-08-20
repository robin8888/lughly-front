/**
 * Mis recargos: /mis-recargos
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, con el horario, la zona y
 * las ausencias. Va con ellos porque es la misma idea vista por el precio:
 * cuándo trabaja, dónde, cuándo no, y cuánto cuesta que sea a deshora.
 *
 * Solo profesional: un cliente no cobra recargos, los paga.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { SurchargesPage } from '@/pages/SurchargesPage'

export default function SurchargesRoute() {
  const router = useRouter()

  /**
   * Con `id` en la dirección, lo que se edita es lo de ese trabajador y quien
   * lo edita es su empresa. Se reutiliza la ruta en vez de crear otra porque la
   * pantalla es la misma y las reglas también: solo cambia de quién es lo que
   * se guarda.
   */
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>()

  return (
    <RoleGate
      allow="pro"
      title="Los recargos son del profesional"
      message="Dicen cuánto sube el precio cuando el trabajo cae en sábado, en festivo o de noche. Como cliente los ves en la ficha de quien contratas, antes de pedir nada."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'surcharges-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay recargos que poner."
      testID="surcharges-denied"
    >
      <SurchargesPage
        employeeId={id}
        employeeName={name}
        onBack={() => router.navigate(id ? '/empleados' : '/account')}
      />
    </RoleGate>
  )
}
