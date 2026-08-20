/**
 * RemotePhoto Molecule
 * Una foto del servidor que dice cuándo no ha podido cargarse.
 *
 * Un `Image` a secas que falla no avisa: se queda el hueco del color de fondo y
 * quien mira entiende que ahí no hay nada, o que la app está rota. Pasó con las
 * fotos de trabajo —faltaba la ruta que las servía— y desde fuera era
 * indistinguible de "este profesional no ha subido ninguna".
 *
 * Aquí, cuando falla, el hueco lo dice. Y en desarrollo dice además el motivo
 * que devuelve el sistema, que es lo único que distingue "no llego al servidor"
 * de "la imagen está corrupta" o "no hay memoria para decodificarla" sin tener
 * el teléfono en la mano.
 *
 * **Y va con la sesión puesta.** Las fotos de una avería exigen sesión —enseñan
 * el interior de la casa de alguien— pero un `Image` a secas no manda ninguna
 * cabecera, así que el servidor contestaba 401 y no se ha visto nunca ninguna.
 * Las públicas —avatares, fotos de trabajo del profesional— ignoran la
 * cabecera, así que no hace falta saber aquí cuál es cuál.
 */

import { useEffect, useState } from 'react'
import { View, Text, Image, type StyleProp, type ImageStyle } from 'react-native'
import { useAccessToken } from '@/stores/useAuthStore'
import { styles } from './RemotePhoto.styles'

export interface RemotePhotoProps {
  uri: string
  style?: StyleProp<ImageStyle>
  /** Qué se enseña si no carga. Corto: el hueco suele ser pequeño. */
  fallback?: string
  testID?: string
}

export function RemotePhoto({
  uri,
  style,
  fallback = 'No se ha podido cargar',
  testID,
}: RemotePhotoProps) {
  const token = useAccessToken()
  const [error, setError] = useState<string | null>(null)

  /*
    Se vuelve a intentar al cambiar la foto o al renovarse la sesión. Sin esto,
    una que fallara por token caducado se quedaría en el hueco de "no carga"
    hasta salir de la pantalla, aunque la sesión ya esté buena otra vez.
  */
  useEffect(() => setError(null), [uri, token])

  if (error !== null) {
    return (
      <View style={[styles.failed, style]} testID={testID ? `${testID}-failed` : undefined}>
        <Text style={styles.failedText} numberOfLines={3}>
          {fallback}
        </Text>

        {/*
          El motivo solo mientras se desarrolla. En producción no aporta nada a
          quien mira una ficha, y puede decir cosas de la infraestructura.
        */}
        {__DEV__ && (
          <Text style={styles.failedReason} numberOfLines={4}>
            {error}
          </Text>
        )}
      </View>
    )
  }

  return (
    <Image
      source={{
        uri,
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      }}
      style={style}
      resizeMode="cover"
      onError={(event) => {
        const reason = event.nativeEvent?.error
        setError(
          typeof reason === 'string' && reason.length > 0 ? reason : 'sin motivo',
        )
      }}
      testID={testID}
    />
  )
}
