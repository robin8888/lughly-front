/**
 * useMyProfile
 * Los datos propios que se piden al registrarse: nombre, teléfono y —si es
 * profesional— la descripción de su trabajo.
 *
 * No había forma de cambiarlos. Se podían cambiar la contraseña, la foto y los
 * oficios, y nada más: quien tecleaba mal su nombre en el alta se quedaba así,
 * y ese nombre sale en su ficha y en los avisos que le llegan al cliente.
 *
 * Al guardar se actualiza también la sesión guardada en el móvil. Si no, la app
 * seguiría saludando con el nombre viejo hasta la siguiente vez que se entrara,
 * y parecería que no se ha guardado.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { meApi } from '@/api/me.api'
import { prosApi } from '@/api/pros.api'
import { useAuthStore } from '@/stores/useAuthStore'

export const myBioQueryKey = ['pro', 'bio'] as const

/** La descripción, solo para profesionales: un cliente no tiene ficha. */
export function useMyBio(enabled = true) {
  return useQuery<{ bio: string | null }>({
    queryKey: myBioQueryKey,
    queryFn: () => prosApi.myBio(),
    enabled,
    staleTime: 60_000,
  })
}

const message = (error: unknown) =>
  error instanceof NetworkError || error instanceof ApiError ? error.message : null

export function useSaveMyProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)

  const profile = useMutation({
    mutationFn: (payload: { name?: string; phone?: string }) =>
      meApi.updateProfile(payload),
    onSuccess: (saved) => {
      // La sesión guardada lleva el nombre: sin esto, la app saluda con el viejo
      updateUser({ name: saved.name, phone: saved.phone })
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
    },
  })

  const bio = useMutation({
    mutationFn: (value: string) => prosApi.setMyBio(value),
    onSuccess: (saved) => {
      queryClient.setQueryData(myBioQueryKey, saved)
      // Sale en su tarjeta del directorio y en su ficha
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'checklist'] })
    },
  })

  return {
    /**
     * Guarda lo que haya cambiado, y solo eso.
     *
     * Son dos peticiones porque son dos cosas distintas del servidor —la
     * persona y su ficha profesional— pero para quien lo usa es un solo botón,
     * así que se cuenta como una sola operación: si falla cualquiera de las
     * dos, se dice que no se ha guardado.
     */
    save: async (changes: {
      name?: string
      phone?: string
      bio?: string
    }): Promise<{ ok: boolean; error: string | null }> => {
      try {
        const person: { name?: string; phone?: string } = {}
        if (changes.name !== undefined) person.name = changes.name
        if (changes.phone !== undefined) person.phone = changes.phone

        if (person.name !== undefined || person.phone !== undefined) {
          await profile.mutateAsync(person)
        }

        if (changes.bio !== undefined) {
          await bio.mutateAsync(changes.bio)
        }

        return { ok: true, error: null }
      } catch (error) {
        return { ok: false, error: message(error) }
      }
    },
    isSaving: profile.isPending || bio.isPending,
  }
}
