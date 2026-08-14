/**
 * useEffectiveRole
 * Qué interfaz se le enseña al usuario: la de cliente o la de profesional.
 *
 * El modo activo (`useRoleStore`) se guarda en el dispositivo y es una
 * preferencia: sirve para que quien opera con las dos facetas alterne entre
 * ellas. Pero NO puede contradecir a la cuenta.
 *
 * Regla: si la cuenta no es de profesional, siempre se ve la interfaz de
 * cliente, diga lo que diga el valor guardado. Sin esto, un cliente que
 * inicie sesión en un móvil donde antes hubo un profesional heredaría su
 * interfaz —sin botón de urgencia y con pestañas que no le corresponden—.
 */

import { useUser } from '@/stores/useAuthStore'
import { useActiveRole } from '@/stores/useRoleStore'

export type EffectiveRole = 'client' | 'pro'

export function useEffectiveRole(): EffectiveRole {
  const user = useUser()
  const activeRole = useActiveRole()

  // Solo una cuenta profesional puede ver la interfaz de profesional
  if (user?.role !== 'pro') return 'client'

  return activeRole === 'pro' ? 'pro' : 'client'
}
