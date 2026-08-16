/**
 * Mis trabajadores: /empleados
 *
 * Fuera de las pestañas: se llega desde el botón del inicio y solo la ve
 * quien tiene gente a cargo, que es una minoría. Ocuparía una pestaña que
 * casi nadie usaría.
 *
 * Quien no ha declarado tener empleados no llega aquí por navegación —el
 * botón del inicio no le aparece—, pero la ruta existe y se puede teclear.
 * El backend responde 403 igualmente; esto solo evita la pantalla vacía.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { EmployeesPage } from '@/pages/EmployeesPage'

export default function EmployeesRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Esto es del profesional"
      message="Aquí se dan de alta los trabajadores que tienes a tu cargo. Es una pantalla de quien ofrece servicios, no de quien los contrata."
      actions={[
        {
          label: 'Volver al inicio',
          onPress: () => router.navigate('/inicio'),
          testID: 'employees-denied-home',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. Para tener trabajadores a tu cargo hace falta darse de alta como profesional."
      testID="employees-denied"
    >
      <EmployeesPage
        onBack={() => router.navigate('/inicio')}
        onUrgencySchedule={(id, name) =>
          router.navigate({ pathname: '/horario-urgencias', params: { id, name } })
        }
      />
    </RoleGate>
  )
}
