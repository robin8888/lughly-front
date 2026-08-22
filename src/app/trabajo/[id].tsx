/**
 * Ficha de un trabajo: /trabajo/[id]
 *
 * Fuera de las pestañas: se entra tocando un trabajo en Mis trabajos. Vale
 * para los dos lados —el servidor decide qué campos manda según quién
 * pregunte—, así que no hay una ruta para el cliente y otra para el
 * profesional.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { JobDetailPage } from '@/pages/JobDetailPage'

export default function JobDetailRoute() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()

  return (
    <JobDetailPage
      jobId={id}
      onBack={() => router.navigate('/jobs')}
      /* Las pujas siguen en su pantalla: ahí es donde se comparan y se adjudica */
      onSeeBids={(jobId, title) =>
        router.navigate({ pathname: '/pujas', params: { jobId, title } })
      }
      /*
       * Buscar a otro, igual que desde la tarjeta de Mis trabajos: al
       * directorio con el oficio puesto, salvo una urgencia, que va a los que
       * están de guardia ahora mismo.
       */
      onReassign={(jobId, trade, declinedProId, type) =>
        type === 'URGENT'
          ? router.navigate({ pathname: '/urgencia/[id]', params: { id: jobId } })
          : router.navigate({
              pathname: '/pros',
              params: {
                trade,
                reassign: jobId,
                ...(declinedProId ? { declined: declinedProId } : {}),
              },
            })
      }
      onOpenChat={(jobId, title, otherName, otherAvatarUrl) =>
        router.push({
          pathname: '/mensajes/trabajo/[id]',
          params: { id: jobId, title, otherName, otherAvatarUrl: otherAvatarUrl ?? '' },
        })
      }
    />
  )
}
