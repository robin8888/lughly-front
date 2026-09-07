/**
 * Contratar un fijo: /fijo?proId=…&trade=…
 *
 * Fuera de las pestañas: se llega desde la ficha del profesional, al elegir
 * «fijo cada semana» en vez de «una vez». Solo cliente — un profesional no se
 * contrata a sí mismo, y el servidor lo rechazaría igual.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { RecurringBookingPage } from '@/pages/RecurringBookingPage'

export default function RecurringRoute() {
  const router = useRouter()
  const { proId, trade } = useLocalSearchParams<{ proId?: string; trade?: string }>()

  return (
    <RoleGate
      allow="client"
      title="Contratar es cosa del cliente"
      message="Aquí se contrata a alguien de forma fija. Como profesional, lo que te llega es el encargo entero en tu bandeja: un sí, y las sesiones quedan confirmadas."
      actions={[
        {
          label: 'Mis encargos',
          onPress: () => router.navigate('/encargos'),
          testID: 'recurring-denied-inbox',
        },
      ]}
      unavailableMessage="Tu cuenta es de profesional, así que no hay nada que contratar."
      testID="recurring-denied"
    >
      <RecurringBookingPage
        proId={proId}
        tradeSlug={trade ?? ''}
        onBack={() =>
          proId
            ? router.navigate({ pathname: '/pro/[id]', params: { id: proId } })
            : router.navigate('/pros')
        }
        /*
          Al contrato, que es donde se ven sus sesiones y desde donde se
          cancela: es lo que se acaba de crear, no una lista.
        */
        onBooked={(jobId) =>
          router.navigate({ pathname: '/trabajo/[id]', params: { id: jobId } })
        }
        onAddPaymentMethod={() => router.push('/mis-pagos')}
      />
    </RoleGate>
  )
}
