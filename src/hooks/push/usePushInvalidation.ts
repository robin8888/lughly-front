/**
 * usePushInvalidation
 * Que la app se entere sola de lo que le cuentan los avisos.
 *
 * Va en la raíz, junto a `usePushRegistration`: no es de ninguna pantalla —el
 * aviso llega esté donde esté el usuario— y tiene que estar escuchando desde
 * que hay sesión.
 *
 * Escucha las dos cosas que pueden pasar con una notificación, porque no son
 * la misma:
 *
 * - **Llega con la app abierta.** Es el caso que arregla lo que se veía roto:
 *   estás mirando tu trabajo, el profesional pulsa "he terminado", y hasta
 *   ahora la pantalla se quedaba igual hasta que salías y volvías.
 * - **El usuario la toca** desde el sistema. La app se abre o vuelve, y lo que
 *   enseñe tiene que estar al día en ese primer pintado, no un segundo
 *   después.
 *
 * Lo que **no** hace todavía es navegar. `data.screen` dice a dónde llevar al
 * usuario, y llevarle es otra decisión —a qué pestaña, qué pasa si está a
 * medias de escribir algo— que se toma cuando toque. Refrescar es lo que
 * arregla el fallo de hoy y no se lleva a nadie de donde estaba.
 */

import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useIsAuthenticated } from '@/stores/useAuthStore'
import { keysToInvalidate } from './pushInvalidation'

export function usePushInvalidation(): void {
  const queryClient = useQueryClient()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    /*
      Sin sesión no hay nada que refrescar, y las consultas ni siquiera están
      montadas. Un aviso que llegue justo al salir no debe disparar peticiones
      con la sesión ya limpiada.
    */
    if (!isAuthenticated) return

    const refresh = (data: unknown) => {
      for (const queryKey of keysToInvalidate(data)) {
        void queryClient.invalidateQueries({ queryKey })
      }
    }

    const received = Notifications.addNotificationReceivedListener((notification) => {
      refresh(notification.request.content.data)
    })

    const tapped = Notifications.addNotificationResponseReceivedListener((response) => {
      refresh(response.notification.request.content.data)
    })

    return () => {
      received.remove()
      tapped.remove()
    }
  }, [isAuthenticated, queryClient])
}
