/**
 * Que la ausencia del módulo nativo NO tumbe la app.
 *
 * Es el fallo que se arregla aquí, y era grave: un `import` arriba del fichero
 * hacía que `TurboModuleRegistry.getEnforcing('DocumentScanner')` lanzara al
 * cargar el módulo, y eso subía por `ImagePickerField` → `MyDocumentsPage` →
 * `_layout` y se llevaba el router. Pantalla en blanco antes de llegar a
 * ninguna parte.
 *
 * Pasa siempre que el JavaScript va por delante del binario, que es lo normal
 * mientras se desarrolla: se añade la dependencia, Metro recarga, y el módulo
 * nativo no existe hasta el siguiente build.
 *
 * En este entorno de test el módulo tampoco está, así que esto comprueba
 * exactamente el caso real.
 */

import { isScannerAvailable } from './useScanDocument'

describe('useScanDocument sin módulo nativo', () => {
  it('importar el hook no lanza', () => {
    // Si el import fuera estático, este fichero ni se cargaría
    expect(typeof isScannerAvailable).toBe('function')
  })

  it('dice que no hay escáner, en vez de reventar', () => {
    expect(isScannerAvailable()).toBe(false)
  })

  it('responde lo mismo si se le pregunta dos veces', () => {
    // El resultado se recuerda: no se reintenta un require que ya falló
    expect(isScannerAvailable()).toBe(false)
    expect(isScannerAvailable()).toBe(false)
  })
})
