/**
 * MessagesFab styles
 * Mismo cristal y sombra que la píldora de abajo (BottomTabBar.styles.ts),
 * en redondo: la app ya tiene ese lenguaje para "flota encima de todo".
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

const SIZE = 54

/**
 * A partir de aquí la chapa dice "9+".
 *
 * Lo que comunica no es la cifra exacta sino que hay gente esperando, y tres
 * dígitos dentro de un círculo de veinte píxeles no se leen. Nueve cabe de
 * sobra y es el corte que usa media industria.
 */
export const BADGE_MAX = 9

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: SIZE,
    height: SIZE,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    zIndex: 70,
    shadowColor: 'rgba(4, 7, 15, 1)',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  /**
   * La chapa, mordiendo la esquina de arriba a la derecha.
   *
   * En rojo y no en el azul de la casa: el aviso tiene que separarse del botón
   * al que se pega, y el botón ya es azul. `urgency` es el rojo apagado de la
   * app —el mismo que "ahora no atiendo"—, no un rojo de alarma: hay mensajes
   * esperando, no ha fallado nada.
   *
   * El aro blanco es lo que la despega del botón: sin él, dos círculos de
   * colores distintos pegados se leen como una sola mancha, y encima el aro
   * sigue funcionando cuando la chapa cae sobre lo que haya detrás.
   *
   * `minWidth` y no `width`: con dos caracteres —"9+"— el círculo se estira a
   * píldora en vez de recortar el texto.
   */
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.urgency,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /**
   * Blanco sobre ese rojo: 6,06:1, muy por encima del 4,5:1 de la WCAG —y
   * hace falta, porque a 12 px es de lo más pequeño que escribe la app—.
   */
  badgeText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 12,
    lineHeight: 14,
    color: '#ffffff',
  },
})
