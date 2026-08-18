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

  it('deja que el vídeo pase por detrás de los botones', () => {
    /*
     * Antes el bloque de botones se pintaba del color de la pantalla para que
     * no se notara el escalón contra el vídeo, que terminaba justo encima.
     * Ahora el vídeo ocupa la pantalla entera y lo que hay bajo los botones es
     * él, desenfocado: un color plano ahí taparía el desenfoque y devolvería
     * el escalón por el otro lado.
     */
    expect(flatten(styles.actions).backgroundColor).toBeUndefined()
    expect(flatten(styles.video).position).toBe('absolute')
  })

  it('pone cristal esmerilado bajo los botones, no un desvanecido a blanco', () => {
    /*
     * El diseño pone ahí un degradado —`linear-gradient(180deg, transparent
     * 72%, ...)`— y aquí estuvo, apilando 16 franjas de opacidad creciente
     * porque React Native no tiene gradientes sin librería. Aclaraba la imagen
     * hacia el color de la pantalla, y lo que se quería era difuminarla sin
     * quitarle color: se cambió por una franja desenfocada en vivo.
     *
     * Va en un test porque es fácil que alguien reponga el degradado
     * "recuperando el diseño", y porque una hoja de estilos no cuenta lo que
     * ya no está.
     */
    expect(styles).not.toHaveProperty('gradient')

    // El cristal cubre el bloque entero, y sin color plano que lo tape
    expect(flatten(styles.actionsBlur).position).toBe('absolute')
    expect(flatten(styles.actions).backgroundColor).toBeUndefined()
  })
})

describe('SplashPage — botones', () => {
  it('no repite el redondeo: lo pone el átomo para toda la app', () => {
    // Empezó aquí y se subió a `Button`. Si vuelve a aparecer en esta hoja,
    // habrá dos sitios donde cambiarlo y uno se quedará atrás.
    expect(flatten(styles.buttonBase).borderRadius).toBeUndefined()
  })

  it('rellena "Iniciar sesión" de blanco, con el azul de la app en el texto', () => {
    // Sobre el cristal esmerilado, el blanco lo despega del vídeo de detrás
    expect(flatten(styles.loginButton).backgroundColor).toBe('#ffffff')
    expect(flatten(styles.loginButtonText).color).toBe(theme.colors.accent700)
  })

  it('lo hunde al pulsarlo, que el fondo a mano tapa el de la variante', () => {
    expect(flatten(styles.loginButtonPressed).backgroundColor).toBe(
      theme.colors.accent100
    )
  })

  it('da a "Iniciar sesión" un contorno que se ve', () => {
    /*
     * El borde por defecto de `secondary` es `divider` —negro al 16%—, que
     * sobre este fondo claro da 1,38:1: WCAG 1.4.11 pide 3:1 para el contorno
     * de un control. Con `accent700` son 5,79:1.
     */
    const login = flatten(styles.loginButton)

    expect(login.borderColor).toBe(theme.colors.accent700)
    expect(login.borderColor).not.toBe(theme.colors.divider)
  })

  it('empareja el texto del secundario con su contorno', () => {
    expect(flatten(styles.loginButtonText).color).toBe(
      flatten(styles.loginButton).borderColor
    )
  })
})
