/**
 * UrgencyProsPage styles
 * Una lista de fichas donde lo que se compara es el precio y la distancia.
 *
 * Por eso el precio va en su propia columna a la derecha y alineado entre
 * fichas: en una lista de cuatro, un número metido dentro del párrafo obliga a
 * buscarlo cuatro veces.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

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
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  content: {
    flexGrow: 1,
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
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },

  list: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    padding: 14,
  },
  /*
    El que ya dijo que no: se ve, pero no se puede volver a elegir. Es un
    estilo completo y no un añadido, porque `InfoCard` recibe un solo objeto.
  */
  cardOff: {
    padding: 14,
    opacity: 0.55,
  },
  declined: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.pendingText,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  },
  /** Quién viene, cuando a quien se contrata es a la empresa */
  worker: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
  rating: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },

  /*
   * El precio, en columna propia. Es lo único que el cliente compara de una
   * ficha a otra, y alineado entre todas se lee de un vistazo.
   */
  rateBox: {
    alignItems: 'flex-end',
  },
  rate: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.accent700,
  },
  rateLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
})
