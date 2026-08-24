import {
  addDays,
  atTime,
  formatDate,
  formatDateTime,
  formatDaySeparator,
  formatLongDate,
  formatJobWhen,
  formatLongDateTime,
  formatMessageTime,
  formatTime,
  parseIsoDate,
  parseIsoDateTime,
  timeLeft,
  toIsoDate,
  toIsoDateTime,
} from './dates'

/**
 * Las fechas se construyen con `new Date(año, mes, día…)`, que interpreta las
 * partes en la hora del dispositivo. Es a propósito: es lo mismo que hace la
 * app y lo que ve el usuario en su reloj.
 */

describe('formatDate', () => {
  it('usa el orden español, día antes que mes', () => {
    expect(formatDate(new Date(2026, 7, 16))).toBe('16/08/2026')
  })

  /**
   * El caso que delata un formato americano: el 3 de abril y el 4 de marzo
   * se escriben igual al revés, y nadie nota el error hasta que aparece un
   * profesional un mes tarde.
   */
  it('el 3 de abril no es el 4 de marzo', () => {
    expect(formatDate(new Date(2026, 3, 3))).toBe('03/04/2026')
    expect(formatDate(new Date(2026, 2, 4))).toBe('04/03/2026')
  })

  it('rellena con cero a la izquierda', () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe('01/01/2026')
  })
})

describe('formatTime', () => {
  it('usa 24 horas', () => {
    expect(formatTime(new Date(2026, 7, 16, 22, 5))).toBe('22:05')
    expect(formatTime(new Date(2026, 7, 16, 9, 0))).toBe('09:00')
  })

  it('la medianoche es 00:00, no 24:00 ni 12:00 AM', () => {
    expect(formatTime(new Date(2026, 7, 16, 0, 0))).toBe('00:00')
  })

  it('el mediodía es 12:00', () => {
    expect(formatTime(new Date(2026, 7, 16, 12, 0))).toBe('12:00')
  })
})

describe('formatMessageTime', () => {
  const now = new Date(2026, 7, 16, 18, 30)

  it('la hora si es de hoy', () => {
    expect(formatMessageTime(new Date(2026, 7, 16, 9, 5), now)).toBe('09:05')
  })

  it('la fecha corta, sin año, si es de otro día', () => {
    expect(formatMessageTime(new Date(2026, 7, 15, 23, 59), now)).toBe('15/08')
  })

  it('un día antes a medianoche ya no es hoy', () => {
    expect(formatMessageTime(new Date(2026, 6, 31, 23, 59), now)).toBe('31/07')
  })
})

describe('formatDaySeparator', () => {
  const now = new Date(2026, 7, 16, 18, 30)

  it('"Hoy" para el mismo día', () => {
    expect(formatDaySeparator(new Date(2026, 7, 16, 9, 5), now)).toBe('Hoy')
  })

  it('"Ayer" para el día anterior', () => {
    expect(formatDaySeparator(new Date(2026, 7, 15, 23, 59), now)).toBe('Ayer')
  })

  it('un día antes a medianoche ya no es hoy', () => {
    expect(formatDaySeparator(new Date(2026, 6, 31, 23, 59), now)).toBe('31 de julio')
  })

  it('sin año si es el actual', () => {
    expect(formatDaySeparator(new Date(2026, 6, 20), now)).toBe('20 de julio')
  })

  it('con año si no es el actual', () => {
    expect(formatDaySeparator(new Date(2025, 7, 16), now)).toBe('16 de agosto de 2025')
  })
})

describe('formatDateTime', () => {
  it('junta fecha y hora', () => {
    expect(formatDateTime(new Date(2026, 7, 16, 22, 5))).toBe('16/08/2026, 22:05')
  })
})

describe('formatLongDate', () => {
  it('escribe el día de la semana y el mes en español', () => {
    // 16 de agosto de 2026 es domingo
    expect(formatLongDate(new Date(2026, 7, 16))).toBe('domingo, 16 de agosto')
  })

  it('lleva las tildes de miércoles y sábado', () => {
    expect(formatLongDate(new Date(2026, 7, 12))).toBe('miércoles, 12 de agosto')
    expect(formatLongDate(new Date(2026, 7, 15))).toBe('sábado, 15 de agosto')
  })

  it('no pone el día del mes con cero delante', () => {
    expect(formatLongDate(new Date(2026, 8, 1))).toBe('martes, 1 de septiembre')
  })
})

describe('formatLongDateTime', () => {
  it('añade el año y la hora', () => {
    expect(formatLongDateTime(new Date(2026, 7, 16, 22, 5))).toBe(
      'domingo, 16 de agosto de 2026 a las 22:05',
    )
  })
})

describe('toIsoDate', () => {
  it('devuelve el día tal como lo ve el usuario', () => {
    expect(toIsoDate(new Date(2026, 7, 16))).toBe('2026-08-16')
  })

  /**
   * Lo que arregla no usar `toISOString()`: en España, en verano, la
   * medianoche local son las 22:00 UTC del día anterior. Una cita del 16 se
   * habría enviado como el 15.
   */
  it('la medianoche no se va al día anterior', () => {
    expect(toIsoDate(new Date(2026, 7, 16, 0, 0))).toBe('2026-08-16')
    expect(toIsoDate(new Date(2026, 7, 16, 1, 30))).toBe('2026-08-16')
  })

  it('rellena mes y día con cero', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('parseIsoDate', () => {
  it('devuelve el mismo día que se escribió', () => {
    expect(formatDate(parseIsoDate('2026-08-16')!)).toBe('16/08/2026')
  })

  /**
   * El fallo que evita: `new Date('2026-08-16')` es UTC, y en España en
   * verano eso cae el día 15 a las 22:00.
   */
  it('no retrocede un día por la zona horaria', () => {
    expect(parseIsoDate('2026-08-16')!.getDate()).toBe(16)
    expect(parseIsoDate('2026-01-16')!.getDate()).toBe(16)
  })

  it('rechaza lo que no es una fecha', () => {
    expect(parseIsoDate('')).toBeNull()
    expect(parseIsoDate('16/08/2026')).toBeNull()
    expect(parseIsoDate('2026-8-16')).toBeNull()
  })

  it('rechaza días que no existen', () => {
    expect(parseIsoDate('2026-02-31')).toBeNull()
    expect(parseIsoDate('2026-02-29')).toBeNull()
    // 2028 sí es bisiesto
    expect(parseIsoDate('2028-02-29')).not.toBeNull()
  })

  it('da la vuelta completa con toIsoDate', () => {
    expect(toIsoDate(parseIsoDate('2026-12-31')!)).toBe('2026-12-31')
  })
})

describe('addDays', () => {
  it('cambia de mes solo', () => {
    expect(toIsoDate(addDays(new Date(2026, 7, 30), 3))).toBe('2026-09-02')
  })

  it('cambia de año solo', () => {
    expect(toIsoDate(addDays(new Date(2026, 11, 30), 3))).toBe('2027-01-02')
  })

  it('acierta en año bisiesto', () => {
    // 2028 sí es bisiesto: el 28 de febrero más un día es el 29
    expect(toIsoDate(addDays(new Date(2028, 1, 28), 1))).toBe('2028-02-29')
    // 2026 no lo es: el 28 de febrero más un día es el 1 de marzo
    expect(toIsoDate(addDays(new Date(2026, 1, 28), 1))).toBe('2026-03-01')
  })

  it('no toca la fecha original', () => {
    const original = new Date(2026, 7, 16)
    addDays(original, 5)
    expect(toIsoDate(original)).toBe('2026-08-16')
  })
})

describe('atTime', () => {
  it('fija la hora y deja el día', () => {
    const result = atTime(new Date(2026, 7, 16, 3, 45), 20, 30)
    expect(formatDateTime(result)).toBe('16/08/2026, 20:30')
  })

  it('los minutos por defecto son cero', () => {
    expect(formatTime(atTime(new Date(2026, 7, 16), 9))).toBe('09:00')
  })
})

describe('timeLeft', () => {
  const now = new Date(2026, 7, 16, 12, 0)

  it('dice los minutos que quedan', () => {
    expect(timeLeft(new Date(2026, 7, 16, 12, 45), now)).toBe('45 minutos')
  })

  it('singulariza', () => {
    expect(timeLeft(new Date(2026, 7, 16, 13, 0), now)).toBe('1 hora')
    expect(timeLeft(new Date(2026, 7, 17, 12, 0), now)).toBe('1 día')
  })

  it('pasa a horas y a días', () => {
    expect(timeLeft(new Date(2026, 7, 16, 20, 0), now)).toBe('8 horas')
    expect(timeLeft(new Date(2026, 7, 19, 12, 0), now)).toBe('3 días')
  })

  it('avisa de que queda muy poco en vez de decir "0 minutos"', () => {
    expect(timeLeft(new Date(2026, 7, 16, 12, 0, 30), now)).toBe(
      'menos de un minuto',
    )
  })

  /**
   * Ya pasado devuelve null y no un negativo: "quedan -3 días" no significa
   * nada, y quien lo use tiene que decirlo con otras palabras.
   */
  it('devuelve null si ya pasó', () => {
    expect(timeLeft(new Date(2026, 7, 16, 11, 59), now)).toBeNull()
    expect(timeLeft(now, now)).toBeNull()
  })
})

/**
 * Fecha con hora: lo que se añadió al pedir la hora al publicar.
 *
 * El riesgo aquí no es el formato sino el desfase: una cita del 16 mandada
 * como el 15, o una hora inventada donde no la hay.
 */
describe('citas con hora', () => {
  it('manda un instante, no un día suelto', () => {
    const cita = new Date(2026, 7, 16, 18, 30)

    expect(toIsoDateTime(cita)).toBe(cita.toISOString())
    expect(parseIsoDateTime(toIsoDateTime(cita))?.getTime()).toBe(cita.getTime())
  })

  it('sigue leyendo las fechas sueltas de antes sin correrlas un día', () => {
    /*
     * `new Date('2026-08-16')` a secas es medianoche UTC, que en España es el
     * día 15 a las 22:00 en verano. Un trabajo publicado antes del cambio se
     * vería con la fecha equivocada.
     */
    const suelta = parseIsoDateTime('2026-08-16')

    expect(suelta?.getDate()).toBe(16)
    expect(suelta?.getMonth()).toBe(7)
  })

  it('no se inventa una hora cuando el dato no la trae', () => {
    // Medianoche UTC delata a una fecha suelta disfrazada de instante
    expect(formatJobWhen('2026-08-16T00:00:00.000Z')).toBe(
      'domingo, 16 de agosto',
    )
    expect(formatJobWhen('2026-08-16')).toBe('domingo, 16 de agosto')
  })

  it('la enseña cuando sí la trae', () => {
    const cita = new Date(2026, 7, 16, 18, 30)

    expect(formatJobWhen(cita.toISOString())).toContain('a las 18:30')
  })

  it('devuelve null con basura, en vez de una fecha inválida', () => {
    expect(parseIsoDateTime('')).toBeNull()
    expect(parseIsoDateTime('el jueves')).toBeNull()
    expect(formatJobWhen('el jueves')).toBeNull()
  })
})
