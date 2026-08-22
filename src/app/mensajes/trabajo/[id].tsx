/**
 * Conversación de un encargo: /mensajes/trabajo/[id]
 *
 * Se entra desde "Mensajes" (un hilo que ya tiene mensajes) o desde la ficha
 * del propio trabajo (`JobDetailPage`, para escribir el primero). Los tres
 * datos de cabecera —título, con quién, su foto— viajan como parámetros: sin
 * ellos la pantalla se abriría en blanco hasta que llegara la primera
 * respuesta del servidor, y aquí siempre se conocen de antemano.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { ThreadDetailPage } from '@/pages/ThreadDetailPage'

export default function JobThreadRoute() {
  const router = useRouter()
  const { id, title, otherName, otherAvatarUrl } = useLocalSearchParams<{
    id: string
    title: string
    otherName: string
    otherAvatarUrl?: string
  }>()

  return (
    <ThreadDetailPage
      mode="job"
      jobId={id}
      title={title ?? 'El trabajo'}
      otherName={otherName ?? 'Sin nombre'}
      otherAvatarUrl={otherAvatarUrl ? otherAvatarUrl : null}
      onBack={() => router.back()}
    />
  )
}
