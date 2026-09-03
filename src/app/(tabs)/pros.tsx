/**
 * Tab Profesionales (directorio).
 *
 * Acepta `?trade=` para llegar ya filtrado desde la home, y `?reassign=` para
 * entrar a buscar sustituto de un trabajo que se quedó sin nadie: ahí tocar una
 * ficha se lo encarga en vez de abrirla.
 */

import { Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { formatAmount } from '@/components/atoms/Money'
import { DirectoryPage } from '@/pages/DirectoryPage'
import { useReassignJob } from '@/hooks/domain/useJob'
import { usePaymentMethods } from '@/hooks/domain/usePaymentMethods'
import { useAuthStore } from '@/stores/useAuthStore'

export default function ProsRoute() {
  const router = useRouter()
  const { trade, lat, lng, reassign, declined } = useLocalSearchParams<{
    trade?: string
    /** Desde dónde busca el cliente; llega de la home, ya con su permiso dado */
    lat?: string
    lng?: string
    /** El trabajo al que se le busca otro profesional */
    reassign?: string
    /** Quién dijo que no: su ficha sale apagada */
    declined?: string
  }>()

  const { reassign: sendReassign } = useReassignJob()
  const { data: methods } = usePaymentMethods()
  const method = methods?.[0] ?? null

  /**
   * Su dirección del alta, que es el respaldo cuando no llega posición del
   * GPS. Ver `punto` más abajo.
   */
  const address = useAuthStore((s) => s.user?.address ?? null)

  /**
   * Se pregunta antes de encargárselo: se llega aquí desde una lista y un
   * toque en la ficha equivocada mandaría el trabajo a quien no era.
   *
   * **Y el precio es del nuevo, no del que se cayó.** Cada profesional cobra
   * lo suyo por presentarse, así que al cambiar se suelta lo retenido del
   * anterior y se retiene lo de este; el importe exacto lo dice el servidor y
   * se enseña al volver. Antes de esto reasignar no cobraba nada: el nuevo
   * hacía el trabajo gratis y nadie se enteraba.
   */
  const choose = (jobId: string, proId: string, proName: string) => {
    if (!method) {
      Alert.alert(
        'Necesitas una tarjeta guardada',
        'La visita del nuevo profesional se retiene al encargárselo, y solo se cobra si acepta. Guárdala en Mis pagos y vuelve.',
        [
          { text: 'Volver', style: 'cancel' },
          { text: 'Guardar tarjeta', onPress: () => router.navigate('/mis-pagos') },
        ],
      )
      return
    }

    Alert.alert(
      `¿Se lo encargas a ${proName}?`,
      'Tendrá 24 horas para responder. Se retiene su visita —la suya, que puede no ser la misma que la del anterior— y solo se cobra si acepta. Si trabaja para una empresa, responde ella.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Encargárselo',
          onPress: () => {
            void (async () => {
              const { ok, result, error } = await sendReassign(jobId, proId, method.id)

              if (!ok) {
                Alert.alert(
                  'No se ha podido encargar',
                  error ?? 'Inténtalo de nuevo en un momento.',
                )
                return
              }

              Alert.alert(
                'Visita pedida',
                `Se han retenido ${formatAmount(result.amount)} €. ${result.respondedByName} tiene 24 horas para responderte.`,
              )
              router.navigate({ pathname: '/trabajo/[id]', params: { id: jobId } })
            })()
          },
        },
      ],
    )
  }

  /*
    Los parámetros de ruta viajan como texto. `Number('')` es 0 —una
    coordenada válida en mitad del Atlántico—, así que se comprueba que
    vengan los dos y que sean números de verdad antes de darlos por buenos.
  */
  const gps =
    lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null

  /**
   * Desde dónde se mide la cercanía, en este orden:
   *
   * 1. **La posición del GPS**, si se llega desde la home con el permiso ya
   *    dado. Es la más exacta y además es dónde está el cliente *ahora*, que
   *    para un fontanero es lo que importa.
   * 2. **La dirección que dio en el alta.** Es el motivo de haberla pedido:
   *    hasta ahora, entrar directo a la pestaña Profesionales —sin pasar por
   *    la home ni dar permiso de ubicación— enseñaba el directorio entero sin
   *    ordenar, con gente a doscientos kilómetros por delante de la de su
   *    calle. Mucha gente no da nunca el permiso de ubicación, así que ese era
   *    el caso normal y no el raro.
   * 3. **Nada**, y el directorio sale sin ordenar por distancia. Le pasa a
   *    quien se registró antes de que la dirección se pidiera.
   */
  const punto = gps ?? (address ? { lat: address.lat, lng: address.lng } : null)

  return (
    <DirectoryPage
      initialTrade={trade}
      point={punto}
      onSelectPro={(id, selection) =>
        router.navigate({
          pathname: '/pro/[id]',
          params: {
            id,
            ...(selection && {
              tradeSlug: selection.tradeSlug,
              serviceIds: selection.serviceIds.join(','),
            }),
          },
        })
      }
      onHireCarta={(proId, tradeSlug, serviceIds) =>
        router.navigate({
          pathname: '/contratar-carta',
          params: { proId, tradeSlug, serviceIds: serviceIds.join(',') },
        })
      }
      onBack={() => router.navigate('/inicio')}
      {...(reassign && {
        reassign: {
          jobId: reassign,
          ...(declined ? { declinedProId: declined } : {}),
          onChoose: (proId: string, proName: string) =>
            choose(reassign, proId, proName),
          onCancel: () => router.navigate('/jobs'),
        },
      })}
    />
  )
}
