/**
 * Cuenta de cobro: /mi-cobro
 *
 * Donde el profesional dice con qué nombre cobra y dónde quiere el dinero.
 * Fuera de las pestañas: se llega desde Mi cuenta, y desde el aviso de que
 * falta.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { PayoutAccountPage } from '@/pages/PayoutAccountPage'

export default function PayoutAccountRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="La cuenta de cobro es del profesional"
      message="Aquí se dice dónde cobrar los trabajos. Como cliente, lo tuyo es la tarjeta con la que pagas, en Pagos y facturas."
      actions={[
        {
          label: 'Mis tarjetas',
          onPress: () => router.navigate('/mis-pagos'),
          testID: 'payout-denied-methods',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente."
      testID="payout-denied"
    >
      <PayoutAccountPage onBack={() => router.back()} />
    </RoleGate>
  )
}
