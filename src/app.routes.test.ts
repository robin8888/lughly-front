import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Que **todas** las pantallas estén declaradas en el navegador.
 *
 * ## Por qué esto merece una prueba propia
 *
 * Porque olvidarse de declarar una no se ve al usarla —la pantalla se abre y
 * funciona igual de bien— y se ve **al cerrar sesión**, que es cuando nadie
 * está mirando. `Stack.Protected` retira del navegador lo que hay en su lista;
 * lo que no está declarado **no se retira**, así que se queda montado con la
 * sesión ya cerrada. Y entonces pasa alguna de estas tres, según la pantalla:
 *
 * - **La app se queda colgada**: la pantalla sigue pidiendo datos sin sesión y
 *   no hay forma de salir de ella. Pasó con el chat.
 * - **La flecha de atrás no lleva a ningún sitio.** Pasó con las urgencias.
 * - **Parece que no se ha cerrado la sesión.** Pasó con «Mi nivel» el 20 de
 *   septiembre de 2026: quien entraba a sus niveles, volvía a Mi cuenta y
 *   cerraba sesión se quedaba leyendo «Los niveles son del profesional» —la
 *   pantalla seguía ahí y su rol ya era el de cliente—. Es el peor de los
 *   tres, porque el usuario cree que sigue dentro.
 *
 * Tres veces el mismo fallo con tres caras distintas. Se comprueba contra el
 * **disco** y no contra una lista escrita a mano: una lista a mano habría que
 * acordarse de actualizarla, que es exactamente lo que falla aquí.
 *
 * Y al revés también: una pantalla declarada que ya no existe. `presupuestar`
 * se quedó en la lista después de borrar el presupuesto de la app, y una ruta
 * fantasma en el navegador es una que alguien puede intentar abrir.
 */
describe('el navegador declara todas las pantallas, y solo las que existen', () => {
  /*
    Vive **fuera** de `src/app` a propósito: cualquier fichero ahí dentro lo
    mira el generador de rutas de Expo, y una prueba metida entre las pantallas
    le tumba los tipos de navegación de toda la app.
  */
  const appDir = join(__dirname, 'app')

  /** Los ficheros de ruta de `src/app`, con el nombre que usa expo-router */
  function routeNames(dir: string, prefix = ''): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const name = entry.name

      if (entry.isDirectory()) {
        /*
          Un grupo —`(tabs)`— se declara entero con una sola línea, así que sus
          pantallas de dentro no cuentan: las gobierna su propio navegador.
        */
        if (name.startsWith('(')) return [name]

        return routeNames(join(dir, name), `${prefix}${name}/`)
      }

      if (!name.endsWith('.tsx')) return []

      const base = name.replace(/\.tsx$/, '')

      /* Los layouts no son pantallas, y las pruebas tampoco */
      if (base === '_layout' || base.includes('.test')) return []

      return [`${prefix}${base}`]
    })
  }

  const enDisco = new Set(routeNames(appDir))

  const declaradas = new Set(
    [...readFileSync(join(appDir, '_layout.tsx'), 'utf8').matchAll(/name="([^"]+)"/g)].map(
      (match) => match[1] as string,
    ),
  )

  it('no hay ninguna pantalla sin declarar', () => {
    const faltan = [...enDisco].filter((route) => !declaradas.has(route)).sort()

    expect(faltan).toEqual([])
  })

  it('ni ninguna declarada que ya no exista', () => {
    const sobran = [...declaradas].filter((route) => !enDisco.has(route)).sort()

    expect(sobran).toEqual([])
  })

  /* Y la de niveles en concreto, que es la que lo destapó */
  it('«Mi nivel» está declarada', () => {
    expect(declaradas.has('mi-nivel')).toBe(true)
  })
})
