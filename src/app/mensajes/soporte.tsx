/**
 * Mi conversación con administración: /mensajes/soporte
 *
 * Un único hilo por usuario (ver `chat.controller.ts`), así que no necesita
 * ningún parámetro: siempre es el mismo, exista ya o se cree con el primer
 * mensaje.
 */

import { useRouter } from 'expo-router'
import { ThreadDetailPage } from '@/pages/ThreadDetailPage'

export default function SupportThreadRoute() {
  const router = useRouter()

  return (
    <ThreadDetailPage
      mode="support"
      title="Soporte"
      otherName="Administración"
      otherAvatarUrl={null}
      onBack={() => router.back()}
    />
  )
}
