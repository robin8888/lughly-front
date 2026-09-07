/**
 * Cuándo sale el diálogo que explica para qué queremos la ubicación.
 *
 * Lo delicado no es el texto, es el momento. El diálogo del sistema sale **una
 * sola vez en la vida de la instalación**: si se deniega, no hay forma de
 * volver a preguntar, y quien lo deniega sin saber qué gana pierde para
 * siempre la lista ordenada por cercanía —o, si es profesional, aparecer en
 * ella—. Por eso primero se dice para qué.
 *
 * Y por eso mismo **no se dice cuando el permiso ya está dado**: ahí no hay
 * ninguna pregunta que preparar, y el diálogo sería un paso de más entre el
 * dedo y lo que se ha venido a hacer.
 */

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useLocationGate } from './useLocationGate'

const mockGetPermissions = jest.fn()

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: () => mockGetPermissions(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Balanced: 4 },
  PermissionStatus: { GRANTED: 'granted' },
}))

beforeEach(() => {
  mockGetPermissions.mockReset()
})

describe('useLocationGate', () => {
  it('con el permiso ya dado, no explica nada: va derecho', async () => {
    mockGetPermissions.mockResolvedValue({ granted: true })
    const proceed = jest.fn()

    const { result } = renderHook(() => useLocationGate(proceed))

    await act(async () => {
      await result.current.start()
    })

    expect(proceed).toHaveBeenCalledTimes(1)
    expect(result.current.visible).toBe(false)
  })

  it('sin permiso, explica antes y no pide nada todavía', async () => {
    mockGetPermissions.mockResolvedValue({ granted: false })
    const proceed = jest.fn()

    const { result } = renderHook(() => useLocationGate(proceed))

    await act(async () => {
      await result.current.start()
    })

    // El diálogo del sistema no se ha llegado a abrir
    expect(proceed).not.toHaveBeenCalled()
    expect(result.current.visible).toBe(true)
  })

  it('al aceptar, se pide; y el diálogo se cierra al terminar', async () => {
    mockGetPermissions.mockResolvedValue({ granted: false })
    const proceed = jest.fn()

    const { result } = renderHook(() => useLocationGate(proceed))

    await act(async () => {
      await result.current.start()
    })
    await act(async () => {
      await result.current.accept()
    })

    expect(proceed).toHaveBeenCalledTimes(1)
    expect(result.current.visible).toBe(false)
    expect(result.current.busy).toBe(false)
  })

  it('al decir "ahora no", se cierra y se avisa a quien esperaba', async () => {
    /*
     * Es lo que desbloquea la pantalla de quien no da el permiso: sin este
     * aviso, la home se quedaría esperando una respuesta que ya se ha dado y
     * el recuento no llegaría a decir nunca cuántos hay.
     */
    mockGetPermissions.mockResolvedValue({ granted: false })
    const proceed = jest.fn()
    const decline = jest.fn()

    const { result } = renderHook(() => useLocationGate(proceed, decline))

    await act(async () => {
      await result.current.start()
    })
    act(() => result.current.dismiss())

    expect(decline).toHaveBeenCalledTimes(1)
    expect(proceed).not.toHaveBeenCalled()
    expect(result.current.visible).toBe(false)
  })

  it('si no se puede mirar el permiso, se explica: es el error barato', async () => {
    // Explicar de más molesta; explicar de menos quema la única pregunta que hay
    mockGetPermissions.mockRejectedValue(new Error('sin sistema'))

    const { result } = renderHook(() => useLocationGate(jest.fn()))

    await act(async () => {
      await result.current.start()
    })

    await waitFor(() => expect(result.current.visible).toBe(true))
  })
})
