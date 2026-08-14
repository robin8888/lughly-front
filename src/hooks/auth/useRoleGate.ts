/**
 * useRoleGate
 * ¿Le corresponde esta pantalla al modo en el que está el usuario?
 *
 * Esto es **cosmético**, como dice el README: sirve para no enseñar a un
 * profesional el formulario de publicar. La autorización de verdad la hace el
 * backend en cada operación. Un `RoleGate` no protege nada por sí solo; evita
 * que la app enseñe algo que no tiene sentido para quien mira.
 *
 * La distinción importante es entre "modo equivocado" y "cuenta equivocada":
 *
 * - Una cuenta profesional en modo cliente que abre Agenda está en el modo
 *   equivocado: se le ofrece cambiar y ya está.
 * - Una cuenta de cliente que abre Agenda no tiene ningún modo al que
 *   cambiar. Ofrecerle un botón de "cambiar a modo profesional" que no haría
 *   nada sería mentirle: hace falta darse de alta como profesional.
 */

import { useCallback } from 'react'
import { useEffectiveRole, type EffectiveRole } from './useEffectiveRole'
import { useUser } from '@/stores/useAuthStore'
import { useRoleStore } from '@/stores/useRoleStore'

export interface RoleGateResult {
  /** El modo actual coincide con el que pide la pantalla */
  allowed: boolean
  /** El modo en el que está ahora mismo */
  current: EffectiveRole
  /**
   * La cuenta permite ponerse en el modo que pide la pantalla.
   * Falso para una cuenta de cliente ante una pantalla de profesional.
   */
  canSwitch: boolean
  /** Cambia al modo que pide la pantalla. No hace nada si `canSwitch` es falso. */
  switchToRequired: () => void
}

export function useRoleGate(required: EffectiveRole): RoleGateResult {
  const current = useEffectiveRole()
  const user = useUser()
  const setActiveRole = useRoleStore((s) => s.setActiveRole)

  // Solo una cuenta profesional tiene dos modos entre los que alternar.
  const hasBothModes = user?.role === 'pro'
  const canSwitch = required === 'client' ? true : hasBothModes

  const switchToRequired = useCallback(() => {
    if (!canSwitch) return
    setActiveRole(required)
  }, [canSwitch, required, setActiveRole])

  return {
    allowed: current === required,
    current,
    canSwitch,
    switchToRequired,
  }
}
