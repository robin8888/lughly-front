/**
 * Que la app arranque aunque falte el módulo nativo del teclado.
 *
 * `react-native-keyboard-controller` revienta **al importarse** si su parte
 * nativa no está en el binario, y eso deja la app sin pintar ni la primera
 * pantalla. Pasa siempre entre instalar la librería y reconstruir el dev
 * client, y en un proyecto que se compila con EAS ese rato es una build
 * entera.
 *
 * Es una situación temporal por definición, pero mientras dura no puede
 * llevarse por delante la app: el teclado es una mejora sobre lo que había, y
 * quedarse sin app por ella es peor que el problema que resuelve.
 */

import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

/** Un doble que se comporta como el módulo sin compilar: revienta al cargarse */
const romperAlImportar = () => {
  jest.doMock('react-native-keyboard-controller', () => {
    throw new Error("The package 'react-native-keyboard-controller' doesn't seem to be linked.")
  })
}

/*
  El caso "sí está" va primero a propósito: `jest.doMock` se registra al
  ejecutarse y ya no se quita, así que en cuanto corre el bloque de abajo la
  librería queda rota para el resto del fichero.
*/
describe('cuando el módulo nativo está', () => {
  beforeEach(() => jest.resetModules())

  /**
   * Con la librería cargada, el envoltorio no hace nada: usa la suya. Si esto
   * dejara de cumplirse, el repuesto se quedaría puesto para siempre y el
   * teclado seguiría tapando los campos en Android sin que nada lo dijera.
   */
  it('usa la librería, no el repuesto', () => {
    const real = require('react-native-keyboard-controller') as Record<string, unknown>
    const shim = require('./keyboardController') as Record<string, unknown>

    expect(shim.hasNativeKeyboardController).toBe(true)
    expect(shim.KeyboardProvider).toBe(real.KeyboardProvider)
    expect(shim.KeyboardAwareScrollView).toBe(real.KeyboardAwareScrollView)
  })
})

describe('cuando falta el módulo nativo', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  it('no revienta al cargarse', () => {
    romperAlImportar()

    expect(() => require('./keyboardController')).not.toThrow()
  })

  it('lo dice, para que nadie se pase la tarde buscándolo', () => {
    romperAlImportar()

    require('./keyboardController')

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('reconstruye el dev client'),
    )
  })

  it('el proveedor deja pasar a sus hijos', () => {
    romperAlImportar()

    const { KeyboardProvider } = require('./keyboardController') as {
      KeyboardProvider: React.ComponentType<{ children?: React.ReactNode }>
    }

    render(
      <KeyboardProvider>
        <Text>lo de dentro</Text>
      </KeyboardProvider>,
    )

    expect(screen.getByText('lo de dentro')).toBeTruthy()
  })

  it('y el scroll sigue pintando lo que lleve dentro', () => {
    romperAlImportar()

    const { KeyboardAwareScrollView } = require('./keyboardController') as {
      KeyboardAwareScrollView: React.ComponentType<{ children?: React.ReactNode }>
    }

    render(
      <KeyboardAwareScrollView>
        <Text>un campo</Text>
      </KeyboardAwareScrollView>,
    )

    expect(screen.getByText('un campo')).toBeTruthy()
  })
})
