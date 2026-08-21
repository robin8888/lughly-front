/**
 * Ficha de un profesional: /pro/<id>.
 *
 * Fuera de `(tabs)` porque no es una pestaña: se llega desde el directorio y
 * se vuelve a él.
 *
 * Reservar y pedir presupuesto llevan al mismo formulario con distinto tipo:
 * lo único que cambia es si se pide precio o se contrata a la tarifa que ya
 * está publicada. Mensajes y denuncia todavía no tienen pantalla, así que
 * avisan de cuándo llegan en vez de no hacer nada: un botón que no responde
 * parece una app rota.
 */

import { Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ProProfilePage } from '@/pages/ProProfilePage'

function comingSoon(what: string, when: string) {
  Alert.alert(what, `Esta parte se construye en ${when}.`)
}

export default function ProProfileRoute() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()

  return (
    <ProProfilePage
      id={id}
      onBack={() => router.navigate('/pros')}
      onBook={() =>
        router.navigate({
          pathname: '/encargar',
          params: { proId: id ?? '', type: 'INSTANT' },
        })
      }
      onQuote={() =>
        router.navigate({
          pathname: '/encargar',
          params: { proId: id ?? '', type: 'QUOTE' },
        })
      }
      onHireCarta={(tradeSlug, serviceIds) =>
        router.navigate({
          pathname: '/contratar-carta',
          params: { proId: id ?? '', tradeSlug, serviceIds: serviceIds.join(',') },
        })
      }
      onMessage={() => comingSoon('Enviar mensaje', 'la Fase 11 (chat)')}
      onReport={() => comingSoon('Denunciar perfil', 'una fase posterior')}
    />
  )
}
