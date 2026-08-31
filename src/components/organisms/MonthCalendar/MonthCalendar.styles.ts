/**
 * MonthCalendar styles
 *
 * Una rejilla de siete columnas donde las casillas se reparten el ancho a
 * partes iguales (`14.2857%`), y no con `flex: 1`: en `flexWrap` el `flex` se
 * calcula por fila, así que la última —que casi nunca tiene siete días— saldría
 * con las casillas estiradas y los números desalineados con los de arriba.
 *
 * La casilla es cuadrada por `aspectRatio` para que el mes entre en pantalla sea
 * cual sea el ancho del móvil, y el círculo del número lleva medida fija: un
 * círculo que crece con la pantalla se convierte en un óvalo en cuanto el texto
 * escala por accesibilidad.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/** Lo que mide el círculo del número. Fijo: ver la cabecera del fichero. */
const NUMBER_SIZE = 34

export const styles = StyleSheet.create({
  calendar: {
    backgroundColor: theme.colors.bg,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },

  /** La barra del mes: flechas a los lados y el nombre en medio */
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  monthArrow: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  monthArrowIcon: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.accent700,
  },
  monthName: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    /* En minúscula sale del propio nombre del mes; aquí se levanta la inicial */
    textTransform: 'capitalize',
  },

  columns: {
    flexDirection: 'row',
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  column: {
    width: '14.2857%',
    textAlign: 'center',
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },

  number: {
    width: NUMBER_SIZE,
    height: NUMBER_SIZE,
    borderRadius: NUMBER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /**
   * Hoy va con el contorno y el día abierto con el relleno, no al revés: el
   * contorno marca sin quitar protagonismo, y el relleno se mueve con cada
   * toque. Si hoy fuera el relleno, abrir otro día dejaría dos casillas
   * gritando lo mismo.
   */
  numberToday: {
    borderWidth: 1.5,
    borderColor: theme.colors.accent600,
  },
  numberSelected: {
    backgroundColor: theme.colors.accent900,
    borderColor: theme.colors.accent900,
  },

  numberText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  /** Un día sin horario: sigue ahí y se puede tocar, pero no pide nada */
  numberTextOff: {
    color: theme.colors.textSoft,
    opacity: 0.7,
  },
  /**
   * Los días fuera, tachados. Es lo que distingue "no trabajo ese día" de
   * "estoy de vacaciones": lo segundo no se arregla desde esta pantalla, y
   * apagarlo igual que un día sin horario haría creer que sí.
   */
  numberTextAway: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSoft,
  },
  /** Sobre el círculo relleno o dentro del contorno de hoy */
  numberTextOn: {
    fontFamily: theme.typography.fonts.bodyBold,
    color: '#ffffff',
  },

  dots: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
    marginTop: 2,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotWorks: {
    backgroundColor: theme.colors.accent600,
  },
  /**
   * Lo comprometido, en el rojo apagado de "ahora no" y **no** en el de error:
   * tener trabajo no es un fallo de nadie, y con el rojo de error una semana
   * llena se leería como una semana rota.
   */
  dotBusy: {
    backgroundColor: theme.colors.unavailable,
  },

  legend: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
})
