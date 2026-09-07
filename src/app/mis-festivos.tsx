/**
 * Mis festivos: /mis-festivos
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, detrás de los recargos, que
 * es lo que explica para qué sirve la lista.
 *
 * Solo profesional. Un cliente no tiene calendario laboral: los festivos le
 * afectan al precio de lo que pide, y eso ya se lo dice la ficha.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { HolidaysPage } from '@/pages/HolidaysPage'

export default function HolidaysRoute() {
  const router = useRouter()

  /**
   * Con `id` en la dirección, el calendario es el de ese trabajador y quien lo
   * mira es su empresa. Misma pantalla y mismas reglas: solo cambia de quién
   * son los días.
   */
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>()

  return (
    <RoleGate
      allow="pro"
      title="El calendario es del profesional"
      message="Dice qué días son festivos donde trabaja y cuáles cobra con recargo. Como cliente, el precio de un festivo te lo dice la ficha de quien contratas."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'holidays-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay calendario laboral que llevar."
      testID="holidays-denied"
    >
      <HolidaysPage
        employeeId={id}
        employeeName={name}
        /*
         * Sin zona no hay comunidad, y sin comunidad no hay calendario. Solo
         * para la propia: la de un trabajador la pone él desde su móvil, así
         * que a su empresa la pantalla se lo dice en vez de ofrecerle un
         * botón que no llevaría a ninguna parte.
         */
        onSetZone={() => router.navigate('/mi-zona')}
        onBack={() => router.navigate(id ? '/empleados' : '/account')}
      />
    </RoleGate>
  )
}
