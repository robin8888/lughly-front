/**
 * Reservar por horas: /reservar-horas?proId=…&trade=…
 *
 * Se llega desde «Reservar ahora» en la ficha de quien cobra por hora. Fuera
 * de las pestañas, como `/contratar-carta` y `/encargar`: es un paso de un
 * flujo, no un destino propio.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { BookHoursPage } from '@/pages/BookHoursPage'

export default function BookHoursRoute() {
  const router = useRouter()
  const { proId, trade } = useLocalSearchParams<{ proId?: string; trade?: string }>()

  return (
    <RoleGate
      allow="client"
      title="Contratar es cosa del cliente"
      message="Aquí se pagan por adelantado las horas de un profesional. Como profesional, son tus horas las que se reservan, no las de otro."
      unavailableMessage="Tu cuenta es solo de profesional: no hay nada que contratar."
      testID="book-hours-denied"
    >
      <BookHoursPage
        proId={proId}
        {...(trade ? { initialTrade: trade } : {})}
        onBack={() => router.back()}
        onBooked={(jobId) =>
          router.replace({ pathname: '/trabajo/[id]', params: { id: jobId } })
        }
        onAddPaymentMethod={() => router.push('/mis-pagos')}
      />
    </RoleGate>
  )
}
