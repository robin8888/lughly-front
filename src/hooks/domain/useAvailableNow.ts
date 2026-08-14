/**
 * useAvailableNow
 * El interruptor de "disponible ahora" del profesional.
 *
 * Se actualiza de forma optimista: un interruptor que tarda medio segundo en
 * moverse se siente roto y la gente lo pulsa dos veces. Se pinta el cambio al
 * instante y, si el servidor lo rechaza, se devuelve a su sitio y se avisa.
 *
 * La fuente de verdad sigue siendo el servidor: este estado sale de la ficha
 * del profesional (`useProProfile`), y al confirmar se actualiza su caché.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import { prosApi, type ApiProDetail } from '@/api/pros.api'
import { proProfileQueryKey } from './useProProfile'

export function useAvailableNow(proId: string | undefined) {
  const queryClient = useQueryClient()
  const key = proProfileQueryKey(proId ?? '')

  const mutation = useMutation({
    mutationFn: (availableNow: boolean) => prosApi.setAvailableNow(availableNow),

    onMutate: async (availableNow) => {
      // Sin esto, una recarga en vuelo podría aterrizar después y pisar
      // el valor que acabamos de pintar.
      await queryClient.cancelQueries({ queryKey: key })

      const previous = queryClient.getQueryData<ApiProDetail>(key)

      queryClient.setQueryData<ApiProDetail>(key, (current) =>
        current ? { ...current, availableNow } : current,
      )

      return { previous }
    },

    onError: (_error, _availableNow, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous)
      }

      Alert.alert(
        'No se ha podido cambiar',
        'Sigue como estaba. Revisa tu conexión e inténtalo de nuevo.',
      )
    },

    onSuccess: (state) => {
      queryClient.setQueryData<ApiProDetail>(key, (current) =>
        current ? { ...current, availableNow: state.availableNow } : current,
      )
    },
  })

  return {
    setAvailableNow: (value: boolean) => mutation.mutate(value),
    isSaving: mutation.isPending,
  }
}
