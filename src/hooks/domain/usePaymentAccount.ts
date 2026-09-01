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

import { useMutation, useQuery } from '@tanstack/react-query'
import { Linking } from 'react-native'
import * as ExpoLinking from 'expo-linking'
import { ApiError, NetworkError } from '@/api'
import { paymentsApi, type ApiAccountStatus } from '@/api/payments.api'
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

export function useRequestOnboardingLink() {
  const mutation = useMutation({
    mutationFn: async () => {
      /**
       * Misma URL para volver y para refrescar: no hay dos pantallas
       * distintas para "terminado" y "sigo a medias", Stripe decide sola
       * cuándo mandar de vuelta.
       */
      const returnUrl = ExpoLinking.createURL('empleados')
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
