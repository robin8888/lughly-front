/**
 * visitPrice
 * Lo que cuesta que un profesional se presente en una dirección.
 *
 * **Espejo de `lughly-backend/src/modules/jobs/domain/visit-price.ts`.** El
 * precio lo decide el servidor —el móvil no manda importes, nunca—, pero hace
 * falta aquí para poder decir la cifra **antes** de que el cliente pulse:
 * primero en el aviso de «Presupuesto», que explica que la visita se paga, y
 * después en el desglose de la pantalla. Un modal que dijera «se te cobrará la
 * visita» sin decir cuánto no avisaría de nada.
 *
 * Si las dos cuentas discrepasen, manda el servidor y el cliente vería un
 * importe distinto del que se le retiene. Por eso son treinta líneas iguales a
 * las de allí y no una llamada más: cambiar la regla obliga a tocar los dos
 * lados, que es lo que dice `AGENTS.md` de cualquier contrato.
 *
 * ## La cuenta
 *
 * `hourlyRate` y `visitFee` son excluyentes: un oficio se cobra por hora o por
 * visita, nunca las dos cosas. Quien tiene carta cobra su `visitFee`; quien
 * cobra por horas cobra **su suelo**, la tarifa por el mínimo que declaró en
 * ese oficio, o una hora si no tiene mínimo.
 *
 * `null` es «este oficio no tiene precio todavía», que no es un cero: es un
 * oficio con el que aún no se puede contratar.
 */

export interface TradeRates {
  hourlyRate?: number | null
  visitFee?: number | null
  minHours?: number | null
}

/** Lo que se factura de una hora suelta cuando no hay mínimo declarado */
const HORAS_SIN_MINIMO = 1

export function visitPriceOf(trade: TradeRates | undefined | null): number | null {
  if (!trade) return null
  if (trade.visitFee != null) return trade.visitFee
  if (trade.hourlyRate == null) return null

  /*
    Un mínimo a cero significa lo mismo que el nulo —sin mínimo— y multiplicar
    por él dejaría la visita gratis, que es el único resultado que esto no
    puede dar.
  */
  const horas =
    trade.minHours != null && trade.minHours > 0 ? trade.minHours : HORAS_SIN_MINIMO

  return Math.round(trade.hourlyRate * horas * 100) / 100
}

/**
 * De dónde sale ese número, dicho para leerlo.
 *
 * Es lo que hace que el aviso no parezca una cifra inventada: quien cobra 14 €
 * la hora con mínimo de dos no entiende «visita 28 €» hasta que se le dice que
 * son sus dos horas mínimas.
 */
export function visitPriceReason(trade: TradeRates | undefined | null): string | null {
  if (!trade) return null
  if (trade.visitFee != null) return 'Es su tarifa por desplazarse.'
  if (trade.hourlyRate == null) return null

  if (trade.minHours != null && trade.minHours > 0) {
    const horas = trade.minHours === 1 ? '1 hora' : `${trade.minHours} horas`
    return `Cobra por horas, así que la visita son sus ${horas} de mínimo.`
  }

  return 'Cobra por horas, así que la visita es una hora suya.'
}
