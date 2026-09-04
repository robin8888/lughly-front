/**
 * TradeRatesField Molecule
 * Los oficios que alguien ejerce, cada uno con su precio por hora.
 *
 * Lo usan los tres sitios donde se declaran oficios: el registro, el alta de
 * un trabajador por parte de su empresa y la pantalla de cambiarlos después.
 * Es el mismo dato en los tres, y con tres formularios distintos acabarían
 * validando cosas distintas.
 *
 * Cada oficio lleva lo suyo —los dos precios y lo que cuenta de él— porque no
 * se cobra lo mismo por limpiar una casa que por cuidar a un mayor, ni se
 * cuenta lo mismo. Con un precio único habría que elegir entre malvender el
 * trabajo caro o parecer caro en el barato, y en un directorio donde el
 * cliente compara precios eso deja fuera de las dos búsquedas.
 *
 * Los dos precios van uno al lado del otro: son la misma pregunta —cuánto
 * vale tu hora— contestada en dos situaciones, y en columna el de abajo
 * parecía una corrección del de arriba.
 */

import { useState, type ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Picker } from '@/components/molecules/Picker'
import { TRADE_OPTIONS, getTradeLabel, isVisitEligibleTrade } from '@/utils/trades'
import { styles } from './TradeRatesField.styles'

/**
 * Un ejemplo del propio oficio, no un "describe tu trabajo".
 *
 * Un marcador genérico se lee como un campo más que rellenar; uno que ya
 * habla de lo suyo enseña de qué va esto —de lo que hace en ESE oficio— sin
 * tener que explicarlo aparte.
 */
function placeholderFor(slug: string): string {
  return `Ej. lo que sueles hacer en ${getTradeLabel(slug).toLowerCase()}, y lo que te distingue.`
}

export interface TradeRate {
  slug: string
  /**
   * Cómo cobra este oficio: por hora, o por una visita para evaluar y
   * presupuestar. No los dos — es la misma pregunta ("cuánto cuesta este
   * oficio") contestada de una forma u otra, y es lo que sale en la tarjeta
   * del directorio.
   */
  pricingMode: 'HOURLY' | 'VISIT'
  /** Como texto: es lo que hay en el campo, con la coma que teclee */
  hourlyRate: string
  /** Lo que cobra por presentarse a evaluar y presupuestar, también como texto */
  visitFee: string
  /**
   * Cuántas horas hay que contratarle como mínimo en este oficio, como texto.
   *
   * **Vacío significa sin mínimo**, igual que la tarifa de urgencia: es una
   * decisión y no un campo a medio rellenar. Solo se pregunta en los oficios
   * por hora; en los de visita, el suelo es la propia visita.
   */
  minHours: string
  /**
   * Lo que cobra por una urgencia de este oficio, también como texto.
   *
   * **Vacío significa que no atiende urgencias de este oficio**, y por eso no
   * se valida como un campo que falte: es una decisión, y hay quien sale
   * corriendo por una fuga pero no por un mueble.
   */
  urgencyRate: string
  /**
   * Qué hace en este oficio, con sus palabras.
   *
   * Una por oficio y no una del perfil: la ficha del directorio responde
   * siempre a un oficio —el buscado, o el principal—, y con una sola
   * descripción un carpintero que además hace limpieza salía en el listado de
   * limpieza hablando de armarios a medida. Vacía es válido: quien no la
   * escriba sigue saliendo con la general de su perfil.
   */
  description: string
}

export interface TradeRatesFieldProps {
  value: TradeRate[]
  onChange: (trades: TradeRate[]) => void
  disabled?: boolean
  /** Se esconde el precio: al trabajador no se le enseña lo que cobra su empresa */
  hideRates?: boolean
  /**
   * Deja elegir, oficio a oficio, entre cobrar por hora o por visita para
   * presupuestar. Solo lo activa "Mis oficios y tarifas": en el registro y en
   * el alta de un trabajador no hay carta que montar todavía, así que el
   * modo se queda fijo en "por hora" como siempre.
   */
  allowVisitMode?: boolean
  /**
   * Algo más que pintar dentro del bloque de CADA oficio, después de su
   * descripción — la carta de "Mis oficios y tarifas", por ejemplo. Vive
   * aquí y no en el llamador porque el bloque por oficio lo dibuja este
   * componente; sin este hueco, cualquier cosa que dependiera de "en qué
   * oficio estoy" tendría que reconstruir la lista de oficios por su cuenta.
   */
  renderExtra?: (trade: TradeRate) => ReactNode
  /**
   * Deja fuera el desplegable de añadir oficio, para poder ponerlo en otro
   * sitio de la pantalla con `<TradeAddPicker />`.
   *
   * Lo usa el alta de un trabajador: allí la lista de oficios va en medio del
   * formulario y "añadir otro" tiene que quedar al final del todo, después de
   * la ciudad. Pegado a los oficios, con un campo debajo, se leía como parte
   * del último oficio rellenado.
   */
  hideAdd?: boolean
  testID?: string
}

export interface TradeAddPickerProps {
  value: TradeRate[]
  onChange: (trades: TradeRate[]) => void
  disabled?: boolean
  testID?: string
}

/**
 * Añadir un oficio a la lista.
 *
 * Vive aparte de `TradeRatesField` —que lo pinta al final salvo que le digan
 * lo contrario— porque hay una pantalla donde no puede ir pegado a la lista:
 * ver `hideAdd`.
 *
 * Desaparece cuando no queda ninguno por añadir: un desplegable vacío no es
 * una opción, es un callejón.
 */
export function TradeAddPicker({
  value,
  onChange,
  disabled = false,
  testID = 'trade-add',
}: TradeAddPickerProps) {
  /**
   * El desplegable se reinicia solo tras cada elección. Sin esto conservaría
   * el último oficio elegido y parecería que ya está puesto.
   */
  const [pickerKey, setPickerKey] = useState(0)

  const chosen = new Set(value.map((trade) => trade.slug))
  const available = TRADE_OPTIONS.filter((option) => !chosen.has(option.value))

  if (available.length === 0) return null

  const add = (slug: string) => {
    onChange([
      ...value,
      {
        slug,
        pricingMode: 'HOURLY',
        hourlyRate: '',
        visitFee: '',
        minHours: '',
        urgencyRate: '',
        description: '',
      },
    ])
    setPickerKey((key) => key + 1)
  }

  /*
    Dicho una sola vez: el rótulo dice qué es esto y el desplegable dice qué
    hacer con él. Los dos con la misma frase —"Añadir oficio" encima de
    "Añadir otro oficio"— se leían como dos sitios distintos donde añadir.
  */
  const titulo = value.length === 0 ? 'Añadir oficio' : 'Añadir otro oficio'

  return (
    <View style={styles.add}>
      <Text style={styles.addLabel}>{titulo}</Text>

      <Picker
        key={pickerKey}
        options={available}
        value={null}
        onChange={add}
        placeholder="Elige un oficio"
        title={titulo}
        disabled={disabled}
        testID={testID}
      />
    </View>
  )
}

export function TradeRatesField({
  value,
  onChange,
  disabled = false,
  hideRates = false,
  allowVisitMode = false,
  renderExtra,
  hideAdd = false,
  testID,
}: TradeRatesFieldProps) {
  const remove = (slug: string) => {
    onChange(value.filter((trade) => trade.slug !== slug))
  }

  const setUrgencyRate = (slug: string, urgencyRate: string) => {
    onChange(
      value.map((trade) =>
        trade.slug === slug ? { ...trade, urgencyRate } : trade,
      ),
    )
  }

  const setDescription = (slug: string, description: string) => {
    onChange(
      value.map((trade) =>
        trade.slug === slug ? { ...trade, description } : trade,
      ),
    )
  }

  const setRate = (slug: string, hourlyRate: string) => {
    onChange(
      value.map((trade) => (trade.slug === slug ? { ...trade, hourlyRate } : trade)),
    )
  }

  const setMinHours = (slug: string, minHours: string) => {
    onChange(
      value.map((trade) => (trade.slug === slug ? { ...trade, minHours } : trade)),
    )
  }

  const setVisitFee = (slug: string, visitFee: string) => {
    onChange(
      value.map((trade) => (trade.slug === slug ? { ...trade, visitFee } : trade)),
    )
  }

  const setPricingMode = (slug: string, pricingMode: TradeRate['pricingMode']) => {
    onChange(
      value.map((trade) => (trade.slug === slug ? { ...trade, pricingMode } : trade)),
    )
  }

  return (
    <View testID={testID}>
      {value.map((trade, index) => (
        <View
          key={trade.slug}
          /*
            La línea de abajo separa un oficio del siguiente, así que el último
            no la lleva: ahí no separa nada y hace que lo que viene después
            —añadir otro— parezca parte de ese oficio.
          */
          style={[styles.trade, index === value.length - 1 && styles.tradeLast]}
          testID={`trade-row-${trade.slug}`}
        >
          <View style={styles.head}>
            <View style={styles.labelColumn}>
              <Text style={styles.label} numberOfLines={2}>
                {getTradeLabel(trade.slug)}
              </Text>
              {index === 0 && value.length > 1 && (
                /**
                 * El primero encabeza su tarjeta cuando el cliente no ha
                 * buscado un oficio concreto. Decirlo evita la sorpresa de
                 * salir anunciado como otra cosa.
                 */
                <Text style={styles.primary}>Encabeza tu ficha</Text>
              )}
            </View>

            <Pressable
              onPress={() => remove(trade.slug)}
              disabled={disabled}
              style={styles.remove}
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${getTradeLabel(trade.slug)}`}
              testID={`trade-remove-${trade.slug}`}
            >
              <Text style={styles.removeIcon}>×</Text>
            </Pressable>
          </View>

          {/*
            Los dos precios, uno al lado del otro y cada uno con su rótulo.
            Son la misma pregunta —cuánto vale tu hora— contestada en dos
            situaciones, y en columna parecía que el de abajo corregía al de
            arriba. Al lado se comparan, que es como se decide el recargo.

            La unidad va fija dentro del campo y no de marca de agua: el
            marcador desaparece al teclear, que es justo cuando un número
            suelto deja de decir si son euros por hora o por trabajo.
          */}
          {!hideRates && (
            <>
              {/*
                El modo de cobro solo se elige en los oficios donde tiene
                sentido: en los de servicio continuo —limpieza, clases,
                cuidados— no hay nada que evaluar antes de empezar, así que
                siempre es por hora y no se pregunta.
              */}
              {allowVisitMode && isVisitEligibleTrade(trade.slug) && (
                <View style={styles.modesGroup}>
                  <Text style={styles.fieldLabel}>Selecciona modo de cobro</Text>

                  <View style={styles.modes} testID={`trade-mode-${trade.slug}`}>
                    <Button
                      variant={trade.pricingMode === 'HOURLY' ? 'primary' : 'secondary'}
                      size="small"
                      onPress={() => setPricingMode(trade.slug, 'HOURLY')}
                      disabled={disabled}
                      style={styles.modeButton}
                      testID={`trade-mode-hourly-${trade.slug}`}
                    >
                      Por hora
                    </Button>

                    <Button
                      variant={trade.pricingMode === 'VISIT' ? 'primary' : 'secondary'}
                      size="small"
                      onPress={() => setPricingMode(trade.slug, 'VISIT')}
                      disabled={disabled}
                      style={styles.modeButton}
                      testID={`trade-mode-visit-${trade.slug}`}
                    >
                      Visita y presupuesto
                    </Button>
                  </View>
                </View>
              )}

              <View style={styles.rates}>
                <View style={styles.rateField}>
                  {trade.pricingMode === 'VISIT' ? (
                    <>
                      <Text style={styles.fieldLabel} numberOfLines={1} adjustsFontSizeToFit>
                        Tarifa de visita
                      </Text>
                      <Input
                        value={trade.visitFee}
                        onChangeText={(text) =>
                          setVisitFee(trade.slug, text.replace(/[^0-9.,]/g, ''))
                        }
                        placeholder="0"
                        suffix="€"
                        keyboardType="decimal-pad"
                        editable={!disabled}
                        style={styles.rateInput}
                        testID={`trade-visit-fee-${trade.slug}`}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.fieldLabel} numberOfLines={1} adjustsFontSizeToFit>
                        Hora normal
                      </Text>
                      <Input
                        value={trade.hourlyRate}
                        onChangeText={(text) =>
                          setRate(trade.slug, text.replace(/[^0-9.,]/g, ''))
                        }
                        placeholder="0"
                        suffix="€/h"
                        keyboardType="decimal-pad"
                        editable={!disabled}
                        style={styles.rateInput}
                        testID={`trade-rate-${trade.slug}`}
                      />
                    </>
                  )}
                </View>

                <View style={styles.rateField}>
                  <Text style={styles.fieldLabel} numberOfLines={1} adjustsFontSizeToFit>
                    {trade.pricingMode === 'VISIT' ? 'Visita en urgencia' : 'Hora en urgencia'}
                  </Text>
                  <Input
                    value={trade.urgencyRate}
                    onChangeText={(text) =>
                      setUrgencyRate(trade.slug, text.replace(/[^0-9.,]/g, ''))
                    }
                    placeholder="0"
                    suffix={trade.pricingMode === 'VISIT' ? '€' : '€/h'}
                    keyboardType="decimal-pad"
                    editable={!disabled}
                    style={styles.rateInput}
                    testID={`trade-urgency-${trade.slug}`}
                  />
                </View>
              </View>

              {/*
                El mínimo, debajo y solo en los oficios por hora. Fuera de la
                fila de arriba a propósito: allí van los dos precios de la
                hora, que se comparan entre sí, y esto no es un precio sino
                cuánto hay que contratar. En la misma fila, un tercer número
                con otra unidad se lee como una tercera tarifa.
              */}
              {trade.pricingMode === 'HOURLY' && (
                <View style={styles.minHoursRow}>
                  <View style={styles.rateField}>
                    <Text style={styles.fieldLabel} numberOfLines={1} adjustsFontSizeToFit>
                      Mínimo por trabajo
                    </Text>
                    <Input
                      value={trade.minHours}
                      onChangeText={(text) =>
                        setMinHours(trade.slug, text.replace(/[^0-9.,]/g, ''))
                      }
                      placeholder="0"
                      suffix="h"
                      keyboardType="decimal-pad"
                      editable={!disabled}
                      style={styles.rateInput}
                      testID={`trade-min-hours-${trade.slug}`}
                    />
                  </View>

                  {/*
                    La mitad derecha se queda vacía para que el campo mida lo
                    mismo que los de arriba: un número que ocupa todo el ancho
                    parece de otra clase que los que tiene encima.
                  */}
                  <View style={styles.rateField} />
                </View>
              )}

              {trade.pricingMode === 'HOURLY' && (
                <Text style={styles.fieldHint}>
                  {trade.minHours.trim() === ''
                    ? 'Sin mínimo se te puede contratar por lo que sea, aunque sea media hora.'
                    : `Por menos de ${trade.minHours} h no se te podrá contratar: se cobran ${trade.minHours} h aunque el trabajo sea más corto.`}
                </Text>
              )}

              {trade.pricingMode === 'VISIT' && (
                <Text style={styles.fieldHint}>
                  Es lo que cobras por presentarte a evaluar y presupuestar.
                  Para vender servicios a precio cerrado de este oficio,
                  añádelos debajo.
                </Text>
              )}

              {/*
                Que esté vacío significa algo, y por eso se dice debajo y no
                dentro del campo: un marcador que ponga "sin urgencias" ocupa
                el sitio del precio y desaparece justo al escribirlo.
              */}
              <Text style={styles.fieldHint}>
                {trade.urgencyRate.trim() === ''
                  ? trade.pricingMode === 'VISIT'
                    ? 'Sin la visita en urgencia no atiendes urgencias de este oficio: no saldrás en la lista de quien tenga una.'
                    : 'Sin la hora en urgencia no atiendes urgencias de este oficio: no saldrás en la lista de quien tenga una.'
                  : trade.pricingMode === 'VISIT'
                    ? 'Es lo que cobras por presentarte a una urgencia de este oficio, con el recargo ya dentro.'
                    : 'Es lo que cobras por salir a una urgencia de este oficio, con el recargo ya dentro.'}
              </Text>
            </>
          )}

          {/*
            Y qué hace en este oficio. Va también cuando las tarifas están
            escondidas —un empleado no ve lo que cobra su empresa, pero el
            texto que sale en su ficha es suyo— y por eso queda fuera del
            `hideRates`.
          */}
          <View style={styles.descriptionRow}>
            <Text style={styles.fieldLabel}>Qué haces en este oficio</Text>

            <Input
              value={trade.description}
              onChangeText={(text) => setDescription(trade.slug, text)}
              placeholder={placeholderFor(trade.slug)}
              multiline
              numberOfLines={3}
              maxLength={500}
              editable={!disabled}
              style={styles.descriptionInput}
              testID={`trade-description-${trade.slug}`}
            />

            <Text style={styles.fieldHint}>
              Sale en tu ficha del listado de {getTradeLabel(trade.slug).toLowerCase()}.
              Si lo dejas vacío se enseña la descripción general de tu perfil.
            </Text>
          </View>

          {renderExtra?.(trade)}
        </View>
      ))}

      {/*
        Añadir otro, con su línea y su aire para que no se lea como un campo
        más del oficio de arriba. Salvo donde la pantalla lo coloca por su
        cuenta —ver `hideAdd`—, que entonces no se pinta aquí.
      */}
      {!hideAdd && (
        <TradeAddPicker value={value} onChange={onChange} disabled={disabled} />
      )}

      {value.length === 0 && (
        <Text style={styles.empty}>
          Sin ningún oficio no apareces en el directorio: es por donde el
          cliente te busca.
        </Text>
      )}
    </View>
  )
}
