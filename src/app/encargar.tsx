/**
 * Encargar a un profesional: /encargar?proId=…&type=QUOTE|INSTANT
 *
 * Se llega desde los dos botones de su ficha. El tipo viaja en la ruta y no
 * en dos pantallas distintas porque el formulario es el mismo: lo único que
 * cambia es si se pide precio o se reserva a la tarifa que ya está publicada.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RequestProPage, type RequestType } from '@/pages/RequestProPage'

export default function RequestProRoute() {
  const router = useRouter()
  const { proId, type, trade } = useLocalSearchParams<{
    proId?: string
    type?: string
    trade?: string
  }>()

  return (
    <RequestProPage
      proId={proId}
      // Cualquier otra cosa se trata como presupuesto: pedir precio no
      // compromete a nada, y reservar sí.
      type={type === 'INSTANT' ? 'INSTANT' : ('QUOTE' as RequestType)}
      {...(trade ? { initialTrade: trade } : {})}
      onBack={() => router.back()}
      // Al enviarlo, a Mis trabajos: es donde va a mirar si le han contestado
      onSent={() => router.navigate('/jobs')}
    />
  )
}
