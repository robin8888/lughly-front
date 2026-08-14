/**
 * Error de API.
 *
 * El backend responde siempre con la misma forma:
 *   { code, message, details?, meta?, requestId? }
 *
 * `code` es estable y es lo que debe mirar la app; `message` ya viene en
 * español y se puede enseñar tal cual al usuario.
 */

export interface ApiErrorDetail {
  field: string
  message: string
}

export interface ApiErrorBody {
  code?: string
  message?: string
  details?: ApiErrorDetail[]
  meta?: Record<string, unknown>
  requestId?: string
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details: ApiErrorDetail[]
  readonly meta?: Record<string, unknown>
  readonly requestId?: string

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? 'No hemos podido completar la operación.')
    this.name = 'ApiError'
    this.status = status
    this.code = body.code ?? 'ERROR'
    this.details = body.details ?? []
    this.meta = body.meta
    this.requestId = body.requestId
  }

  /** Errores de validación mapeados a { campo: mensaje } para el formulario. */
  toFieldErrors<T>(): Partial<Record<keyof T & string, string>> {
    const errors: Record<string, string> = {}

    for (const detail of this.details) {
      if (!errors[detail.field]) {
        errors[detail.field] = detail.message
      }
    }

    return errors as Partial<Record<keyof T & string, string>>
  }
}

/** Fallo de red o timeout: ni siquiera hubo respuesta del servidor. */
export class NetworkError extends Error {
  constructor(message = 'No hay conexión con el servidor. Revisa tu red.') {
    super(message)
    this.name = 'NetworkError'
  }
}
