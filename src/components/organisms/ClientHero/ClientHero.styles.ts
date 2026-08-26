/**
 * ClientHero styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.accent900,
    /*
      Sin redondear por ningún lado. Arriba nunca lo estuvo —el bloque muere
      contra el borde de la pantalla y una curva ahí dejaría dos medias lunas
      blancas junto al notch— y abajo se le ha quitado: la franja navy corta
      recto de canto a canto y se lee como el borde de la pantalla, no como
      una tarjeta apoyada encima del contenido.
    */
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
  /**
   * El de mensajes, en dorado y con chispas.
   *
   * Es el único botón de esta fila que lleva a una conversación con otra
   * persona, y quedaba indistinguible del blanco al 28 % que separa cualquier
   * icono del fondo. La chapa roja avisa cuando hay algo sin leer; esto es
   * para **antes** de que llegue el primer mensaje, que es cuando nadie sabe
   * que ese botón existe.
   *
   * `rating` es el dorado de la casa —el de las estrellas— y no uno nuevo. Y
   * el borde sube a 1,5 porque a un punto el dorado se lee como gris sucio
   * sobre el navy.
   */
  iconButtonChat: {
    borderColor: theme.colors.rating,
    borderWidth: 1.5,
  },
  /**
   * La chapa de mensajes sin leer, mordiendo la esquina del icono.
   *
   * La misma pieza que la del botón flotante de la home del profesional —rojo
   * `urgency`, aro blanco, "9+" a partir de nueve—, porque cuentan lo mismo y
   * en dos homes de la misma app no pueden avisar de dos formas distintas.
   *
   * El aro blanco importa más aquí que allí: el icono vive sobre la franja
   * navy del hero, y sin él el rojo apagado se apoyaría directamente en el
   * azul oscuro.
   */
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.urgency,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 11,
    lineHeight: 13,
    color: '#ffffff',
  },
  /**
   * La foto, centrada y grande, con el saludo debajo.
   *
   * Estaba arriba a la derecha, del tamaño de un icono, haciendo pareja con el
   * botón de mensajes. Ahí era un adorno de la barra superior; aquí es la
   * cabecera de la pantalla de alguien que acaba de entrar en su app.
   *
   * Mismas medidas que en Mi cuenta —104 con anillo de 2 y aire de 3— porque
   * es la misma foto de la misma persona: dos tamaños distintos en dos
   * pantallas seguidas se leen como dos cosas distintas.
   *
   * El anillo se queda en `accent500` y no en transparente como allí: en Mi
   * cuenta el anillo dice si el profesional atiende urgencias y en un cliente
   * no dice nada, pero esto es navy y sin él la foto se apoya directamente en
   * el azul oscuro.
   */
  avatarBlock: {
    alignItems: 'center',
    marginTop: theme.spacing[6],
  },
  avatarRing: {
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.accent500,
    padding: 3,
  },
  avatar: {
    width: 104,
    height: 104,
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
    marginTop: theme.spacing[3],
    textAlign: 'center',
  },
  /*
    Centrado también. Es la segunda línea del mismo bloque —la foto, el saludo
    y para qué sirve la pantalla—, y dejarla alineada a la izquierda partiría
    en dos algo que se lee de una vez.
  */
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent300,
    marginTop: theme.spacing[1],
    textAlign: 'center',
  },
  search: {
    marginTop: theme.spacing[4],
  },
  /*
    Pegados al buscador. Entre los dos había tres huecos apilados —el margen
    de abajo del buscador, el aire de su nota y este— que sumaban más de
    treinta puntos y dejaban los botones flotando lejos de lo que acompañan.
    Quitado el primero y bajado este, quedan diez.
  */
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
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
