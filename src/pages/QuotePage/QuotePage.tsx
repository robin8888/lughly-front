/**
 * QuotePage
 * Donde el profesional escribe el presupuesto (`CICLOS` §C5).
 *
 * Es el paso que faltaba del ciclo de la visita. El cliente pagaba por que
 * fueran a mirarlo, iban, y **el presupuesto se daba fuera de la app**: por
 * WhatsApp, en un papel o de palabra. Todo lo que viene detrás —aceptarlo,
 * pagarlo, discutir un extra— colgaba de una cifra que no estaba en ninguna
 * parte.
 *
 * ## Por líneas y no por un importe suelto
 *
 * Un total a secas hay que creérselo; una columna se comprueba. Y el tipo de
 * cada línea no es una etiqueta: el material es lo único que se puede cobrar
 * por adelantado y lo único que no se devuelve si el cliente cancela después
 * de comprado (§C8). Sin distinguirlo, esas reglas no se pueden aplicar.
 *
 * ## El total se ve mientras se escribe
 *
 * Con el descuento de la visita ya restado, que es lo que el cliente va a
 * pagar de verdad. Quien presupuesta sin verlo acaba mandando un número que no
 * es el que pensaba, y corregirlo cuesta otra versión.
 *
 * ## Y el material se puede cobrar por delante
 *
 * La casilla estuvo aquí unas horas el 7 de septiembre y se retiró el mismo
 * día: `materialsUpfront` se guardaba, pero **no había nada capaz de liberar
 * esa retención**, así que prometía algo que nadie podía cumplir. Vuelve con
 * su otra mitad —«material comprado» con el ticket, §C6—, y solo aparece si
 * hay líneas de material: sin piezas que comprar no hay nada que adelantar.
 */

import { useMemo, useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { Button } from '@/components/atoms/Button'
import { Checkbox } from '@/components/atoms/Checkbox'
import { Input } from '@/components/atoms/Input'
import { formatAmount } from '@/components/atoms/Money'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { useJob, useCreateQuote } from '@/hooks/domain/useJob'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import type { ApiQuoteLineKind } from '@/api/jobs.api'
import { theme } from '@/theme'
import { styles } from './QuotePage.styles'

const KIND_OPTIONS = [
  { value: 'LABOUR', label: 'Mano de obra' },
  { value: 'MATERIALS', label: 'Material' },
  { value: 'OTHER', label: 'Otros' },
]

/**
 * Los días que se ofrecen de validez.
 *
 * Una lista y no un campo libre: nadie necesita "once días", y quince —lo que
 * trae puesto— es lo que dice la tabla de plazos de `CICLOS`. Quien trabaje con
 * materiales que se mueven de precio acorta; el resto no toca nada.
 */
const VALID_OPTIONS = [
  { value: '7', label: '7 días' },
  { value: '15', label: '15 días' },
  { value: '30', label: '30 días' },
  { value: '60', label: '60 días' },
]

interface Linea {
  kind: ApiQuoteLineKind
  concept: string
  /** Como texto: es lo que hay en el campo, con su coma española */
  quantity: string
  unitPrice: string
}

const LINEA_NUEVA: Linea = { kind: 'LABOUR', concept: '', quantity: '1', unitPrice: '' }

/** «12,50» y «12.50» valen los dos: la coma es lo que se teclea en España */
function numero(text: string): number {
  return Number(text.replace(',', '.'))
}

function importeDe(linea: Linea): number {
  const quantity = numero(linea.quantity)
  const unitPrice = numero(linea.unitPrice)

  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return 0

  // Redondeado por línea, igual que en el servidor: la columna tiene que
  // cuadrar con lo que se suma a mano
  return Math.round(quantity * unitPrice * 100) / 100
}

export interface QuotePageProps {
  jobId: string | undefined
  onBack: () => void
  /** Al emitirlo, a la ficha del trabajo, que es donde ya se ve */
  onDone: () => void
}

export function QuotePage({ jobId, onBack, onDone }: QuotePageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data: job, isPending, isError, refetch } = useJob(jobId)
  const { createQuote, isQuoting } = useCreateQuote()

  const [lineas, setLineas] = useState<Linea[]>([{ ...LINEA_NUEVA }])
  const [validDays, setValidDays] = useState('15')
  const [materialsUpfront, setMaterialsUpfront] = useState(false)

  /** Lo que el cliente pagó por la visita, que se descuenta del total */
  const visitCredit = job?.amount != null && job.type === 'QUOTE' ? job.amount : 0

  const totales = useMemo(() => {
    const linesTotal = lineas.reduce((sum, linea) => sum + importeDe(linea), 0)
    const materialsTotal = lineas
      .filter((linea) => linea.kind === 'MATERIALS')
      .reduce((sum, linea) => sum + importeDe(linea), 0)

    const total = Math.max(0, linesTotal - visitCredit)

    return {
      linesTotal,
      materialsTotal,
      // Nunca negativo: la visita ya se cobró y no se devuelve, pero tampoco
      // se le debe dinero a nadie
      total,
      /*
        Lo que se adelantaría, con el tope del total y la misma cuenta que hace
        el servidor: la visita descontada se come antes la mano de obra que las
        piezas, así que con 138 de material y 120 por pagar se adelantan 120.
      */
      advance: Math.min(materialsTotal, total),
    }
  }, [lineas, visitCredit])

  /* Sin piezas que comprar no hay nada que adelantar, y la casilla sobra */
  const puedeAdelantar = totales.materialsTotal > 0

  const cambiar = (index: number, cambios: Partial<Linea>) =>
    setLineas((actuales) =>
      actuales.map((linea, i) => (i === index ? { ...linea, ...cambios } : linea)),
    )

  const quitar = (index: number) =>
    setLineas((actuales) => actuales.filter((_, i) => i !== index))

  /**
   * Qué falta para poder mandarlo, dicho entero y de una vez.
   *
   * En vez de deshabilitar el botón sin explicar: un botón apagado sin motivo
   * es la forma más rápida de que alguien cierre la pantalla creyendo que la
   * app está rota.
   */
  const falta = useMemo(() => {
    const sinConcepto = lineas.some((linea) => linea.concept.trim().length < 3)
    const sinPrecio = lineas.some(
      (linea) => !Number.isFinite(numero(linea.unitPrice)) || linea.unitPrice.trim() === '',
    )
    const sinCantidad = lineas.some((linea) => !(numero(linea.quantity) > 0))

    if (lineas.length === 0) return 'Añade al menos una línea.'
    if (sinConcepto) return 'Cada línea necesita decir qué es, en dos palabras.'
    if (sinPrecio) return 'A alguna línea le falta el precio.'
    if (sinCantidad) return 'La cantidad tiene que ser mayor que cero.'
    if (totales.linesTotal <= 0) return 'El presupuesto no puede sumar cero.'

    return null
  }, [lineas, totales.linesTotal])

  const enviar = () => {
    if (!job || falta) return

    void (async () => {
      const { ok, error } = await createQuote(job.id, {
        lines: lineas.map((linea) => ({
          kind: linea.kind,
          concept: linea.concept.trim(),
          quantity: numero(linea.quantity),
          unitPrice: numero(linea.unitPrice),
        })),
        validDays: Number(validDays),
        /*
          Y si borró las líneas de material después de marcarla, no se manda:
          la casilla estaría pidiendo un adelanto de cero.
        */
        materialsUpfront: materialsUpfront && puedeAdelantar,
      })

      if (!ok) {
        Alert.alert(
          'No se ha podido mandar',
          error ?? 'Inténtalo de nuevo en un momento.',
        )
        return
      }

      onDone()
    })()
  }

  const header = (
    <View style={styles.header}>
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        Presupuesto
      </Text>
    </View>
  )

  if (isPending || isError || !job) {
    return (
      <View style={styles.screen} testID="quote-page">
        {header}
        <EmptyState
          title={isPending ? 'Un momento' : 'No hemos podido cargar el trabajo'}
          message={
            isPending
              ? 'Cargando el trabajo…'
              : 'Revisa tu conexión e inténtalo de nuevo.'
          }
          actions={
            isPending
              ? []
              : [{ label: 'Reintentar', onPress: () => void refetch(), testID: 'quote-retry' }]
          }
          testID="quote-loading"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="quote-page">
      {header}

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            {`Lo que cuesta arreglar "${job.title}", desglosado. El cliente lo ve línea a línea, así que dos palabras por concepto valen más que una descripción larga.`}
          </Text>
        </InfoCard>

        {lineas.map((linea, index) => (
          <InfoCard key={index} style={styles.lineCard} testID={`quote-line-${index}`}>
            <FormField label="Qué es">
              <Input
                value={linea.concept}
                onChangeText={(concept) => cambiar(index, { concept })}
                placeholder="Cambiar pastillas de freno"
                testID={`quote-line-concept-${index}`}
              />
            </FormField>

            <FormField label="De qué tipo">
              <Picker
                options={KIND_OPTIONS}
                value={linea.kind}
                onChange={(kind) => cambiar(index, { kind: kind as ApiQuoteLineKind })}
                title="Tipo de línea"
                testID={`quote-line-kind-${index}`}
              />
            </FormField>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <FormField label="Cantidad">
                  <Input
                    value={linea.quantity}
                    onChangeText={(quantity) => cambiar(index, { quantity })}
                    keyboardType="decimal-pad"
                    testID={`quote-line-quantity-${index}`}
                  />
                </FormField>
              </View>
              <View style={styles.rowItem}>
                <FormField label="Precio por unidad">
                  <Input
                    value={linea.unitPrice}
                    onChangeText={(unitPrice) => cambiar(index, { unitPrice })}
                    keyboardType="decimal-pad"
                    placeholder="45"
                    testID={`quote-line-price-${index}`}
                  />
                </FormField>
              </View>
            </View>

            <View style={styles.lineFooter}>
              <Text style={styles.lineAmount}>
                {formatAmount(importeDe(linea))} €
              </Text>
              {/*
                Quitar solo cuando hay más de una: la última no se puede borrar
                porque un presupuesto sin líneas no dice nada, y un botón que
                no hace nada se pulsa igual.
              */}
              {lineas.length > 1 && (
                <Pressable
                  onPress={() => quitar(index)}
                  accessibilityRole="button"
                  testID={`quote-line-remove-${index}`}
                >
                  <Text style={styles.remove}>Quitar</Text>
                </Pressable>
              )}
            </View>
          </InfoCard>
        ))}

        <Button
          variant="secondary"
          onPress={() => setLineas((actuales) => [...actuales, { ...LINEA_NUEVA }])}
          style={styles.addLine}
          testID="quote-add-line"
        >
          Añadir otra línea
        </Button>

        <InfoCard style={styles.totals} testID="quote-totals">
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Suma</Text>
            <Text style={styles.subtotal}>{formatAmount(totales.linesTotal)} €</Text>
          </View>

          {visitCredit > 0 && (
            <View style={styles.totalRow}>
              {/*
                Se descuenta y se dice: el cliente ya lo pagó por que fueras, y
                si no aparece parece que se cobra dos veces el mismo viaje.
              */}
              <Text style={styles.totalLabel}>Visita que ya te pagó</Text>
              <Text style={styles.credit}>−{formatAmount(visitCredit)} €</Text>
            </View>
          )}

          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.finalLabel}>Le queda por pagar</Text>
            <Text style={styles.final}>{formatAmount(totales.total)} €</Text>
          </View>

          {/*
            Y de eso, cuánto cobras antes de empezar. Va debajo del total y no
            en su lugar: lo que el cliente paga no cambia —sale de ahí, no se
            suma—, y enseñarlo como una cifra aparte haría pensar lo contrario.
          */}
          {materialsUpfront && puedeAdelantar && (
            <View style={styles.totalRow} testID="quote-advance">
              <Text style={styles.totalLabel}>De eso, material por delante</Text>
              <Text style={styles.advance}>{formatAmount(totales.advance)} €</Text>
            </View>
          )}
        </InfoCard>

        <FormField label="Cuánto tiempo vale">
          <Picker
            options={VALID_OPTIONS}
            value={validDays}
            onChange={setValidDays}
            title="Validez del presupuesto"
            testID="quote-valid-days"
          />
        </FormField>

        {/*
          El pago a cuenta del material (§C6).

          Solo cuando hay material: ofrecérselo a quien presupuesta cuatro
          horas de mano de obra sería ofrecerle adelantar cero euros.

          Se dice lo que le toca a cada uno —él cobra al comprar, el cliente ve
          el ticket— porque es un trato entre dos, y la casilla decide dinero
          del cliente antes de que exista nada.
        */}
        {puedeAdelantar && (
          <View style={styles.upfront}>
            <Checkbox
              checked={materialsUpfront}
              onChange={setMaterialsUpfront}
              testID="quote-materials-upfront"
            >
              {`Cóbrame el material por adelantado (${formatAmount(totales.advance)} €)`}
            </Checkbox>
            <Text style={styles.upfrontHint}>
              Se le retiene al aceptar, con el resto, y te lo pagamos en cuanto
              subas el ticket de la compra. Así no pones tú las piezas.
            </Text>
          </View>
        )}

        {falta && <Text style={styles.missing}>{falta}</Text>}

        <Button
          fullWidth
          onPress={enviar}
          loading={isQuoting}
          disabled={falta !== null}
          style={styles.send}
          testID="quote-send"
        >
          Mandar el presupuesto
        </Button>

        <Text style={styles.footnote}>
          Se lo mandamos ahora mismo. Si te dice que no, te dirá por qué y
          puedes mandarle otro.
        </Text>
      </FormScrollView>
    </View>
  )
}
