/**
 * useEmployees / useEmployer
 * Los trabajadores a cargo y los datos fiscales de quien los tiene.
 *
 * `useEmployer` devuelve null cuando no tiene gente a cargo, que es el caso
 * normal: casi todos los profesionales trabajan solos. Por eso no falla ni
 * reintenta, simplemente no hay empleador.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import {
  employeesApi,
  type ApiEmployee,
  type ApiEmployer,
  type BecomeEmployerPayload,
  type CreateEmployeePayload,
} from '@/api/employees.api'

export function employerQueryKey() {
  return ['employer'] as const
}

export function employeesQueryKey() {
  return ['employees'] as const
}

export function useEmployer(enabled = true) {
  return useQuery<{ employer: ApiEmployer | null }>({
    queryKey: employerQueryKey(),
    queryFn: () => employeesApi.employer(),
    enabled,
    staleTime: 60_000,
  })
}

export function useEmployees(enabled = true) {
  return useQuery<{ items: ApiEmployee[] }>({
    queryKey: employeesQueryKey(),
    queryFn: () => employeesApi.list(),
    enabled,
    staleTime: 30_000,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeesApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey() })
      /**
       * También el empleador: sus oficios se derivan de los trabajadores, así
       * que dar de alta a uno puede añadir un oficio nuevo a la empresa.
       */
      void queryClient.invalidateQueries({ queryKey: employerQueryKey() })
    },
  })

  const error = mutation.error

  return {
    create: async (payload: CreateEmployeePayload): Promise<ApiEmployee | null> => {
      try {
        return await mutation.mutateAsync(payload)
      } catch {
        return null
      }
    },
    isCreating: mutation.isPending,
    fieldErrors:
      error instanceof ApiError ? error.toFieldErrors<CreateEmployeePayload>() : {},
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}

export function useBecomeEmployer() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: BecomeEmployerPayload) => employeesApi.declare(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employerQueryKey() })
    },
  })

  const error = mutation.error

  return {
    declare: async (payload: BecomeEmployerPayload): Promise<ApiEmployer | null> => {
      try {
        return await mutation.mutateAsync(payload)
      } catch {
        return null
      }
    },
    isDeclaring: mutation.isPending,
    fieldErrors:
      error instanceof ApiError ? error.toFieldErrors<BecomeEmployerPayload>() : {},
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
