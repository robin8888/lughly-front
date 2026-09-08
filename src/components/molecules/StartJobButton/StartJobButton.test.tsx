/**
 * El botón de empezar, y su hora.
 *
 * Lo pidió Robin el 8 de septiembre de 2026 con el motivo exacto: **con más de
 * un trabajo en la agenda, el botón de al lado es el del otro**. Tres tarjetas
 * con el mismo botón encendido en las tres es una equivocación esperando a
 * pasar, y equivocarse arranca el reloj del trabajo que no es — que en uno por
 * horas acaba en una factura mal contada.
 *
 * Lo que se ata son los cuatro casos que deciden si se enciende, porque un
 * fallo aquí **no se ve**: o el botón se queda muerto para siempre en los
 * encargos sin fecha, o vuelve a estar encendido a todas horas y volvemos al
 * problema.
 */

import { render } from '@testing-library/react-native'
import { StartJobButton } from './StartJobButton'

const EN_UNA_HORA = () => new Date(Date.now() + 60 * 60_000).toISOString()
const HACE_UN_RATO = () => new Date(Date.now() - 5 * 60_000).toISOString()

const pintar = (props: Partial<React.ComponentProps<typeof StartJobButton>> = {}) =>
  render(
    <StartJobButton
      canStartAt={null}
      onPress={() => {}}
      testID="empezar"
      {...props}
    />,
  )

describe('StartJobButton', () => {
  it('antes de la hora está apagado y dice desde cuándo', () => {
    const { getByTestId } = pintar({ canStartAt: EN_UNA_HORA() })

    expect(getByTestId('empezar')).toBeDisabled()
    expect(getByTestId('empezar-too-early')).toBeTruthy()
  })

  /** Los diez minutos ya pasados: es la hora, se puede */
  it('llegada la hora se enciende solo', () => {
    const { getByTestId, queryByTestId } = pintar({ canStartAt: HACE_UN_RATO() })

    expect(getByTestId('empezar')).not.toBeDisabled()
    expect(queryByTestId('empezar-too-early')).toBeNull()
  })

  /**
   * Sin hora acordada no se comprueba nada. Hay encargos sin fecha, y exigir
   * puntualidad a una cita que no existe sería cerrar el botón para siempre —
   * el fallo más caro de los posibles, porque deja a alguien sin poder
   * registrar un trabajo que está haciendo.
   */
  it('sin hora acordada se puede empezar cuando sea', () => {
    const { getByTestId, queryByTestId } = pintar({ canStartAt: null })

    expect(getByTestId('empezar')).not.toBeDisabled()
    expect(queryByTestId('empezar-too-early')).toBeNull()
  })

  /**
   * Y cuando está apagado por otra cosa —ya hay un trabajo en curso—, la
   * explicación de la hora no sale: la de verdad la pone quien lo apagó, y dos
   * avisos apilados diciendo cosas distintas no los lee nadie.
   */
  it('apagado por otro motivo, no explica la hora', () => {
    const { getByTestId, queryByTestId } = pintar({
      canStartAt: EN_UNA_HORA(),
      disabled: true,
    })

    expect(getByTestId('empezar')).toBeDisabled()
    expect(queryByTestId('empezar-too-early')).toBeNull()
  })

  it('mientras se manda, tampoco se puede volver a pulsar', () => {
    const { getByTestId } = pintar({ canStartAt: HACE_UN_RATO(), isStarting: true })

    expect(getByTestId('empezar')).toBeDisabled()
  })
})
