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
  it('trae los tres pasos que estaban en la home', () => {
    const { getByText } = render(
      <HowItWorksPage onBack={noop} onPublish={noop} />
    )

    expect(getByText('Publica tu trabajo')).toBeTruthy()
    expect(getByText('Recibe pujas')).toBeTruthy()
    expect(getByText('Adjudica tú mismo')).toBeTruthy()
  })

  it('trae la regla que diferencia a Lughly', () => {
    const { getByText } = render(
      <HowItWorksPage onBack={noop} onPublish={noop} />
    )

    expect(getByText('La puja más baja no gana automáticamente')).toBeTruthy()
  })

  it('ya no arrastra la numeración de secciones de la home', () => {
    // "02 ·" y "03 ·" ordenaban la home; fuera de ella no ordenan nada
    const { queryByText } = render(
      <HowItWorksPage onBack={noop} onPublish={noop} />
    )

    expect(queryByText(/^0\d · /)).toBeNull()
  })

  it('deja volver y deja publicar', () => {
    const { getByTestId } = render(
      <HowItWorksPage onBack={noop} onPublish={noop} />
    )

    expect(getByTestId('how-it-works-back')).toBeTruthy()
    expect(getByTestId('auction-publish')).toBeTruthy()
  })
})
