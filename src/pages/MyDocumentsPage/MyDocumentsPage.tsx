/**
 * MyDocumentsPage
 * Subir o corregir el documento de identidad después del alta.
 *
 * **Esta pantalla se prometía en dos sitios y no existía.** El registro decía
 * "Podrás intentarlo desde tu perfil" cuando una subida fallaba, y el error de
 * urgencias del servidor mandaba a "Mi cuenta", donde solo había un texto
 * inerte. Quien se quedaba sin documentos —el alta está hecha para no tumbarse
 * si la subida falla— no tenía ninguna salida.
 *
 * Ahora hace falta de verdad: sin documento no se puede pujar. Un bloqueo sin
 * salida no es una regla, es una app rota.
 *
 * Las fotos se toman con el escáner de documentos del sistema, que encuadra,
 * recorta y endereza. **No impide fotografiar otra cosa**: lleva disparador
 * manual. La comprobación de que es un documento está pendiente y va en el
 * servidor, leyendo el contenido de la imagen ya recortada.
 */

import { useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { ApiError, NetworkError } from '@/api'
import type { DocumentType, IdentityKind } from '@/api/upload.api'
import { Button } from '@/components/atoms/Button'
import { FormField } from '@/components/molecules/FormField'
import { ImagePickerField } from '@/components/molecules/ImagePickerField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { useMyDocuments, useUploadDocument } from '@/hooks/domain/useMyDocuments'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useRefreshUser } from '@/hooks/auth/useRefreshUser'
import { theme } from '@/theme'
import { styles } from './MyDocumentsPage.styles'

const IDENTITY_OPTIONS = [
  { value: 'DNI', label: 'DNI (2 caras)' },
  { value: 'NIE', label: 'NIE (2 caras)' },
  { value: 'PASSPORT', label: 'Pasaporte (1 página)' },
]

export interface MyDocumentsPageProps {
  onBack: () => void
  testID?: string
}

export function MyDocumentsPage({ onBack, testID }: MyDocumentsPageProps) {
  const onScroll = useNavScrollHandler()
  const refreshUser = useRefreshUser()
  const { documents, hasIdentity, isPending, isError, refetch } = useMyDocuments()
  const { upload, isUploading } = useUploadDocument()

  const [identityKind, setIdentityKind] = useState<IdentityKind>('DNI')
  const [front, setFront] = useState<PickedImage | null>(null)
  const [back, setBack] = useState<PickedImage | null>(null)

  const isPassport = identityKind === 'PASSPORT'
  const pending = documents.filter((document) => document.status === 'PENDING')
  const rejected = documents.filter((document) => document.status === 'REJECTED')

  /**
   * Se sube cada cara por su lado, en serie y no en paralelo: si la segunda
   * falla, la primera ya está guardada y al volver solo le falta esa.
   */
  const handleSend = async () => {
    const jobs: { file: PickedImage; type: DocumentType }[] = []

    if (front) {
      jobs.push({ file: front, type: isPassport ? 'PASSPORT' : 'IDENTITY_FRONT' })
    }
    if (!isPassport && back) {
      jobs.push({ file: back, type: 'IDENTITY_BACK' })
    }

    if (jobs.length === 0) {
      Alert.alert('Falta el documento', 'Elige al menos una foto para subirla.')
      return
    }

    try {
      for (const job of jobs) {
        await upload({ file: job.file, type: job.type, identityKind })
      }

      setFront(null)
      setBack(null)

      /*
       * Subir un documento retira la verificación anterior en el servidor, así
       * que el usuario del store se queda desfasado si no se vuelve a leer.
       */
      await refreshUser()

      Alert.alert(
        'Documento recibido',
        'Ya puedes seguir. Lo revisaremos, y mientras tanto no te bloquea nada.',
      )
    } catch (error) {
      Alert.alert(
        'No se ha podido subir',
        error instanceof ApiError || error instanceof NetworkError
          ? error.message
          : 'Revisa tu conexión e inténtalo de nuevo.',
      )
    }
  }

  return (
    <SafeAreaView style={styles.screen} testID={testID ?? 'my-documents-page'}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          testID="documents-back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mis documentos</Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {isPending ? (
          <View style={styles.state} testID="documents-loading">
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <InfoCard style={styles.card} testID="documents-error">
            <Text style={styles.cardTitle}>
              No hemos podido leer tus documentos
            </Text>
            <Text style={styles.cardBody}>
              Los que ya subiste siguen guardados; es esta pantalla la que no ha
              podido consultarlos.
            </Text>
            <Button
              variant="secondary"
              onPress={() => void refetch()}
              style={styles.retry}
              testID="documents-retry"
            >
              Reintentar
            </Button>
          </InfoCard>
        ) : (
          <InfoCard style={styles.card} testID="documents-state">
            <Text style={styles.cardTitle}>
              {hasIdentity
                ? 'Documento aportado'
                : 'Te falta el documento de identidad'}
            </Text>
            <Text style={styles.cardBody}>
              {hasIdentity
                ? 'Con esto puedes pujar por los trabajos publicados.'
                : 'Sin él no se puede pujar. Escanéalo aquí abajo y podrás seguir al momento.'}
            </Text>

            {pending.length > 0 && (
              <Text style={styles.note} testID="documents-pending">
                {pending.length === 1
                  ? 'Tienes un documento pendiente de revisar. No te bloquea nada mientras tanto.'
                  : `Tienes ${pending.length} documentos pendientes de revisar. No te bloquean nada mientras tanto.`}
              </Text>
            )}

            {rejected.map((document) => (
              <Text
                key={document.id}
                style={styles.rejected}
                testID="documents-rejected"
              >
                Rechazado: {document.rejectionReason ?? 'vuelve a subirlo, por favor.'}
              </Text>
            ))}
          </InfoCard>
        )}

        <FormField
          label="Tipo de documento"
          helper="Solo se usa para verificar tu identidad. No se muestra en tu perfil ni lo ve ningún cliente."
          testID="documents-kind-field"
        >
          <Picker
            options={IDENTITY_OPTIONS}
            value={identityKind}
            onChange={(value) => setIdentityKind(value as IdentityKind)}
            title="Documento de identidad"
            disabled={isUploading}
            testID="documents-kind"
          />
        </FormField>

        <View style={styles.slots}>
          <View style={styles.slot}>
            <ImagePickerField
              value={front}
              onChange={setFront}
              placeholder={isPassport ? 'Página de datos' : 'Cara frontal'}
              disabled={isUploading}
              document
              testID="documents-front"
            />
          </View>

          {!isPassport && (
            <View style={styles.slot}>
              <ImagePickerField
                value={back}
                onChange={setBack}
                placeholder="Cara trasera"
                disabled={isUploading}
                document
              testID="documents-back"
              />
            </View>
          )}
        </View>

        {/*
          Subir otra vez sustituye al anterior del mismo tipo: es la forma de
          corregir una foto movida, y hay que decirlo para que nadie tema
          duplicar nada.
        */}
        <Text style={styles.hint}>
          El escáner recorta y endereza el documento por ti. Si ya subiste uno,
          volver a subirlo lo sustituye: sirve para corregir una foto movida o un
          documento caducado.
        </Text>

        <Button
          fullWidth
          onPress={() => void handleSend()}
          loading={isUploading}
          style={styles.send}
          testID="documents-send"
        >
          Subir documento
        </Button>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
