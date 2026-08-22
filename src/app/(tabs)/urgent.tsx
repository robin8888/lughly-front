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
      onPublished={(jobId, photosFailed) => {
        /*
          Solo se avisa si algo salió mal. Antes salía un aviso siempre —"ya
          estamos avisando a los disponibles"— y era un paso de nada en medio
          de una urgencia; ahora lo siguiente es elegir a quién llamar, y una
          ventana por delante solo estorba.
        */
        if (photosFailed > 0) {
          Alert.alert(
            'Publicada, pero faltan fotos',
            photosFailed === 1
              ? 'Una foto no se pudo enviar. Sigue adelante y elige profesional.'
              : `${photosFailed} fotos no se pudieron enviar. Sigue adelante y elige profesional.`,
          )
        }

        router.navigate({ pathname: '/urgencia/[id]', params: { id: jobId } })
      }}
      onPublishNormal={() => router.navigate('/pros')}
      onBack={() => router.navigate('/inicio')}
    />
  )
}
