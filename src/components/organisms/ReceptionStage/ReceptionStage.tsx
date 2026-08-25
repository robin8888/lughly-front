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
 * Uhiro en el mostrador, con el cartel que dice dónde escribir. En cuanto una
 * búsqueda encuentra a alguien, el mostrador se convierte en el oficio
 * buscado y Uhiro dice desde un bocadillo cuántos hay y ofrece verlos.
 *
 * Es un componente **tonto**: quién ha buscado qué y cuántos salen se lo dan
 * hecho. Así se puede probar el bocadillo entero sin servidor.
 */

import { View, Text, Image } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { images } from '@/images'
import { getTradeImage, getTradeLabel, type TradeSlug } from '@/utils/trades'
import { styles } from './ReceptionStage.styles'

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
    // El fallo se mira antes que la espera: al fallar la consulta deja de
    // cargar pero tampoco trae recuento, y "un momento, que miro" se quedaría
    // ahí para siempre sin que nadie esté mirando nada.
    if (isError) {
      return <Text style={styles.speech}>No he podido mirarlo. Prueba otra vez.</Text>
    }

    if (isLoading || total === undefined) {
      return <Text style={styles.speech}>Un momento, que miro…</Text>
    }

    if (total === 0) {
      return (
        <Text style={styles.speech}>
          {nearby
            ? `Todavía no hay nadie de ${label} cerca de ti.`
            : `Todavía no hay nadie de ${label} en Lughly.`}
        </Text>
      )
    }

    return (
      <Text style={styles.speech}>
        Hay <Text style={styles.count}>{total}</Text>{' '}
        {total === 1 ? 'profesional' : 'profesionales'} de {label}
        {nearby ? ' cerca de ti' : ''}
      </Text>
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
          El bocadillo solo aparece cuando hay algo que contestar: sin
          búsqueda detrás, un cartel flotando sobre el mostrador no dice nada.
        */}
        {trade != null && (
          <View style={styles.bubble} testID="reception-bubble">
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

            {/*
              El pico va dentro del bocadillo y no suelto, para que siga a su
              borde de arriba sea cual sea el alto del texto.
            */}
            <View style={styles.tail} pointerEvents="none" />
          </View>
        )}
      </View>
    </View>
  )
}
