/**
 * usePaymentMethods
 * Las tarjetas guardadas del cliente, y guardar una nueva.
 *
 * Contrato: lughly-backend/src/modules/payments/payments.controller.ts
 *
 * Guardar pasa por el PaymentSheet de Stripe (`useStripe`,
 * `@stripe/stripe-react-native`): el número de tarjeta no pasa por este
 * código ni por el backend de Lughly en ningún momento, solo el
 * `client_secret` del `SetupIntent` que el móvil confirma directamente con
 * Stripe.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useStripe } from '@stripe/stripe-react-native'
import { ApiError, NetworkError } from '@/api'
import { paymentsApi, type ApiPaymentMethod } from '@/api/payments.api'

export function paymentMethodsQueryKey() {
  return ['payments', 'methods'] as const
}

export function usePaymentMethods(enabled = true) {
  return useQuery<ApiPaymentMethod[]>({
    queryKey: paymentMethodsQueryKey(),
    queryFn: () => paymentsApi.methods(),
    enabled,
    staleTime: 30_000,
  })
}

export function useSaveCard() {
  const queryClient = useQueryClient()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const mutation = useMutation({
    /** `true` si de verdad guardó una tarjeta; `false` si el cliente cerró el PaymentSheet sin terminar. */
    mutationFn: async (): Promise<boolean> => {
      const { clientSecret } = await paymentsApi.setupIntent()

      const { error: initError } = await initPaymentSheet({
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: 'Lughly',
      })

      if (initError) throw new Error(initError.message)

      const { error: presentError } = await presentPaymentSheet()

      // Cerrar el PaymentSheet sin terminar no es un fallo que contar
      if (presentError?.code === 'Canceled') return false
      if (presentError) throw new Error(presentError.message)

      return true
    },
    onSuccess: (saved) => {
      if (saved) {
        void queryClient.invalidateQueries({ queryKey: paymentMethodsQueryKey() })
      }
    },
  })

  return {
    save: async (): Promise<{ ok: boolean; error: string | null }> => {
      try {
        const saved = await mutation.mutateAsync()
        return { ok: saved, error: null }
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'No se ha podido guardar la tarjeta.',
        }
      }
    },
    isSaving: mutation.isPending,
  }
}
