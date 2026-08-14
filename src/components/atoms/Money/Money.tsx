/**
 * Money Atom
 * Formatea cantidades monetarias sin lógica de negocio
 *
 * Se formatea a mano y NO con `Intl.NumberFormat`: el motor Hermes de esta
 * app trae `Intl` incompleto —`Intl.RelativeTimeFormat` no existe y revienta
 * con "undefined cannot be used as a constructor"— y no hay garantía de que
 * `NumberFormat` esté en todas las versiones y plataformas. Este átomo no se
 * había llegado a renderizar nunca en el móvil, así que el fallo habría
 * aparecido en la Fase 7, al montar el desglose de precio.
 *
 * Formato español: punto para los miles y coma para los decimales.
 * 1234.5 → "1.234,50 €"
 */

import { Text, type StyleProp, type TextStyle } from 'react-native'
import { styles, sizeStyles } from './Money.styles'

export type MoneySize = 'small' | 'medium' | 'large'

export interface MoneyProps {
  amount: number
  currency?: string
  size?: MoneySize
  style?: StyleProp<TextStyle>
  testID?: string
}

/** Dos decimales y separador de miles, a la española. */
export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '—'

  // Se opera sobre el valor absoluto y el signo se pone al final: si no,
  // el separador de miles se colaría delante del menos en "-1.234,50".
  const negative = amount < 0
  const fixed = Math.abs(amount).toFixed(2)
  const [whole = '0', decimals = '00'] = fixed.split('.')

  /**
   * En español no se separan los millares de un número de cuatro cifras:
   * "1000,00", no "1.000,00" (convención de la RAE, y lo que hacía el
   * `Intl.NumberFormat('es-ES')` al que sustituye esto). A partir de cinco
   * cifras sí se agrupa.
   */
  const withThousands =
    whole.length > 4 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : whole

  return `${negative ? '-' : ''}${withThousands},${decimals}`
}

export function Money({
  amount,
  currency = '€',
  size = 'medium',
  style,
  testID,
}: MoneyProps) {
  return (
    <Text style={[styles.base, sizeStyles[size], style]} testID={testID}>
      {formatAmount(amount)}
      {currency}
    </Text>
  )
}
