/**
 * Traduce un ZodError al mapa { campo: mensaje } que consumen los formularios.
 * Se queda con el primer error de cada campo: mostrar varios a la vez satura.
 */

import type { z } from 'zod'

export type FieldErrors<T> = Partial<Record<keyof T & string, string>>

export function toFieldErrors<T>(error: z.ZodError): FieldErrors<T> {
  const errors: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors as FieldErrors<T>
}
