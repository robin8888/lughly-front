/**
 * De qué color va el fondo de la tarjeta de un trabajo.
 *
 * Se prueba porque lo usan dos pantallas —la agenda del profesional y la lista
 * del cliente— y porque equivocarse aquí **no se ve**: la tarjeta sale de otro
 * color y nadie lo nota hasta que alguien busca un trabajo en curso y no lo
 * distingue de uno terminado.
 *
 * Lo que se ata es el reparto en cuatro señales, que es la decisión de fondo:
 * un color por cada uno de los trece estados no sería una señal, sería un
 * arcoíris.
 */

import { jobTint } from './jobStatus'

describe('jobTint', () => {
  it('lo cerrado y por delante, en su color', () => {
    expect(jobTint('CONTRACTED')).toBe('contracted')
  })

  it('lo que está pasando ahora mismo, en el suyo', () => {
    expect(jobTint('IN_PROGRESS')).toBe('inProgress')
  })

  /**
   * Terminado, cancelado y cerrado sin trato son tres finales distintos y una
   * sola señal: ninguno pide nada. Lo que hay que distinguir de lejos no es
   * cómo acabó, es que ya no hay que hacer nada con él.
   */
  it('todo lo que ya no pide nada comparte el gris', () => {
    expect(jobTint('COMPLETED')).toBe('done')
    expect(jobTint('CANCELLED')).toBe('done')
    expect(jobTint('CLOSED')).toBe('done')
  })

  /**
   * Y lo que espera a otro se queda en blanco, que es el reposo. Si todo
   * llevara color, ninguno destacaría — que es exactamente lo que pasa hoy con
   * diez tarjetas blancas, al revés.
   */
  it('lo que espera a otro no se tiñe', () => {
    expect(jobTint('PENDING_PRO')).toBe('none')
    expect(jobTint('OPEN')).toBe('none')
    expect(jobTint('QUOTED')).toBe('none')
    expect(jobTint('DRAFT')).toBe('none')
  })

  /**
   * Lo rechazado y lo caducado tampoco se tiñen aquí, y no es un olvido: eso
   * **te espera a ti**, y quien pinta la tarjeta lo marca en naranja por su
   * cuenta. Depende de más cosas que el estado —una urgencia abierta también
   * espera— así que la decisión no cabe en esta tabla.
   */
  it('lo que te espera a ti lo decide quien pinta, no esto', () => {
    expect(jobTint('DECLINED')).toBe('none')
    expect(jobTint('EXPIRED')).toBe('none')
  })
})
