/**
 * El fondo de la entrada tiene que ser el claro de las tarjetas, el mismo que
 * hay detrás de Login y Registro: entrar y pulsar "Registrarse" no debe ser un
 * salto de color.
 *
 * Ya no está atado al vídeo. Lo estuvo mientras la animación era un logotipo
 * con alfa, que había que componer sobre este color exacto porque H.264 no
 * admite transparencia; la escena de ahora es opaca y trae su propio fondo,
 * así que este color se puede cambiar sin recodificar nada.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native'
import { theme } from '@/theme'
import { styles as authShellStyles } from '@/components/templates/AuthShell/AuthShell.styles'
import { styles } from './SplashPage.styles'

/**
 * `StyleSheet.flatten` devuelve el objeto de estilo ya resuelto. Se tipa como
 * la unión de los dos porque aquí se le pasan cajas y textos por igual.
 */
const flatten = (style: unknown) =>
  StyleSheet.flatten(style as never) as ViewStyle & TextStyle

describe('SplashPage — fondo', () => {
  it('usa el mismo claro que la tarjeta de Login y Registro', () => {
    expect(flatten(styles.container).backgroundColor).toBe(
      flatten(authShellStyles.card).backgroundColor
    )
  })

  /**
   * El vídeo es 9:16 y un móvil de hoy es más estrecho que eso. Con los
   * cuatro lados a cero, `cover` lo escalaba por el alto y se comía un 11%
   * por cada canto —y en esta pieza hay logotipo y hormigas hasta el borde—.
   * Sin `bottom`, el alto lo pone la pantalla a partir del ancho y no se
   * recorta nada.
   */
  it('no le fija el alto al vídeo: eso es lo que le comía los lados', () => {
    expect(flatten(styles.video).position).toBe('absolute')
    expect(flatten(styles.video).bottom).toBeUndefined()
    expect(flatten(styles.video).height).toBeUndefined()
  })

  /**
   * Los botones son cristal esmerilado, y esmerilar blanco da blanco: si la
   * banda que le sobra a la pantalla por debajo del vídeo se queda en color
   * plano, los botones se ven descoloridos sobre un vacío. La rellena el
   * mismo vídeo desenfocado.
   */
  it('rellena con vídeo la banda que le sobra a la pantalla', () => {
    const banda = flatten(styles.backdrop)

    expect(banda.position).toBe('absolute')
    expect(banda.bottom).toBe(0)
    // Recorta la vista de dentro, que es más alta que la banda a propósito
    expect(banda.overflow).toBe('hidden')
    expect(banda.backgroundColor).toBeUndefined()
  })

  it('deja que el vídeo pase por detrás de los botones', () => {
    /*
     * El bloque de botones no se pinta del color de la pantalla: lo que hay
     * bajo cada botón es el vídeo desenfocado, y un color plano ahí taparía
     * el cristal.
     */
    expect(flatten(styles.actions).backgroundColor).toBeUndefined()
    expect(flatten(styles.registerButton).backgroundColor).toBe('transparent')
    expect(flatten(styles.loginButton).backgroundColor).toBe('transparent')
  })

  it('pone cristal esmerilado en cada botón, no un desvanecido a blanco', () => {
    /*
     * El diseño pone ahí un degradado —`linear-gradient(180deg, transparent
     * 72%, ...)`— y aquí estuvo, apilando 16 franjas de opacidad creciente
     * porque React Native no tiene gradientes sin librería. Aclaraba la
     * imagen hacia el color de la pantalla, y lo que se quería era difuminarla
     * sin quitarle color.
     *
     * Va en un test porque es fácil que alguien reponga el degradado
     * "recuperando el diseño", y porque una hoja de estilos no cuenta lo que
     * ya no está.
     */
    expect(styles).not.toHaveProperty('gradient')

    // El cristal llena su botón, y el recorte lo mantiene dentro del redondeo
    expect(flatten(styles.glassFill).position).toBe('absolute')
    expect(flatten(styles.glass).overflow).toBe('hidden')
    expect(flatten(styles.glass).borderRadius).toBe(theme.radius.card)
  })
})

describe('SplashPage — botones', () => {
  it('no repite el redondeo: lo pone el átomo para toda la app', () => {
    // Empezó aquí y se subió a `Button`. Si vuelve a aparecer en esta hoja,
    // habrá dos sitios donde cambiarlo y uno se quedará atrás.
    expect(flatten(styles.buttonBase).borderRadius).toBeUndefined()
  })

  /**
   * La jerarquía la lleva el contorno, porque el relleno ya no está: los dos
   * botones son el mismo cristal. Si alguien iguala los grosores, dejan de
   * distinguirse el uno del otro.
   */
  it('distingue el principal por el grosor del contorno, no por el relleno', () => {
    expect(flatten(styles.registerButton).borderWidth).toBe(2)
    expect(flatten(styles.loginButton).borderWidth).toBeUndefined()
  })

  it('da a los dos un contorno que se ve', () => {
    /*
     * El borde por defecto de `secondary` es `divider` —negro al 16%—, que
     * sobre este cristal claro da 1,38:1: WCAG 1.4.11 pide 3:1 para el
     * contorno de un control. Con `accent700` son 5,79:1.
     */
    for (const boton of [styles.registerButton, styles.loginButton]) {
      expect(flatten(boton).borderColor).toBe(theme.colors.accent700)
      expect(flatten(boton).borderColor).not.toBe(theme.colors.divider)
    }
  })

  /** Sobre un vídeo en movimiento, la letra es lo único que ancla la lectura */
  it('resalta el texto de los dos, y más el del principal', () => {
    expect(flatten(styles.registerText).color).toBe(theme.colors.accent900)
    expect(flatten(styles.loginButtonText).color).toBe(theme.colors.accent700)

    for (const texto of [styles.registerText, styles.loginButtonText]) {
      expect(flatten(texto).fontFamily).toBe(
        theme.typography.fonts.bodySemiBold
      )
    }
  })

  it('lo hunde al pulsarlo, que sobre el cristal no hay relleno que oscurecer', () => {
    expect(flatten(styles.buttonPressed).backgroundColor).toBe(
      theme.colors.accent100
    )
  })
})
