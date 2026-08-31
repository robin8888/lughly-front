/**
 * MyLevelPage styles
 *
 * Tres bloques y un orden que no es casual: dónde estás, **cuánto te falta**, y
 * la escalera entera. El del medio es el motivo de la pantalla, así que es el
 * único con una cifra grande; si compitiera con las otras dos, la escalera
 * volvería a leerse como una tabla de precios.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  /*
    Cabecera en el azul oscuro de los formularios (`AuthShell`), con el título
    en blanco (25 Agosto 2026). Se hizo en las treinta pantallas a la vez: una
    cabecera clara aquí y otra oscura allá no es una variante, es un descuido.
  */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkDivider,
    backgroundColor: theme.colors.accent900,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  title: {
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  /** Dónde está: sobre el azul, y con el nombre del nivel como protagonista */
  hereLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
    opacity: 0.9,
  },
  hereName: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h3,
    color: '#ffffff',
    marginTop: 2,
  },
  hereRate: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },

  /**
   * La cifra que falta. Sin tarjeta y centrada, con aire por arriba y por
   * abajo: es lo único de la pantalla que tiene que verse desde el otro lado
   * de la habitación.
   */
  next: {
    marginTop: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  nextLead: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
  nextAmount: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  nextNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.textSoft,
    textAlign: 'center',
    marginTop: 8,
  },
  /** Arriba del todo no hay cifra que dar, así que tampoco hay número grande */
  nextTop: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.sizes.body * 1.4,
    color: theme.colors.availableText,
    textAlign: 'center',
  },

  ladderTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    marginBottom: 10,
  },
  ladder: {
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    overflow: 'hidden',
  },
  step: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  /**
   * El escalón en el que está, marcado con fondo y no solo con negrita: en una
   * lista de cuatro filas parecidas, un peso de letra distinto se pierde.
   */
  stepCurrent: {
    backgroundColor: theme.colors.accent100,
  },
  stepHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  stepName: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  },
  stepNameCurrent: {
    fontFamily: theme.typography.fonts.bodyBold,
    color: theme.colors.accent800,
  },
  stepRate: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
  stepRateCurrent: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: theme.colors.accent800,
  },
  stepFrom: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: 2,
  },

  explain: {
    marginTop: 20,
    gap: 8,
  },
  explainTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  explainLine: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.text,
    opacity: 0.85,
  },

  reviewed: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    textAlign: 'center',
    marginTop: 16,
  },
})
