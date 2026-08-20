/**
 * PROPUESTA de estilo, 20 Agosto 2026. **No es el tema de la app todavía.**
 *
 * Vive aparte a propósito: se usa solo en el directorio nuevo
 * (`DirectoryFeedPage`) para poder verlo al lado del actual y decidir. Si se
 * adopta, esto se funde con `src/theme` y este fichero desaparece; si no, se
 * borra entero y no queda rastro en el resto de la app.
 *
 * ## Qué cambia, y por qué
 *
 * El tema actual viene del sistema de diseño "industrial" del `_ds`, y ese
 * sistema tiene tres marcas muy fuertes: **esquinas en escuadra** (`radius: 0`
 * en tarjetas, campos y etiquetas), **un contorno azul alrededor de cada
 * tarjeta**, y **una cuadrícula de plano** dibujada detrás. Las tres juntas se
 * leen como una herramienta técnica —un plano, un panel de control— y es
 * exactamente lo contrario de lo que se busca aquí, que es que dé confianza
 * mirar a una persona.
 *
 * La propuesta quita esas tres y las sustituye por lo que hacen las apps
 * sociales:
 *
 * 1. **Redondeo generoso** (20 en tarjeta, 16 en foto, píldora en chips). Es
 *    el gesto que más dice "app moderna" con menos esfuerzo.
 * 2. **Sin marcos**. Las tarjetas se separan por aire y una sombra suave, no
 *    por una línea. Un feed es una superficie continua, no una colección de
 *    recuadros.
 * 3. **Fondo blanco** en vez del gris `#f2f2f3`. El gris obliga a que la
 *    tarjeta sea casi blanca para destacar, y ahí se pierde el contraste;
 *    con fondo blanco la foto y la cara mandan.
 * 4. **El azul de la app se queda.** Se probó el eléctrico de la mascota y
 *    para la tarifa y el distintivo resultaba un grito: no son botones, son
 *    datos. Lo que sí cambia es dónde se usa el oscuro —`accent700`—, que es
 *    el que aguanta texto blanco: los filtros activos.
 * 5. **Nada en mayúsculas**. Los rótulos en caja alta suenan a institución.
 *
 * Las **fuentes no se tocan**: Fredoka y Nunito son redondeadas y amables, y
 * ya están donde tienen que estar.
 *
 * Y **la organización de la tarjeta tampoco** (decidido el 20 Agosto 2026, al
 * ver el piloto): la identidad a la izquierda, los números en columna a la
 * derecha y la tira de fotos debajo se quedan como estaban. Ese reparto ya
 * estaba pensado y es lo que deja comparar dos profesionales de un vistazo.
 * Esto cambia cómo se ve, no dónde está cada cosa.
 */

import { colors } from './colors'

export const feed = {
  colors: {
    /** El feed es una superficie continua, no un tablero con fichas encima */
    bg: '#ffffff',
    /** Para los huecos que esperan algo: campos, chips, fotos que no cargan */
    subtle: '#f3f5f7',
    text: '#111417',
    /** Todo lo que acompaña sin competir: oficio, ciudad, distancia */
    textSoft: '#697586',
    /** Línea de un pelo. Solo donde de verdad hace falta separar */
    hairline: '#e9edf1',

    /**
     * **El azul de la app, no uno nuevo** (decidido el 20 Agosto 2026, al ver
     * el piloto). Se probó el eléctrico de la mascota y no encaja: la tarifa y
     * el distintivo de identidad no son botones, y con ese azul gritaban.
     *
     * Salen del tema en vez de copiados a mano para que sigan siendo el mismo
     * azul el día que el tema cambie.
     *
     * Son dos y no uno porque hacen cosas distintas: `accent` es para texto
     * sobre fondo claro —la tarifa—, y `accentStrong` es el oscuro que aguanta
     * texto blanco encima, que es la regla que ya sigue la app en sus botones
     * rellenos.
     */
    accent: colors.accent,
    accentStrong: colors.accent700,
    accentSoft: colors.accent100,
    onAccent: '#ffffff',

    available: '#12a150',
    availableSoft: '#e8f7ee',
    /**
     * El anillo de quien no está disponible ahora. Es un rojo apagado y no el
     * `urgency` de la app: aquí no ha fallado nada ni hay ninguna urgencia,
     * solo dice que hoy no sale corriendo.
     */
    unavailable: '#d1544a',
    star: '#f5a524',
  },

  radius: {
    card: 20,
    photo: 16,
    field: 14,
    pill: 999,
  },

  /**
   * Más aire que ahora. La pantalla actual aprieta a 12 y el feed respira a
   * 16: en una lista larga, el aire entre tarjetas es lo que deja distinguir
   * una persona de la siguiente sin leer.
   */
  space: {
    gap: 8,
    inset: 16,
    between: 12,
    cards: 14,
  },

  /**
   * Sombra muy baja. Lo justo para despegar la tarjeta del fondo blanco sin
   * que parezca que flota: en un feed hay decenas, y sombras marcadas
   * ensucian la pantalla entera.
   */
  shadow: {
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
} as const
