/**
 * ReceptionStage Organism
 * El hueco grande de la home del cliente (25 Agosto 2026).
 *
 * Sustituye a `TradesGrid`, que enseñaba los dieciocho oficios en cuadrícula.
 * Elegir de una parrilla y buscar en el buscador de arriba eran dos caminos
 * al mismo sitio, y la parrilla ocupaba el resto de la pantalla para
 * repetirlo. Aquí queda **un** dibujo del tamaño de cuatro de aquellas
 * casillas, y el buscador es el único camino.
 *
 * El dibujo no es decoración: contesta. Mientras no se ha buscado nada es
 * Uhiro en el mostrador, y desde el bocadillo manda al buscador de arriba. En
 * cuanto una búsqueda encuentra a alguien, el mostrador se convierte en el
 * oficio buscado y Uhiro dice cuántos hay y ofrece verlos.
 *
 * **El bocadillo está siempre**, también al abrir la app. Antes solo aparecía
 * con una búsqueda detrás, y hasta entonces el único sitio que decía dónde
 * escribir era un cartel dibujado dentro de la ilustración: quien no lo mirase
 * se quedaba delante de un dibujo bonito sin nada que hacer. Uhiro lo dice
 * ahora en voz alta, y por el mismo canal por el que después dará la
 * respuesta.
 *
 * Y lo dice **escribiéndolo**, letra a letra. Es un personaje contestando a lo
 * que le acaban de preguntar, no un contador que se refresca: la respuesta
 * apareciendo entera de golpe se lee como un dato de la interfaz, y así se lee
 * como que alguien ha mirado y está respondiendo.
 *
 * Es un componente **tonto**: quién ha buscado qué y cuántos salen se lo dan
 * hecho. Así se puede probar el bocadillo entero sin servidor.
 */

import { useEffect, useState } from 'react'
import { View, Text, Image, AccessibilityInfo } from 'react-native'
import { BlurView } from 'expo-blur'
import { Button } from '@/components/atoms/Button'
import { images } from '@/images'
import { getTradeImage, getTradeLabel, type TradeSlug } from '@/utils/trades'
import { styles } from './ReceptionStage.styles'

/**
 * Lo que tarda cada letra en salir.
 *
 * Empezó en 16 ms y se veía escribir apenas —una frase de cuarenta caracteres
 * resuelta en medio segundo es un parpadeo, no un tecleo—, pasó por 45 y se
 * quedó aquí: esa misma frase tarda ahora casi tres segundos y se lee al ritmo
 * al que se escribe, que es de lo que iba el efecto.
 *
 * Lo que quita el filo de esperar tres segundos es que **el bocadillo ya está
 * a su tamaño final** desde el primer fotograma: se ve cuánto va a decir antes
 * de que lo diga, así que la espera es por leerlo y no por saber si cabe algo
 * más. Sin esa parte, este número sería demasiado alto.
 */
export const TYPING_MS = 70

/**
 * Un trozo de lo que dice Uhiro.
 *
 * La frase va partida porque dentro hay **dos datos que se buscan por
 * separado**: cuántos hay y de qué oficio. Cada uno lleva su color —la cifra
 * en verde y negrita, el oficio en naranja— para que leyendo por encima se
 * vean los dos sin llegar a leer la frase entera.
 *
 * Y va partida en trozos y no marcada con etiquetas dentro del texto porque el
 * tecleo tiene que poder cortar por cualquier letra, también por la mitad de
 * la cifra o del nombre del oficio.
 */
interface Segment {
  text: string
  tone?: 'count' | 'trade'
}

/** El estilo de cada trozo; sin `tone`, hereda el blanco de la frase */
const TONES = {
  count: styles.count,
  trade: styles.trade,
} as const

/**
 * Cuántos caracteres de la frase se ven ya.
 *
 * Se cuenta sobre la frase entera y no por trozo, para que el corte cruce las
 * fronteras entre ellos sin detenerse: si no, la cifra aparecería de golpe al
 * llegarle el turno.
 */
function useTyped(full: string): number {
  const [shown, setShown] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  /**
   * Quien tiene puesto "reducir movimiento" en su móvil lo tiene puesto por
   * algo —desde el mareo al vértigo—, y una frase que se escribe sola es
   * justo movimiento. Ahí sale entera de una vez, que es lo mismo que decía
   * pero sin animarlo.
   */
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

  useEffect(() => {
    if (reduceMotion || full === '') {
      setShown(full.length)
      return
    }

    /*
      Se reinicia a cero en cada frase nueva. Sin esto, buscar otro oficio
      dejaría la frase anterior a medio borrar debajo de la nueva, porque el
      contador seguiría donde lo dejó.
    */
    setShown(0)

    let count = 0
    const timer = setInterval(() => {
      count += 1
      setShown(count)
      if (count >= full.length) clearInterval(timer)
    }, TYPING_MS)

    return () => clearInterval(timer)
  }, [full, reduceMotion])

  return shown
}

/**
 * La frase de Uhiro, saliendo letra a letra **sin mover el bocadillo**.
 *
 * Son dos copias de la misma frase, una encima de otra. La de abajo va entera
 * e invisible y es la que mide: fija el alto y el ancho del bocadillo desde el
 * primer fotograma. La de arriba va en absoluto —no mide nada— y enseña solo
 * lo escrito hasta ahora.
 *
 * Con una sola copia, el bocadillo crecía con cada letra: una caja estirándose
 * y saltando de línea a mitad de frase, que llamaba más la atención que lo que
 * ponía.
 */
function Typed({ segments }: { segments: Segment[] }) {
  const full = segments.map((segment) => segment.text).join('')
  const shown = useTyped(full)

  let budget = shown

  return (
    <View>
      {/*
        El fantasma. Se esconde del lector de pantalla porque si no leería la
        frase dos veces, una por copia.
      */}
      <Text
        style={[styles.speech, styles.ghost]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {full}
      </Text>

      {/*
        Y lo escrito. La etiqueta lleva la frase **entera** desde el primer
        momento: un lector de pantalla que fuese leyendo lo que hay diría
        "Hay", "Hay 7", "Hay 7 pro"… una vez por letra. La animación es para
        quien la ve, y quien no la ve merece la respuesta de una vez.
      */}
      <Text style={[styles.speech, styles.typed]} accessibilityLabel={full}>
        {segments.map((segment, index) => {
          const slice = segment.text.slice(0, Math.max(0, budget))
          budget -= segment.text.length

          if (slice === '') return null

          return segment.tone ? (
            <Text key={index} style={TONES[segment.tone]}>
              {slice}
            </Text>
          ) : (
            <Text key={index}>{slice}</Text>
          )
        })}
      </Text>
    </View>
  )
}

export interface ReceptionStageProps {
  /** El oficio de la última búsqueda. `null` mientras no se ha buscado nada */
  trade?: TradeSlug | null
  /** Cuántos profesionales hay de ese oficio; `undefined` hasta que contesta */
  total?: number
  /**
   * Si ese recuento es **el de los que llegan hasta el cliente** o el de toda
   * la app. Decide si el bocadillo dice "cerca de ti", y por eso no se da por
   * supuesto: sin permiso de ubicación no hay contra qué medir, y prometer
   * cercanía sobre un número nacional es mentir en la primera frase.
   */
  nearby?: boolean
  isLoading?: boolean
  isError?: boolean
  /** Abrir el directorio ya filtrado por el oficio buscado */
  onSee: () => void
  testID?: string
}

export function ReceptionStage({
  trade,
  total,
  nearby = false,
  isLoading = false,
  isError = false,
  onSee,
  testID,
}: ReceptionStageProps) {
  /*
    El oficio solo toma el sitio del mostrador **si hay alguien**. Enseñar la
    ilustración de carpintería para decir que no hay carpinteros parece un
    resultado hasta que se lee el bocadillo.
  */
  const hayAlguien = trade != null && total !== undefined && total > 0

  const label = trade ? getTradeLabel(trade).toLowerCase() : ''

  const dice = () => {
    /*
      Sin búsqueda detrás, la instrucción. Es lo primero que se lee al abrir la
      app, así que no describe la pantalla: dice qué hacer y dónde.
    */
    if (trade == null) {
      return (
        <Typed
          segments={[
            {
              text: 'Dime arriba qué profesional estás buscando y te encontraré el más cercano a ti.',
            },
          ]}
        />
      )
    }

    // El fallo se mira antes que la espera: al fallar la consulta deja de
    // cargar pero tampoco trae recuento, y "un momento, que miro" se quedaría
    // ahí para siempre sin que nadie esté mirando nada.
    if (isError) {
      return (
        <Text style={styles.speech}>
          No he podido mirarlo. Prueba otra vez.
        </Text>
      )
    }

    /*
      La espera no se teclea. Es un texto de paso que se va en cuanto llega la
      respuesta, y animarlo pondría a Uhiro escribiendo "un momento" durante
      justo el momento que dura la espera.
    */
    if (isLoading || total === undefined) {
      return <Text style={styles.speech}>Un momento, que miro…</Text>
    }

    if (total === 0) {
      return (
        <Typed
          segments={[
            { text: 'Todavía no hay nadie de ' },
            { text: label, tone: 'trade' },
            { text: nearby ? ' cerca de ti.' : ' en Lughly.' },
          ]}
        />
      )
    }

    return (
      <Typed
        segments={[
          { text: 'Hay ' },
          { text: String(total), tone: 'count' },
          { text: ` ${total === 1 ? 'profesional' : 'profesionales'} de ` },
          { text: label, tone: 'trade' },
          { text: nearby ? ' cerca de ti' : '' },
        ]}
      />
    )
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.stage}>
        <Image
          source={hayAlguien ? getTradeImage(trade) : images.recepcion}
          style={styles.image}
          resizeMode="cover"
          accessible={false}
          testID={testID ? `${testID}-image` : undefined}
        />

        {/*
          Siempre. Con búsqueda detrás contesta; sin ella, manda al buscador.
        */}
        <View style={styles.bubble} testID="reception-bubble">
          <View style={styles.card}>
            {/*
                El mismo cristal que la barra de abajo: `BlurView` ultrafino,
                misma intensidad y el mismo `blurMethod`, que en Android no es
                opcional —sin él no desenfoca, dibuja un velo de color plano—.

                Encima va el velo navy, y ahí sí se separa de la barra: la
                barra flota sobre pantallas blancas y con el desenfoque le
                basta, mientras que esto flota sobre un dibujo a todo color y
                la letra va en blanco. Los números del contraste, en la hoja de
                estilos.
              */}
            <BlurView
              intensity={40}
              tint="systemUltraThinMaterialLight"
              blurMethod="dimezisBlurViewSdk31Plus"
              style={styles.glass}
              pointerEvents="none"
            />
            <View style={styles.veil} pointerEvents="none" />

            <View style={styles.said}>{dice()}</View>

            {hayAlguien && (
              <Button
                size="small"
                onPress={onSee}
                style={styles.see}
                textStyle={styles.seeText}
                testID="reception-see"
              >
                Ver
              </Button>
            )}
          </View>

          {/*
              El pico va dentro del bocadillo y no suelto, para que siga a su
              borde de arriba sea cual sea el alto del texto. Fuera de `card`,
              que recorta: si estuviera dentro, el recorte se lo comería.
            */}
          {/*
            Son dos triángulos: el dorado por detrás, un pelo más grande, del
            que solo se ve el canto. Es la única forma de contornear un
            triángulo dibujado con el truco de los bordes.
          */}
          <View style={styles.tailEdge} pointerEvents="none" />
          <View style={styles.tail} pointerEvents="none" />
        </View>
      </View>
    </View>
  )
}
