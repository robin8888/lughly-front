/**
 * HeroCard styles
 * Valores literales de HOME_MOBILE.md §2.
 *
 * Dos paletas para la misma pieza:
 *
 * - `dark`: la del diseño, tarjeta #04070f sobre fondo negro. Es la de
 *   HOME_MOBILE.md y no se toca.
 * - `light`: tarjeta clara, que es la que usan las dos home. Sobre el fondo
 *   claro de la app una tarjeta negra se lee como un bloque pegado, no como la
 *   cabecera de la pantalla.
 *
 * Lo que cambia es solo el color: tamaños, espaciados y estructura son los
 * mismos en las dos. Por eso hay un `base` compartido y dos mapas de color,
 * en vez de dos hojas de estilos que habría que mantener en paralelo.
 */

import { StyleSheet, type TextStyle } from 'react-native'
import { theme } from '@/theme'

export type HeroVariant = 'dark' | 'light'

/**
 * Estrellas de la ficha del profesional. Más grandes que las de una tarjeta
 * de datos: aquí no acompañan a una cifra, son el resumen de su reputación y
 * lo segundo que se mira después de la foto.
 */
export const PROFILE_STAR_SIZE = 16

export const styles = StyleSheet.create({
  /**
   * A sangre y pegada arriba: de canto a canto de la pantalla y sin hueco
   * sobre ella.
   *
   * Estuvo con doce puntos de margen por los lados y por arriba, o sea
   * flotando como una tarjeta más de la lista. No lo es: es **la cabecera de
   * la pantalla**, y ese margen la dejaba leyéndose como un recuadro pegado
   * encima del contenido en vez de como su principio. Es el mismo movimiento
   * que ya hizo la home del cliente con su hero y su escena.
   *
   * El margen negativo **cancela el `paddingHorizontal: 12` del contenedor**
   * de `HomePagePro`, que es quien la pinta. Es acoplamiento, y a propósito:
   * la alternativa era quitarle ese relleno al contenedor y devolvérselo a los
   * ocho bloques de debajo, que es mucho más sitio donde equivocarse. Si algún
   * día cambia ese doce, este tiene que cambiar con él.
   *
   * Y sin redondear, por lo mismo que el hero del cliente: a sangre, una curva
   * deja medias lunas del fondo contra el borde del móvil.
   */
  card: {
    marginHorizontal: -12,
    marginTop: 0,
    borderRadius: 0,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 26,
  },
  /**
   * El logotipo, al mismo tamaño que el "LUGHLY" de 20 px que sustituye.
   *
   * Se iguala la altura de la mayúscula y no la de la imagen: el texto iba en
   * mayúsculas y el logotipo lleva 'g' e 'y' bajando de la línea base. Mismo
   * cálculo que en `AuthShell`, donde está explicado entero.
   *
   *   20 × 0,70 = 14,0 de mayúscula ÷ 0,7468 = 18,7 a la par del texto
   *   ×2 por decisión de producto: 37,4 de alto → 109,3 de ancho
   *
   * Alineado a la izquierda, como estaba el texto.
   */
  brand: {
    height: 37.4,
    aspectRatio: 900 / 308,
    alignSelf: 'flex-start',
  },
  /**
   * Foto y nombre centrados, en los dos roles. Al profesional le cuelgan
   * además su oficio y su valoración.
   *
   * `marginBottom` propio: cuando aquí había debajo un titular, la separación
   * la ponía él con su `marginTop`. Ya no hay titular.
   */
  profile: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 18,
  },
  userName: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 29,
    lineHeight: 32.5,
    textAlign: 'center',
    marginTop: 10,
  },
  /** Oficio · ciudad, bajo el nombre */
  profileMeta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    textAlign: 'center',
    marginTop: 4,
  },
  profileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  profileRatingText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
  },
  /**
   * Los botones van apilados a lo ancho, no dos por fila.
   *
   * Iban en fila cuando eran una pareja —"Publicar un trabajo" junto a "Ver
   * profesionales"— y por eso llevaban `flex: 1` y un cuerpo de 14 px, más
   * pequeño que un botón normal, para que los textos largos no partieran en
   * dos líneas. Al quedarse uno solo, esa estrechez ya no la pide nadie.
   */
  /**
   * El de la agenda del profesional: la mitad de la caja y centrado.
   *
   * `width` en porcentaje y no un número: la cabecera se estira con la
   * pantalla, y media tarjeta tiene que seguir siendo media en un móvil
   * pequeño y en una tableta. `alignSelf` porque sin `fullWidth` el botón se
   * estira igual —la tarjeta es una columna— y quedaría a la izquierda.
   */
  actionHalf: {
    width: '50%',
    alignSelf: 'center',
  },
  actionText: {
    fontSize: 14,
  },
  urgent: {
    marginTop: 8,
    backgroundColor: theme.colors.urgency,
    borderColor: theme.colors.urgency,
  },
})

/**
 * Solo colores. Se fueron de aquí `brand` —ahora es una imagen, que se lee
 * sobre las dos paletas—, y `tag`, `tagText` y `title`, cuyos elementos
 * desaparecieron de la tarjeta.
 *
 * Y se fueron también `actionSecondary` y `actionSecondaryText`, que vestían
 * el botón hueco del profesional: desde el 4 de septiembre de 2026 lleva el
 * mismo relleno azul que el del cliente, y ese color no depende de la paleta
 * —es el `primary` del botón, que se lee igual sobre las dos—.
 *
 * `body` se queda aunque ya no haya párrafo: es el color apagado de la
 * paleta, y lo usan el oficio y la valoración del profesional.
 */
interface HeroPalette {
  userName: TextStyle
  body: TextStyle
}

export const palettes: Record<HeroVariant, HeroPalette> = {
  dark: {
    /**
     * `accent300` y no el azul de marca: sobre negro, `accent` se queda en
     * 2,4:1 y el nombre no se lee. Es el mismo azul de la app aclarado hasta
     * que contrasta.
     */
    userName: { color: theme.colors.accent300 },
    body: { color: 'rgba(255, 255, 255, 0.75)' },
  },
  light: {
    /** Sobre claro es el 700 el que contrasta, igual que el resto de rótulos */
    userName: { color: theme.colors.accent700 },
    // 0.8 y no 0.75: sobre claro el mismo porcentaje se lee más lavado.
    body: { color: 'rgba(28, 43, 51, 0.8)' },
  },
}
