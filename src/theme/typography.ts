/**
 * Typography tokens
 * Fuentes: Fredoka (titulares) + Nunito (cuerpo)
 *
 * **Cambio del 18 Agosto 2026.** Antes eran Barlow Condensed y Barlow: una
 * grotética estrecha de señalética, correcta y seca. El logotipo, en cambio,
 * son letras gordas de esquinas redondas, y las dos cosas juntas parecían de
 * productos distintos. Fredoka es lo más cercano a esas letras que hay en
 * Google Fonts; Nunito lleva los remates redondeados y aguanta bien en cuerpos
 * pequeños, que es donde vive casi todo el texto de la app.
 *
 * **Ojo al tocar titulares:** Fredoka NO es condensada y Barlow Condensed sí,
 * así que todo lo que use `heading` ocupa más ancho que antes. Los rótulos de
 * pantalla van holgados, pero cualquier texto nuevo que se meta en media fila
 * hay que mirarlo en el móvil.
 *
 * Por eso las etiquetas de botón se pasaron a `bodyBold`: van a 14-16 px,
 * dos por fila y con `numberOfLines={1}`, y en Fredoka se cortarían.
 */

export const typography = {
  fonts: {
    heading: 'Fredoka_600SemiBold',
    body: 'Nunito_400Regular',
    bodySemiBold: 'Nunito_600SemiBold',
    bodyBold: 'Nunito_700Bold',
  },
  /**
   * Escala subida ~12% sobre la del diseño web (13 Agosto 2026): los tamaños
   * originales estaban pensados para una maqueta de 390 px vista en pantalla
   * grande, y en el móvil real se leían pequeños.
   *
   * **Segunda subida, solo en los cuerpos pequeños (18 Agosto 2026):** `small`
   * y `tiny` son los que llevan casi todo el texto secundario de la app —229
   * reglas entre los dos— y seguían quedándose cortos en el móvil. Los
   * titulares no se tocan: el problema era de lectura, no de jerarquía, y
   * subirlo todo habría dejado la escala igual de apretada.
   *
   * Sube aquí y no regla a regla porque los `lineHeight` de la app se calculan
   * multiplicando estos valores; tocarlos uno por uno habría descuadrado el
   * interlineado en la mitad de las pantallas.
   *
   * Entre paréntesis, el valor original del diseño por si hay que volver atrás.
   */
  sizes: {
    h1: 46, // 42
    h2: 36, // 32
    h3: 28, // 25
    h4: 22, // 20
    h5: 18, // 16
    h6: 15, // 13
    body: 17, // 15
    small: 16, // 13 · era 15
    tiny: 13.5, // 11 · era 12,5
    button: 16, // 14
  },
  lineHeights: {
    heading: 1.12,
    body: 1.55,
    button: 1.2,
  },
} as const

/**
 * **No hay tokens de `letterSpacing`, y es a propósito.**
 *
 * Los hubo, copiados del CSS tal cual: `caps: 0.08`, `heading: -0.015`. Pero
 * en CSS eso son **em** —proporción del cuerpo— y React Native lo interpreta
 * en **puntos**. Un tracking de 0,08 puntos es exactamente nada, así que los
 * rótulos en mayúsculas iban sin separar sin que nadie lo notara. Al final no
 * los usaba ningún componente: cada regla pone su tracking en puntos y bien
 * calculado (0,66 sobre 12,5 px, 0,4 sobre 13,5…).
 *
 * O sea que eran un duplicado muerto y equivocado. Si vuelven, tienen que ser
 * una función del cuerpo —`em * fontSize`— y no una constante, porque el mismo
 * em da puntos distintos en cada tamaño.
 */
export type FontFamily = keyof typeof typography.fonts
export type FontSize = keyof typeof typography.sizes
