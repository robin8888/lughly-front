/**
 * AgendaPage styles
 * Una tarjeta por trabajo: cuándo, dónde, quién y qué hay que hacer.
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
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
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
  count: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.65,
    marginBottom: 10,
  },
  list: {
    gap: 12,
  },

  /**
   * El fondo dice en qué punto está el trabajo, **sin inventar un idioma
   * nuevo**: cada tarjeta se tiñe del tono suave de la misma familia que ya
   * lleva su etiqueta (`jobStatusLook`). Si la etiqueta dice "En curso" en
   * verde, el fondo es ese verde aclarado.
   *
   * Es lo que convierte la agenda en algo que se lee de un vistazo desde la
   * furgoneta: sin esto son diez tarjetas blancas idénticas y hay que leer la
   * etiqueta de cada una para saber cuál es la de ahora.
   *
   * Tonos muy claros a propósito. Es el fondo de una tarjeta entera con texto
   * encima, no una etiqueta: el color tiene que señalar sin competir con lo
   * que hay escrito. El borde del mismo color, un punto más fuerte, es lo que
   * lo separa del fondo de la pantalla ahora que la tarjeta ya no es blanca.
   */
  cardContracted: {
    backgroundColor: theme.colors.accent2100,
    borderWidth: 1,
    borderColor: theme.colors.accent2300,
  },
  /** El de ahora mismo: verde, el de "esto está en marcha" */
  cardInProgress: {
    backgroundColor: theme.colors.availableSoft,
    borderWidth: 1,
    borderColor: theme.colors.available,
  },
  /**
   * Y el terminado en gris, que es el único que **no** pide nada.
   *
   * Apagado a propósito y no en otro color vivo: lo que está hecho tiene que
   * pesar menos que lo que está por hacer, o la agenda de quien lleva un mes
   * trabajando se convierte en una pared de colores donde no se distingue lo
   * de hoy.
   */
  cardCompleted: {
    backgroundColor: theme.colors.neutral200,
    borderWidth: 1,
    borderColor: theme.colors.neutral400,
  },
  /**
   * Y el título de lo terminado, apagado.
   *
   * El gris de fondo por sí solo no bastaba: sobre una pantalla clara, un gris
   * suave se lee como "tarjeta normal con otro papel". Bajarle también el
   * contraste al texto es lo que lo manda al fondo de verdad — lo hecho tiene
   * que pesar menos que lo que está por hacer.
   */
  jobTitleDone: {
    color: theme.colors.neutral700,
  },

  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  /*
    El título manda en la tarjeta: es lo único que dice **qué hay que hacer**,
    y estaba al mismo tamaño que el oficio y la ciudad. En una lista que se
    mira de pie en un portal, lo primero que se busca tiene que ganar por
    tamaño, no por posición.
  */
  jobTitle: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h5,
    lineHeight: theme.typography.sizes.h5 * 1.25,
    color: theme.colors.cardText,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 3,
  },
  /** El día, destacado: es lo que se viene a mirar */
  /**
   * El día, en su propia caja y destacado.
   *
   * Es una agenda: lo que se viene a mirar es cuándo toca, y como una línea
   * más de texto se perdía entre el oficio y la dirección.
   */
  whenBox: {
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.field,
    backgroundColor: theme.colors.accent100,
  },
  whenLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    opacity: 0.8,
  },
  when: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent900,
    marginTop: 2,
  },

  /**
   * Llamar, como botón. Era un texto azul, y en la pantalla que se abre
   * delante del portal lo que hace falta es algo que se toque sin apuntar.
   */
  call: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent700,
  },
  callText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: '#ffffff',
  },

  /** La tira de fotos del cliente */
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  photo: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.photo,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceSoft,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },

  block: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  blockLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginBottom: 2,
  },
  address: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  city: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
  },
  client: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  /** Llamar es la acción más usada de esta pantalla, así que se ve */
  noPhone: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 2,
  },

  description: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 10,
  },

  /** El botón del día: separado de lo que se lee, y a lo ancho de la tarjeta */
  action: {
    marginTop: 12,
  },
  /** Por qué no se puede empezar todavía: debajo del botón apagado */
  blocked: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.textSoft,
    marginTop: 8,
  },
  /** Lo que sustituye al botón cuando ya no hay nada que pulsar */
  awaitingClient: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 12,
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  amountLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
  },
  amount: {
    color: theme.colors.accent700,
  },
  noAmount: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
})
