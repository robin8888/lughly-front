/**
 * AdminDisputesPage
 * La cola de revisiones, para quien tiene rol de administrador (`CICLOS` §C9).
 *
 * Es la mitad que hace que la revisión exista de verdad: el servidor sabe
 * abrirlas, escalarlas y resolverlas, pero **si nadie las mira, vencen** — y
 * vencer significa devolverle el dinero al cliente sin que nadie haya
 * estudiado el caso, que es un fallo nuestro y no de las partes.
 *
 * ## Por vencimiento, no por llegada
 *
 * La cola llega del servidor ordenada por la fecha en que se acaba el plazo. Lo
 * que importa no es cuál se abrió antes: es a cuál se le acaba el tiempo. Y las
 * vencidas salen marcadas, porque esas ya están costando dinero de alguien.
 *
 * ## Los tres finales, y el motivo obligatorio
 *
 * Pagar al profesional, devolver al cliente o rebajar el precio. No son tres
 * botones inventados: son los remedios que da la ley al incumplimiento
 * contractual, y la rebaja es la que evita tener que elegir entre dos
 * injusticias en el caso más común, que es «estaba casi bien».
 *
 * El motivo se escribe siempre y va dentro del aviso que reciben los dos. Una
 * decisión sobre el dinero de alguien sin una línea que la explique no se
 * sostiene delante de nadie, y el reglamento P2B (UE 2019/1150) obliga a
 * motivar lo que afecta a un profesional.
 */

import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, Text, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { API_BASE_URL } from '@/api'
import type { ApiDisputeQueueItem } from '@/api/admin.api'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { formatAmount } from '@/components/atoms/Money'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import { useDisputes, useResolveDispute } from '@/hooks/domain/useDisputes'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { styles } from './AdminDisputesPage.styles'

/** Cuántos días quedan, dicho como se dice: «quedan 3 días» o «venció ayer» */
function plazoDe(dueAt: string, overdue: boolean): string {
  const dias = Math.round((new Date(dueAt).getTime() - Date.now()) / 86_400_000)

  if (overdue) return 'Vencida: el dinero ya debería haber vuelto'
  if (dias <= 0) return 'Vence hoy'
  if (dias === 1) return 'Queda un día'

  return `Quedan ${dias} días`
}

function abiertaPor(item: ApiDisputeQueueItem): string {
  switch (item.openedBy) {
    case 'client':
      return `La pidió ${item.clientName}`
    case 'pro':
      return `La pidió ${item.proName ?? 'el profesional'}`
    default:
      return 'Se abrió sola: el reparo se quedó sin contestar en 72 h'
  }
}

function elMomento(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface AdminDisputesPageProps {
  onBack: () => void
}

export function AdminDisputesPage({ onBack }: AdminDisputesPageProps) {
  const onScroll = useNavScrollHandler()
  const { disputes, isPending, isError, refetch } = useDisputes()
  const { resolve, isResolving } = useResolveDispute()

  /**
   * Lo que se está escribiendo en cada ficha, por disputa.
   *
   * Por identificador y no una sola caja: la cola se recarga sola al resolver
   * una, y un estado compartido llevaría el texto escrito para un caso a la
   * ficha de otro. Eso, aquí, es firmar una decisión con el motivo de otra.
   */
  const [decisiones, setDecisiones] = useState<Record<string, string>>({})
  const [importes, setImportes] = useState<Record<string, string>>({})
  const [mirando, setMirando] = useState<{ fotos: string[]; index: number } | null>(null)

  const decidir = (
    item: ApiDisputeQueueItem,
    outcome: 'TO_PRO' | 'TO_CLIENT' | 'SPLIT',
  ) => {
    const decision = (decisiones[item.disputeId] ?? '').trim()

    if (decision.length < 20) {
      Alert.alert(
        'Falta el motivo',
        'Explica la decisión: es lo único que van a leer las dos partes, y hay que motivarla.',
      )
      return
    }

    const toClient =
      outcome === 'SPLIT'
        ? Number((importes[item.disputeId] ?? '').replace(',', '.'))
        : undefined

    if (outcome === 'SPLIT' && !(toClient! > 0 && toClient! <= item.retained)) {
      Alert.alert(
        'La cifra no cuadra',
        `Al repartir hay que decir cuánto vuelve al cliente, entre 0 y ${formatAmount(item.retained)} €.`,
      )
      return
    }

    void (async () => {
      const { ok, error, result } = await resolve({
        disputeId: item.disputeId,
        outcome,
        decision,
        toClient,
      })

      if (!ok) {
        Alert.alert('No se ha podido resolver', error ?? 'Inténtalo de nuevo en un momento.')
        return
      }

      Alert.alert(
        'Resuelta',
        result && result.refunded > 0
          ? `Se le devuelven ${formatAmount(result.refunded)} € al cliente. Se lo hemos dicho a los dos.`
          : 'Se le abona al profesional lo retenido. Se lo hemos dicho a los dos.',
      )
    })()
  }

  const header = (
    <View style={styles.header}>
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Revisiones</Text>
    </View>
  )

  if (isPending || isError) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']} testID="admin-disputes-page">
        {header}
        <EmptyState
          title={isPending ? 'Un momento' : 'No hemos podido cargar la cola'}
          message={
            isPending
              ? 'Estamos trayendo lo que hay por revisar.'
              : 'Puede ser la conexión. Inténtalo otra vez.'
          }
          actions={
            isPending
              ? []
              : [{ label: 'Reintentar', onPress: () => void refetch(), testID: 'admin-disputes-retry' }]
          }
          testID="admin-disputes-loading"
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']} testID="admin-disputes-page">
      {header}

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {disputes.length === 0 ? (
          <EmptyState
            title="No hay nada por revisar"
            message="Cuando un trabajo se atasque entre las dos partes, aparecerá aquí con su plazo."
            testID="admin-disputes-empty"
          />
        ) : (
          disputes.map((item) => (
            <InfoCard
              key={item.disputeId}
              style={styles.card}
              testID={`admin-dispute-${item.disputeId}`}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.deadline, item.overdue && styles.overdue]}>
                  {plazoDe(item.dueAt, item.overdue)}
                </Text>
              </View>

              <Text style={styles.parties}>
                {item.clientName} · {item.proName ?? 'sin profesional'}
              </Text>

              <Text style={styles.who}>{abiertaPor(item)}</Text>
              <Text style={styles.reason}>«{item.reason}»</Text>

              {item.holdReason && (
                <Text style={styles.hold}>Reparo del cliente: «{item.holdReason}»</Text>
              )}

              {/* Lo que hay en juego, desglosado: decidir pide una cifra */}
              <View style={styles.moneyRow}>
                <Text style={styles.moneyLabel}>Retenido</Text>
                <Text style={styles.money}>{formatAmount(item.retained)} €</Text>
              </View>
              {item.charges.map((charge, index) => (
                <View key={`${charge.kind}-${index}`} style={styles.moneyRow}>
                  <Text style={styles.moneyDetail}>{charge.kind}</Text>
                  <Text style={styles.moneyDetail}>{formatAmount(charge.amount)} €</Text>
                </View>
              ))}

              {/* El expediente: cada prueba con de quién es y de cuándo */}
              {(item.evidence.length > 0 || item.resultPhotos.length > 0) && (
                <View style={styles.strip}>
                  {item.resultPhotos.map((foto, index) => (
                    <Pressable
                      key={foto.url}
                      onPress={() =>
                        setMirando({
                          fotos: item.resultPhotos.map((f) => `${API_BASE_URL}${f.fullUrl}`),
                          index,
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Ver cómo dijo el profesional que quedó"
                      style={styles.thumb}
                      testID={`admin-dispute-${item.disputeId}-result-${index}`}
                    >
                      <RemotePhoto
                        uri={`${API_BASE_URL}${foto.url}`}
                        style={styles.thumbImage}
                        fallback="No carga"
                      />
                      <Text style={styles.stamp}>Resultado</Text>
                    </Pressable>
                  ))}

                  {item.evidence.map((prueba, index) => (
                    <Pressable
                      key={prueba.id}
                      onPress={() =>
                        setMirando({
                          fotos: item.evidence.map((p) => `${API_BASE_URL}${p.fullUrl}`),
                          index,
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Ver la prueba del ${elMomento(prueba.createdAt)}`}
                      style={styles.thumb}
                      testID={`admin-dispute-${item.disputeId}-evidence-${index}`}
                    >
                      <RemotePhoto
                        uri={`${API_BASE_URL}${prueba.url}`}
                        style={styles.thumbImage}
                        fallback="No carga"
                      />
                      <Text style={styles.stamp}>
                        {prueba.side === 'CLIENT' ? 'Cliente' : 'Profesional'}
                      </Text>
                      <Text style={styles.stampDate}>{elMomento(prueba.createdAt)}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={styles.decideTitle}>La decisión</Text>
              <Text style={styles.decideHint}>
                Se la mandamos a los dos tal cual la escribas. Decide sobre el
                dinero retenido, no sobre quién tiene razón.
              </Text>

              <Input
                value={decisiones[item.disputeId] ?? ''}
                onChangeText={(texto) =>
                  setDecisiones((antes) => ({ ...antes, [item.disputeId]: texto }))
                }
                placeholder="Ej. Las fotos del cliente son del día siguiente y enseñan la misma fuga."
                multiline
                numberOfLines={3}
                editable={!isResolving}
                testID={`admin-dispute-${item.disputeId}-decision`}
              />

              <Button
                fullWidth
                onPress={() => decidir(item, 'TO_PRO')}
                disabled={isResolving}
                style={styles.action}
                testID={`admin-dispute-${item.disputeId}-to-pro`}
              >
                Pagarle al profesional
              </Button>

              <Button
                fullWidth
                variant="secondary"
                onPress={() => decidir(item, 'TO_CLIENT')}
                disabled={isResolving}
                style={styles.action}
                testID={`admin-dispute-${item.disputeId}-to-client`}
              >
                Devolvérselo al cliente
              </Button>

              {/*
                La rebaja: el caso más frecuente. Sin ella hay que elegir entre
                dos injusticias cada vez que el trabajo estaba a medias.
              */}
              <View style={styles.splitRow}>
                <View style={styles.splitInput}>
                  <Input
                    value={importes[item.disputeId] ?? ''}
                    onChangeText={(texto) =>
                      setImportes((antes) => ({ ...antes, [item.disputeId]: texto }))
                    }
                    placeholder="€ al cliente"
                    keyboardType="decimal-pad"
                    editable={!isResolving}
                    testID={`admin-dispute-${item.disputeId}-amount`}
                  />
                </View>
                <View style={styles.splitButton}>
                  <Button
                    fullWidth
                    variant="secondary"
                    onPress={() => decidir(item, 'SPLIT')}
                    disabled={isResolving}
                    testID={`admin-dispute-${item.disputeId}-split`}
                  >
                    Repartir
                  </Button>
                </View>
              </View>
            </InfoCard>
          ))
        )}
      </FormScrollView>

      <PhotoViewer
        photos={mirando?.fotos ?? []}
        openAt={mirando?.index ?? null}
        onClose={() => setMirando(null)}
        testID="admin-disputes-viewer"
      />
    </SafeAreaView>
  )
}
