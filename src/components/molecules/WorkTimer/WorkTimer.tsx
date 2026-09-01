/**
 * WorkTimer Molecule
 * Cuánto lleva —o cuánto duró— un trabajo, contando en vivo.
 *
 * Lo ven **los dos lados y dice lo mismo en los dos**, y por eso el origen
 * viene del servidor (`startedAt`) en vez de apuntarse en cada móvil: dos
 * relojes de pared no coinciden, y un contador que a cada uno le diga una cosa
 * es peor que no tenerlo.
 *
 * ## Corriendo y parado son el mismo componente
 *
 * Con `finishedAt` a nulo cuenta hacia arriba desde el inicio; con él puesto
 * enseña el total y se queda quieto. Separarlos en dos componentes obligaría a
 * cada pantalla a decidir cuál pinta, y esa decisión —¿ha terminado ya?— es
 * justo la que se equivoca: entre que el profesional pulsa Terminar y el
 * cliente lo da por bueno, el trabajo sigue en curso pero el reloj ya no.
 *
 * ## Un tick por segundo, y solo mientras corre
 *
 * Parado no hay intervalo: un trabajo cerrado en la lista de "mis trabajos" no
 * tiene por qué despertar a nadie cada segundo. Y el intervalo se suelta al
 * desmontar, que en una lista larga es la diferencia entre un contador y
 * treinta.
 */

import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { styles } from './WorkTimer.styles'

export interface WorkTimerProps {
  /** Cuándo empezó, en ISO. Sin esto no hay nada que contar. */
  startedAt: string
  /** Cuándo terminó. Nulo es que sigue corriendo. */
  finishedAt?: string | null
  /** Se enseña encima del número: «Lleva trabajando», «Duró»… */
  label?: string
  testID?: string
}

/** «1:05:32» o «12:40» — sin horas cuando no las hay, que ocupan y no dicen nada */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  const pad = (value: number) => String(value).padStart(2, '0')

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}

export function WorkTimer({ startedAt, finishedAt, label, testID }: WorkTimerProps) {
  const started = new Date(startedAt).getTime()
  const finished = finishedAt ? new Date(finishedAt).getTime() : null
  const running = finished === null

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!running) return

    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  /*
    Una fecha que no se puede leer no pinta un contador roto: no pinta nada.
    Es preferible a un «NaN:NaN» en la pantalla de alguien.
  */
  if (Number.isNaN(started)) return null

  const elapsed = (finished ?? now) - started

  return (
    <View style={[styles.container, running && styles.running]} testID={testID}>
      {label !== undefined && <Text style={styles.label}>{label}</Text>}

      <Text
        style={[styles.time, running && styles.timeRunning]}
        /*
          El número cambia cada segundo: sin esto, el lector de pantalla lo
          leería en voz alta una vez por segundo y taparía todo lo demás.
        */
        accessibilityLiveRegion="none"
        testID={testID ? `${testID}-value` : undefined}
      >
        {formatElapsed(elapsed)}
      </Text>
    </View>
  )
}
