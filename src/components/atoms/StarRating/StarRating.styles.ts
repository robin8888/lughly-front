/**
 * StarRating styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  /* Un pelín de aire alrededor: la estrella es un glifo, no un icono cuadrado */
  starWrapper: {
    paddingVertical: 2,
  },
  /*
    Sin `lineHeight` fijo: lo pone el componente a partir del tamaño.

    Estaba clavado en 18, y con eso una estrella de 32 —la del modal de
    valorar— se pintaba dentro de una línea de 18 y **se cortaba arriba y
    abajo**. Lo encontró Robin al dar por bueno un trabajo. Un alto fijo solo
    vale mientras el tamaño no cambie, y este es un componente que recibe el
    suyo por parámetro.
  */
  star: {
    textAlign: 'center',
  },
  filled: {
    color: theme.colors.rating,
  },
  empty: {
    color: theme.colors.neutral300,
  },
  value: {
    fontSize: theme.typography.sizes.small,
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: theme.colors.text,
    marginLeft: 4,
  },
})
