/**
 * Los 18 oficios de Lughly
 * Fuente: MobileApp.dc.html (allLabels) — mismos slugs que usará GET /v1/trades.
 *
 * `regulated: true` marca los oficios que exigen habilitación profesional
 * en el registro (README: "Obligatoria para electricidad y otras reguladas").
 */

import { tradeImages, type TradeImageKey } from '@/images'

export type TradeSlug = TradeImageKey

export interface Trade {
  slug: TradeSlug
  label: string
  regulated: boolean
}

/**
 * ORDEN SIGNIFICATIVO: es el del carrusel de la home, fijado en
 * HOME_MOBILE.md. No reordenar sin cambiarlo también allí y en el seed
 * del backend (`sortOrder`).
 */
export const TRADES: readonly Trade[] = [
  { slug: 'carpinteria', label: 'Carpintería', regulated: false },
  { slug: 'electricidad', label: 'Electricidad', regulated: true },
  { slug: 'fontaneria', label: 'Fontanería', regulated: true },
  { slug: 'pintura', label: 'Pintura', regulated: false },
  { slug: 'jardineria', label: 'Jardinería', regulated: false },
  { slug: 'informatica', label: 'Informática', regulated: false },
  { slug: 'limpieza', label: 'Limpieza', regulated: false },
  { slug: 'transporte', label: 'Transporte / Conductor', regulated: false },
  { slug: 'cuidados', label: 'Cuidado de niños y mayores', regulated: false },
  { slug: 'dependiente', label: 'Dependiente/a', regulated: false },
  { slug: 'domiciliario', label: 'Domiciliario', regulated: false },
  { slug: 'cerrajeria', label: 'Cerrajería', regulated: false },
  { slug: 'climatizacion', label: 'Climatización', regulated: true },
  { slug: 'mecanica', label: 'Mecánica de vehículos', regulated: false },
  { slug: 'belleza', label: 'Peluquería y estética', regulated: false },
  { slug: 'clases', label: 'Clases particulares', regulated: false },
  { slug: 'mascotas', label: 'Cuidado de mascotas', regulated: false },
  { slug: 'otros', label: 'Otros oficios', regulated: false },
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
