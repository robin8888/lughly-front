/**
 * Ficha de un profesional: /pro/<id>.
 *
 * Fuera de `(tabs)` porque no es una pestaña: se llega desde el directorio y
 * se vuelve a él.
 *
 * Cada forma de contratar tiene su pantalla, y las tres cobran: por horas
 * (`/reservar-horas`), por carta (`/contratar-carta`) y la visita para
 * presupuesto (`/encargar`). Hasta el 3 de septiembre de 2026 había una cuarta
 * —el encargo genérico, mismo formulario con `type: 'INSTANT'`— que no cobraba
 * nada; era la puerta de atrás de la regla «no hay camino que no cobra» y ya no
 * existe.
 *
 * La denuncia todavía no tiene pantalla, así que avisa de cuándo llega en vez
 * de no hacer nada: un botón que no responde parece una app rota.
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
      onBookHours={(trade) =>
        router.navigate({
          pathname: '/reservar-horas',
          params: { proId: id ?? '', trade },
        })
      }
      /*
        El oficio viaja, y no es un detalle: lo que se contrata aquí es la
        visita, y su precio es del oficio y no del profesional. Quien pone
        bombines y además hace mudanzas no cobra lo mismo por ir a ver una cosa
        que la otra. La ficha ya ha avisado de cuánto cuesta antes de llegar.
      */
      onQuote={(trade) =>
        router.navigate({
          pathname: '/encargar',
          params: { proId: id ?? '', trade },
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
