/**
 * Revisar documentos: /revisar-documentos
 *
 * Solo administradores. No lleva `RoleGate` porque ese componente reparte entre
 * cliente y profesional —son las dos caras del producto— y administrador no es
 * una tercera cara: es otra cosa. Aquí no hay "cambiar de modo" que ofrecer.
 *
 * La comprobación de verdad la hace el servidor en cada llamada: `@Roles(ADMIN)`.
 * Esto solo evita que alguien llegue a una pantalla que le va a devolver 403.
 */

import { useRouter } from 'expo-router'
import { AdminDocumentsPage } from '@/pages/AdminDocumentsPage'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useUserRole } from '@/stores/useAuthStore'

export default function AdminDocumentsRoute() {
  const router = useRouter()
  const role = useUserRole()

  if (role !== 'admin') {
    return (
      <EmptyState
        title="Esta pantalla no es para tu cuenta"
        message="La revisión de documentos la hace el equipo de Lughly. Si has llegado aquí por un enlace, vuelve al inicio."
        illustration="none"
        actions={[
          {
            label: 'Volver al inicio',
            onPress: () => router.navigate('/inicio'),
            testID: 'admin-denied-home',
          },
        ]}
        testID="admin-documents-denied"
      />
    )
  }

  return <AdminDocumentsPage onBack={() => router.navigate('/account')} />
}
