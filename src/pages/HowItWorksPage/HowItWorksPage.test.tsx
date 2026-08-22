/**
 * La pantalla recogió contenido que antes estaba repartido por la home.
 *
 * Lo que se comprueba aquí es que llegó entero: si alguien limpia la home y se
 * deja una de las dos secciones por el camino, el texto desaparece de la app
 * sin que nada falle.
 */

import { render } from '@testing-library/react-native'
import { HowItWorksPage } from './HowItWorksPage'

const noop = () => {}

describe('HowItWorksPage', () => {
  it('trae los tres pasos del modelo sin subasta', () => {
    const { getByText } = render(
      <HowItWorksPage onBack={noop} onBrowse={noop} />
    )

    expect(getByText('Busca en el directorio')).toBeTruthy()
    expect(getByText('Encárgale el trabajo')).toBeTruthy()
    expect(getByText('Págalo por la app')).toBeTruthy()
  })

  it('ya no arrastra la numeración de secciones de la home', () => {
    // "02 ·" y "03 ·" ordenaban la home; fuera de ella no ordenan nada
    const { queryByText } = render(
      <HowItWorksPage onBack={noop} onBrowse={noop} />
    )

    expect(queryByText(/^0\d · /)).toBeNull()
  })

  it('deja volver y deja ir al directorio', () => {
    const { getByTestId } = render(
      <HowItWorksPage onBack={noop} onBrowse={noop} />
    )

    expect(getByTestId('how-it-works-back')).toBeTruthy()
    expect(getByTestId('how-it-works-browse')).toBeTruthy()
  })
})
