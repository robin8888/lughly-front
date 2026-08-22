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
      // Con destino de reserva: `back()` a secas no hace nada si no hay
      // nada detrás en la pila, y deja un aviso de desarrollo sin avisar
      // al usuario de que el botón no ha hecho nada.
      onBack={() => (router.canGoBack() ? router.back() : router.navigate('/mensajes'))}
    />
  )
}
