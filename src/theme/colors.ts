/**
 * Color tokens extraídos de _ds/industry-b237969c-50b4-49b1-bd23-47ccffb071f0/styles.css
 * No modificar valores manualmente: son la fuente de verdad del diseño.
 */

export const colors = {
  // Base
  /**
   * **Blanco desde el 20 Agosto 2026.** Era `#f2f2f3`, y ese gris obligaba a
   * que la tarjeta fuese casi blanca para destacar sobre él; ahí se perdía el
   * contraste que de verdad importa, que es el de la foto y la cara contra la
   * página. Ahora las tarjetas se separan con aire y una sombra baja.
   */
  bg: '#ffffff',
  surface: '#e9e9ea',
  /** Para lo que espera algo: chips, huecos de foto, estados pulsados */
  surfaceSoft: '#f3f5f7',
  /**
   * Los campos van en blanco (20 Agosto 2026). Con la página gris el relleno
   * gris los delimitaba; sobre página blanca se leen como cajas apagadas, y
   * un formulario entero en gris parece deshabilitado.
   */
  field: '#ffffff',
  /**
   * Y por eso el borde deja de ser el `divider`: un campo blanco sobre página
   * blanca **solo se distingue por su contorno**, así que ese contorno tiene
   * que verse de verdad. Este llega a 3,1:1 contra el blanco, que es lo que
   * pide la WCAG 1.4.11 para el contorno de un control; el `divider` se queda
   * en 1,5:1 y desaparecía.
   */
  fieldBorder: '#8b929c',
  /** Lo que acompaña sin competir: oficio, ciudad, distancia, pies de texto */
  textSoft: '#697586',
  /** Línea de un pelo, solo donde de verdad hace falta separar */
  hairline: '#e9edf1',
  text: '#1d1f20',
  accent: '#5980a6',
  accent2: '#728fab',
  divider: 'rgba(29, 31, 32, 0.16)',
  /**
   * El azul translúcido de la barra de abajo, tal cual
   * (`BottomTabBar.styles.ts`). Lo usan las tarjetas que explican una
   * pantalla, para que se lean como parte del mismo cristal que la barra.
   *
   * Sobre página blanca queda en un azul claro (#88a4bf), así que **el texto
   * blanco encima se queda en 2,6:1**: por debajo del 4,5:1 que pide la WCAG
   * para un cuerpo de 16 px. Es una decisión tomada a la vista de las dos
   * opciones, no un descuido; si algún día se quiere corregir, o sube la
   * opacidad o baja el color.
   */
  accentGlass: 'rgba(89, 128, 166, 0.72)',
  /**
   * El cristal navy: el velo que llevan encima del desenfoque la barra de
   * abajo y el bocadillo de la home.
   *
   * **Uno y compartido**, porque son la misma pieza de lenguaje: algo que
   * flota sobre el contenido dejándolo ver difuminado. Con dos valores
   * parecidos se verían como dos materiales distintos en la misma pantalla.
   *
   * Ese 0,78 no es de gusto: es el punto donde la letra blanca encima aguanta
   * en el peor caso —fondo blanco por detrás— con 6,93:1, y el estado apagado
   * de la barra, que va al 75 % de opacidad, todavía llega a 4,75:1. Bajarlo
   * enseña más de lo que hay detrás y se lleva por delante los rótulos
   * apagados, que son los primeros en caer.
   *
   * Navy y no `accentGlass`: ese azul es más claro y su propia ficha lo dice
   * —blanco encima se queda en 2,6:1—.
   */
  navyGlass: 'rgba(29, 45, 61, 0.78)',
  /**
   * El mismo cristal, en el rojo de "ahora no" (`unavailable`) y no en el de
   * error: rechazar un trabajo que no se puede hacer no es un fallo de nadie,
   * y con el rojo de error el trabajador leería que ha hecho algo mal.
   */
  unavailableGlass: 'rgba(209, 84, 74, 0.72)',

  // Neutral ramp
  neutral100: '#f5f5f8',
  neutral200: '#e7e7ea',
  neutral300: '#d4d4d7',
  neutral400: '#b7b7ba',
  neutral500: '#98989b',
  neutral600: '#7a7a7d',
  neutral700: '#5d5d60',
  neutral800: '#424244',
  neutral900: '#2b2b2d',

  // Accent ramp
  accent100: '#eef6ff',
  accent200: '#d6ebff',
  accent300: '#b5d9fd',
  accent400: '#94bce3',
  accent500: '#749dc4',
  accent600: '#597ea3',
  accent700: '#416180',
  accent800: '#2c455d',
  accent900: '#1d2d3d',

  // Accent-2 ramp
  accent2100: '#eef6ff',
  accent2200: '#d6ebff',
  accent2300: '#bdd8f2',
  accent2400: '#9ebbd8',
  accent2500: '#7e9cb8',
  accent2600: '#627d98',
  accent2700: '#486077',
  accent2800: '#314457',
  accent2900: '#1f2d3a',

  // Semánticos (según README)
  available: '#3f8f5a',
  /**
   * El mismo verde, oscurecido, para **escribir** con él sobre blanco.
   *
   * `available` es un color de contorno y de punto: al lado de una foto dice
   * "puede ir ahora" sin que nadie lo lea como texto. En letra se queda en
   * 3,97:1 contra el blanco, por debajo del 4,5:1 que pide la WCAG para un
   * cuerpo de 16 px; este llega a 6,35:1.
   *
   * Lo usa el recuento del bocadillo de la home —cuántos profesionales hay
   * cerca—, que es la cifra por la que el cliente decide si sigue.
   */
  availableText: '#2f6b43',
  /**
   * Y el mismo verde otra vez, esta vez **aclarado**, para escribir con él
   * sobre cristal oscuro.
   *
   * Son tres tonos del mismo color y cada uno tiene su fondo: `available` es
   * de contorno y de punto, `availableText` es para leer sobre blanco, y este
   * es para leer sobre el navy del bocadillo de la home. Los dos primeros son
   * verdes oscuros: sobre ese cristal dan 2,3:1 y 1,7:1, o sea que no se leen.
   * Este llega a 4,73:1, por encima del 4,5:1 que pide la WCAG.
   *
   * Se aclaró una segunda vez al subir la transparencia del bocadillo. Es la
   * cuenta que ata las dos cosas: cuanto más cristal, más claro tiene que ser
   * lo que se escribe encima. Bajar el velo sin tocar este verde lo deja por
   * debajo del umbral, y la cifra es justo el dato que no se puede perder.
   *
   * Aclarar hacía falta porque el fondo cambió de bando: el bocadillo era
   * blanco y pasó a ser el mismo cristal de la barra de abajo, con la letra
   * en blanco. Un color que funcionaba sobre papel no funciona sobre tinta.
   */
  availableOnGlass: '#8fe8ae',
  /**
   * El anillo de quien no atiende ahora. Rojo apagado y **no** `urgency`: no
   * ha fallado nada ni hay ninguna urgencia, solo dice que hoy no sale
   * corriendo.
   */
  unavailable: '#d1544a',

  /**
   * Naranja de "esto espera por ti": los encargos sin responder.
   *
   * Naranja y no rojo porque no hay nada roto ni vencido —el plazo sigue
   * corriendo—, y el rojo en una lista larga se lee como una fila de errores.
   *
   * Son tres y no uno porque hacen tres cosas distintas y cada una necesita su
   * contraste: `pending` es el contorno de la tarjeta (3,5:1 sobre blanco, por
   * encima del 3:1 que pide la WCAG 1.4.11 para delimitar un elemento),
   * `pendingSoft` el fondo de la etiqueta y `pendingText` la letra encima, que
   * juntos pasan de 7:1. Blanco sobre el naranja fuerte se quedaría en 3,5:1,
   * por debajo de lo que se lee.
   */
  pending: '#c9741f',
  pendingSoft: '#fceedd',
  pendingText: '#8a4d0a',
  /**
   * El mismo naranja de la familia de arriba, aclarado para escribir con él
   * sobre el cristal navy del bocadillo de la home. Ahí nombra **el oficio**
   * —"Hay 7 profesionales de *carpintería*"—, así que aquí no significa "hay
   * algo pendiente": es el mismo color de la casa haciendo otro trabajo.
   *
   * Aclarado por lo mismo que `availableOnGlass`: `pending` sobre ese cristal
   * da 1,98:1 y no se lee. Este llega a 4,71:1.
   *
   * Con esto son tres colores en una frase de diez palabras —blanco, verde y
   * naranja—, y es el techo: cada uno señala una cosa que se busca por
   * separado (cuántos hay, de qué oficio, y el resto de la frase). Un cuarto
   * ya no señalaría nada.
   */
  pendingOnGlass: '#ffcd7d',
  /**
   * Y el rojo, aclarado por lo mismo. Lo usa el icono de "Urgente" en la barra
   * de abajo desde que la barra es navy: el `urgency` de siempre sobre ese
   * cristal da 1,13:1, o sea que la pestaña roja desaparecía.
   *
   * Aun aclarado se queda en 3,09:1, que **basta para un icono y no para una
   * letra** —la WCAG pide 3:1 para un objeto gráfico y 4,5:1 para un texto—.
   * Por eso en la barra se pinta con él el dibujo y no el rótulo: el rótulo va
   * en blanco como los demás, y la pestaña se sigue leyendo como la roja.
   * Para llegar a 4,5 sobre ese fondo haría falta un rosa que ya no es rojo.
   */
  urgencyOnGlass: '#f0958a',
  urgency: '#a3453a',
  error: '#a3453a',
  rating: '#d4a13a',

  // Dark theme para app móvil (según MobileApp.dc.html)
  darkBg: '#04070f',
  darkText: '#e8edf5',
  darkDivider: 'rgba(232, 237, 245, 0.14)',
  darkInputBg: '#0c1220',

  // Tarjetas claras sobre fondo oscuro
  cardBg: '#fdfdfb',
  cardText: '#1c2b33',
  cardDivider: 'rgba(28, 43, 51, 0.14)',
} as const

export type Color = keyof typeof colors
