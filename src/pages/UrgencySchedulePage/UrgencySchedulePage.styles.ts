/**
 * UrgencySchedulePage styles
 * Una tarjeta por franja: día, horas, tarifa y su botón de quitar.
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
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  /*
   * La tarjeta de arriba es lo que explica para qué sirve la pantalla, así que
   * va en el tamaño de texto normal y no en el pequeño de las notas al pie.
   */
  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  rateNote: {
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

  empty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 16,
  },

  list: {
    gap: 12,
    marginTop: 16,
  },
  window: {
    gap: 0,
  },
  /** Desde y hasta, uno al lado del otro: se leen como un rango */
  /**
   * Los siete días, en botones de una letra.
   *
   * En una fila y no en un desplegable: con un selector solo se ve el día
   * elegido y hay que abrirlo para saber cuáles hay; aquí se ve de un vistazo
   * qué días están puestos y cuáles no, que es lo que se está decidiendo.
   */
  days: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    flex: 1,
    /* 44 de alto es el mínimo de un objetivo táctil; el ancho lo reparte flex */
    height: 44,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: {
    backgroundColor: theme.colors.accent700,
    borderColor: theme.colors.accent700,
  },
  dayText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
  /* Blanco sobre `accent700`: 6,48:1, el mismo par que los botones rellenos */
  dayTextOn: {
    color: '#ffffff',
  },
  /**
   * Los dos repartos de siempre. En enlace y no en botón: son un atajo a lo
   * que ya se puede hacer tocando días, no una tercera cosa que decidir.
   */
  dayShortcuts: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  dayShortcut: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },
  hours: {
    flexDirection: 'row',
    gap: 10,
  },
  hour: {
    flex: 1,
  },
  overnight: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    marginBottom: 10,
  },
  /**
   * Lo que falta para poder guardar, encima del botón.
   *
   * En una caja con fondo y no como texto suelto: compite con una lista larga
   * de tarjetas, y un párrafo del mismo color que el resto se pierde entre
   * ellas justo cuando hace falta que se vea.
   */
  missing: {
    // El rojo de la app al 10 %: se ve la caja sin que grite
    backgroundColor: 'rgba(163, 69, 58, 0.10)',
    borderRadius: theme.radius.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    marginTop: 12,
  },
  missingText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.45,
    color: theme.colors.error,
  },
  invalid: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.error,
    marginBottom: 10,
  },
  /**
   * Botón y no un enlace suelto: es la única acción destructiva de la tarjeta
   * y con la forma de las demás se ve dónde termina el área que se pulsa.
   * Va perfilado en vez de relleno para que no compita con guardar.
   */
  remove: {
    marginTop: 10,
    paddingVertical: 9,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.urgency,
    alignItems: 'center',
  },
  removeText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },

  add: {
    marginTop: 16,
  },
  save: {
    marginTop: 10,
  },
})
