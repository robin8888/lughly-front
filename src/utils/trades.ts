/**
 * Los 18 oficios de Lughly
 * Fuente: MobileApp.dc.html (allLabels) — mismos slugs que usará GET /v1/trades.
 *
 * `regulated: true` marca los oficios que exigen habilitación profesional
 * en el registro (README: "Obligatoria para electricidad y otras reguladas").
 *
 * `visitEligible: false` marca los oficios de servicio continuo —se cobra el
 * tiempo, no hay nada que evaluar antes de empezar— y por eso solo tienen
 * cobro por hora, sin modo visita: limpieza, clases, cuidado de niños/
 * mayores/mascotas, y los oficios de acompañar o conducir. En el resto, el
 * profesional elige si cobra por hora o por visita para presupuestar.
 */

import { tradeImages, type TradeImageKey } from '@/images'

export type TradeSlug = TradeImageKey

export interface Trade {
  slug: TradeSlug
  label: string
  regulated: boolean
  visitEligible: boolean
}

/**
 * ORDEN SIGNIFICATIVO: es el del carrusel de la home, fijado en
 * HOME_MOBILE.md. No reordenar sin cambiarlo también allí y en el seed
 * del backend (`sortOrder`).
 */
export const TRADES: readonly Trade[] = [
  { slug: 'carpinteria', label: 'Carpintería', regulated: false, visitEligible: true },
  { slug: 'electricidad', label: 'Electricidad', regulated: true, visitEligible: true },
  { slug: 'fontaneria', label: 'Fontanería', regulated: true, visitEligible: true },
  { slug: 'pintura', label: 'Pintura', regulated: false, visitEligible: true },
  { slug: 'jardineria', label: 'Jardinería', regulated: false, visitEligible: true },
  { slug: 'informatica', label: 'Informática', regulated: false, visitEligible: true },
  { slug: 'limpieza', label: 'Limpieza', regulated: false, visitEligible: false },
  { slug: 'transporte', label: 'Transporte / Conductor', regulated: false, visitEligible: false },
  { slug: 'cuidados', label: 'Cuidado de niños y mayores', regulated: false, visitEligible: false },
  { slug: 'dependiente', label: 'Dependiente/a', regulated: false, visitEligible: false },
  { slug: 'domiciliario', label: 'Domiciliario', regulated: false, visitEligible: false },
  { slug: 'cerrajeria', label: 'Cerrajería', regulated: false, visitEligible: true },
  { slug: 'climatizacion', label: 'Climatización', regulated: true, visitEligible: true },
  { slug: 'mecanica', label: 'Mecánica de vehículos', regulated: false, visitEligible: true },
  { slug: 'belleza', label: 'Peluquería y estética', regulated: false, visitEligible: true },
  { slug: 'clases', label: 'Clases particulares', regulated: false, visitEligible: false },
  { slug: 'mascotas', label: 'Cuidado de mascotas', regulated: false, visitEligible: false },
  { slug: 'otros', label: 'Otros oficios', regulated: false, visitEligible: true },
] as const

/** Opciones listas para <Picker /> */
export const TRADE_OPTIONS = TRADES.map(({ slug, label }) => ({
  value: slug,
  label,
}))

export function getTrade(slug: string): Trade | undefined {
  return TRADES.find((trade) => trade.slug === slug)
}

export function getTradeLabel(slug: string): string {
  return getTrade(slug)?.label ?? 'Otros oficios'
}

export function getTradeImage(slug: string) {
  return tradeImages[slug as TradeSlug] ?? tradeImages.otros
}

export function isRegulatedTrade(slug: string): boolean {
  return getTrade(slug)?.regulated ?? false
}

export function isVisitEligibleTrade(slug: string): boolean {
  return getTrade(slug)?.visitEligible ?? false
}
