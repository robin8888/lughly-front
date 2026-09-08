/**
 * «Cómo funciona», ahora un recorrido de un paso por pantalla.
 *
 * Lo que se ata son las dos cosas que lo hacen ser un recorrido y no una
 * página larga: que **avance** y que a cada rol le toque **su** texto. Un
 * fallo en lo segundo no se ve en el código —los dos recorridos se leen
 * igual— y deja al profesional leyendo cómo se contrata, que es lo que hacía
 * la pantalla de antes.
 *
 * Y el botón de volver, que aquí tiene dos trabajos: retroceder un paso, y
 * salir solo en el primero. Si saliera siempre, volver a mirar el paso
 * anterior costaría empezar el recorrido otra vez.
 */

import { render, fireEvent } from '@testing-library/react-native'
import { HowItWorksPage } from './HowItWorksPage'
import { stepsFor } from './steps'

const noop = () => {}

const pintar = (
  role: 'client' | 'pro',
  props: { onBack?: () => void; onFinish?: () => void } = {},
) =>
  render(
    <HowItWorksPage
      role={role}
      onBack={props.onBack ?? noop}
      onFinish={props.onFinish ?? noop}
    />,
  )

describe('HowItWorksPage', () => {
  it('empieza por el primer paso del recorrido del cliente', () => {
    const { getByTestId } = pintar('client')

    expect(getByTestId('how-it-works-title')).toHaveTextContent(
      stepsFor('client')[0]!.title,
    )
    expect(getByTestId('how-it-works-progress')).toHaveTextContent('1 de 5')
  })

  /**
   * El motivo de que haya dos recorridos: al profesional no se le cuenta cómo
   * contratar, se le cuenta cómo trabajar. Se comprueba con el primer paso de
   * cada uno, que es donde se separan.
   */
  it('al profesional le toca el suyo, no el del cliente', () => {
    const { getByTestId } = pintar('pro')

    expect(getByTestId('how-it-works-title')).toHaveTextContent(
      stepsFor('pro')[0]!.title,
    )
    expect(stepsFor('pro')[0]!.title).not.toBe(stepsFor('client')[0]!.title)
  })

  it('siguiente pasa al siguiente paso', () => {
    const { getByTestId } = pintar('client')

    fireEvent.press(getByTestId('how-it-works-next'))

    expect(getByTestId('how-it-works-title')).toHaveTextContent(
      stepsFor('client')[1]!.title,
    )
    expect(getByTestId('how-it-works-progress')).toHaveTextContent('2 de 5')
  })

  it('atrás retrocede un paso, sin salirse', () => {
    const salir = jest.fn()
    const { getByTestId } = pintar('client', { onBack: salir })

    fireEvent.press(getByTestId('how-it-works-next'))
    fireEvent.press(getByTestId('how-it-works-back'))

    expect(getByTestId('how-it-works-progress')).toHaveTextContent('1 de 5')
    expect(salir).not.toHaveBeenCalled()
  })

  it('y en el primero sí sale', () => {
    const salir = jest.fn()
    const { getByTestId } = pintar('client', { onBack: salir })

    fireEvent.press(getByTestId('how-it-works-back'))

    expect(salir).toHaveBeenCalled()
  })

  /**
   * El final lleva a hacer algo, y a algo distinto según quién lea: terminar
   * de leer y quedarse en la misma pantalla sería contar cómo se hace algo y
   * no dejar hacerlo.
   */
  it('el último paso termina el recorrido', () => {
    const acabar = jest.fn()
    const { getByTestId, queryByTestId } = pintar('client', { onFinish: acabar })

    const pasos = stepsFor('client').length
    for (let i = 0; i < pasos - 1; i += 1) {
      fireEvent.press(getByTestId('how-it-works-next'))
    }

    expect(getByTestId('how-it-works-progress')).toHaveTextContent(`${pasos} de ${pasos}`)
    /* Y ahí ya no hace falta la salida de emergencia */
    expect(queryByTestId('how-it-works-skip')).toBeNull()

    fireEvent.press(getByTestId('how-it-works-next'))
    expect(acabar).toHaveBeenCalled()
  })

  it('saltar se sale sin leerlo entero', () => {
    const salir = jest.fn()
    const { getByTestId } = pintar('pro', { onBack: salir })

    fireEvent.press(getByTestId('how-it-works-skip'))

    expect(salir).toHaveBeenCalled()
  })

  /**
   * Cinco pasos con la misma cara se leen como una pantalla que no ha
   * cargado. No se comprueba cuál va en cada uno —eso es criterio y cambia—
   * sino que no sean todas la misma.
   */
  it('las caras se alternan en los dos recorridos', () => {
    for (const role of ['client', 'pro'] as const) {
      const caras = stepsFor(role).map((step) => step.image)
      expect(new Set(caras).size).toBeGreaterThan(1)
    }
  })
})
