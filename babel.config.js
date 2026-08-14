/**
 * Configuración de Babel.
 *
 * `react-native-worklets/plugin` es obligatorio para Reanimated 4: transforma
 * las funciones que se ejecutan en el hilo de UI. Sin él, las animaciones del
 * carrusel fallan en tiempo de ejecución (no en compilación, que es peor).
 *
 * Tiene que ir SIEMPRE el último de la lista de plugins.
 */
module.exports = function (api) {
  api.cache(true)

  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  }
}
