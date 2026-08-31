/**
 * AvailabilityPage styles
 *
 * Arriba el mes en rejilla y debajo el día abierto: se mira, se toca un día y
 * se edita sin cambiar de pantalla. El panel del día no va en tarjeta blanca
 * como las franjas, sino separado por una línea, para que se lea como "lo que
 * hay debajo del calendario" y no como una tarjeta más de una lista.
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

  /** Sobre el azul de la tarjeta que explica: blanco y en negrita */
  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  /**
   * El segundo párrafo, en redonda. Si los dos fueran negrita no habría
   * ninguno más importante que el otro, y este es el matiz, no el aviso.
   */
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

  calendarSlot: {
    marginTop: 16,
  },
  /**
   * "actualizando…" debajo del mes y no encima: un velo de carga sobre la
   * rejilla la dejaría ilegible justo mientras se cambia de mes, que es cuando
   * se está mirando.
   */
  updating: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    textAlign: 'center',
    marginTop: 6,
  },

  shortcut: {
    marginTop: 12,
  },

  /** El día abierto, separado del calendario por una línea */
  day: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  dayTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  daySource: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.textSoft,
    marginTop: 4,
  },
  /**
   * Festivo y "estás fuera": los dos avisan de algo que manda sobre el horario
   * y que no se arregla desde aquí, así que van con la misma pinta.
   */
  dayFlag: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.urgency,
    marginTop: 8,
  },

  /**
   * Lo ya comprometido, en el rojo apagado de "ahora no" y **no** en el de
   * error: tener trabajo no es un fallo, y con el rojo de error un día lleno se
   * leería como un día roto. Es el mismo color del punto del calendario, que es
   * por donde se ha llegado hasta aquí.
   */
  commitments: {
    marginTop: 12,
    padding: 12,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.unavailable,
  },
  commitmentsTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: 8,
  },
  commitment: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 4,
  },
  commitmentHours: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  commitmentTitle: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
  commitmentsNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.textSoft,
    marginTop: 8,
  },

  dayEmpty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 12,
  },

  list: {
    gap: 12,
    marginTop: 12,
  },
  window: {
    gap: 0,
  },
  /** Desde y hasta, uno al lado del otro: se leen como un rango */
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
  invalid: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.error,
    marginBottom: 10,
  },
  /** Botón, como en el horario de urgencias: se ve dónde se pulsa */
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
    marginTop: 12,
  },
  save: {
    marginTop: 10,
  },

  /**
   * Volver al horario de siempre va como enlace y no como botón: deshace, no
   * decide. Con tres botones seguidos el importante deja de verse.
   */
  revert: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  revertText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    textDecorationLine: 'underline',
  },

  /**
   * El horario de todas las semanas: siete filas, y la que se abre despliega su
   * editor debajo. Un acordeón y no siete editores a la vez, que serían
   * cuarenta campos de hora en una pantalla.
   */
  weekly: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  weeklyTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  },
  weeklyNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.textSoft,
    marginTop: 4,
  },
  weeklyList: {
    marginTop: 12,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    overflow: 'hidden',
  },
  /*
    El separador va en el contenedor de cada fila y no en la fila: así el
    editor desplegado queda dentro del mismo bloque y no partido por una línea
    a media altura.
  */
  weeklyRowSlot: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  weeklyRowOpen: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  /**
   * Las tres letras del día, con ancho fijo para que las horas de las siete
   * filas caigan alineadas: en una lista, lo que se compara de un vistazo es la
   * columna de la derecha.
   */
  weeklyDay: {
    width: 40,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  weeklyHours: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  /** "Sin horario" no es un dato, es la ausencia de uno: se dice más bajo */
  weeklyHoursOff: {
    color: theme.colors.textSoft,
  },
  weeklyChevron: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSoft,
  },
  weeklyEditor: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: theme.colors.surfaceSoft,
  },

  /** El atajo, dentro del diálogo */
  shortcutBody: {
    gap: 12,
  },
  /**
   * Los siete días como interruptores, en varias líneas.
   *
   * Antes eran siete círculos repartiéndose el ancho con la inicial dentro, y
   * no valía por dos motivos: **martes y miércoles empiezan los dos por "m"**,
   * así que había dos botones idénticos, y en un móvil estrecho cada círculo se
   * quedaba en poco más que la letra. Ahora llevan tres letras y una marca, y
   * se envuelven en las líneas que hagan falta.
   */
  weekdays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekday: {
    minWidth: 74,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayOn: {
    backgroundColor: theme.colors.accent600,
    borderColor: theme.colors.accent600,
  },
  weekdayText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  weekdayTextOn: {
    color: '#ffffff',
  },

  /**
   * Entre semana / fin de semana / todos. Son los tres grupos que se piden
   * siempre, y sin ellos poner de lunes a viernes son cinco toques.
   */
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surfaceSoft,
  },
  presetText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },

  /**
   * El aviso de los festivos que chocan con el horario. Va al final y fuera de
   * tarjeta: no es parte de lo que se edita, es lo que hay que mirar antes de
   * darlo por bueno, y mira más allá del mes que se está viendo.
   */
  holidays: {
    marginTop: 20,
    padding: 12,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.urgency,
  },
  holidaysTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: 6,
  },
  holidaysLine: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.text,
    opacity: 0.9,
  },
  holidaysNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 8,
  },
})
