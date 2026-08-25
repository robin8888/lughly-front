/**
 * MyPhotosPage
 * Las fotos de trabajo del profesional, para cambiarlas cuando quiera.
 *
 * En el alta se piden, pero ahí casi nadie tiene las buenas a mano: se suben
 * las que hay en el carrete y se cambian al terminar el siguiente trabajo. Sin
 * esta pantalla, las del primer día serían las de siempre.
 *
 * Van **por oficio**, con su tope de cinco cada uno, porque la tarjeta del
 * directorio habla de un oficio concreto: en la de limpieza no pintan fotos de
 * carpintería. Quien ejerce uno solo ve una rejilla y no nota la diferencia.
 *
 * Cada foto va por su cuenta —se sube al elegirla y se quita al confirmar— y
 * no hay botón de guardar. Es lo que se espera de una galería, y evita el caso
 * peor: creer que se ha subido algo, salir de la pantalla y perderlo.
 */

import { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { API_BASE_URL } from '@/api'
import type { ApiMyProPhoto } from '@/api/pros.api'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { usePickImage } from '@/hooks/media/usePickImage'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useMyTrades } from '@/hooks/domain/useMyTrades'
import {
  MAX_WORK_PHOTOS,
  useManageMyPhotos,
  useMyPhotos,
} from '@/hooks/domain/useMyPhotos'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { PlusIcon } from '@/components/atoms/PlusIcon'
import { theme } from '@/theme'
import { cellSize, styles } from './MyPhotosPage.styles'

export interface MyPhotosPageProps {
  onBack: () => void
}

export function MyPhotosPage({ onBack }: MyPhotosPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const isEmployee = useIsEmployee()

  /*
   * El lado de la celda se calcula con el ancho real de la pantalla, para que
   * el hueco de añadir y las fotos midan exactamente lo mismo. Se recalcula al
   * girar el teléfono, que es lo que `useWindowDimensions` hace y una constante
   * de módulo no.
   */
  const { width } = useWindowDimensions()
  const side = { width: cellSize(width), height: cellSize(width) }

  /**
   * Las rejillas las mandan sus OFICIOS, no las fotos que ya tenga: sin esto,
   * un oficio recién añadido no tendría dónde subir la primera.
   */
  const trades = useMyTrades(!isEmployee)
  const { data, isPending, isError, refetch } = useMyPhotos(!isEmployee)
  const { add, remove, isWorking } = useManageMyPhotos()
  const { pick, isProcessing } = usePickImage()

  /**
   * Qué ha pasado con lo último que se hizo.
   *
   * Va aquí dentro y no en un aviso del sistema: subir cinco fotos son cinco
   * ventanas que cerrar a mano, y el aviso taparía justo la rejilla donde se
   * quiere ver el resultado. Lo bueno se borra solo a los cuatro segundos; lo
   * malo se queda hasta el siguiente intento, porque pide hacer algo.
   */
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const say = (text: string, ok: boolean) => {
    if (timer.current) clearTimeout(timer.current)
    setNotice({ text, ok })

    if (ok) timer.current = setTimeout(() => setNotice(null), 4000)
  }

  // Sin esto, el temporizador dispararía sobre una pantalla que ya no está
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const photos = data ?? []
  const isBusy = isWorking || isProcessing

  const photosOf = (slug: string): ApiMyProPhoto[] =>
    photos
      .filter((photo) => photo.tradeSlug === slug)
      .sort((a, b) => a.position - b.position)

  const handleAdd = async (slug: string) => {
    const image = await pick('library')

    // Cancelar el selector no es un fallo: no se dice nada
    if (!image) return

    const { ok, error } = await add(image, slug)

    say(
      ok ? 'Foto subida. Ya se ve en tu ficha.' : (error ?? 'No hemos podido subir la foto.'),
      ok,
    )
  }

  /**
   * Se pregunta antes de quitar. Borrar una foto no se deshace —el fichero se
   * va del servidor— y el gesto es un toque sobre algo que se está mirando.
   */
  const handleRemove = (id: string) => {
    Alert.alert('¿Quitar esta foto?', 'Dejará de verse en tu ficha y en el listado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () => {
          void remove(id).then(({ ok, error }) => {
            say(
              ok ? 'Foto quitada.' : (error ?? 'No hemos podido quitar la foto.'),
              ok,
            )
          })
        },
      },
    ])
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Mis fotos</Text>
    </View>
  )

  /**
   * La ficha de un empleado es la de su empresa: las fotos que se ven son las
   * que ella sube. Se le dice, en vez de dejarle chocar con un 403.
   */
  if (isEmployee) {
    return (
      <View style={styles.screen} testID="my-photos-page">
        {header}
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}>
          <EmptyState
            title="Las lleva tu empresa"
            message="Las fotos que se ven en el listado son las de quien te dio de alta. Si tienes trabajos que merece la pena enseñar, mándaselas a ellos."
            actions={[{ label: 'Volver', onPress: onBack, testID: 'my-photos-employee-back' }]}
            testID="my-photos-employee"
          />
        </ScrollView>
      </View>
    )
  }

  const isLoading = isPending || trades.isPending
  const hasFailed = isError || trades.isError
  const myTrades = trades.data ?? []

  return (
    <View style={styles.screen} testID="my-photos-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.state} testID="my-photos-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : hasFailed ? (
          <EmptyState
            title="No hemos podido cargar tus fotos"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              {
                label: 'Reintentar',
                onPress: () => {
                  void refetch()
                  void trades.refetch()
                },
                testID: 'my-photos-retry',
              },
            ]}
            testID="my-photos-error"
          />
        ) : (
          <>
            {/*
              El párrafo que explica, en su propia tarjeta azul y fuera
              de la blanca: lo que se lee y lo que se toca, separados.
            */}
            <InfoCard variant="accent">
              <Text style={styles.intro}>
                Enseña trabajos terminados, no herramientas ni el furgón: quien
                busca quiere ver cómo queda.
                {myTrades.length > 1
                  ? ` Van por oficio, ${MAX_WORK_PHOTOS} en cada uno, porque quien busca limpieza solo ve las de limpieza.`
                  : ` Caben ${MAX_WORK_PHOTOS}, y por eso conviene que sean tus mejores ${MAX_WORK_PHOTOS}.`}
              </Text>
            </InfoCard>

            <InfoCard>

            {notice && (
              <Text
                style={[styles.notice, notice.ok ? styles.noticeOk : styles.noticeError]}
                testID="my-photos-notice"
              >
                {notice.text}
              </Text>
            )}

            {myTrades.map((trade) => {
              const own = photosOf(trade.slug)
              const canAdd = own.length < MAX_WORK_PHOTOS && !isBusy

              return (
                <View key={trade.slug} style={styles.group}>
                  {/* El oficio solo si hay más de uno: con uno, sobra */}
                  {myTrades.length > 1 && (
                    <Text style={styles.groupLabel}>
                      {trade.label} · {own.length} de {MAX_WORK_PHOTOS}
                    </Text>
                  )}

                  <View style={styles.grid}>
                    {own.map((photo, index) => (
                      <View key={photo.id} style={[styles.cell, side]}>
                        <Image
                          source={{ uri: `${API_BASE_URL}${photo.url}` }}
                          style={styles.photo}
                          resizeMode="cover"
                        />

                        <Pressable
                          onPress={() => handleRemove(photo.id)}
                          disabled={isBusy}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={`Quitar la foto ${index + 1} de ${trade.label}`}
                          style={styles.remove}
                          testID={`my-photos-remove-${trade.slug}-${index}`}
                        >
                          <Text style={styles.removeIcon}>×</Text>
                        </Pressable>
                      </View>
                    ))}

                    {/**
                     * El hueco de añadir va al final, donde continúa la
                     * rejilla, y desaparece al llegar al tope: un botón que
                     * solo puede dar error no debería estar ahí.
                     */}
                    {own.length < MAX_WORK_PHOTOS && (
                      <Pressable
                        onPress={() => void handleAdd(trade.slug)}
                        disabled={!canAdd}
                        accessibilityRole="button"
                        accessibilityLabel={`Añadir una foto de ${trade.label}`}
                        style={[styles.cell, side, styles.addCell, !canAdd && styles.addBusy]}
                        testID={`my-photos-add-${trade.slug}`}
                      >
                        {isBusy ? (
                          <ActivityIndicator size="small" color={theme.colors.accent} />
                        ) : (
                          <PlusIcon color={theme.colors.accent} />
                        )}
                      </Pressable>
                    )}
                  </View>

                  {own.length === 0 && (
                    <Text style={styles.hint}>
                      Todavía no tienes ninguna de este oficio. Una ficha con
                      fotos se mira mucho más que una sin ellas.
                    </Text>
                  )}
                </View>
              )
            })}
          </InfoCard>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
