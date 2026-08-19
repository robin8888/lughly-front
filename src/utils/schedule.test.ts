/**
 * El horario, tal y como se lee en una ficha.
 *
 * Lo que se ata es que salgan los siete días. Enseñar solo los que trabaja
 * obliga a quien lo lee a deducir el resto, y en un cartel de horarios lo que
 * no está escrito se lee como un descuido, no como "cerrado".
 */

import { toWeekSchedule } from './schedule'

describe('toWeekSchedule', () => {
  it('empieza en lunes y termina en domingo, como en España', () => {
    const week = toWeekSchedule([])

    expect(week.map((day) => day.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0])
  })

  it('junta las franjas del mismo día en una línea', () => {
    const week = toWeekSchedule([
      { weekday: 1, from: '09:00', to: '14:00' },
      { weekday: 1, from: '16:00', to: '20:00' },
    ])

    expect(week[0]?.hours).toBe('09:00 - 14:00 · 16:00 - 20:00')
  })

  it('el día sin horas se queda en null, para poder decir "cerrado"', () => {
    const week = toWeekSchedule([{ weekday: 1, from: '09:00', to: '14:00' }])

    expect(week[0]?.hours).toBe('09:00 - 14:00')
    expect(week[1]?.hours).toBeNull()
  })

  it('el turno de noche se lee en los dos días que ocupa', () => {
    /*
     * Llega partido porque así se guarda, y así se lee mejor: cada día dice a
     * qué hora se le puede llamar, que es la pregunta que trae quien mira.
     */
    const week = toWeekSchedule([
      { weekday: 5, from: '22:00', to: '00:00' },
      { weekday: 6, from: '00:00', to: '06:00' },
    ])

    expect(week[4]?.hours).toBe('22:00 - 00:00')
    expect(week[5]?.hours).toBe('00:00 - 06:00')
  })

  it('el domingo va el último aunque el servidor lo cuente como día cero', () => {
    const week = toWeekSchedule([{ weekday: 0, from: '10:00', to: '14:00' }])

    expect(week[6]?.hours).toBe('10:00 - 14:00')
  })
})
