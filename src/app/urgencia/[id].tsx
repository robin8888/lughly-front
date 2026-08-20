/**
 * A quién llamar para una urgencia: /urgencia/[id]
 *
 * Se entra por dos sitios y por eso la ruta solo recibe el trabajo: el oficio
 * y el punto salen de su ficha. Si vinieran por parámetros, el segundo camino
 * —"Buscar" desde una urgencia rechazada, donde no se tiene nada a mano— habría
 * que rehacerlo entero.
 *
 * 1. Justo después de describir la avería.
 * 2. Cuando el elegido dice que no o se le pasa el plazo, desde Mis trabajos.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { UrgencyProsPage } from '@/pages/UrgencyProsPage'
import { useJob } from '@/hooks/domain/useJob'

export default function UrgencyProsRoute() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { data: job } = useJob(id)

  const point =
    job?.latitude != null && job.longitude != null
      ? { lat: job.latitude, lng: job.longitude }
      : null

  return (
    <UrgencyProsPage
      jobId={id}
      tradeSlug={job?.trade}
      point={point}
      /* Quien dijo que no sigue en la lista, pero apagado */
      declinedProId={job?.status === 'DECLINED' ? job.assignedPro?.id : null}
      /* A esperar su respuesta, que es lo único que queda por hacer */
      onAsked={(jobId) =>
        router.navigate({ pathname: '/trabajo/[id]', params: { id: jobId } })
      }
      onSeeDirectory={() =>
        router.navigate({
          pathname: '/pros',
          params: { ...(job?.trade ? { trade: job.trade } : {}) },
        })
      }
      onBack={() => router.navigate('/jobs')}
    />
  )
}
