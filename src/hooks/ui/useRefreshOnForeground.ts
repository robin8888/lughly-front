/**
 * useRefreshOnForeground
 * Vuelve a pedir unas consultas cada vez que la app regresa a primer plano.
 *
 * Nació dentro de la cuenta de cobro —`useRefreshAccountStatusOnForeground`—
 * para el caso de salir al navegador de Stripe y volver. Es el mismo problema
 * que tiene todo lo demás: mientras la app está en segundo plano no llega
 * nada, y al volver la pantalla enseña lo que había hace media hora.
 *
 * ## Por qué a mano y no con `refetchOnWindowFocus`
 *
 * React Query sabe hacer esto solo, pero **solo vuelve a pedir lo que está
 * caducado**, y aquí el `staleTime` por defecto son cinco minutos. Volver a la
 * app a los treinta segundos de haberla dejado no pediría nada, que es
 * justamente el rato en el que a uno le contestan un mensaje. Invalidar es más
 * fuerte: marca caducado y pide en el mismo gesto.
 *
 * Y solo pide lo que está montado: las consultas de pantallas que nadie mira
 * se quedan marcadas y se piden cuando se abran.
 */

import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'

export function useRefreshOnForeground(keys: QueryKey[], enabled = true): void {
  const queryClient = useQueryClient()

  /*
    Las claves se comparan por su contenido y no por identidad: quien llame a
    esto va a escribir el array en el cuerpo del componente —`[['jobs']]`— y
    con la identidad se volvería a suscribir en cada pintado.
  */
  const fingerprint = JSON.stringify(keys)

  useEffect(() => {
    if (!enabled) return

    const refresh = () => {
      for (const queryKey of JSON.parse(fingerprint) as QueryKey[]) {
        void queryClient.invalidateQueries({ queryKey })
      }
    }

    // También al montar: entrar en la pantalla es volver a ella.
    refresh()

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh()
    })

    return () => subscription.remove()
  }, [enabled, fingerprint, queryClient])
}
