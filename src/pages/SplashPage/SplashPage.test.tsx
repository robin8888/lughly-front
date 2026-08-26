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
import { styles, REGISTER_GLASS, LOGIN_GLASS } from './SplashPage.styles'

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
     * El bloque de botones no se pinta del color de la pantalla, y el relleno
     * de cada uno es un velo: lo que hay debajo es el vídeo desenfocado, y un
     * color opaco ahí taparía el cristal y devolvería el rectángulo plano que
     * fueron estos botones al principio.
     */
    expect(flatten(styles.actions).backgroundColor).toBeUndefined()

    for (const boton of [styles.registerButton, styles.loginButton]) {
      const relleno = flatten(boton).backgroundColor as string
      const alfa = Number(relleno.replace(/^rgba\(|\)$/g, '').split(',')[3])

      expect(relleno).toMatch(/^rgba\(/)
      expect(alfa).toBeGreaterThan(0)
      expect(alfa).toBeLessThan(1)
    }
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
   * La jerarquía la lleva el color del relleno: azul lleno el principal,
   * blanco el otro. El contorno la subraya con el doble de grosor en el
   * primero, pero ya no es lo único que los separa.
   */
  it('rellena el principal de azul y el otro de blanco', () => {
    expect(flatten(styles.registerButton).backgroundColor).toBe(REGISTER_GLASS)
    expect(flatten(styles.loginButton).backgroundColor).toBe(LOGIN_GLASS)

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

  /**
   * Cada letra va contra su propio relleno, no contra el cristal desnudo. Si
   * alguien cambia un relleno sin cambiar su letra —o al revés— se pierde el
   * contraste que sostiene la pantalla entera, porque debajo hay un vídeo que
   * cambia de color con cada fotograma.
   */
  it('resalta el texto de los dos, cada uno contra su relleno', () => {
    expect(flatten(styles.registerText).color).toBe('#ffffff')
    expect(flatten(styles.loginButtonText).color).toBe(theme.colors.accent700)

    for (const texto of [styles.registerText, styles.loginButtonText]) {
      expect(flatten(texto).fontFamily).toBe(
        theme.typography.fonts.bodySemiBold
      )
    }
  })

  /*
   * Y cada uno se hunde hacia su lado. Compartir un solo estado pulsado, como
   * cuando los dos estaban huecos, dejaría "Registrarse" en blanco sobre casi
   * blanco justo en el instante de la pulsación.
   */
  it('hunde el azul oscureciéndolo y el blanco aclarándolo', () => {
    expect(flatten(styles.registerPressed).backgroundColor).toBe(
      theme.colors.accent900
    )
    expect(flatten(styles.loginPressed).backgroundColor).toBe(
      theme.colors.accent100
    )
  })
})
