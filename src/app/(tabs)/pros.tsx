/**
 * Tab Profesionales (directorio).
 *
 * Acepta `?trade=` para llegar ya filtrado desde la home, y `?reassign=` para
 * entrar a buscar sustituto de un trabajo que se quedó sin nadie: ahí tocar una
 * ficha se lo encarga en vez de abrirla.
 */

import { Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { DirectoryPage } from '@/pages/DirectoryPage'
import { useReassignJob } from '@/hooks/domain/useJob'

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

  /**
   * Se pregunta antes de encargárselo: se llega aquí desde una lista y un
   * toque en la ficha equivocada mandaría el trabajo a quien no era.
   */
  const choose = (jobId: string, proId: string, proName: string) => {
    Alert.alert(
      `¿Se lo encargas a ${proName}?`,
      'Tendrá 24 horas para responder. Si trabaja para una empresa, responde ella.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Encargárselo',
          onPress: () => {
            void (async () => {
              const { ok, result, error } = await sendReassign(jobId, proId)

              if (!ok) {
                Alert.alert(
                  'No se ha podido encargar',
                  error ?? 'Inténtalo de nuevo en un momento.',
                )
                return
              }

              Alert.alert(
                'Encargo enviado',
                `${result.respondedByName} tiene 24 horas para responderte.`,
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
  const punto =
    lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null

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
