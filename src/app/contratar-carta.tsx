/**
 * Contratar la carta: /contratar-carta
 *
 * Se llega desde la ficha de un profesional (`onHireCarta`), con lo que ya
 * eligió: el oficio y los servicios marcados. Fuera de las pestañas, como
 * `/encargar`: es un paso de un flujo, no un destino propio.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { HireCartaPage } from '@/pages/HireCartaPage'

export default function HireCartaRoute() {
  const router = useRouter()
  const { proId, tradeSlug, serviceIds } = useLocalSearchParams<{
    proId?: string
    tradeSlug?: string
    serviceIds?: string
  }>()

  return (
    <RoleGate
      allow="client"
      title="Contratar es cosa del cliente"
      message="Aquí se paga por lo que se ha elegido en la ficha de un profesional. Como profesional, es tu carta la que se contrata, no la de otro."
      unavailableMessage="Tu cuenta es solo de profesional: no hay nada que contratar."
      testID="hire-carta-denied"
    >
      <HireCartaPage
        proId={proId}
        tradeSlug={tradeSlug ?? ''}
        serviceIds={serviceIds ? serviceIds.split(',').filter(Boolean) : []}
        onBack={() => router.back()}
        onBooked={(jobId) => router.replace({ pathname: '/trabajo/[id]', params: { id: jobId } })}
        onAddPaymentMethod={() => router.push('/mis-pagos')}
      />
    </RoleGate>
  )
}
