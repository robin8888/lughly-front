/**
 * Sparkles Atom
 * Chispitas que salen de algo, en bucle, para que se mire.
 *
 * Se hizo para el botón de mensajes de la home del cliente: es el sitio donde
 * le contesta el profesional y quedaba perdido entre el logotipo y su foto,
 * sin nada que dijera que ahí pasan cosas. La chapa roja avisa cuando hay algo
 * sin leer, pero **antes** de que llegue el primer mensaje el botón no dice
 * nada, y ahí es cuando hay que enseñar dónde está.
 *
 * ## Por qué en bucle y no una vez
 *
 * Porque no señala un suceso, señala un sitio. Una animación que ocurre al
 * entrar se la pierde quien estaba mirando otra cosa, que es justo el caso.
 *
 * ## Y por qué no es un adorno
 *
 * Va **fuera del árbol de accesibilidad** y no recibe toques: es decoración
 * pura sobre un botón que ya tiene su etiqueta. Un lector de pantalla no debe
 * anunciar tres estrellas, y un dedo que caiga encima tiene que pulsar el
 * botón de debajo.
 */

import { useEffect, useState } from 'react'
import { AccessibilityInfo, View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { theme } from '@/theme'
import { styles } from './Sparkles.styles'

/** Lo que tarda una chispa en encenderse y apagarse */
const FLASH_MS = 900

/**
 * Y lo que espera antes de volver a empezar.
 *
 * Largo a propósito: sin pausa serían tres luces parpadeando sin parar al lado
 * de un logotipo, que es lo que separa "mira aquí" de un cartel de neón. Con
 * ella el destello llega, se va, y vuelve cuando ya no se le esperaba.
 */
const REST_MS = 1400

/**
 * Dónde va cada chispa y cuándo le toca.
 *
 * Seis, repartidas alrededor y **desacompasadas**: a la vez serían un latido
 * y se leerían como un aviso —algo que hay que atender—, en vez de como un
 * brillo. Los retardos reparten las seis por toda la vuelta del ciclo, así que
 * siempre hay alguna encendida y nunca todas. Los tamaños tampoco se repiten,
 * para que no parezcan copias.
 */
const SPARKS = [
  { top: -6, left: -7, size: 11, delay: 0 },
  { top: -4, left: 20, size: 7, delay: 380 },
  { top: 30, left: -4, size: 9, delay: 760 },
  // Las tres de abajo y la de la derecha van por debajo de la altura de la
  // chapa de mensajes sin leer, que vive arriba a la derecha: las dos cosas
  // encima se estorban justo cuando más falta hace que se lea la chapa.
  { top: 34, left: 52, size: 7, delay: 1140 },
  { top: 46, left: 46, size: 8, delay: 1520 },
  { top: 44, left: 6, size: 9, delay: 1900 },
] as const

export interface SparklesProps {
  /** El dorado por defecto es el de las valoraciones */
  color?: string
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function Sparkles({
  color = theme.colors.rating,
  style,
  testID,
}: SparklesProps) {
  /**
   * Quien tiene puesto "reducir movimiento" lo tiene puesto por algo. Ahí las
   * chispas se quedan encendidas y quietas: siguen marcando el sitio, que es
   * para lo que están, sin la parte que molesta.
   */
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    let alive = true

    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduceMotion(value)
    })

    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    )

    return () => {
      alive = false
      sub?.remove?.()
    }
  }, [])

  return (
    <View
      style={[styles.layer, style]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      {SPARKS.map((spark) => (
        <Spark
          key={`${spark.top}:${spark.left}`}
          spark={spark}
          color={color}
          still={reduceMotion}
        />
      ))}
    </View>
  )
}

function Spark({
  spark,
  color,
  still,
}: {
  spark: (typeof SPARKS)[number]
  color: string
  still: boolean
}) {
  const life = useSharedValue(still ? 1 : 0)

  useEffect(() => {
    if (still) {
      life.value = 1
      return
    }

    /*
      Encender, apagar, esperar. El `withDelay` de fuera solo corre la primera
      vuelta: es lo que desacompasa las tres sin necesitar tres relojes.
    */
    life.value = withDelay(
      spark.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: FLASH_MS / 2, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: FLASH_MS / 2, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: REST_MS }),
        ),
        -1,
        false,
      ),
    )
  }, [life, spark.delay, still])

  /*
    Crece mientras aparece y se queda pequeña al apagarse. Una chispa que solo
    cambia de opacidad parpadea; con el tamaño, destella.
  */
  const animated = useAnimatedStyle(() => ({
    opacity: life.value,
    transform: [{ scale: 0.55 + life.value * 0.45 }],
  }))

  return (
    <Animated.View
      style={[
        styles.spark,
        { top: spark.top, left: spark.left, width: spark.size, height: spark.size },
        animated,
      ]}
    >
      <Svg viewBox="0 0 24 24" width="100%" height="100%">
        {/*
          Un destello de cuatro puntas, no una estrella de cinco: las puntas
          salen de un centro con los lados cóncavos, que es lo que se lee como
          brillo y no como icono de valoración.
        */}
        <Path
          d="M12 0 C13.2 8.4 15.6 10.8 24 12 C15.6 13.2 13.2 15.6 12 24 C10.8 15.6 8.4 13.2 0 12 C8.4 10.8 10.8 8.4 12 0 Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  )
}
