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
import { useUserRole } from '@/stores/useAuthStore'

export default function AccountRoute() {
  const router = useRouter()
  const role = useEffectiveRole()
  const accountRole = useUserRole()

  /**
   * Un empleado no puede tener empleados, así que ese acceso no le sale. Al
   * resto sí, tenga gente a cargo o no: es la puerta de quien contrata al
   * primero después de haber empezado solo.
   */
  const isEmployee = useIsEmployee()

  /**
   * Lo del administrador va primero y aparte.
   *
   * No es una tercera "cara" del producto como cliente y profesional: es otra
   * cosa, y quien entra con esa cuenta viene a revisar, no a contratar. Por eso
   * encabeza la lista en vez de esconderse entre los accesos del rol.
   *
   * Se enseña por rol de la cuenta y no por el modo activo: un administrador ve
   * la interfaz de cliente —`useEffectiveRole` solo distingue cliente y
   * profesional—, y su acceso no debe depender de eso.
   */
  const adminLinks: AccountLink[] =
    accountRole === 'admin'
      ? [
          {
            label: 'Revisar documentos',
            onPress: () => router.push('/revisar-documentos'),
          },
        ]
      : []

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
          {
            label: 'Mi horario de trabajo',
            onPress: () => router.push('/mi-horario'),
          },
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

  return (
    <AccountPage
      links={[...adminLinks, ...links]}
      onBack={() => router.navigate('/inicio')}
      onDocuments={() => router.push('/mis-documentos')}
    />
  )
}
