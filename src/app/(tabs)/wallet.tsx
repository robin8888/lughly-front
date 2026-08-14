/**
 * Tab Cartera (placeholder), solo para modo profesional.
 *
 * La cartera es de cobros: saldo, retenido y retiradas. Lo que un cliente
 * paga se ve en "Pagos y facturas", que es otra pantalla.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

export default function WalletRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="La cartera es de cobros"
      message="Aquí un profesional ve lo que ha ganado, lo que está retenido y retira su saldo. Lo que tú pagas como cliente se ve en tus trabajos, con su recibo."
      actions={[
        {
          label: 'Ver mis trabajos',
          onPress: () => router.navigate('/jobs'),
          testID: 'wallet-denied-jobs',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. La cartera aparece al darse de alta como profesional."
      testID="wallet-denied"
    >
      <ComingSoonPage
        title="Cartera"
        roadmap="la Fase 9 (Pagos y cartera)"
        testID="wallet-tab"
      />
    </RoleGate>
  )
}
