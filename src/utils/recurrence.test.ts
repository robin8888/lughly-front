import { describeRecurrence, formatMinuteOfDay, formatWeekdays } from './recurrence'

/**
 * El contrato fijo dicho en una frase.
 *
 * Lo que se ata aquí es el orden de los días. Vienen como los cuenta
 * `Date.getDay()` —0 es domingo— y en España la semana empieza en lunes, así
 * que hay un reordenado en medio que se puede romper sin que dé ningún error:
 * la frase sigue saliendo, solo que dice otra cosa.
 */

describe('describeRecurrence', () => {
  it('dice los días en el orden en que se lee una semana', () => {
    expect(describeRecurrence({ weekdays: [5, 1, 3], startMinute: 600, durationMin: 120 })).toBe(
      'Los lunes, miércoles y viernes, de 10:00 a 12:00',
    )
  })

  /** El domingo va al final, que es donde lo busca quien lo lee */
  it('el domingo cierra la semana, no la abre', () => {
    expect(formatWeekdays([0, 6])).toBe('sábado y domingo')
  })

  it('un solo día no lleva "y"', () => {
    expect(formatWeekdays([2])).toBe('martes')
  })

  /** Sin días no hay frase que decir: devolver "Los , de…" sería peor */
  it('sin días no dice nada', () => {
    expect(describeRecurrence({ weekdays: [], startMinute: 600, durationMin: 60 })).toBe('')
  })

  /**
   * La hora de final se calcula sumando lo que dura, que es la única forma de
   * que no se descuadre con la de empiece.
   */
  it('la hora de final sale de sumar lo que dura', () => {
    expect(describeRecurrence({ weekdays: [1], startMinute: 570, durationMin: 105 })).toBe(
      'Los lunes, de 09:30 a 11:15',
    )
  })

  it('las horas van con dos cifras', () => {
    expect(formatMinuteOfDay(0)).toBe('00:00')
    expect(formatMinuteOfDay(545)).toBe('09:05')
  })
})
