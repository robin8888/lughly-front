/**
 * AdminDocumentsPage
 * La cola de revisión de documentos, para quien tiene rol de administrador.
 *
 * Es la pieza que hacía falta para que `identityVerifiedAt` se escriba alguna
 * vez. Sin ella, aceptar urgencias —construido, probado y con avisos push— no
 * lo pasaba nadie desde agosto.
 *
 * Se revisa de uno en uno y por el más antiguo, que es como llega la cola del
 * servidor: quien lleva más esperando es quien más lo necesita para trabajar.
 */

import { useState } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native'
import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { API_BASE_URL, ApiError, NetworkError } from '@/api'
import type { ApiPendingDocument } from '@/api/admin.api'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Input } from '@/components/atoms/Input'
import {
  usePendingDocuments,
  useReviewDocument,
} from '@/hooks/domain/useAdminDocuments'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatLongDateTime } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './AdminDocumentsPage.styles'

const TYPE_LABEL: Record<string, string> = {
  IDENTITY_FRONT: 'Identidad · cara frontal',
  IDENTITY_BACK: 'Identidad · cara trasera',
  PASSPORT: 'Pasaporte',
  PROFESSIONAL_LICENSE: 'Habilitación profesional',
}

export interface AdminDocumentsPageProps {
  onBack: () => void
  testID?: string
}

export function AdminDocumentsPage({ onBack, testID }: AdminDocumentsPageProps) {
  const onScroll = useNavScrollHandler()
  const { documents, isPending, isError, refetch } = usePendingDocuments()
  const { review, isReviewing } = useReviewDocument()

  /** Motivo del rechazo, por documento: se escribe en el que se está mirando */
  const [reasons, setReasons] = useState<Record<string, string>>({})

  /**
   * La imagen es privada y va con el token en la cabecera.
   *
   * No hay URL pública ni firmada: el endpoint comprueba en cada petición que
   * quien pide es el dueño o un administrador. `Image` admite cabeceras en su
   * `source`, así que no hace falta descargarla a mano.
   */
  const accessToken = useAuthStore((state) => state.accessToken)

  const sourceFor = (document: ApiPendingDocument) => ({
    uri: `${API_BASE_URL}/v1/me/documents/${document.id}/content`,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  const handleReview = async (document: ApiPendingDocument, approve: boolean) => {
    const reason = reasons[document.id]?.trim()

    if (!approve && (!reason || reason.length < 5)) {
      Alert.alert(
        'Falta el motivo',
        'Es lo único que va a leer esa persona en su pantalla. Sin él, volverá a subir la misma foto sin saber qué corregir.',
      )
      return
    }

    try {
      const result = await review({
        documentId: document.id,
        approve,
        ...(approve ? {} : { rejectionReason: reason }),
      })

      setReasons((current) => {
        const { [document.id]: _removed, ...rest } = current
        return rest
      })

      Alert.alert(
        approve ? 'Aprobado' : 'Rechazado',
        approve
          ? result.identityVerified
            ? `${document.owner.name} queda con la identidad verificada.`
            : `Aprobado. A ${document.owner.name} le falta todavía la otra cara para quedar verificado.`
          : `Se lo decimos a ${document.owner.name} con el motivo que has escrito.`,
      )
    } catch (error) {
      Alert.alert(
        'No se ha podido guardar',
        error instanceof ApiError || error instanceof NetworkError
          ? error.message
          : 'Revisa tu conexión e inténtalo de nuevo.',
      )
    }
  }

  return (
    <SafeAreaView style={styles.screen} testID={testID ?? 'admin-documents-page'}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          testID="admin-documents-back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Revisar documentos</Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {isPending ? (
          <View style={styles.state} testID="admin-documents-loading">
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido leer la cola"
            message="Los documentos siguen donde estaban; es esta pantalla la que no ha podido consultarlos."
            illustration="none"
            actions={[
              {
                label: 'Reintentar',
                onPress: () => void refetch(),
                testID: 'admin-documents-retry',
              },
            ]}
            testID="admin-documents-error"
          />
        ) : documents.length === 0 ? (
          <EmptyState
            title="No hay nada por revisar"
            message="Cuando alguien suba su documento, aparecerá aquí con su nombre al lado para poder cotejarlo."
            illustration="greeting"
            testID="admin-documents-empty"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {documents.length === 1
                ? '1 documento por revisar'
                : `${documents.length} documentos por revisar`}
            </Text>

            {documents.map((document) => (
              <InfoCard
                key={document.id}
                style={styles.card}
                testID={`admin-document-${document.id}`}
              >
                <Text style={styles.type}>
                  {TYPE_LABEL[document.type] ?? document.type}
                </Text>

                {/*
                  El nombre va junto a la imagen a propósito: revisar es cotejar
                  que lo que dice el documento es quien dice ser, y para eso hay
                  que tener las dos cosas a la vista sin cambiar de pantalla.
                */}
                <Text style={styles.owner}>{document.owner.name}</Text>
                <Text style={styles.meta}>
                  {document.owner.email}
                  {document.owner.identityDocumentKind
                    ? ` · dice aportar ${document.owner.identityDocumentKind}`
                    : ''}
                </Text>
                <Text style={styles.meta}>
                  Subido el {formatLongDateTime(new Date(document.createdAt))}
                </Text>

                {document.owner.verified && (
                  <Text style={styles.warning} testID="admin-document-was-verified">
                    Esta persona ya estaba verificada. Subir un documento nuevo le
                    retiró la verificación, así que rechazar esto la deja sin ella.
                  </Text>
                )}

                <Image
                  source={sourceFor(document)}
                  style={styles.preview}
                  resizeMode="contain"
                  accessibilityLabel={`Documento de ${document.owner.name}`}
                  testID={`admin-document-image-${document.id}`}
                />

                <Input
                  value={reasons[document.id] ?? ''}
                  onChangeText={(value) =>
                    setReasons((current) => ({ ...current, [document.id]: value }))
                  }
                  placeholder="Motivo, solo si lo rechazas"
                  multiline
                  style={styles.reason}
                  editable={!isReviewing}
                  testID={`admin-document-reason-${document.id}`}
                />

                <View style={styles.actions}>
                  <Button
                    fullWidth
                    onPress={() => void handleReview(document, true)}
                    disabled={isReviewing}
                    testID={`admin-document-approve-${document.id}`}
                  >
                    Aprobar
                  </Button>

                  <Button
                    variant="secondary"
                    fullWidth
                    onPress={() => void handleReview(document, false)}
                    disabled={isReviewing}
                    style={styles.reject}
                    textStyle={styles.rejectText}
                    testID={`admin-document-reject-${document.id}`}
                  >
                    Rechazar
                  </Button>
                </View>
              </InfoCard>
            ))}
          </>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
