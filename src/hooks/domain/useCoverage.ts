/**
 * useCoverage
 * ¿La dirección entra en el radio de cobertura del profesional?
 *
 * Se resuelve con `haversineKm`, sin llamar a ningún servicio.
 *
 * **Esto no autoriza nada.** El backend vuelve a comprobar la cobertura al
 * contratar (README §7: en una urgencia solo se avisa a quien cubre la
 * dirección). El hook existe para que el usuario no llegue a un error que ya
 * sabíamos: dejarle rellenar el formulario entero para rechazarlo al final
 * es la peor forma de decírselo.
 */

import { useMemo } from 'react'
import { formatDistance, haversineKm, type LatLng } from '@/utils/geo'

export interface CoverageResult {
  /** El punto cae dentro del radio */
  covered: boolean
  /** Distancia en línea recta, en km */
  distanceKm: number
  /** Frase lista para enseñar */
  label: string
}

export function useCoverage(
  base: LatLng | null | undefined,
  target: LatLng | null | undefined,
  radiusKm: number,
): CoverageResult | null {
  return useMemo(() => {
    if (!base || !target) return null

    const distanceKm = haversineKm(base, target)
    const covered = distanceKm <= radiusKm

    return {
      covered,
      distanceKm,
      label: covered
        ? `Dentro de su zona, a ${formatDistance(distanceKm)}`
        : `Fuera de su zona: está a ${formatDistance(distanceKm)} y cubre hasta ${radiusKm} km`,
    }
  }, [base, target, radiusKm])
}
