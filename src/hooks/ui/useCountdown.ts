/**
 * useCountdown
 * Lo que queda hasta una fecha, actualizándose solo.
 *
 * **El intervalo se adapta al tiempo restante**, y no es un capricho: un
 * contador que se repinta cada segundo durante seis días gasta batería para
 * mover una cifra que nadie mira. Cuando quedan días, basta con refrescar
 * cada minuto; el segundero solo importa en la última hora, que es cuando
 * la gente se queda mirando la pantalla.
 *
 * Devuelve 0 si la fecha ya pasó, nunca negativo: quien lo use enseña
 * "cerrada" en vez de un tiempo al revés.
 */

import { useEffect, useState } from 'react'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

/** Por debajo de esto se cuenta al segundo. */
const FINE_GRAINED_BELOW = HOUR

export interface Countdown {
  /** Milisegundos restantes; 0 si ya venció */
  remaining: number
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function breakdown(remaining: number): Countdown {
  return {
    remaining,
    days: Math.floor(remaining / (24 * HOUR)),
    hours: Math.floor((remaining % (24 * HOUR)) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
    expired: remaining <= 0,
  }
}

function remainingFrom(target: string): number {
  const end = new Date(target).getTime()
  if (Number.isNaN(end)) return 0
  return Math.max(0, end - Date.now())
}

export function useCountdown(target: string | null | undefined): Countdown | null {
  const [remaining, setRemaining] = useState(() =>
    target ? remainingFrom(target) : 0,
  )

  useEffect(() => {
    if (!target) return

    setRemaining(remainingFrom(target))

    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const left = remainingFrom(target)
      setRemaining(left)

      if (left <= 0) return

      /**
       * Se reprograma en cada vuelta en lugar de usar un intervalo fijo: así
       * el ritmo cambia solo al entrar en la última hora, sin tener que
       * vigilar el umbral desde fuera.
       */
      timer = setTimeout(tick, left < FINE_GRAINED_BELOW ? SECOND : MINUTE)
    }

    timer = setTimeout(tick, remainingFrom(target) < FINE_GRAINED_BELOW ? SECOND : MINUTE)

    return () => clearTimeout(timer)
  }, [target])

  if (!target) return null

  return breakdown(remaining)
}
