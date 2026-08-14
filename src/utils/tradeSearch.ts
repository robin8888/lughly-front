/**
 * Búsqueda rápida de oficios.
 *
 * La gente no busca "fontanería", busca "fuga" o "grifo". Los sinónimos
 * salen de MobileApp.dc.html (synonymsM) y son los que hacen que el buscador
 * sirva de algo.
 *
 * La comparación ignora tildes: "jardineria" tiene que encontrar "Jardinería".
 */

import { TRADES, type Trade, type TradeSlug } from './trades'

const SYNONYMS: Partial<Record<TradeSlug, string[]>> = {
  cerrajeria: ['cerrajero', 'cerradura', 'llave', 'puerta', 'bombin'],
  fontaneria: ['fontanero', 'fuga', 'grifo', 'atasco', 'tuberia', 'wc'],
  electricidad: ['electricista', 'luz', 'enchufe', 'cuadro', 'diferencial'],
  carpinteria: ['carpintero', 'madera', 'mueble', 'armario', 'puerta'],
  pintura: ['pintor', 'gotele', 'pared', 'pintar'],
  jardineria: ['jardinero', 'poda', 'cesped', 'seto', 'riego'],
  informatica: ['informatico', 'ordenador', 'wifi', 'router', 'portatil'],
  limpieza: ['limpiadora', 'limpiar', 'fin de obra'],
  transporte: ['conductor', 'mudanza', 'porte', 'furgoneta'],
  climatizacion: ['aire acondicionado', 'caldera', 'calefaccion', 'bomba de calor'],
  mecanica: ['mecanico', 'coche', 'taller', 'bateria'],
  belleza: ['peluqueria', 'peluquero', 'estetica', 'unas'],
  clases: ['profesor', 'clases particulares', 'repaso', 'idiomas'],
  mascotas: ['perro', 'gato', 'paseador', 'guarderia canina'],
  cuidados: ['ninera', 'canguro', 'mayores', 'dependencia'],
}

/** Quita tildes y pasa a minúsculas, para comparar sin sorpresas. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export interface TradeSuggestion {
  trade: Trade
  /** Por qué ha salido: el sinónimo que ha coincidido, si fue por ahí */
  hint?: string
}

const MAX_SUGGESTIONS = 6

export function searchTrades(query: string): TradeSuggestion[] {
  const needle = normalize(query)
  if (!needle) return []

  const suggestions: TradeSuggestion[] = []

  for (const trade of TRADES) {
    if (normalize(trade.label).includes(needle)) {
      suggestions.push({ trade })
      continue
    }

    const match = SYNONYMS[trade.slug]?.find((synonym) =>
      normalize(synonym).includes(needle),
    )

    if (match) suggestions.push({ trade, hint: match })
  }

  return suggestions.slice(0, MAX_SUGGESTIONS)
}
