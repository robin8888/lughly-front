/**
 * MyPhotosPage styles
 * Misma cabecera que las demás pantallas de pila; la rejilla es de tres en
 * fila, que es lo que cabe a un tamaño en el que se distingue el trabajo.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/** Lo que separa una celda de la siguiente, y de los bordes de la pantalla */
export const GRID_GAP = 8
export const CONTENT_PADDING = 16
export const GRID_COLUMNS = 3

/**
 * El lado de una celda, en píxeles.
 *
 * Se calcula y no se pone en porcentaje. Con `31 %` más `aspectRatio`, el alto
 * sale de una multiplicación con decimales que cada plataforma redondea a su
 * manera, y el hueco de añadir acababa midiendo distinto que las fotos de al
 * lado. En píxeles enteros las dos cajas son la misma caja.
 */
export function cellSize(windowWidth: number): number {
  const available =
    windowWidth - CONTENT_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)

  return Math.floor(available / GRID_COLUMNS)
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: '#ffffff',
    marginBottom: 12,
  },
  /*
   * Lo que ha pasado con la última foto, dentro de la pantalla y encima de la
   * rejilla: es donde se está mirando cuando se acaba de tocar el hueco.
   */
  notice: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.4,
    marginBottom: 12,
  },
  noticeOk: {
    color: theme.colors.accent700,
  },
  noticeError: {
    color: theme.colors.error,
  },

  /** Cada oficio, con su rótulo y su rejilla */
  group: {
    marginBottom: 16,
  },
  groupLabel: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.5,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginBottom: 8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  /* El tamaño lo pone la pantalla, con `cellSize`: aquí solo va lo que no cambia */
  cell: {
    backgroundColor: theme.colors.accent100,
    borderRadius: theme.radius.photo,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },

  /**
   * La cruz de quitar va dentro de la foto, arriba a la derecha, sobre un
   * cuadro opaco: encima de una imagen clara un icono suelto no se ve.
   */
  remove: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.text,
  },
  removeIcon: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small,
    color: theme.colors.bg,
  },

  addCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    /*
     * `accent500` y no `accent300`: el borde de puntos sobre el fondo claro de
     * la celda se veía tan lavado que el hueco no parecía que se pudiera
     * pulsar. Sigue siendo más suave que el azul del texto, que es lo que
     * tiene que llamar primero.
     */
    borderColor: theme.colors.accent500,
    backgroundColor: 'transparent',
  },
  addBusy: {
    opacity: 0.6,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 12,
  },
})
