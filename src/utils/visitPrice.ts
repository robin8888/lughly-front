/**
 * visitPrice
 * Lo que cuesta que un profesional vaya a ver el problema para presupuestarlo.
 *
 * **Espejo de `lughly-backend/src/modules/jobs/domain/visit-price.ts`.** El
 * precio lo decide el servidor —el móvil no manda importes, nunca—, pero hace
 * falta aquí para poder decir la cifra **antes** de que el cliente pulse:
 * primero en el aviso de «Presupuesto», que explica que la visita se paga, y
 * después en el desglose de la pantalla. Un aviso que dijera «se te cobrará la
 * visita» sin decir cuánto no avisaría de nada.
 *
 * Si las dos cuentas discrepasen, manda el servidor y el cliente vería un
 * importe distinto del que se le retiene. Por eso son las mismas líneas que las
 * de allí y no una llamada más: cambiar la regla obliga a tocar los dos lados,
 * que es lo que dice `AGENTS.md` de cualquier contrato.
 *
 * ## Solo da presupuestos quien tiene tarifa de visita
 *
 * `visitFee` **es** eso: lo que cobra por presentarse a ver la avería antes de
 * dar un precio. Quien la tiene puesta es quien presupuesta.
 *
 * Quien cobra por horas no: no vende precios cerrados, vende ratos de su
 * agenda — a una limpiadora no se le pide presupuesto, se le reservan las horas
 * que hagan falta—. Las dos tarifas son excluyentes en el servidor, y esa
 * exclusión son **dos modelos de negocio**, no un detalle de columnas.
 *
 * Los dos casos en que no se puede presupuestar se distinguen a propósito:
 * a quien cobra por horas **sí se le puede contratar** —por su agenda— y a
 * quien no tiene ninguna tarifa no se le puede contratar de ninguna forma. La
 * pantalla tiene que poder mandar a cada uno a un sitio distinto.
 */

export interface TradeRates {
  hourlyRate?: number | null
  visitFee?: number | null
}

export type VisitPrice =
  /** Tiene tarifa de visita: se le puede pedir presupuesto, y cuesta esto */
  | { kind: 'fee'; amount: number }
  /** Cobra por horas: no da presupuestos, se le reservan horas */
  | { kind: 'hourly' }
  /** Sin ninguna tarifa: no se le puede contratar por ese oficio */
  | { kind: 'none' }

export function visitPriceOf(trade: TradeRates | undefined | null): VisitPrice {
  if (!trade) return { kind: 'none' }
  if (trade.visitFee != null) return { kind: 'fee', amount: trade.visitFee }
  if (trade.hourlyRate != null) return { kind: 'hourly' }

  return { kind: 'none' }
}

/** El oficio con el que se le puede pedir presupuesto, si tiene alguno. */
export function quotableTradeOf<T extends TradeRates>(
  trades: T[],
  preferred?: T,
): T | null {
  if (preferred && visitPriceOf(preferred).kind === 'fee') return preferred

  return trades.find((trade) => visitPriceOf(trade).kind === 'fee') ?? null
}
