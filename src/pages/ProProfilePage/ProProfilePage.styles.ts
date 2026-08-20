/**
 * ProProfilePage styles
 * Cabecera fija y ficha, según MobileApp.dc.html (isPerfil).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/*
 * 96 y no 68: centrada y con sitio, la foto es lo primero que se mira en la
 * ficha de una persona a la que vas a dejar entrar en casa.
 */
export const AVATAR_SIZE = 96

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.bg,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  headerTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h6,
    color: theme.colors.text,
  },
  content: {
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stateText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
  },

  /** La presentación entera: foto, nombre, etiquetas, precio y nota */
  hero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  /** Solo el hueco: el círculo y su anillo los dibuja el átomo `Avatar` */
  avatar: {
    marginBottom: 10,
  },
  name: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    textAlign: 'center',
    color: theme.colors.cardText,
  },
  /** Quién hará el trabajo, bajo el nombre de quien lo contrata */
  worker: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    textAlign: 'center',
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 2,
  },
  trade: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    textAlign: 'center',
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 2,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },

  /*
   * Los dos números con los que se compara una persona con otra, uno a cada
   * lado de una línea. Separados del resto por arriba: así se encuentran en el
   * mismo sitio en todas las fichas, sin tener que leer nada.
   */
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  headlineItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  headlineDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.cardDivider,
  },
  headlineLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
  },
  rate: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.accent700,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingValue: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },

  /**
   * Galería de sus trabajos. Se sale del margen de la pantalla a propósito,
   * con el mismo hueco de vuelta en el contenido: así la primera foto empieza
   * alineada con el texto y las siguientes se asoman por el borde, que es lo
   * que invita a arrastrar.
   */
  galleryGroup: {
    marginBottom: 14,
  },
  /*
    El rótulo de la tira y cuántas fotos hay, a los lados. El número no es un
    adorno: dice si merece la pena arrastrar y cuánto queda por ver, que en una
    tira horizontal no se sabe hasta el final.
  */
  galleryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  /** El oficio de la tira, en pequeño y en mayúsculas como el resto de rótulos */
  galleryLabel: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.colors.cardText,
    opacity: 0.7,
  },
  galleryCount: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  gallery: {
    marginHorizontal: -16,
  },
  galleryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  /**
   * Más pequeñas que antes: 220 de ancho dejaban ver dos y media y la tira
   * parecía cortada. Con 150 entran tres y pico, y ese trozo de la cuarta es
   * lo que dice sin palabras que hay más a la derecha.
   *
   * En 4:3 y no en 3:4 porque así se suele fotografiar una habitación
   * terminada, y con el borde fino para que una foto clara no se derrame en
   * el fondo de la página.
   */
  galleryPhoto: {
    width: 150,
    height: 112,
    backgroundColor: theme.colors.accent100,
    borderRadius: theme.radius.field,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },

  bio: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.55,
    color: theme.colors.cardText,
  },
  completed: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    marginTop: 8,
  },

  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h6,
    color: theme.colors.cardText,
    marginBottom: 8,
  },
  sectionBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
  },
  /** Una línea por oficio: nombre a la izquierda, precio a la derecha */
  /*
    La línea separa el oficio entero —su precio y lo que cuenta de él— del
    siguiente. Antes iba en la fila del precio, y con la descripción debajo
    habría partido en dos lo que es una sola cosa.
  */
  /*
    Cada oficio, su bloque. La línea separa un oficio del siguiente y no el
    precio de su texto, que es una sola cosa.
  */
  tradeBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardDivider,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  tradeDescription: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 5,
  },
  /** El "no ha contado nada": más apagado, para que no compita con lo escrito */
  tradeNoDescription: {
    fontStyle: 'italic',
    opacity: 0.5,
  },
  tradeLabel: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  tradeRate: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },

  /** Altura del mapa de cobertura. En el diseño web son 160 px. */
  /*
   * Día a la izquierda y horas a la derecha, como el cartel de un negocio: es
   * la forma en la que ya se sabe leer un horario sin pararse a mirarlo.
   */
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardDivider,
  },
  scheduleDay: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.85,
    textTransform: 'capitalize',
  },
  scheduleHours: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.85,
    textAlign: 'right',
  },
  /** La última fila no lleva raya: la cierra el borde de la tarjeta */
  scheduleRowLast: {
    borderBottomWidth: 0,
  },
  /** Hoy, que es el día por el que casi todo el mundo viene a mirar */
  scheduleToday: {
    fontFamily: theme.typography.fonts.bodyBold,
    color: theme.colors.accent700,
    opacity: 1,
  },
  scheduleClosed: {
    opacity: 0.5,
  },

  sectionNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 6,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  messageButton: {
    marginTop: 8,
  },
  report: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
    textAlign: 'center',
    marginTop: 16,
  },
})
