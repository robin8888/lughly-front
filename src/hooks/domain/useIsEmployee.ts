/**
 * useIsEmployee
 * Si quien está dentro trabaja para otro.
 *
 * No es un rol ni un permiso: es un dato de su ficha. Un empleado es un
 * profesional normal salvo en lo económico, que pertenece a su empleador —
 * él no ve por cuánto se cerró un trabajo ni cuál es su tarifa, y las
 * facturas no van a su nombre.
 *
 * Sale de la ficha del profesional, que ya se pide en su inicio: aquí solo
 * se lee la caché de esa consulta, no hay una petición nueva.
 */

import { useProProfile } from './useProProfile'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { useUser } from '@/stores/useAuthStore'

export function useIsEmployee(): boolean {
  const user = useUser()
  const role = useEffectiveRole()

  // Un cliente nunca es empleado de nadie: sin esto se pediría una ficha
  // profesional que no existe y el backend respondería 404.
  const { data } = useProProfile(role === 'pro' ? user?.id : undefined)

  return data?.employerName != null
}
