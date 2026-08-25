/**
 * MyProfilePage styles
 * Un formulario y nada más: es una pantalla de un solo trabajo.
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
    /*
     * Arriba y no centrado, aunque sobre sitio: aquí se escribe, y al abrirse
     * el teclado el hueco visible se encoge. Con el contenido centrado, los
     * campos dan un salto justo mientras se teclea.
     */
    flexGrow: 1,
    padding: 16,
  },
  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  formError: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginTop: 14,
  },
  form: {
    marginTop: 16,
  },
  /** Alto para varias líneas y el texto arriba, no centrado verticalmente */
  bio: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  loading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  save: {
    marginTop: 8,
  },

  /*
    A las descripciones por oficio. En texto y no como botón: es una salida
    de la pantalla, no lo que se viene a hacer aquí.
  */
  toTrades: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  toTradesText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    textDecorationLine: 'underline',
  },
})
