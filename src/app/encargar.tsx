/**
 * Pedir presupuesto a un profesional: /encargar?proId=…&trade=…
 *
 * Se llega desde el botón «Presupuesto» de su ficha, después del aviso de que
 * la visita se paga.
 *
 * **Ya no lleva `type`.** Llevaba `QUOTE|INSTANT` porque el formulario servía
 * para las dos cosas, y el `INSTANT` de aquí era un encargo sin precio y sin
 * cobro: la puerta de atrás de la regla «no hay camino que no cobra». Reservar
 * a tarifa fija tiene sus dos pantallas propias, `/reservar-horas` y
 * `/contratar-carta`, y las dos cobran.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RequestProPage } from '@/pages/RequestProPage'

export default function RequestProRoute() {
  const router = useRouter()
  const { proId, trade } = useLocalSearchParams<{
    proId?: string
    trade?: string
  }>()

  return (
    <RequestProPage
      proId={proId}
      {...(trade ? { initialTrade: trade } : {})}
      onBack={() => router.back()}
      // Al enviarlo, a Mis trabajos: es donde va a mirar si le han contestado
      onSent={() => router.navigate('/jobs')}
      // Sin tarjeta no se puede contratar, y guardarla es cosa de Mis pagos
      onAddPaymentMethod={() => router.navigate('/mis-pagos')}
    />
  )
}
