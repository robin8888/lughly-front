/**
 * Tab Mis trabajos, solo para modo cliente.
 *
 * Son los trabajos que uno ha CONTRATADO. Los que un profesional ejecuta
 * viven en su agenda, que es otra pantalla.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { MyJobsPage } from '@/pages/MyJobsPage'

export default function JobsRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="client"
      title="Aquí van los trabajos que contratas"
      message="Estás en modo profesional. Los encargos que tú ejecutas se gestionan desde tu agenda; esta pantalla es la del cliente que contrata."
      actions={[
        {
          label: 'Ir a mi agenda',
          onPress: () => router.navigate('/schedule'),
          testID: 'jobs-denied-schedule',
        },
      ]}
      testID="jobs-denied"
    >
      <MyJobsPage
        onPublish={() => router.navigate('/publish')}
        onBack={() => router.navigate('/inicio')}
      />
    </RoleGate>
  )
}
