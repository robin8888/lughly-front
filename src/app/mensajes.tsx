/**
 * Mis mensajes: /mensajes
 *
 * Fuera de las pestañas, desde Mi cuenta. Sirve a los dos roles: el cliente
 * habla con quien tiene su trabajo, el profesional con quien se lo encargó.
 */

import { useRouter } from 'expo-router'
import { MessagesPage } from '@/pages/MessagesPage'
import type { ApiThreadSummary } from '@/api/chat.api'

export default function MessagesRoute() {
  const router = useRouter()

  const openJobThread = (thread: ApiThreadSummary) => {
    if (!thread.jobId) return

    router.push({
      pathname: '/mensajes/trabajo/[id]',
      params: {
        id: thread.jobId,
        title: thread.title,
        otherName: thread.otherName,
        otherAvatarUrl: thread.otherAvatarUrl ?? '',
      },
    })
  }

  return (
    <MessagesPage
      /**
       * `back()` a secas asume que siempre hay algo detrás en la pila, y no
       * siempre lo hay —tras recargar la app, o si se llega aquí de un modo
       * que no deja historial—: entonces `router.back()` no hace nada y deja
       * un aviso de desarrollo ("GO_BACK no manejado"). Con destino conocido
       * de reserva no hace falta que haya nada detrás.
       */
      onBack={() => (router.canGoBack() ? router.back() : router.navigate('/account'))}
      onOpenJobThread={openJobThread}
      onOpenSupport={() => router.push('/mensajes/soporte')}
    />
  )
}
