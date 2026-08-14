/**
 * Mock de MapLibre para los tests.
 *
 * La librería es un módulo nativo: en jest no hay mapa que renderizar. Se
 * sustituye por vistas que conservan las props, que es lo que los tests
 * necesitan comprobar —qué capas se declaran, con qué pintura, si la fuente
 * agrupa, qué coordenada lleva cada marcador— sin depender de que se dibuje
 * nada.
 *
 * Cada componente deja sus props en `props` de una `View` con su `testID`,
 * así que un test puede disparar `onDragEnd` a mano como haría el usuario al
 * soltar el marcador.
 */

import type { ReactNode } from 'react'
import { View } from 'react-native'

interface AnyProps {
  children?: ReactNode
  id?: string
  testID?: string
  [key: string]: unknown
}

function mockComponent(name: string) {
  const Component = ({ children, testID, id, ...rest }: AnyProps) => (
    <View testID={testID ?? id ?? name} {...rest}>
      {children}
    </View>
  )
  Component.displayName = name
  return Component
}

export const Map = mockComponent('Map')
export const Camera = mockComponent('Camera')
export const GeoJSONSource = mockComponent('GeoJSONSource')
export const Layer = mockComponent('Layer')
export const ViewAnnotation = mockComponent('ViewAnnotation')
export const Marker = mockComponent('Marker')
export const UserLocation = mockComponent('UserLocation')
export const Images = mockComponent('Images')
export const Callout = mockComponent('Callout')

export const LocationManager = { start: jest.fn(), stop: jest.fn() }
export const LogManager = { setLogLevel: jest.fn() }
