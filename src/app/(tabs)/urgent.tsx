/**
 * Tab Urgente.
 *
 * Las dos caras de la urgencia según quién mire, y por eso aquí no hay
 * `RoleGate`: el profesional no está "bloqueado", tiene su propia pantalla.
 * Bloquearle sería absurdo, porque las urgencias le importan más a él que a
 * nadie: es quien cobra el recargo por salir corriendo.
 */

import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { UrgencyPage } from '@/pages/UrgencyPage'
import { ProUrgenciesPage } from '@/pages/ProUrgenciesPage'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { useUser } from '@/stores/useAuthStore'

export default function UrgentRoute() {
  const router = useRouter()
  const role = useEffectiveRole()
  const user = useUser()

  if (role === 'pro') {
    return (
      <ProUrgenciesPage
        userId={user?.id}
        onBack={() => router.navigate('/inicio')}
        // El interruptor de "disponible ahora" vive en su inicio
        onGoAvailability={() => router.navigate('/inicio')}
      />
    )
  }

  return (
    <UrgencyPage
      onPublished={(_jobId, photosFailed) => {
        Alert.alert(
          'Aviso enviado',
          photosFailed > 0
            ? `Ya estamos avisando a los profesionales disponibles. ${photosFailed === 1 ? 'Una foto no se pudo enviar' : `${photosFailed} fotos no se pudieron enviar`}.`
            : 'Ya estamos avisando a los profesionales disponibles de tu zona. Cada uno tiene 30 minutos para aceptar.',
        )
        router.navigate('/jobs')
      }}
      onPublishNormal={() => router.navigate('/publish')}
      onBack={() => router.navigate('/inicio')}
    />
  )
}
