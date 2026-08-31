/**
 * El horario propio, ahora en calendario.
 *
 * Se atan las cosas que fallarían en silencio: que a un empleado no se le
 * enseñe un editor que el servidor va a rechazar —su horario lo pone su
 * empresa—; que al guardar un día se pregunte **para qué días**, porque darlo
 * por hecho se equivoca la mitad de las veces; que lo ya comprometido se vea y
 * no se pueda tocar; y que no se pueda guardar una franja con la misma hora de
 * inicio y de fin, que es un error de dedo y no "todo el día".
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native'
import type { ApiAvailabilityCalendar, ApiCalendarDay } from '@/api/pros.api'
import { AvailabilityPage } from './AvailabilityPage'

/*
 * Los dobles van dentro de las factorías a propósito: `jest.mock` se eleva al
 * principio del fichero y una constante de aquí abajo aún no existiría.
 *
 * El prefijo `mock` tampoco es adorno: es lo único que jest deja que una
 * factoría lea de fuera, justamente por lo mismo.
 */
let mockEsEmpleado = false

/** Septiembre de 2026, y hoy es el miércoles 16 */
const MES = '2026-09'
const HOY = '2026-09-16'

/**
 * Un mes entero como lo devuelve el servidor.
 *
 * El día de la semana sale de `Date.UTC` y no escrito a mano: el calendario
 * coloca cada día en su columna a partir de ese número, y un mes con los días
 * mal numerados probaría una rejilla que no existe.
 */
function mesDePrueba(cambios: Record<string, Partial<ApiCalendarDay>> = {}) {
  const days: ApiCalendarDay[] = []

  for (let numero = 1; numero <= 30; numero += 1) {
    const date = `${MES}-${String(numero).padStart(2, '0')}`
    const weekday = new Date(Date.UTC(2026, 8, numero)).getUTCDay()

    days.push({
      date,
      weekday,
      // De lunes a viernes, de 9 a 14: el horario de siempre
      windows:
        weekday >= 1 && weekday <= 5
          ? [{ from: '09:00', to: '14:00', endsNextDay: false }]
          : [],
      source: 'weekly',
      away: false,
      holiday: null,
      commitments: [],
      ...cambios[date],
    })
  }

  return {
    month: MES,
    today: HOY,
    setByEmployer: false,
    /* De lunes a viernes de 9 a 14, que es lo que pinta la lista semanal */
    weekly: [1, 2, 3, 4, 5].map((weekday) => ({
      weekday,
      from: '09:00',
      to: '14:00',
    })),
    days,
  } satisfies ApiAvailabilityCalendar
}

let mockCalendario = mesDePrueba()

const mockSetDay = jest.fn(() => Promise.resolve({ ok: true, error: null }))
const mockClearDay = jest.fn(() => Promise.resolve({ ok: true, error: null }))
const mockApply = jest.fn(() => Promise.resolve({ ok: true, error: null }))

jest.mock('@/hooks/domain/useIsEmployee', () => ({
  useIsEmployee: () => mockEsEmpleado,
}))

/*
 * El aviso de festivos pide el calendario del año, que aquí no viene al caso:
 * sin este doble, la pantalla llamaría al hook de verdad y se quedaría sin
 * QueryClientProvider.
 */
jest.mock('@/hooks/domain/useMyHolidays', () => ({
  useMyHolidays: () => ({ data: undefined }),
}))

jest.mock('@/hooks/domain/useAvailabilityCalendar', () => ({
  useAvailabilityCalendar: () => ({
    data: mockCalendario,
    isPending: false,
    isError: false,
    isFetching: false,
    refetch: () => {},
  }),
  useSetAvailabilityDay: () => ({
    setDay: mockSetDay,
    clearDay: mockClearDay,
    isSaving: false,
  }),
  useSetAvailabilityWeekdays: () => ({ apply: mockApply, isSaving: false }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

/* Los avisos de "guardado" son ruido aquí: lo que se prueba es qué se manda */
jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {})

/**
 * El reloj, quieto en el 16 de septiembre de 2026.
 *
 * La pantalla arranca por el mes del móvil —hay que pedirle uno al servidor
 * para que conteste cuál es hoy—, así que sin fijar la fecha la prueba pasaría
 * o no según el día en que se ejecute. Se falsea **solo `Date`**: falsear los
 * temporizadores dejaría colgados los `waitFor`, que esperan de verdad.
 */
beforeAll(() => {
  jest.useFakeTimers({
    doNotFake: [
      'hrtime',
      'nextTick',
      'performance',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
  })

  jest.setSystemTime(new Date(2026, 8, 16, 10, 0, 0))
})

afterAll(() => {
  jest.useRealTimers()
})

describe('AvailabilityPage', () => {
  beforeEach(() => {
    mockEsEmpleado = false
    mockCalendario = mesDePrueba()
    jest.clearAllMocks()
  })

  it('pinta el mes y abre el día de hoy', () => {
    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('month-calendar')).toBeTruthy()
    expect(getByTestId('month-calendar-month')).toHaveTextContent('septiembre 2026')

    // El día abierto al llegar es el de hoy, y el que manda es el del servidor
    expect(getByText('miércoles, 16 de septiembre')).toBeTruthy()
  })

  it('al empleado le explica que su horario lo pone su empresa', () => {
    /*
     * Sin esto vería el editor, guardaría, y el servidor le devolvería un 403
     * después de la espera. El mensaje es el mismo pero llega antes y sin cara
     * de error.
     */
    mockEsEmpleado = true

    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('availability-employee')).toBeTruthy()
    expect(queryByTestId('month-calendar')).toBeNull()
  })

  it('tocar otro día lo abre con sus horas', () => {
    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    // El sábado 19 no tiene horario en el semanal
    fireEvent.press(getByTestId('month-calendar-day-2026-09-19'))

    expect(getByText('sábado, 19 de septiembre')).toBeTruthy()
    expect(getByText(/Este día no tiene horas/)).toBeTruthy()
  })

  it('cambiar de día suelta lo que se estaba escribiendo en el anterior', () => {
    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    // Dos franjas en el miércoles: la de siempre más una nueva
    fireEvent.press(getByTestId('availability-add'))
    expect(getByTestId('slot-1')).toBeTruthy()

    fireEvent.press(getByTestId('month-calendar-day-2026-09-19'))

    // El sábado es suyo y está vacío: no hereda lo del miércoles
    expect(queryByTestId('slot-0')).toBeNull()
  })

  it('guardar pregunta si es para ese día o para todos los que caen igual', () => {
    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-add'))
    fireEvent.press(getByTestId('availability-save'))

    expect(getByTestId('availability-scope')).toBeTruthy()
    expect(getByText('Solo el 16')).toBeTruthy()
    expect(getByText('Todos los miércoles')).toBeTruthy()
  })

  it('"solo el 16" guarda ese día y no toca los demás miércoles', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-add'))
    fireEvent.press(getByTestId('availability-save'))
    fireEvent.press(getByTestId('availability-scope-day'))

    await waitFor(() => {
      expect(mockSetDay).toHaveBeenCalledWith(HOY, [
        { from: '09:00', to: '14:00' },
        { from: '09:00', to: '18:00' },
      ])
    })

    expect(mockApply).not.toHaveBeenCalled()
  })

  it('"todos los miércoles" cambia el horario semanal de ese día', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-add'))
    fireEvent.press(getByTestId('availability-save'))
    fireEvent.press(getByTestId('availability-scope-weekly'))

    await waitFor(() => {
      // 3 es el miércoles, como lo cuenta `Date.getDay()`
      expect(mockApply).toHaveBeenCalledWith(
        [3],
        [
          { from: '09:00', to: '14:00' },
          { from: '09:00', to: '18:00' },
        ],
      )
    })

    expect(mockSetDay).not.toHaveBeenCalled()
  })

  it('quitar todas las franjas y guardar deja el día sin horario', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('slot-0-remove'))
    fireEvent.press(getByTestId('availability-save'))
    fireEvent.press(getByTestId('availability-scope-day'))

    /*
      La lista vacía es "ese día no trabajo", que no es lo mismo que quitar la
      excepción: eso es `clearDay` y lo hace otro botón.
    */
    await waitFor(() => expect(mockSetDay).toHaveBeenCalledWith(HOY, []))
    expect(mockClearDay).not.toHaveBeenCalled()
  })

  it('no deja guardar si las dos horas son la misma', () => {
    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    // El selector de hora devuelve una fecha; se fuerza a la hora de inicio
    const inicio = new Date()
    inicio.setHours(9, 0, 0, 0)
    fireEvent(getByTestId('slot-0-to'), 'onChange', inicio)

    expect(getByTestId('availability-save')).toBeDisabled()
    expect(getByText(/no pueden ser la misma/)).toBeTruthy()
  })

  it('sin tocar nada no hay nada que guardar', () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('availability-save')).toBeDisabled()
  })
})

/**
 * Los días que se salen del horario de siempre, y lo que ya está cerrado.
 *
 * Son las dos cosas que el editor de franjas no sabía decir, y por las que la
 * pantalla pasó a ser un calendario.
 */
describe('AvailabilityPage con días fuera de lo normal', () => {
  beforeEach(() => {
    mockEsEmpleado = false
    jest.clearAllMocks()
  })

  it('un día con horas puestas aparte ofrece volver al horario de siempre', async () => {
    mockCalendario = mesDePrueba({
      [HOY]: {
        source: 'day',
        windows: [{ from: '08:00', to: '12:00', endsNextDay: false }],
      },
    })

    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByText(/tiene horas puestas aparte/)).toBeTruthy()

    fireEvent.press(getByTestId('availability-revert'))

    await waitFor(() => expect(mockClearDay).toHaveBeenCalledWith(HOY))
  })

  it('un día normal no ofrece volver: no se ha ido a ninguna parte', () => {
    mockCalendario = mesDePrueba()

    const { queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    expect(queryByTestId('availability-revert')).toBeNull()
  })

  it('lo ya comprometido se enseña y no se edita', () => {
    mockCalendario = mesDePrueba({
      [HOY]: {
        commitments: [
          {
            appointmentId: 'a1',
            jobId: 'j1',
            title: 'Caldera del señor Ruiz',
            from: '11:00',
            to: '13:00',
            endsNextDay: false,
            status: 'CONFIRMED',
          },
        ],
      },
    })

    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('availability-commitments')).toBeTruthy()
    expect(getByText('Caldera del señor Ruiz')).toBeTruthy()
    expect(getByText('11:00 – 13:00')).toBeTruthy()

    /* Una franja comprometida no es una franja editable: no hay slot para ella */
    expect(getByTestId('slot-0-from')).toBeTruthy()
    expect(() => getByTestId('slot-1')).toThrow()
  })

  it('un día de vacaciones lo dice, porque no se arregla desde aquí', () => {
    mockCalendario = mesDePrueba({ [HOY]: { away: true } })

    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('availability-day-away')).toBeTruthy()
  })

  it('un festivo lo dice con su nombre', () => {
    mockCalendario = mesDePrueba({
      [HOY]: { holiday: 'Fiesta local' },
    })

    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('availability-day-holiday')).toBeTruthy()
    expect(getByText(/Fiesta local/)).toBeTruthy()
  })
})

/**
 * El atajo: no tener que ir día por día.
 *
 * Es la mitad de la razón de ser de la pantalla. Lo que se ata es que **solo
 * toque los días marcados**: quien trabaja los sábados no puede perderlos por
 * aplicar de lunes a viernes.
 */
describe('AvailabilityPage: varios días de la semana a la vez', () => {
  beforeEach(() => {
    mockEsEmpleado = false
    mockCalendario = mesDePrueba()
    jest.clearAllMocks()
  })

  it('viene con de lunes a viernes marcado', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-shortcut'))
    fireEvent.press(getByTestId('availability-shortcut-apply'))

    await waitFor(() =>
      expect(mockApply).toHaveBeenCalledWith(
        [1, 2, 3, 4, 5],
        [{ from: '09:00', to: '18:00' }],
      ),
    )
  })

  it('se pueden marcar y desmarcar días', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-shortcut'))

    // Fuera el viernes, dentro el sábado
    fireEvent.press(getByTestId('availability-weekday-5'))
    fireEvent.press(getByTestId('availability-weekday-6'))
    fireEvent.press(getByTestId('availability-shortcut-apply'))

    await waitFor(() =>
      expect(mockApply).toHaveBeenCalledWith(
        [1, 2, 3, 4, 6],
        [{ from: '09:00', to: '18:00' }],
      ),
    )
  })

  it('sin ningún día marcado no deja aplicar', () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-shortcut'))

    for (const weekday of [1, 2, 3, 4, 5]) {
      fireEvent.press(getByTestId(`availability-weekday-${weekday}`))
    }

    expect(getByTestId('availability-shortcut-apply')).toBeDisabled()
  })
})

/**
 * Y el otro camino: la empresa editando el horario de un trabajador.
 *
 * Lo que se ata es que el aviso de "te lo pone tu empresa" **no** salga
 * entonces. Es la misma pantalla y el mismo `useIsEmployee`, así que sin
 * distinguirlo la empresa se encontraría el mensaje de su propio empleado y no
 * podría editar nada, que es justo el agujero que esto viene a tapar.
 */
describe('AvailabilityPage con un trabajador', () => {
  beforeEach(() => {
    mockEsEmpleado = false
    mockCalendario = mesDePrueba()
    jest.clearAllMocks()
  })

  it('deja editar el horario de un trabajador', () => {
    const { getByTestId, queryByTestId } = render(
      <AvailabilityPage onBack={() => {}} employeeId="u2" employeeName="Ana" />,
    )

    expect(getByTestId('month-calendar')).toBeTruthy()
    expect(queryByTestId('availability-employee')).toBeNull()
  })

  it('encabeza con su nombre, para no confundirlo con el propio', () => {
    const { getByText } = render(
      <AvailabilityPage onBack={() => {}} employeeId="u2" employeeName="Ana" />,
    )

    expect(getByText('Ana')).toBeTruthy()
  })
})


/**
 * El horario de todas las semanas, listado y editable.
 *
 * Es lo que faltaba: desde el calendario solo se llega a un día de la semana de
 * uno en uno y por el camino largo, y quien quiere cambiar "los lunes" no está
 * pensando en ninguna fecha. Lo que se ata es que **solo toque ese día**.
 */
describe('AvailabilityPage: el horario de todas las semanas', () => {
  beforeEach(() => {
    mockEsEmpleado = false
    mockCalendario = mesDePrueba()
    jest.clearAllMocks()
  })

  it('lista los siete días con sus horas', () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    // Lunes: lo que hay puesto. Domingo: la ausencia, dicha como tal.
    expect(getByTestId('availability-weekly-1')).toHaveTextContent(/LUN.*09:00–14:00/)
    expect(getByTestId('availability-weekly-0')).toHaveTextContent(/DOM.*Sin horario/)
  })

  it('abre un día y deja editarlo', () => {
    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    expect(queryByTestId('availability-weekly-editor')).toBeNull()

    fireEvent.press(getByTestId('availability-weekly-1'))

    expect(getByTestId('availability-weekly-editor')).toBeTruthy()
    expect(getByTestId('week-slot-0-from')).toBeTruthy()
  })

  it('guardar los lunes solo manda el lunes', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-weekly-1'))
    fireEvent.press(getByTestId('availability-weekly-add'))
    fireEvent.press(getByTestId('availability-weekly-save'))

    await waitFor(() =>
      expect(mockApply).toHaveBeenCalledWith(
        [1],
        [
          { from: '09:00', to: '14:00' },
          { from: '09:00', to: '18:00' },
        ],
      ),
    )

    // Ni el día suelto ni ningún otro día de la semana
    expect(mockSetDay).not.toHaveBeenCalled()
  })

  it('quitar todas las franjas deja ese día de la semana sin horario', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-weekly-1'))
    fireEvent.press(getByTestId('week-slot-0-remove'))
    fireEvent.press(getByTestId('availability-weekly-save'))

    await waitFor(() => expect(mockApply).toHaveBeenCalledWith([1], []))
  })

  it('sin tocar nada no hay nada que guardar', () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-weekly-1'))

    expect(getByTestId('availability-weekly-save')).toBeDisabled()
  })

  it('cambiar de día suelta lo que se estaba escribiendo en el anterior', () => {
    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-weekly-1'))
    fireEvent.press(getByTestId('availability-weekly-add'))
    expect(getByTestId('week-slot-1')).toBeTruthy()

    fireEvent.press(getByTestId('availability-weekly-2'))

    // El martes es suyo: una franja, la que tiene guardada
    expect(getByTestId('week-slot-0')).toBeTruthy()
    expect(queryByTestId('week-slot-1')).toBeNull()
  })

  it('editar un día de la semana no toca el día suelto abierto arriba', () => {
    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-weekly-1'))
    fireEvent.press(getByTestId('availability-weekly-add'))

    /* El panel del día de arriba sigue con lo suyo, sin nada que guardar */
    expect(getByTestId('availability-save')).toBeDisabled()
    expect(queryByTestId('slot-1')).toBeNull()
  })
})

/**
 * Y el diálogo del atajo.
 *
 * La inicial sola no valía: martes y miércoles empiezan los dos por "m", así
 * que la fila salía con dos botones idénticos y no se sabía cuál se marcaba.
 */
describe('AvailabilityPage: el diálogo de varios días', () => {
  beforeEach(() => {
    mockEsEmpleado = false
    mockCalendario = mesDePrueba()
    jest.clearAllMocks()
  })

  it('cada día se distingue del de al lado', () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-shortcut'))

    /* Y con la marca de elegido, porque de lunes a viernes vienen marcados */
    expect(getByTestId('availability-weekday-2')).toHaveTextContent(/MAR/)
    expect(getByTestId('availability-weekday-3')).toHaveTextContent(/MIÉ/)
  })

  it('el grupo de fin de semana marca sábado y domingo, y solo esos', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-shortcut'))
    fireEvent.press(getByTestId('availability-preset-weekend'))
    fireEvent.press(getByTestId('availability-shortcut-apply'))

    await waitFor(() =>
      expect(mockApply).toHaveBeenCalledWith([6, 0], [{ from: '09:00', to: '18:00' }]),
    )
  })

  it('el grupo de entre semana vuelve a poner los cinco', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-shortcut'))
    fireEvent.press(getByTestId('availability-preset-all'))
    fireEvent.press(getByTestId('availability-preset-workweek'))
    fireEvent.press(getByTestId('availability-shortcut-apply'))

    await waitFor(() =>
      expect(mockApply).toHaveBeenCalledWith(
        [1, 2, 3, 4, 5],
        [{ from: '09:00', to: '18:00' }],
      ),
    )
  })

  it('todos son los siete', async () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('availability-shortcut'))
    fireEvent.press(getByTestId('availability-preset-all'))
    fireEvent.press(getByTestId('availability-shortcut-apply'))

    await waitFor(() =>
      expect(mockApply).toHaveBeenCalledWith(
        [1, 2, 3, 4, 5, 6, 0],
        [{ from: '09:00', to: '18:00' }],
      ),
    )
  })
})
