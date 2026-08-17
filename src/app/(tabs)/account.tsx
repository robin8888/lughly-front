/**
 * Tab Mi cuenta.
 *
 * Los accesos cambian según el modo activo, como en el diseño. Los que aún
 * no tienen pantalla se muestran marcados como "Pronto": esconderlos daría
 * la impresión de que la app hace menos de lo que hará, y navegar a una
 * pantalla vacía es peor que no navegar.
 */

import { useRouter } from 'expo-router'
import { AccountPage, type AccountLink } from '@/pages/AccountPage'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'

export default function AccountRoute() {
  const router = useRouter()
  const role = useEffectiveRole()

  /**
   * Un empleado no puede tener empleados, así que ese acceso no le sale. Al
   * resto sí, tenga gente a cargo o no: es la puerta de quien contrata al
   * primero después de haber empezado solo.
   */
  const isEmployee = useIsEmployee()

  const links: AccountLink[] =
    role === 'pro'
      ? [
          { label: 'Mensajes', comingSoon: true },
          /**
           * El aviso del inicio solo sale cuando hay algo pendiente, así que
           * sin esto no había forma de entrar a mirar si no había nada. Y una
           * vez respondido tampoco se podía volver.
           */
          { label: 'Encargos', onPress: () => router.navigate('/encargos') },
          { label: 'Panel profesional', comingSoon: true },
          /**
           * Los oficios de un empleado los pone su empresa, y empleados de
           * un empleado no existen. Las dos pantallas se lo explicarían,
           * pero es mejor no llevarle a una puerta cerrada.
           */
          ...(isEmployee
            ? []
            : [
                {
                  label: 'Mis oficios',
                  onPress: () => router.navigate('/oficios'),
                },
                {
                  label: 'Mis trabajadores',
                  onPress: () => router.navigate('/empleados'),
                },
                /**
                 * Las fotos de un empleado son las de su empresa, igual que
                 * sus oficios, así que el acceso va en el mismo grupo.
                 */
                {
                  label: 'Mis fotos de trabajo',
                  onPress: () => router.navigate('/mis-fotos'),
                },
              ]),
          { label: 'Calendario de disponibilidad', comingSoon: true },
          { label: 'Cartera', onPress: () => router.navigate('/wallet') },
          { label: 'Configuración', comingSoon: true },
          { label: 'Notificaciones', comingSoon: true },
        ]
      : [
          { label: 'Mensajes', comingSoon: true },
          { label: 'Mis trabajos publicados', onPress: () => router.navigate('/jobs') },
          { label: 'Métodos de pago', comingSoon: true },
          { label: 'Configuración', comingSoon: true },
          { label: 'Notificaciones', comingSoon: true },
        ]

  return <AccountPage links={links} onBack={() => router.navigate('/inicio')} />
}
