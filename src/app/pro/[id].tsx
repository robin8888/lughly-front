/**
 * Ficha de un profesional: /pro/<id>.
 *
 * Fuera de `(tabs)` porque no es una pestaña: se llega desde el directorio y
 * se vuelve a él.
 *
 * Reservar y pedir presupuesto llevan al mismo formulario con distinto tipo:
 * lo único que cambia es si se pide precio o se contrata a la tarifa que ya
 * está publicada. La denuncia todavía no tiene pantalla, así que avisa de
 * cuándo llega en vez de no hacer nada: un botón que no responde parece una
 * app rota.
 *
 * **Sin botón de mensaje.** Lo hubo, apuntando a un aviso de "esto llega en
 * la Fase 11" — y se quitó al construir el chat de verdad (22 Ago 2026)
 * porque nunca iba a poder cumplirlo: el chat vive dentro de un encargo
 * (`resolveJobThreadSides` exige un `Job`), y desde esta ficha no hay ningún
 * encargo todavía. Escribir se hace desde la ficha del propio trabajo, una
 * vez pedido — ver `onOpenChat` en `JobDetailPage`.
 */

import { Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ProProfilePage } from '@/pages/ProProfilePage'

function comingSoon(what: string, when: string) {
  Alert.alert(what, `Esta parte se construye en ${when}.`)
}

export default function ProProfileRoute() {
  const router = useRouter()
  const { id, tradeSlug, serviceIds } = useLocalSearchParams<{
    id?: string
    /** Lo que ya se había marcado en la tarjeta del directorio, si venía de ahí */
    tradeSlug?: string
    serviceIds?: string
  }>()

  return (
    <ProProfilePage
      id={id}
      onBack={() => router.navigate('/pros')}
      {...(tradeSlug && {
        initialSelection: {
          tradeSlug,
          serviceIds: serviceIds ? serviceIds.split(',') : [],
        },
      })}
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
      onReport={() => comingSoon('Denunciar perfil', 'una fase posterior')}
    />
  )
}
