/**
 * Tab Urgente, solo para modo cliente.
 * Texto del bloqueo: MobileApp.dc.html (`isUrgenciaDenied`).
 */

import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { UrgencyPage } from '@/pages/UrgencyPage'

export default function UrgentRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="client"
      title="Las urgencias las publica el cliente"
      message="Estás en modo profesional: tú recibes los avisos de urgencia cuando estás disponible. Si además quieres contratar, cambia a modo cliente."
      actions={[
        {
          label: 'Ver trabajos disponibles',
          onPress: () => router.navigate('/offers'),
          testID: 'urgent-denied-offers',
        },
        {
          label: 'Activar "disponible ahora"',
          onPress: () => router.navigate('/inicio'),
          testID: 'urgent-denied-available',
        },
      ]}
      testID="urgent-denied"
    >
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
    </RoleGate>
  )
}
