/**
 * Revisiones: /revisiones
 *
 * Solo administradores, como `revisar-documentos`, y por lo mismo: administrar
 * no es una tercera cara del producto —cliente y profesional lo son—, así que
 * aquí no hay «cambiar de modo» que ofrecer.
 *
 * La comprobación de verdad la hace el servidor en cada llamada: `@Roles(ADMIN)`.
 * Esto solo evita llegar a una pantalla que va a devolver 403.
 */

import { useRouter } from 'expo-router'
import { AdminDisputesPage } from '@/pages/AdminDisputesPage'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useUserRole } from '@/stores/useAuthStore'

export default function AdminDisputesRoute() {
  const router = useRouter()
  const role = useUserRole()

  if (role !== 'admin') {
    return (
      <EmptyState
        title="Esta pantalla no es para tu cuenta"
        message="Las revisiones las resuelve el equipo de Lughly. Si tienes un trabajo en revisión, lo verás en su ficha."
        actions={[
          {
            label: 'Volver al inicio',
            onPress: () => router.navigate('/inicio'),
            testID: 'admin-disputes-denied-home',
          },
        ]}
        testID="admin-disputes-denied"
      />
    )
  }

  return <AdminDisputesPage onBack={() => router.navigate('/account')} />
}
