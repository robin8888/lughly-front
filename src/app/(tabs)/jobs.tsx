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
        /**
         * Tocar cualquier trabajo lleva a su ficha: qué pasa con él, a quién
         * se espera y quién lo hace. Desde ahí se llega a las pujas si es una
         * subasta, que es donde se comparan y se adjudica.
         *
         * Antes solo las subastas llevaban a alguna parte, y era justo al
         * revés de lo que hacía falta: en una subasta abierta no hay nada que
         * preguntarse, y en un encargo sin respuesta sí.
         */
        onSelectJob={(jobId) =>
          router.navigate({ pathname: '/trabajo/[id]', params: { id: jobId } })
        }
        /*
         * Al directorio con el oficio puesto y sabiendo quién dijo que no,
         * para apagarlo allí. `reassign` lleva el trabajo: lo que se elija se
         * le encarga a él, en vez de crear otro igual.
         *
         * Una urgencia va a otro sitio: a los que están de guardia ahora
         * mismo. Mandarla al directorio sería ofrecerle una lista de gente
         * que quizá conteste mañana para algo que no puede esperar.
         */
        onReassign={(jobId, trade, declinedProId, type) =>
          type === 'URGENT'
            ? router.navigate({
                pathname: '/urgencia/[id]',
                params: { id: jobId },
              })
            : router.navigate({
                pathname: '/pros',
                params: {
                  trade,
                  reassign: jobId,
                  ...(declinedProId ? { declined: declinedProId } : {}),
                },
              })
        }
      />
    </RoleGate>
  )
}
