/**
 * ThreadDetailPage
 * Una conversación: la de un encargo, o la propia con administración.
 *
 * Las dos formas comparten toda la pantalla —burbujas, adjunto, composición—
 * y solo cambian en qué hook lee y manda los mensajes (`mode`). Repetir la
 * pantalla entera por un cambio de endpoint habría dejado dos sitios donde
 * arreglar el mismo fallo.
 *
 * Sin WebSocket: sondea cada pocos segundos mientras está abierta (ver
 * `useChat`). No hay paginación —el backend devuelve el hilo entero— porque
 * una conversación de un encargo no llega a los cientos de mensajes.
 */

import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/atoms/Avatar'
import { Icon } from '@/components/atoms/Icon'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import {
  useJobMessages,
  useSendJobMessage,
  useSendSupportMessage,
  useSupportMessages,
  useUploadChatAttachment,
} from '@/hooks/domain/useChat'
import { usePickImage } from '@/hooks/media/usePickImage'
import { usePickDocument } from '@/hooks/media/usePickDocument'
import { API_BASE_URL, type UploadFile } from '@/api'
import type { ApiMessage } from '@/api/chat.api'
import { useUser } from '@/stores/useAuthStore'
import { formatMessageTime } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './ThreadDetailPage.styles'

export interface ThreadDetailPageProps {
  mode: 'job' | 'support'
  /** Obligatorio en modo `job` */
  jobId?: string
  /** El título del encargo; "Soporte" en modo `support` */
  title: string
  otherName: string
  otherAvatarUrl: string | null
  onBack: () => void
}

/** Lo que se está escribiendo, hasta que se envía */
interface PendingAttachment {
  key: string
  kind: 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  /** El fichero local, para enseñarlo antes de que exista en el servidor */
  previewUri: string
}

const ATTACHMENT_LABEL: Record<PendingAttachment['kind'], string> = {
  IMAGE: 'Foto',
  VIDEO: 'Vídeo',
  DOCUMENT: 'Documento',
}

export function ThreadDetailPage({
  mode,
  jobId,
  title,
  otherName,
  otherAvatarUrl,
  onBack,
}: ThreadDetailPageProps) {
  const insets = useSafeAreaInsets()
  const user = useUser()
  const scrollRef = useRef<ScrollView>(null)

  const jobMessages = useJobMessages(mode === 'job' ? jobId : undefined, mode === 'job')
  const supportMessages = useSupportMessages(mode === 'support')
  const { data, isPending, isError, refetch } =
    mode === 'job' ? jobMessages : supportMessages

  const sendJob = useSendJobMessage(jobId)
  const sendSupport = useSendSupportMessage()
  const { send, isSending } = mode === 'job' ? sendJob : sendSupport

  const { upload, isUploading } = useUploadChatAttachment()
  const { pick } = usePickImage()
  const { pick: pickDocument, isAvailable: canPickDocument } = usePickDocument()

  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null)
  const [viewerUri, setViewerUri] = useState<string | null>(null)

  const messages = data ?? []
  const canSend = (text.trim().length > 0 || attachment !== null) && !isSending

  const chooseAttachment = () => {
    Alert.alert('Adjuntar', undefined, [
      { text: 'Hacer una foto', onPress: () => void attachImage('camera') },
      { text: 'Elegir de la galería', onPress: () => void attachImage('library') },
      /**
       * Solo si el binario trae el módulo nativo. Ofrecerla igual y fallar al
       * tocarla sería peor que no ofrecerla: parece un botón roto en vez de
       * una opción que todavía no está.
       */
      ...(canPickDocument
        ? [{ text: 'Elegir un documento (PDF)', onPress: () => void attachDocument() }]
        : []),
      { text: 'Cancelar', style: 'cancel' as const },
    ])
  }

  const uploadAndAttach = async (file: UploadFile) => {
    const { ok, result, error } = await upload(file)
    if (!ok || !result) {
      Alert.alert('No se ha podido adjuntar', error ?? 'Inténtalo de nuevo.')
      return
    }

    setAttachment({ key: result.key, kind: result.kind, previewUri: file.uri })
  }

  const attachImage = async (source: 'camera' | 'library') => {
    const image = await pick(source)
    if (!image) return
    await uploadAndAttach(image)
  }

  const attachDocument = async () => {
    const doc = await pickDocument()
    if (!doc) return
    await uploadAndAttach(doc)
  }

  const submit = async () => {
    if (!canSend) return

    const body = text.trim()
    const { ok, error } = await send({
      body: body.length > 0 ? body : undefined,
      attachmentKey: attachment?.key,
      attachmentKind: attachment?.kind,
    })

    if (!ok) {
      Alert.alert('No se ha podido enviar', error ?? 'Inténtalo de nuevo en un momento.')
      return
    }

    setText('')
    setAttachment(null)
  }

  // Al abrir, y con cada mensaje nuevo, la conversación se queda al final
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false })
  }, [messages.length])

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Avatar
        uri={otherAvatarUrl ? `${API_BASE_URL}${otherAvatarUrl}` : null}
        size={36}
      />
      <View style={styles.headerText}>
        <Text style={styles.otherName} numberOfLines={1}>
          {otherName}
        </Text>
        {mode === 'job' && (
          <Text style={styles.jobTitle} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="thread-detail-page"
    >
      {header}

      {isPending ? (
        <View style={styles.state} testID="thread-detail-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : isError ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>No hemos podido cargar la conversación.</Text>
          <Pressable onPress={() => void refetch()} testID="thread-detail-retry">
            <Text style={styles.retry}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <Text style={styles.empty}>
              {mode === 'job'
                ? 'Todavía no os habéis escrito. Empieza tú.'
                : 'Escríbenos y te contestaremos lo antes posible.'}
            </Text>
          ) : (
            messages.map((message) => (
              <Bubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
                onOpenImage={(url) => setViewerUri(url)}
              />
            ))
          )}
        </ScrollView>
      )}

      {attachment && (
        <View style={styles.pendingAttachment} testID="thread-detail-pending-attachment">
          {attachment.kind === 'IMAGE' ? (
            <Avatar uri={attachment.previewUri} size={40} />
          ) : (
            <View style={styles.pendingAttachmentIcon}>
              <Icon name="paperclip" size={18} color={theme.colors.accent700} />
            </View>
          )}
          <Text style={styles.pendingAttachmentLabel}>
            {ATTACHMENT_LABEL[attachment.kind]}
          </Text>
          <Pressable
            onPress={() => setAttachment(null)}
            accessibilityRole="button"
            accessibilityLabel="Quitar adjunto"
            style={styles.pendingAttachmentRemove}
            testID="thread-detail-remove-attachment"
          >
            <Text style={styles.pendingAttachmentRemoveText}>✕</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.composer, { paddingBottom: 10 + insets.bottom }]}>
        <Pressable
          onPress={chooseAttachment}
          disabled={isUploading}
          style={styles.composerButton}
          accessibilityRole="button"
          accessibilityLabel="Adjuntar"
          testID="thread-detail-attach"
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={theme.colors.accent700} />
          ) : (
            <Icon name="paperclip" size={20} color={theme.colors.accent700} />
          )}
        </Pressable>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje…"
          placeholderTextColor="rgba(29, 31, 32, 0.5)"
          style={styles.input}
          multiline
          cursorColor={theme.colors.accent}
          testID="thread-detail-input"
        />

        <Pressable
          onPress={() => void submit()}
          disabled={!canSend}
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          testID="thread-detail-send"
        >
          <Icon name="send" size={18} color="#ffffff" />
        </Pressable>
      </View>

      <PhotoViewer
        photos={viewerUri ? [viewerUri] : []}
        openAt={viewerUri ? 0 : null}
        onClose={() => setViewerUri(null)}
        testID="thread-detail-photo-viewer"
      />
    </KeyboardAvoidingView>
  )
}

function Bubble({
  message,
  isOwn,
  onOpenImage,
}: {
  message: ApiMessage
  isOwn: boolean
  onOpenImage: (url: string) => void
}) {
  const attachmentUrl = message.attachment ? `${API_BASE_URL}${message.attachment.url}` : null

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {attachmentUrl && message.attachment?.kind === 'IMAGE' && (
          <Pressable
            onPress={() => onOpenImage(attachmentUrl)}
            accessibilityRole="button"
            accessibilityLabel="Ver foto"
            testID={`thread-detail-attachment-${message.id}`}
          >
            <RemotePhoto uri={attachmentUrl} style={styles.attachmentImage} />
          </Pressable>
        )}

        {attachmentUrl && message.attachment?.kind !== 'IMAGE' && (
          <View style={styles.attachmentChip}>
            <Icon
              name="paperclip"
              size={16}
              color={isOwn ? '#ffffff' : theme.colors.accent700}
            />
            <Text style={[styles.attachmentChipText, isOwn && styles.attachmentChipTextOwn]}>
              {message.attachment?.kind === 'VIDEO' ? 'Vídeo' : 'Documento'}
            </Text>
          </View>
        )}

        {message.body && (
          <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
            {message.body}
          </Text>
        )}

        <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
          {formatMessageTime(new Date(message.createdAt))}
        </Text>
      </View>
    </View>
  )
}
