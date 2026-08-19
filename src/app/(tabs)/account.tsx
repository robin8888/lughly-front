/**
 * Tab Mi cuenta.
 *
 * Los accesos cambian según el modo activo, como en el diseño. Los que aún
 * no tienen pantalla se muestran marcados como "Pronto": esconderlos daría
 * la impresión de que la app hace menos de lo que hará, y navegar a una
 * pantalla vacía es peor que no navegar.
 */

import { useRouter } from 'expo-router'
import {
  AccountPage,
  type AccountLinkGroup,
  type AccountLinkNote,
} from '@/pages/AccountPage'
import { useProfileChecklist } from '@/hooks/domain/useProfileChecklist'
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
  const adminGroups: AccountLinkGroup[] =
    accountRole === 'admin'
      ? [
          {
            title: 'Administración',
            links: [
              {
                label: 'Revisar documentos',
                onPress: () => router.push('/revisar-documentos'),
              },
            ],
          },
        ]
      : []

  /**
   * Los accesos, en grupos con rótulo.
   *
   * Antes eran once seguidos sin ningún orden, y once cosas en fila se leen de
   * arriba abajo cada vez que se busca una.
   *
   * El primer grupo es lo que ve el cliente —oficios, fotos, horario, zona,
   * documentos—: es el escaparate, y es lo que hay que poder repasar de un
   * vistazo. Que no esté dentro de "Configuración" es a propósito: ahí dentro
   * quedaría más lejos que "Notificaciones", y en cualquier app
   * "Configuración" significa otra cosa —contraseña, avisos, idioma, borrar la
   * cuenta—.
   *
   * La foto de perfil no está en ninguna lista porque no hace falta: se cambia
   * tocándola arriba, que es donde se busca.
   */
  /*
   * Lo que falta por poner. Solo tiene sentido para un profesional: un cliente
   * no tiene perfil que completar.
   */
  const { data: checklist } = useProfileChecklist(role === 'pro')

  /** Falta y hace falta para trabajar */
  const blocking: AccountLinkNote = { label: 'Falta', tone: 'blocking' }
  /** Falta, pero se puede trabajar sin ello */
  const optional: AccountLinkNote = { label: 'Sin poner', tone: 'optional' }

  const groups: AccountLinkGroup[] =
    role === 'pro'
      ? [
          {
            title: 'Mi perfil, lo que ve el cliente',
            links: [
              /**
               * Los oficios y las fotos de un empleado los pone su empresa, y
               * su horario y su zona también. Las pantallas se lo explicarían,
               * pero es mejor no llevarle a una puerta cerrada.
               */
              ...(isEmployee
                ? []
                : [
                    {
                      label: 'Mis oficios y tarifas',
                      onPress: () => router.navigate('/oficios'),
                      /*
                       * Este sí bloquea: sin ningún oficio no aparece en el
                       * directorio, así que no es que le vaya peor, es que no
                       * le encuentra nadie.
                       */
                      ...(checklist?.trades === 'MISSING' && { note: blocking }),
                    },
                    {
                      label: 'Mis fotos de trabajo',
                      onPress: () => router.navigate('/mis-fotos'),
                      ...(checklist?.photos === 'MISSING' && { note: optional }),
                    },
                    {
                      label: 'Mi horario de trabajo',
                      onPress: () => router.push('/mi-horario'),
                      ...(checklist?.schedule === 'MISSING' && { note: optional }),
                    },
                    {
                      label: 'Mi zona de trabajo',
                      onPress: () => router.push('/mi-zona'),
                      ...(checklist?.coverage === 'MISSING' && { note: optional }),
                    },
                  ]),
              /**
               * Los documentos sí, también para un empleado: se los piden a él,
               * no a su empresa. Y estaban solo detrás del aviso de que
               * faltaban, así que una vez subidos no había por dónde volver.
               */
              {
                label: 'Mis documentos',
                onPress: () => router.push('/mis-documentos'),
                /*
                 * Sin ellos no puede pujar ni aceptar un encargo, así que es de
                 * los que bloquean. Cuando están subidos y esperando revisión
                 * se dice también: si no, quien acaba de subirlos no sabe si
                 * llegaron.
                 */
                ...(checklist?.identityDocuments === 'MISSING' && { note: blocking }),
                ...(checklist?.identityDocuments === 'PENDING' && {
                  note: { label: 'En revisión', tone: 'pending' as const },
                }),
              },
            ],
          },
          {
            title: 'Mi trabajo',
            links: [
              /**
               * El aviso del inicio solo sale cuando hay algo pendiente, así que
               * sin esto no había forma de entrar a mirar si no había nada. Y una
               * vez respondido tampoco se podía volver.
               */
              { label: 'Encargos', onPress: () => router.navigate('/encargos') },
              ...(isEmployee
                ? []
                : [
                    { label: 'Mis trabajadores', onPress: () => router.navigate('/empleados') },
                  ]),
              { label: 'Cartera', onPress: () => router.navigate('/wallet') },
              { label: 'Mensajes', comingSoon: true },
              { label: 'Panel profesional', comingSoon: true },
            ],
          },
          {
            title: 'Cuenta',
            links: [
              {
                label: 'Cambiar contraseña',
                onPress: () => router.push('/cambiar-contrasena'),
              },
              { label: 'Notificaciones', comingSoon: true },
              { label: 'Configuración', comingSoon: true },
            ],
          },
        ]
      : [
          {
            title: 'Mi actividad',
            links: [
              { label: 'Mis trabajos publicados', onPress: () => router.navigate('/jobs') },
              { label: 'Mensajes', comingSoon: true },
            ],
          },
          {
            title: 'Cuenta',
            links: [
              {
                label: 'Cambiar contraseña',
                onPress: () => router.push('/cambiar-contrasena'),
              },
              { label: 'Métodos de pago', comingSoon: true },
              { label: 'Notificaciones', comingSoon: true },
              { label: 'Configuración', comingSoon: true },
            ],
          },
        ]

  return (
    <AccountPage
      groups={[...adminGroups, ...groups]}
      onBack={() => router.navigate('/inicio')}
      onDocuments={() => router.push('/mis-documentos')}
    />
  )
}
