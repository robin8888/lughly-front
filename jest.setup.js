/**
 * Configuración común de los tests.
 *
 * Reanimated no arranca dentro de jest: al importarlo, `react-native-worklets`
 * intenta hablar con su módulo nativo, que en un test no existe, y revienta
 * con `Cannot read properties of undefined (reading 'loadUnpackers')` antes
 * incluso de que empiece la prueba.
 *
 * El doble que trae la propia librería (`react-native-reanimated/mock`) no
 * sirve: en la versión 4 importa el módulo real por dentro y vuelve a caer en
 * el mismo sitio. De ahí que este esté escrito a mano.
 *
 * Cubre lo que la app usa de verdad —`Animated.ScrollView` y las cuatro
 * funciones de `useCompactNav`— más las habituales, para que el siguiente que
 * escriba un test de pantalla no tenga que volver aquí. Las animaciones no se
 * simulan: `withTiming` devuelve su destino, que es el estado final, y es lo
 * único que se puede comprobar sin reloj.
 *
 * Va en la configuración y no en cada fichero porque lo necesita cualquier
 * pantalla que encoja la barra inferior al hacer scroll, que son todas.
 */
jest.mock('react-native-reanimated', () => {
  const { ScrollView, View, Text, Image, FlatList } = require('react-native')

  const identity = (value) => value
  const easing = Object.assign(identity, {
    ease: identity,
    linear: identity,
    in: identity,
    out: identity,
    inOut: identity,
    bezier: () => identity,
  })

  return {
    __esModule: true,
    default: {
      ScrollView,
      View,
      Text,
      Image,
      FlatList,
      createAnimatedComponent: (component) => component,
    },
    makeMutable: (initial) => ({ value: initial }),
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedScrollHandler: () => () => {},
    useAnimatedStyle: (factory) =>
      typeof factory === 'function' ? factory() : {},
    useDerivedValue: (factory) => ({ value: factory() }),
    withTiming: identity,
    withSpring: identity,
    withDelay: (_delay, value) => value,
    interpolate: identity,
    Easing: easing,
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    runOnJS: identity,
    runOnUI: identity,
  }
})
