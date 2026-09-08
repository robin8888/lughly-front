/**
 * Una conversación: /mensajes/persona/[id], donde `id` es **la otra persona**.
 *
 * Se entra desde "Mensajes" (una conversación que ya tiene mensajes), desde la
 * ficha de un trabajo (`JobDetailPage`, para escribir el primero) y desde el
 * aviso de un mensaje nuevo. Los tres llevan al mismo sitio porque desde el 8
 * de septiembre de 2026 la conversación es de la persona y no del encargo: la
 * ruta iba por `jobId` y ahora va por quién.
 *
 * El nombre y la foto viajan como parámetros: sin ellos la cabecera se abriría
 * en blanco hasta que llegara la primera respuesta del servidor, y quien abre
 * la pantalla siempre los sabe. El aviso es la excepción —solo trae el
 * identificador—, y ahí se rellenan con lo que conteste el servidor.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { ThreadDetailPage } from '@/pages/ThreadDetailPage'
import { useConversation } from '@/hooks/domain/useChat'

export default function ConversationRoute() {
  const router = useRouter()
  const { id, otherName, otherAvatarUrl } = useLocalSearchParams<{
    id: string
    otherName?: string
    otherAvatarUrl?: string
  }>()

  /*
    Solo para cuando se llega sin nombre —desde un aviso—. La consulta es la
    misma que hace la pantalla, así que React Query la sirve de su caché en
    lugar de pedirla dos veces.
  */
  const { data } = useConversation(id, !otherName)

  return (
    <ThreadDetailPage
      mode="direct"
      otherUserId={id}
      otherName={otherName ?? data?.otherName ?? 'Conversación'}
      otherAvatarUrl={otherAvatarUrl ? otherAvatarUrl : (data?.otherAvatarUrl ?? null)}
      // Con destino de reserva: `back()` a secas no hace nada si no hay
      // nada detrás en la pila, y deja un aviso de desarrollo sin avisar
      // al usuario de que el botón no ha hecho nada.
      onBack={() => (router.canGoBack() ? router.back() : router.navigate('/mensajes'))}
    />
  )
}
