/**
 * ClientHero styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.accent900,
    /*
      Solo las esquinas de abajo: arriba el bloque muere contra el borde de la
      pantalla y una curva ahí dejaría dos medias lunas blancas junto al notch.
    */
    borderBottomLeftRadius: theme.radius.card,
    borderBottomRightRadius: theme.radius.card,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    height: 24,
    width: 70,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  /** 44 px de lado: el mínimo que Apple pide para poder acertarle con el dedo */
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.accent500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
  },
  avatarEmpty: {
    backgroundColor: theme.colors.accent800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h3,
    lineHeight: theme.typography.sizes.h3 * theme.typography.lineHeights.heading,
    color: '#ffffff',
    marginTop: theme.spacing[6],
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent300,
    marginTop: theme.spacing[1],
  },
  search: {
    marginTop: theme.spacing[4],
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[3],
  },
  urgent: {
    flex: 1,
    backgroundColor: theme.colors.urgency,
  },
  /*
    Quien pinta el fondo a mano tiene que decir también cómo se ve hundido:
    sin esto el `backgroundColor` de arriba tapa el color de pulsado de la
    variante y el botón se queda sin respuesta al tacto.
  */
  urgentPressed: {
    backgroundColor: '#8d3b31',
  },
  urgentText: {
    color: '#ffffff',
  },
  howItWorks: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  howItWorksText: {
    color: theme.colors.accent300,
  },
})
