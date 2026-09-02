/**
 * usePaymentAccount
 * La cuenta de cobro (Stripe Connect) del `Employer`.
 *
 * Contrato: lughly-backend/src/modules/payments/payments.controller.ts
 *
 * El estado no llega por webhook: las cuentas v2 `recipient` no avisan por el
 * `account.updated` clásico (ver `RefreshAccountStatusUseCase` en el
 * backend), así que hay que preguntarle a Stripe a demanda. Se hace al
 * montar y cada vez que la app vuelve a primer plano, que es como se vuelve
 * del navegador tras completar el onboarding — mismo patrón que
 * `useRefreshUserOnForeground` para confirmar el correo.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Linking } from 'react-native'
import * as ExpoLinking from 'expo-linking'
import { ApiError, NetworkError } from '@/api'
import {
  paymentsApi,
  type ApiAccountStatus,
  type ApiBillingIdentity,
  type BillingIdentityPayload,
} from '@/api/payments.api'
import type { FieldErrors } from '@/utils/formErrors'
import { useRefreshOnForeground } from '@/hooks/ui/useRefreshOnForeground'

export function accountStatusQueryKey() {
  return ['payments', 'account-status'] as const
}

export function useAccountStatus(enabled = true) {
  return useQuery<ApiAccountStatus>({
    queryKey: accountStatusQueryKey(),
    queryFn: () => paymentsApi.accountStatus(),
    enabled,
    staleTime: 15_000,
  })
}

/**
 * Refresca al montar y cada vez que la app vuelve a primer plano. Cubre el
 * flujo de onboarding: el empleador sale al navegador, completa sus datos
 * bancarios en Stripe y vuelve; al volver, la app se entera sin que haga
 * falta pulsar nada.
 *
 * El mecanismo se mudó a `useRefreshOnForeground`, que es el mismo que ahora
 * usa todo lo que caduca solo. Esto se queda como el nombre con el que se lee
 * en la pantalla de empleados: lo que se refresca ahí es "el estado de la
 * cuenta", no "unas claves".
 */
export function useRefreshAccountStatusOnForeground(enabled: boolean): void {
  useRefreshOnForeground([accountStatusQueryKey()], enabled)
}

/**
 * Los datos fiscales con los que cobra, y guardarlos.
 *
 * Es el paso de antes del enlace de Stripe: la cuenta se abre a nombre de
 * estos datos, y sin ellos no hay a quién abrírsela. Hasta hoy solo se podían
 * dar declarándose con gente a cargo, así que el autónomo que trabaja solo se
 * quedaba sin cuenta de cobro y sin forma de conseguirla.
 */
export function billingIdentityQueryKey() {
  return ['payments', 'identity'] as const
}

export function useBillingIdentity(enabled = true) {
  return useQuery<ApiBillingIdentity | null>({
    queryKey: billingIdentityQueryKey(),
    queryFn: () => paymentsApi.identity(),
    enabled,
    staleTime: 30_000,
  })
}

export function useSaveBillingIdentity() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: BillingIdentityPayload) => paymentsApi.setIdentity(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: billingIdentityQueryKey() })
      /*
        Y el estado de la cuenta: al guardar los datos ya hay `Employer`, así
        que la consulta que antes devolvía "no eres empleador" ahora contesta.
      */
      void queryClient.invalidateQueries({ queryKey: accountStatusQueryKey() })
    },
  })

  const error = mutation.error

  return {
    save: async (payload: BillingIdentityPayload): Promise<boolean> => {
      try {
        await mutation.mutateAsync(payload)
        return true
      } catch {
        return false
      }
    },
    isSaving: mutation.isPending,
    fieldErrors:
      error instanceof ApiError
        ? error.toFieldErrors<BillingIdentityPayload>()
        : ({} as FieldErrors<BillingIdentityPayload>),
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}

export function useRequestOnboardingLink(returnTo = 'mi-cobro') {
  const mutation = useMutation({
    mutationFn: async () => {
      /**
       * Misma URL para volver y para refrescar: no hay dos pantallas
       * distintas para "terminado" y "sigo a medias", Stripe decide sola
       * cuándo mandar de vuelta.
       */
      const returnUrl = ExpoLinking.createURL(returnTo)
      const { url } = await paymentsApi.onboardingLink(returnUrl, returnUrl)
      return url
    },
  })

  return {
    start: async (): Promise<{ ok: boolean; error: string | null }> => {
      try {
        const url = await mutation.mutateAsync()
        await Linking.openURL(url)
        return { ok: true, error: null }
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : 'No se ha podido abrir la cuenta de cobro.',
        }
      }
    },
    isStarting: mutation.isPending,
  }
}
