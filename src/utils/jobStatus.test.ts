/**
 * De qué color va el fondo de la tarjeta de un trabajo.
 *
 * Se prueba porque lo usan dos pantallas —la agenda del profesional y la lista
 * del cliente— y porque equivocarse aquí **no se ve**: la tarjeta sale de otro
 * color y nadie lo nota hasta que alguien busca un trabajo en curso y no lo
 * distingue de uno terminado.
 *
 * Lo que se ata es el reparto en familias, que es la decisión de fondo. Eran
 * cuatro hasta el 8 de septiembre de 2026 y tres cuartas partes de los estados
 * caían en «gris» o en «sin color»: una lista con unos meses encima era una
 * pared gris. Ahora son seis, una por cada cosa distinta que puede pasarte —y
 * no trece, una por estado, que no sería una señal sino un arcoíris—.
 */

import { jobTint, JOB_TINT_COLORS, type JobTint } from './jobStatus'
import type { ApiJobStatus } from '@/api/jobs.api'

describe('jobTint', () => {
  it('lo cerrado y por delante, en su color', () => {
    expect(jobTint('CONTRACTED')).toBe('contracted')
  })

  it('lo que está pasando ahora mismo, en el suyo', () => {
    expect(jobTint('IN_PROGRESS')).toBe('inProgress')
  })

  /**
   * Terminado deja de ser gris. Era el caso más común de todos —cualquier
   * cuenta con unos meses tiene la lista llena de ellos— y compartía color con
   * lo cancelado y lo caducado, que no se parecen en nada: uno salió bien.
   */
  it('lo terminado tiene su propio color, y ya no es el gris', () => {
    expect(jobTint('COMPLETED')).toBe('completed')
    expect(jobTint('COMPLETED')).not.toBe(jobTint('CANCELLED'))
    expect(jobTint('COMPLETED')).not.toBe(jobTint('EXPIRED'))
  })

  /** Lo que se torció, junto: alguien dijo que no, o se rompió por el camino */
  it('lo que se torció comparte el rojo', () => {
    expect(jobTint('CANCELLED')).toBe('failed')
    expect(jobTint('DECLINED')).toBe('failed')
    expect(jobTint('QUOTE_REJECTED')).toBe('failed')
    expect(jobTint('DISPUTED')).toBe('failed')
  })

  /** Y lo que se apagó solo, sin que nadie decidiera nada */
  it('lo que se apagó solo se queda gris', () => {
    expect(jobTint('EXPIRED')).toBe('expired')
    expect(jobTint('CLOSED')).toBe('expired')
  })

  it('lo que está en el aire esperando a otro, en azul claro', () => {
    expect(jobTint('OPEN')).toBe('open')
    expect(jobTint('PENDING_PRO')).toBe('open')
    expect(jobTint('DRAFT')).toBe('open')
  })

  /**
   * Un presupuesto encima de la mesa es lo único de esta tabla que **te espera
   * a ti**. El resto de "te toca" —se quedó sin nadie, una urgencia sin
   * elegir— lo marca quien pinta la tarjeta, porque depende de más cosas que
   * el estado y no cabe aquí.
   */
  it('el presupuesto sin contestar te espera a ti', () => {
    expect(jobTint('QUOTED')).toBe('waiting')
  })

  /**
   * Ningún estado se queda sin color, que es justo el fallo que esto arregla.
   * La lista va escrita a mano a propósito: si mañana se añade uno al enum,
   * este test **no** se entera —`jobTint` sí, porque el `switch` es exhaustivo
   * y TypeScript no deja compilar sin él—, así que lo que se comprueba aquí es
   * que ninguno de los que hay hoy devuelva algo sin color.
   */
  it('todos los estados tienen su color', () => {
    const TODOS: ApiJobStatus[] = [
      'DRAFT',
      'OPEN',
      'PENDING_PRO',
      'CONTRACTED',
      'QUOTED',
      'QUOTE_REJECTED',
      'IN_PROGRESS',
      'COMPLETED',
      'CLOSED',
      'DISPUTED',
      'EXPIRED',
      'DECLINED',
      'CANCELLED',
    ]

    for (const status of TODOS) {
      const tinte: JobTint = jobTint(status)
      expect(JOB_TINT_COLORS[tinte]).toBeDefined()
      expect(JOB_TINT_COLORS[tinte].backgroundColor).toMatch(/^#/)
    }
  })

  /**
   * Y dos familias no pueden acabar del mismo color: sería volver a tener
   * cuatro señales con nombres de seis. Ha estado a punto de pasar —`accent100`
   * y `accent2100` son el mismo hexadecimal—.
   */
  it('no hay dos familias del mismo color', () => {
    const fondos = Object.values(JOB_TINT_COLORS).map((c) => c.backgroundColor)

    expect(new Set(fondos).size).toBe(fondos.length)
  })
})
