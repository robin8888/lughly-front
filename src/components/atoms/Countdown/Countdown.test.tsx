/**
 * El formato del contador: dos unidades, nunca cinco.
 */

import { render } from '@testing-library/react-native'
import { Countdown, formatCountdown } from './Countdown'

describe('formatCountdown', () => {
  it('con días, enseña días y horas', () => {
    expect(formatCountdown({ days: 2, hours: 5, minutes: 12, seconds: 34 })).toBe('2d 05h')
  })

  it('sin días, enseña horas y minutos', () => {
    expect(formatCountdown({ days: 0, hours: 5, minutes: 12, seconds: 34 })).toBe('5h 12m')
  })

  it('en la última hora, baja al segundo', () => {
    expect(formatCountdown({ days: 0, hours: 0, minutes: 12, seconds: 34 })).toBe('12m 34s')
  })

  it('rellena con cero para que no baile el ancho', () => {
    expect(formatCountdown({ days: 1, hours: 5, minutes: 0, seconds: 0 })).toBe('1d 05h')
    expect(formatCountdown({ days: 0, hours: 0, minutes: 3, seconds: 7 })).toBe('3m 07s')
  })
})

describe('Countdown', () => {
  it('cuenta hacia una fecha futura', () => {
    const enDosDias = new Date(Date.now() + 2 * 86400000 + 5 * 3600000).toISOString()
    const { getByTestId } = render(<Countdown target={enDosDias} />)

    expect(getByTestId('countdown').props.children).toContain('2d')
  })

  it('dice que el plazo se cumplió si la fecha ya pasó', () => {
    const ayer = new Date(Date.now() - 86400000).toISOString()
    const { getByText } = render(<Countdown target={ayer} />)

    expect(getByText('Plazo cumplido')).toBeTruthy()
  })

  it('no pinta nada sin fecha', () => {
    const { queryByTestId } = render(<Countdown target={null} />)

    expect(queryByTestId('countdown')).toBeNull()
  })
})
