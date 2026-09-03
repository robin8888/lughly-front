/**
 * usePushNavigation
 * Que tocar un aviso lleve a donde el aviso habla.
 *
 * Va en la raíz, junto a `usePushInvalidation` y `usePushRegistration`: el
 * aviso llega esté donde esté el usuario, así que esto no es de ninguna
 * pantalla.
 *
 * ## Por qué `useLastNotificationResponse` y no un listener
 *
 * Porque el caso que más importa es el que un listener **no ve**: la app
 * cerrada del todo. Tocas «ha terminado tu trabajo» a las once de la noche, la
 * app arranca de cero, y para cuando `addNotificationResponseReceivedListener`
 * queda montado el evento ya ha pasado. `useLastNotificationResponse` guarda la
 * última respuesta y la entrega también en ese arranque en frío, que es
 * justamente cómo se abre una app desde una notificación.
 *
 * ## Y por qué se apunta cuál se ha atendido
 *
 * Porque ese valor **no se limpia**: sigue ahí en cada render mientras la app
 * viva. Sin la marca, cualquier cambio de estado en la raíz volvería a llevar
 * al usuario al trabajo del aviso —incluido cuando ya se ha ido a otra
 * pantalla—, y eso se siente como una app que te secuestra.
 *
 * ## Refrescar y navegar están separados a propósito
 *
 * `usePushInvalidation` se ocupa de que los datos estén al día y **no mueve a
 * nadie**; esto solo mueve. Son dos decisiones distintas: la primera vale
 * siempre, incluso con la app en primer plano y el aviso sin tocar, y la
 * segunda solo cuando alguien ha tocado el aviso a propósito.
 */

import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useIsAuthenticated } from '@/stores/useAuthStore'
import { readPushData } from './pushInvalidation'
import { routeFor } from './pushRoutes'

export function usePushNavigation(): void {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const response = Notifications.useLastNotificationResponse()

  /** Cuál se ha atendido ya, para no volver a llevar a nadie a lo mismo */
  const attended = useRef<string | null>(null)

  useEffect(() => {
    /*
      Sin sesión no se navega: el aviso puede ser de la sesión anterior, y
      llevar a la ficha de un trabajo ajeno acabaría en un 404 o, peor, en la
      pantalla de entrar con una ruta rara detrás.
    */
    if (!isAuthenticated || !response) return

    const id = response.notification.request.identifier
    if (attended.current === id) return
    attended.current = id

    const route = routeFor(readPushData(response.notification.request.content.data))

    // Un aviso que no dice a dónde no mueve a nadie: ver `routeFor`
    if (route) router.navigate(route)
  }, [response, isAuthenticated, router])
}
