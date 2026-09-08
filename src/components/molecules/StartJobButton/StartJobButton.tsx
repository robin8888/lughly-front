/**
 * StartJobButton
 * «He llegado, empiezo», con su hora.
 *
 * **El botón no se enciende hasta diez minutos antes de la hora acordada.** Lo
 * pidió Robin el 8 de septiembre de 2026 y el motivo es el que lo hace
 * necesario: con dos o tres trabajos en la agenda, todos con el mismo botón
 * encendido, **el de al lado es el del otro**. Arrancar el reloj del trabajo
 * equivocado no es un despiste de agenda: en uno por horas es una factura mal
 * contada, y el cliente que la paga no estaba delante.
 *
 * El servidor ya lo rechazaba (`TooEarlyToStartError`), pero eso no basta: un
 * botón que se puede pulsar y contesta que no se lee como una app rota. Lo que
 * hacía falta era que **no se pueda pulsar**, y que se vea desde cuándo sí.
 *
 * ## Por qué el instante viene del servidor
 *
 * `canStartAt` llega hecho de la API —los diez minutos se restan allí— y aquí
 * solo se compara con el reloj del móvil. Así la regla vive en un sitio: el
 * día que el margen cambie, las apps ya instaladas se enteran solas.
 *
 * Sin `canStartAt` el botón está encendido, y es lo correcto: hay encargos sin
 * fecha, y exigir puntualidad a una cita que no existe sería cerrarlo para
 * siempre.
 *
 * Y tarde siempre se puede: pasada la hora, esto no vuelve a apagarse nunca.
 * Llegar con retraso pasa, y castigarlo dejaría a alguien trabajando sin poder
 * registrarlo.
 */

import { Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { formatCountdown } from '@/components/atoms/Countdown'
import { useCountdown } from '@/hooks/ui/useCountdown'
import { formatTime } from '@/utils/dates'
import { styles } from './StartJobButton.styles'

export interface StartJobButtonProps {
  /** Desde cuándo deja el servidor empezar. `null` es "cuando quiera". */
  canStartAt: string | null
  onPress: () => void
  /** Mientras se manda */
  isStarting?: boolean
  /** Apagado por otro motivo: ya hay un trabajo en curso */
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function StartJobButton({
  canStartAt,
  onPress,
  isStarting = false,
  disabled = false,
  style,
  testID,
}: StartJobButtonProps) {
  /*
    Se cuenta solo, y por eso esto es un componente y no un cálculo dentro de
    la lista: un hook no puede vivir dentro de un `.map`. Cada tarjeta lleva su
    cuenta atrás, que en la última hora va al segundo — que es justo cuando
    alguien está esperando delante de un portal a que se le encienda.
  */
  const countdown = useCountdown(canStartAt)

  /* Sin hora, o ya pasada: se puede empezar */
  const tooEarly = countdown !== null && !countdown.expired

  return (
    <>
      <Button
        fullWidth
        onPress={onPress}
        disabled={isStarting || disabled || tooEarly}
        style={style}
        testID={testID}
      >
        {isStarting ? 'Un momento…' : 'He llegado, empiezo'}
      </Button>

      {/*
        Y por qué está apagado, que si no parece que la app falla. Con las dos
        cosas: cuánto falta —que es lo que se mira estando de pie en la calle—
        y a qué hora, que es lo que deja comprobar que la cita es la que uno
        cree.
      */}
      {tooEarly && !disabled && (
        <View style={styles.wait} testID={testID ? `${testID}-too-early` : undefined}>
          <Text style={styles.waitText}>
            Podrás empezar en {formatCountdown(countdown)}, a las{' '}
            {formatTime(new Date(canStartAt as string))} — diez minutos antes de la hora
            acordada, para no arrancar el reloj del trabajo equivocado.
          </Text>
        </View>
      )}
    </>
  )
}
