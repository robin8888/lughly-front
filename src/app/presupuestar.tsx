/**
 * Hacer un presupuesto: /presupuestar?id=…
 *
 * Fuera de las pestañas: se entra desde la ficha del trabajo, que es donde el
 * profesional está mirando lo que ha ido a ver. Solo el lado profesional —el
 * servidor rechaza a cualquier otro con un 404, que es lo correcto: confirmar
 * que ese trabajo existe ya sería decir algo—.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { QuotePage } from '@/pages/QuotePage'

export default function QuoteRoute() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()

  const volver = () =>
    id
      ? router.navigate({ pathname: '/trabajo/[id]', params: { id } })
      : router.navigate('/jobs')

  return (
    <RoleGate
      allow="pro"
      title="Presupuestar es cosa del profesional"
      message="Aquí es donde quien ha ido a ver el trabajo dice lo que cuesta arreglarlo. Como cliente lo recibes en la ficha del trabajo."
      actions={[
        {
          label: 'Mis trabajos',
          onPress: () => router.navigate('/jobs'),
          testID: 'quote-denied-jobs',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay nada que presupuestar."
      testID="quote-denied"
    >
      <QuotePage jobId={id} onBack={volver} onDone={volver} />
    </RoleGate>
  )
}
