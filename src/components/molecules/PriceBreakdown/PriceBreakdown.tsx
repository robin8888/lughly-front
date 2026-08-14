/**
 * PriceBreakdown Molecule
 * "Lo que vas a pagar", según MobileApp.dc.html (isPerfil, formulario de reserva).
 *
 * Solo pinta. No calcula recargos ni totales: ese cálculo es regla de negocio
 * y vive en `usePriceQuote` (Fase 7), que además debe coincidir con lo que
 * cobra el servidor. Si la molécula hiciera la cuenta, habría dos fórmulas
 * distintas y acabarían discrepando.
 *
 * El README exige que los recargos estén siempre visibles antes de contratar:
 * por eso la línea del recargo se marca en rojo y nunca se esconde.
 */

import { View, Text } from 'react-native'
import { Money } from '@/components/atoms/Money'
import { styles } from './PriceBreakdown.styles'

/**
 * - `base`: la línea normal (horas × tarifa)
 * - `surcharge`: recargo aplicado, en rojo y con el signo +
 * - `muted`: informativo, no suma (por ejemplo el mínimo por visita)
 */
export type PriceLineTone = 'base' | 'surcharge' | 'muted'

export interface PriceLine {
  label: string
  amount: number
  tone?: PriceLineTone
}

export interface PriceBreakdownProps {
  lines: PriceLine[]
  total: number
  title?: string
  /** Aclaración al pie, como "se cobra por horas reales" */
  note?: string
  testID?: string
}

export function PriceBreakdown({
  lines,
  total,
  title = 'Lo que vas a pagar',
  note,
  testID,
}: PriceBreakdownProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.lines}>
        {lines.map((line) => {
          const tone = line.tone ?? 'base'

          return (
            <View key={line.label} style={styles.line}>
              <Text
                style={[styles.label, tone === 'muted' && styles.muted]}
                numberOfLines={2}
              >
                {line.label}
              </Text>

              <View style={styles.amount}>
                {tone === 'surcharge' && <Text style={styles.plus}>+</Text>}
                <Money
                  amount={line.amount}
                  size="small"
                  style={
                    tone === 'surcharge'
                      ? styles.surchargeAmount
                      : tone === 'muted'
                        ? styles.mutedAmount
                        : styles.baseAmount
                  }
                />
              </View>
            </View>
          )
        })}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total estimado</Text>
        <Money amount={total} size="medium" style={styles.totalAmount} />
      </View>

      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  )
}
