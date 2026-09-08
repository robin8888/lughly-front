import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /**
   * La explicación de por qué el botón está apagado, debajo de él.
   *
   * Con fondo y no como una línea suelta: es lo que se lee estando de pie en
   * un portal, y entre el resto de datos de la tarjeta una frase gris más se
   * pasa por alto. Del color de los plazos —naranja apagado—, que es lo que ya
   * significa "esto va de esperar" en el resto de la app.
   */
  wait: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.pendingSoft,
  },
  waitText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.45,
    color: theme.colors.pendingText,
  },
})
