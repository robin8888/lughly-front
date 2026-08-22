/**
 * Countdown Atom
 * Cuenta atrás hasta que vence un plazo de respuesta (diseño `isSubastas`: "2d 05h").
 *
 * Enseña **dos unidades**, no cinco. "2d 05h" se lee de un vistazo;
 * "2d 05h 12m 34s" hay que descifrarlo, y los segundos no cambian ninguna
 * decisión cuando faltan dos días.
 *
 * En la última hora sí baja al segundo: ahí es cuando importa.
 */

import { Text, type StyleProp, type TextStyle } from 'react-native'
import { useCountdown } from '@/hooks/ui/useCountdown'
import { styles } from './Countdown.styles'

export interface CountdownProps {
  /** Fecha objetivo en ISO */
  target: string | null | undefined
  /** Texto cuando ya venció */
  expiredLabel?: string
  /** Prefijo, por ejemplo "Cierra en" */
  prefix?: string
  style?: StyleProp<TextStyle>
  testID?: string
}

/** Dos cifras siempre: "05h" y no "5h", para que no baile el ancho. */
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatCountdown(parts: {
  days: number
  hours: number
  minutes: number
  seconds: number
}): string {
  if (parts.days > 0) return `${parts.days}d ${pad(parts.hours)}h`
  if (parts.hours > 0) return `${parts.hours}h ${pad(parts.minutes)}m`
  return `${parts.minutes}m ${pad(parts.seconds)}s`
}

export function Countdown({
  target,
  expiredLabel = 'Plazo cumplido',
  prefix,
  style,
  testID,
}: CountdownProps) {
  const countdown = useCountdown(target)

  if (!countdown) return null

  return (
    <Text style={[styles.base, style]} testID={testID ?? 'countdown'}>
      {countdown.expired
        ? expiredLabel
        : `${prefix ? `${prefix} ` : ''}${formatCountdown(countdown)}`}
    </Text>
  )
}
