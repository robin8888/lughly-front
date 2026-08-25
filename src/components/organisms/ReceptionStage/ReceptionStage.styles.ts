/**
 * ReceptionStage styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[6],
  },
  /*
    Cuadrado a todo el ancho: es justo lo que ocupaban las cuatro casillas que
    había aquí —dos columnas al 48 % y dos filas, con su hueco en medio—, así
    que la home no cambia de largo al sustituirlas por este.

    `aspectRatio` y no un alto fijo, para que el cuadrado siga al ancho del
    móvil sin recalcular nada.
  */
  stage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.accent100,
  },
  /*
    La imagen ocupa el flujo al 100 % y no va en absoluto: con
    `position: absolute` y los cuatro lados a 0 el `Image` no recibe medida y
    se pinta a su tamaño real —1024 px dentro de una caja de 343—, con lo que
    el `overflow: hidden` recorta y solo se ve una esquina.

    `cover` porque las diecinueve —recepción y los dieciocho oficios— son
    cuadradas y llenan exacto.
  */
  image: {
    width: '100%',
    height: '100%',
  },
  /*
    Abajo a la derecha, con el pico apuntando hacia arriba. Estuvo arriba a la
    derecha, que es donde se pone un bocadillo de cómic, y ahí **le tapaba la
    cara**: en las diecinueve ilustraciones Uhiro está centrado y de medio
    cuerpo, así que su cabeza ocupa justo el tercio de arriba del centro. Por
    abajo lo que hay es banco de trabajo, suelo o mostrador.

    Sin sombra a propósito. En Android la sombra es `elevation`, que dibuja
    por el contorno de la vista y se lleva por delante el pico, que sobresale.
    Blanco sobre ilustración ya se despega solo.
  */
  bubble: {
    position: 'absolute',
    bottom: theme.spacing[4],
    right: theme.spacing[4],
    /*
      Ancho: con el botón en la misma línea, al 62 % le quedaban tres palabras
      por línea y el bocadillo se hacía una columna.
    */
    maxWidth: '86%',
    backgroundColor: '#ffffff',
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    /*
      En fila y el botón al otro extremo. Debajo del texto gastaba una franja
      entera del bocadillo para tres letras, y con el bocadillo abajo a la
      derecha lo empujaba contra el canto de la ilustración.
    */
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  /*
    Lo dicho se encoge y el botón no: `flexShrink` en el texto, para que al
    partirse en dos o tres líneas sea el texto el que ceda ancho y "Ver" no
    acabe con una letra por línea.
  */
  said: {
    flexShrink: 1,
  },
  speech: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  /*
    La cifra en verde. Es el dato por el que el cliente decide si sigue, y en
    una frase corrida se pierde: en verde se lee antes que la frase que la
    rodea, que es justo lo que se quiere.
  */
  count: {
    color: theme.colors.availableText,
  },
  /*
    El triángulo del cómic. React Native no tiene `clip-path`: el pico es una
    caja de 0x0 con dos bordes laterales transparentes y el de arriba del
    color del bocadillo, que es el truco de siempre para dibujar un triángulo
    sin traer un SVG para doce píxeles.
  */
  tail: {
    position: 'absolute',
    top: -11,
    left: theme.spacing[4],
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  /** Pequeño de verdad: cabe en el bocadillo y no compite con lo que dice */
  see: {
    paddingHorizontal: theme.spacing[4],
    /* Que no lo encoja el texto largo: tres letras no se parten */
    flexShrink: 0,
  },
  seeText: {
    fontSize: theme.typography.sizes.tiny,
  },
})
