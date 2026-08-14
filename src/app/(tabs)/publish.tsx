/**
 * Tab Publicar, solo para modo cliente.
 * Texto del bloqueo: MobileApp.dc.html (`isPublicarDenied`).
 */

import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { PublishPage } from '@/pages/PublishPage'

export default function PublishRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="client"
      title="Publicar es cosa del cliente"
      message="Estás en modo profesional: aquí tu sitio es pujar por los trabajos publicados. Si además quieres contratar a alguien, cambia a modo cliente."
      actions={[
        {
          label: 'Ver trabajos disponibles',
          onPress: () => router.navigate('/offers'),
          testID: 'publish-denied-offers',
        },
      ]}
      testID="publish-denied"
    >
      <PublishPage
        onPublished={(_jobId, photosFailed) => {
          /**
           * El detalle del trabajo aún no existe (Fase 10), así que se lleva
           * a la lista, que sí. Avisar y navegar es mejor que dejar al
           * usuario en el formulario ya vacío preguntándose si se envió.
           *
           * Si alguna foto no subió se dice, pero sin alarmar: el trabajo
           * está publicado y eso es lo que importaba.
           */
          Alert.alert(
            'Trabajo publicado',
            photosFailed > 0
              ? `Ya lo pueden ver los profesionales. ${photosFailed === 1 ? 'Una foto no se pudo enviar' : `${photosFailed} fotos no se pudieron enviar`}; puedes añadirlas más tarde.`
              : 'Ya lo pueden ver los profesionales. Te avisaremos en cuanto recibas la primera puja.',
          )
          router.navigate('/jobs')
        }}
        onUrgent={() => router.navigate('/urgent')}
        onBack={() => router.navigate('/inicio')}
      />
    </RoleGate>
  )
}
