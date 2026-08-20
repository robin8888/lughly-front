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
  const { trade, reassign, declined } = useLocalSearchParams<{
    trade?: string
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

  return (
    <DirectoryPage
      initialTrade={trade}
      onSelectPro={(id) => router.navigate({ pathname: '/pro/[id]', params: { id } })}
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
