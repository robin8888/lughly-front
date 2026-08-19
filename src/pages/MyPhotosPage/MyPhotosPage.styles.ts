/**
 * MyPhotosPage styles
 * Misma cabecera que las demás pantallas de pila; la rejilla es de tres en
 * fila, que es lo que cabe a un tamaño en el que se distingue el trabajo.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/** Tres por fila con 8 de hueco: el 31 % deja sitio a los dos separadores. */
const CELL = '31%'

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
    textTransform: 'uppercase',
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
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginBottom: 12,
  },
  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: 8,
  },

  /** Cada oficio, con su rótulo y su rejilla */
  group: {
    marginBottom: 16,
  },
  groupLabel: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginBottom: 8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: CELL,
    aspectRatio: 1,
    backgroundColor: theme.colors.accent100,
    borderRadius: theme.radius.none,
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
  /**
   * El `+` no salía centrado y no era cosa del contenedor, que ya centra: un
   * texto se dibuja dentro de una caja de línea más alta que el propio signo
   * —hay sitio reservado para las tildes y para lo que baja de la `g`—, así
   * que el `+` se queda en el medio de esa caja y no en el del cuadrado.
   *
   * `lineHeight` igual al tamaño quita ese aire, y `includeFontPadding` quita
   * el que Android añade además por su cuenta.
   */
  addIcon: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    lineHeight: theme.typography.sizes.h4,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: theme.colors.accent,
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
