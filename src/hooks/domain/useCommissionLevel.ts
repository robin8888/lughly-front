/**
 * useCommissionLevel
 * Su nivel de comisión y cuánto le falta para el siguiente.
 *
 * Contrato: lughly-backend/src/modules/payments/payments.controller.ts
 *
 * **Existe porque un descuento que nadie sabe que existe no incentiva nada**
 * (`COMO_SE_CONTRATA.md` §12.6). Lo que de verdad se viene a buscar aquí es
 * `missingToNext`.
 *
 * Los porcentajes y los rótulos llegan del servidor y **no se escriben en el
 * móvil**: un número pintado a mano que no coincida con el que se cobra es la
 * peor clase de error, porque nadie lo mira hasta que alguien reclama.
 */

import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/api'
import { paymentsApi, type ApiCommissionLevelState } from '@/api/payments.api'

export function commissionLevelQueryKey() {
  return ['payments', 'commission-level'] as const
}

export function useCommissionLevel(enabled = true) {
  const query = useQuery<ApiCommissionLevelState>({
    queryKey: commissionLevelQueryKey(),
    queryFn: () => paymentsApi.commissionLevel(),
    enabled,
    /**
     * Un minuto. El nivel solo cambia el día 1 de cada mes, pero el volumen
     * sube con cada trabajo que se da por bueno, y esa es la cifra que se viene
     * a mirar.
     */
    staleTime: 60_000,
    /*
      Un 404 aquí no es un fallo, es una respuesta: no tiene cuenta de cobro
      propia. Reintentarlo tres veces solo retrasa el mensaje que hay que
      enseñarle.
    */
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 2,
  })

  /**
   * Sin cuenta de cobro propia: o es un trabajador por cuenta ajena —cuya
   * comisión paga su empresa— o todavía no la ha activado. Se distingue del
   * error de verdad porque lo que hay que enseñarle no se parece en nada.
   */
  const withoutAccount = query.error instanceof ApiError && query.error.status === 404

  return { ...query, withoutAccount }
}
