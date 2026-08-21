/**
 * Métodos de pago: /mis-pagos
 *
 * Fuera de las pestañas, desde Mi cuenta en modo cliente. Solo cliente: un
 * profesional cobra, no guarda tarjeta para pagar.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { PaymentMethodsPage } from '@/pages/PaymentMethodsPage'

export default function PaymentMethodsRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="client"
      title="Los métodos de pago son de quien contrata"
      message="Aquí guardas la tarjeta con la que pagas tus trabajos. Como profesional cobras tú, no pagas — eso se ve en tu cartera."
      unavailableMessage="Tu cuenta es solo de profesional: no hay tarjeta que guardar."
      testID="payment-methods-denied"
    >
      <PaymentMethodsPage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
