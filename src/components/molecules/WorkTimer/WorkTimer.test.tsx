/**
 * El contador del trabajo.
 *
 * Lo ven los dos lados y tiene que decir lo mismo en los dos, porque en un
 * trabajo por horas es lo que se acaba pagando. Los fallos de aquí no dan
 * error: enseñan un número, solo que el equivocado.
 */

import { act, render, screen } from '@testing-library/react-native'
import { formatElapsed, WorkTimer } from './WorkTimer'

const EMPEZO = '2026-09-01T10:00:00.000Z'

describe('formatElapsed', () => {
  it('sin horas no las enseña: ocupan y no dicen nada', () => {
    expect(formatElapsed(0)).toBe('0:00')
    expect(formatElapsed(65_000)).toBe('1:05')
    expect(formatElapsed(59 * 60_000 + 59_000)).toBe('59:59')
  })

  it('con horas, las tres cifras', () => {
    expect(formatElapsed(60 * 60_000)).toBe('1:00:00')
    expect(formatElapsed(3 * 60 * 60_000 + 5 * 60_000 + 9_000)).toBe('3:05:09')
  })

  /**
   * Un reloj que va por detrás del servidor daría negativo. Enseñar
   * «-0:03» asusta más que un cero, y no significa nada para quien lo lee.
   */
  it('nunca cuenta hacia atrás', () => {
    expect(formatElapsed(-5_000)).toBe('0:00')
  })
})

describe('WorkTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-09-01T10:02:30.000Z'))
  })

  afterEach(() => jest.useRealTimers())

  it('corriendo, cuenta desde que se empezó', () => {
    render(<WorkTimer startedAt={EMPEZO} testID="reloj" />)

    expect(screen.getByTestId('reloj-value')).toHaveTextContent('2:30')
  })

  it('y sigue contando solo', () => {
    render(<WorkTimer startedAt={EMPEZO} testID="reloj" />)

    act(() => {
      jest.advanceTimersByTime(5_000)
    })

    expect(screen.getByTestId('reloj-value')).toHaveTextContent('2:35')
  })

  /**
   * Entre que el profesional pulsa Terminar y el cliente lo da por bueno, el
   * trabajo sigue `IN_PROGRESS` pero el reloj ya no. Si siguiera corriendo,
   * el total que se enseña al pagar crecería durante las 24 horas del plazo.
   */
  it('terminado, se queda con el total y no se mueve', () => {
    render(
      <WorkTimer
        startedAt={EMPEZO}
        finishedAt="2026-09-01T10:01:00.000Z"
        testID="reloj"
      />,
    )

    act(() => {
      jest.advanceTimersByTime(30_000)
    })

    expect(screen.getByTestId('reloj-value')).toHaveTextContent('1:00')
  })

  it('enseña la etiqueta que le pongan', () => {
    render(<WorkTimer startedAt={EMPEZO} label="Llevas trabajando" testID="reloj" />)

    expect(screen.getByText('Llevas trabajando')).toBeTruthy()
  })

  /**
   * Preferible a un «NaN:NaN» en la pantalla de alguien: si la fecha no se
   * puede leer, no hay contador que enseñar.
   */
  it('con una fecha ilegible no pinta nada', () => {
    render(<WorkTimer startedAt="no es una fecha" testID="reloj" />)

    expect(screen.queryByTestId('reloj')).toBeNull()
  })
})
