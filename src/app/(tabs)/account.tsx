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
  type AccountLink,
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
                icon: 'document',
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
                : ([
                    /*
                     * Va el primero del grupo: el nombre y la descripción son
                     * lo primero que lee el cliente en la tarjeta, antes que el
                     * precio y que las fotos.
                     */
                    {
                      label: 'Mis datos y mi descripción',
                      onPress: () => router.push('/mis-datos'),
                      icon: 'profile',
                      ...(checklist?.bio === 'MISSING' && { note: optional }),
                    },
                    {
                      label: 'Mis oficios y tarifas',
                      onPress: () => router.navigate('/oficios'),
                      icon: 'trades',
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
                      icon: 'photos',
                      ...(checklist?.photos === 'MISSING' && { note: optional }),
                    },
                    {
                      label: 'Mi horario de trabajo',
                      onPress: () => router.push('/mi-horario'),
                      icon: 'clock',
                      ...(checklist?.schedule === 'MISSING' && { note: optional }),
                    },
                    {
                      label: 'Mi zona de trabajo',
                      onPress: () => router.push('/mi-zona'),
                      icon: 'map-pin',
                      ...(checklist?.coverage === 'MISSING' && { note: optional }),
                    },
                    /*
                     * Va detrás del horario porque es lo que lo corrige: el
                     * horario dice la semana normal y esto dice cuándo no la
                     * hay. Sin aviso de "falta": no tener vacaciones marcadas
                     * es lo normal.
                     */
                    {
                      label: 'Mis ausencias y vacaciones',
                      onPress: () => router.push('/mis-ausencias'),
                      icon: 'vacation',
                    },
                    /*
                     * Los recargos van detrás del horario y las ausencias
                     * porque son lo mismo mirado por el precio: cuándo
                     * trabaja, cuándo no, y cuánto cuesta que sea a deshora.
                     * Sin aviso de "falta": traen los de la ley puestos.
                     */
                    {
                      label: 'Mis recargos',
                      onPress: () => router.push('/mis-recargos'),
                      icon: 'surcharge',
                    },
                    /*
                     * Y los festivos justo detrás, que es donde se ve para qué
                     * sirve el de domingos y festivos.
                     */
                    {
                      label: 'Mis festivos',
                      onPress: () => router.push('/mis-festivos'),
                      icon: 'holidays',
                    },
                  ] satisfies AccountLink[])),
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
              {
                label: 'Encargos',
                onPress: () => router.navigate('/encargos'),
                icon: 'clipboard-check',
              },
              ...(isEmployee
                ? []
                : [
                    {
                      label: 'Mis trabajadores',
                      onPress: () => router.navigate('/empleados'),
                      icon: 'team' as const,
                    },
                  ]),
              { label: 'Cartera', onPress: () => router.navigate('/wallet'), icon: 'card-wallet' },
              { label: 'Mensajes', onPress: () => router.push('/mensajes'), icon: 'message' },
              { label: 'Panel profesional', comingSoon: true, icon: 'bar-chart' },
            ],
          },
          {
            title: 'Cuenta',
            links: [
              /**
               * Los documentos van aquí y no arriba: el cliente **no** los ve
               * —los mira quien revisa, y nadie más—, así que en el grupo de
               * "lo que ve el cliente" prometían algo que no es verdad. Son
               * papeles de la cuenta, como la contraseña.
               *
               * Los tiene también un empleado: se los piden a él, no a su
               * empresa.
               */
              {
                label: 'Mis documentos',
                onPress: () => router.push('/mis-documentos'),
                icon: 'document',
                /*
                 * Sin ellos no puede contratar ni que le contraten, así que es de
                 * los que bloquean. Cuando están subidos y esperando revisión se
                 * dice también: si no, quien acaba de subirlos no sabe si
                 * llegaron.
                 */
                ...(checklist?.identityDocuments === 'MISSING' && { note: blocking }),
                ...(checklist?.identityDocuments === 'PENDING' && {
                  note: { label: 'En revisión', tone: 'pending' as const },
                }),
              },
              {
                label: 'Cambiar contraseña',
                onPress: () => router.push('/contrasena'),
                icon: 'lock',
              },
              { label: 'Notificaciones', comingSoon: true, icon: 'bell' },
              { label: 'Configuración', comingSoon: true, icon: 'settings' },
            ],
          },
        ]
      : [
          {
            title: 'Mi actividad',
            links: [
              /* El nombre y el teléfono también son suyos, aunque no tenga ficha */
              { label: 'Mis datos', onPress: () => router.push('/mis-datos'), icon: 'profile' },
              {
                label: 'Mis trabajos publicados',
                onPress: () => router.navigate('/jobs'),
                icon: 'publish',
              },
              { label: 'Mensajes', onPress: () => router.push('/mensajes'), icon: 'message' },
            ],
          },
          {
            title: 'Cuenta',
            links: [
              {
                label: 'Cambiar contraseña',
                onPress: () => router.push('/contrasena'),
                icon: 'lock',
              },
              {
                label: 'Métodos de pago',
                onPress: () => router.push('/mis-pagos'),
                icon: 'card',
              },
              { label: 'Notificaciones', comingSoon: true, icon: 'bell' },
              { label: 'Configuración', comingSoon: true, icon: 'settings' },
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
