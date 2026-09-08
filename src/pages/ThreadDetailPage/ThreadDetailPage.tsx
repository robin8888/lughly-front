/**
 * ThreadDetailPage
 * Una conversación: la que se tiene con una persona, o la propia con
 * administración.
 *
 * Las dos formas comparten toda la pantalla —burbujas, adjunto, composición—
 * y solo cambian en qué hook lee y manda los mensajes (`mode`). Repetir la
 * pantalla entera por un cambio de endpoint habría dejado dos sitios donde
 * arreglar el mismo fallo.
 *
 * **Es la conversación con la persona, no la de un encargo** (Robin, 8 Sep
 * 2026): aquí está todo lo que os habéis escrito, del primer trabajo al
 * último, seguido y sin separaciones. De qué trabajo hablabais en cada momento
 * lo dice lo que os dijisteis.
 *
 * Y se puede quedar **de solo lectura**: cuando el último trabajo en común
 * está terminado **y cobrado**, el servidor deja de admitir mensajes
 * (`canWrite`) y en el sitio del campo de escribir se explica por qué. Que la
 * raya esté en el cobro y no en terminar es de Robin: entre una cosa y otra
 * hay una retención que liberar, y ahí es donde hacen falta los dos. Se lee
 * entera igual: lo que se acordó, la foto que mandó, el precio que dijo.
 *
 * Sin WebSocket: sondea cada pocos segundos mientras está abierta (ver
 * `useChat`). No hay paginación —el backend devuelve el hilo entero— porque
 * una conversación entre dos personas no llega a los cientos de mensajes.
 */

import { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
/*
  El de la librería y no el de React Native: el de React Native necesita que la
  ventana se encoja al abrirse el teclado, y en Android eso dejó de pasar desde
  que la app dibuja de borde a borde. Aquí se nota más que en ningún sitio: sin
  él, el campo de escribir se queda debajo del teclado.
*/
import { KeyboardAvoidingView } from '@/components/templates/FormScrollView/keyboardController'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Avatar } from '@/components/atoms/Avatar'
import { Icon } from '@/components/atoms/Icon'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import {
  useConversation,
  useMarkThreadRead,
  useSendMessage,
  useSendSupportMessage,
  useSupportMessages,
  useUploadChatAttachment,
} from '@/hooks/domain/useChat'
import { usePickImage } from '@/hooks/media/usePickImage'
import { usePickDocument } from '@/hooks/media/usePickDocument'
import { useOpenAttachment } from '@/hooks/media/useOpenAttachment'
import { API_BASE_URL, type UploadFile } from '@/api'
import type { ApiMessage } from '@/api/chat.api'
import { useUser } from '@/stores/useAuthStore'
import { formatDaySeparator, formatTime, toIsoDate } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './ThreadDetailPage.styles'

export interface ThreadDetailPageProps {
  mode: 'direct' | 'support'
  /** Obligatorio en modo `direct`: con quién se habla */
  otherUserId?: string
  /**
   * Su nombre y su foto, para pintar la cabecera desde el primer fotograma.
   * Viajan como parámetro porque quien abre la pantalla siempre los sabe —la
   * bandeja y la ficha del trabajo—, y esperar a la respuesta del servidor
   * dejaría la cabecera en blanco un segundo.
   */
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
  /** Con el que se eligió en el aparato ("contrato.pdf"), para enseñarlo */
  name: string
}

const ATTACHMENT_LABEL: Record<PendingAttachment['kind'], string> = {
  IMAGE: 'Foto',
  VIDEO: 'Vídeo',
  DOCUMENT: 'Documento',
}

export function ThreadDetailPage({
  mode,
  otherUserId,
  otherName,
  otherAvatarUrl,
  onBack,
}: ThreadDetailPageProps) {
  const insets = useSafeAreaInsets()
  const user = useUser()
  const scrollRef = useRef<ScrollView>(null)

  const conversation = useConversation(
    mode === 'direct' ? otherUserId : undefined,
    mode === 'direct',
  )
  const supportMessages = useSupportMessages(mode === 'support')
  const { isPending, isError, refetch } =
    mode === 'direct' ? conversation : supportMessages

  const sendDirect = useSendMessage(otherUserId)
  const sendSupport = useSendSupportMessage()
  const { send, isSending } = mode === 'direct' ? sendDirect : sendSupport

  const { markRead } = useMarkThreadRead()

  const { upload, isUploading } = useUploadChatAttachment()
  const { pick } = usePickImage()
  const { pick: pickDocument, isAvailable: canPickDocument } = usePickDocument()
  const { open: openAttachment, isOpening } = useOpenAttachment()

  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null)
  const [viewerUri, setViewerUri] = useState<string | null>(null)

  const messages =
    (mode === 'direct' ? conversation.data?.messages : supportMessages.data) ?? []

  /*
    A soporte siempre se le puede escribir: no depende de ningún trabajo. En
    una conversación con otra persona lo dice el servidor, y mientras se está
    cargando se da por bueno —enseñar el campo y quitarlo medio segundo
    después se lee como un fallo—.
  */
  const canWrite = mode === 'support' || (conversation.data?.canWrite ?? true)

  const canSend =
    canWrite && (text.trim().length > 0 || attachment !== null) && !isSending

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

    setAttachment({ key: result.key, kind: result.kind, previewUri: file.uri, name: file.name })
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
      attachmentName: attachment?.name,
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

  /**
   * Y se da por leído lo que hay hasta aquí.
   *
   * Depende de cuántos mensajes hay, no solo de abrir la pantalla: la
   * conversación se sondea cada cinco segundos, así que si llega uno con la
   * pantalla delante hay que volver a marcar. Sin eso, el contador subiría
   * delante de quien está leyendo justo ese mensaje.
   *
   * Con la lista vacía no se llama: no hay hilo todavía —nace con el primer
   * mensaje— y no hay nada que marcar.
   */
  useEffect(() => {
    if (messages.length === 0) return

    if (mode === 'support') markRead({ support: true })
    else if (otherUserId) markRead({ otherUserId })
    // `markRead` es estable; incluirlo aquí volvería a marcar en cada pintado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, mode, otherUserId])

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
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
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior="padding"
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
              {mode === 'direct'
                ? 'Todavía no os habéis escrito. Empieza tú.'
                : 'Escríbenos y te contestaremos lo antes posible.'}
            </Text>
          ) : (
            withDaySeparators(messages).map((item) =>
              item.type === 'separator' ? (
                <DaySeparator key={item.key} label={item.label} />
              ) : (
                <Bubble
                  key={item.key}
                  message={item.message}
                  isOwn={item.message.senderId === user?.id}
                  onOpenImage={(url) => setViewerUri(url)}
                  onOpenFile={(url, name) => void openAttachment(url, name)}
                  isOpeningFile={isOpening}
                />
              ),
            )
          )}
        </ScrollView>
      )}

      {attachment && canWrite && (
        <View style={styles.pendingAttachment} testID="thread-detail-pending-attachment">
          {attachment.kind === 'IMAGE' ? (
            <Avatar uri={attachment.previewUri} size={40} />
          ) : (
            <View style={styles.pendingAttachmentIcon}>
              {/*
                El clip es el botón de adjuntar, no lo que se ha adjuntado:
                usarlo también aquí no distinguía un documento de un vídeo
                ni de nada. El de documento sí lo dice de un vistazo.
              */}
              <Icon
                name={attachment.kind === 'DOCUMENT' ? 'document' : 'paperclip'}
                size={18}
                color={theme.colors.accent700}
              />
            </View>
          )}
          <View style={styles.pendingAttachmentLabels}>
            <Text style={styles.pendingAttachmentLabel} numberOfLines={1}>
              {ATTACHMENT_LABEL[attachment.kind]}
            </Text>

            {/* El nombre de verdad, para documentos y vídeos — una foto ya se ve a sí misma */}
            {attachment.kind !== 'IMAGE' && (
              <Text style={styles.pendingAttachmentName} numberOfLines={1}>
                {attachment.name}
              </Text>
            )}
          </View>
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

      {!canWrite ? (
        /*
          El trabajo se acabó y el dinero ya llegó (`chat-open.ts` en el
          servidor). Se dice, y se dice cómo vuelve a abrirse: un campo de
          texto desactivado sin explicación se lee como una app rota, y
          esconder la pantalla entera perdería lo que ya está escrito.

          El texto no dice quién contrata a quién porque lo leen los dos
          lados: «si vuelve a contratarte» sobra en la mitad de las pantallas
          donde sale, y aquí no hay forma de saber cuál de las dos es.
        */
        <View
          style={[styles.closed, { paddingBottom: 14 + insets.bottom }]}
          testID="thread-detail-closed"
        >
          <Text style={styles.closedText}>
            El trabajo está terminado y cobrado, así que esta conversación está cerrada. Si
            volvéis a trabajar juntos, se abrirá otra vez aquí mismo.
          </Text>
        </View>
      ) : (
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
      )}

      <PhotoViewer
        photos={viewerUri ? [viewerUri] : []}
        openAt={viewerUri ? 0 : null}
        onClose={() => setViewerUri(null)}
        testID="thread-detail-photo-viewer"
      />
    </KeyboardAvoidingView>
  )
}

type ChatItem =
  | { type: 'separator'; key: string; label: string }
  | { type: 'message'; key: string; message: ApiMessage }

/**
 * Intercala una píldora de día ("Hoy", "Ayer"…) antes del primer mensaje de
 * cada día distinto — como en cualquier chat. Los mensajes llegan del más
 * antiguo al más nuevo, así que basta comparar cada uno con el día del
 * anterior.
 */
function withDaySeparators(messages: ApiMessage[]): ChatItem[] {
  const now = new Date()
  const items: ChatItem[] = []
  let lastDay: string | null = null

  for (const message of messages) {
    const date = new Date(message.createdAt)
    const day = toIsoDate(date)

    if (day !== lastDay) {
      items.push({ type: 'separator', key: `day-${day}`, label: formatDaySeparator(date, now) })
      lastDay = day
    }

    items.push({ type: 'message', key: message.id, message })
  }

  return items
}

function DaySeparator({ label }: { label: string }) {
  return (
    <View style={styles.daySeparator}>
      <View style={styles.daySeparatorPill}>
        <Text style={styles.daySeparatorText}>{label}</Text>
      </View>
    </View>
  )
}

/**
 * La coletilla de la burbuja, curva como en WhatsApp.
 *
 * El borde recto de la izquierda/derecha (según el lado) queda pegado al
 * borde de la burbuja y del mismo color, así que se leen como una sola
 * pieza; el borde curvo es el que se ve por fuera.
 */
function BubbleTail({ isOwn }: { isOwn: boolean }) {
  const color = isOwn ? theme.colors.accent : theme.colors.surfaceSoft
  const path = isOwn ? 'M0 0 C3 1.5 8 3 8 8 L0 8 Z' : 'M8 0 C5 1.5 0 3 0 8 L8 8 Z'

  return (
    <Svg
      width={8}
      height={8}
      viewBox="0 0 8 8"
      style={[styles.bubbleTail, isOwn ? styles.bubbleTailOwn : styles.bubbleTailOther]}
    >
      <Path d={path} fill={color} />
    </Svg>
  )
}

function Bubble({
  message,
  isOwn,
  onOpenImage,
  onOpenFile,
  isOpeningFile,
}: {
  message: ApiMessage
  isOwn: boolean
  onOpenImage: (url: string) => void
  onOpenFile: (url: string, fileName: string) => void
  isOpeningFile: boolean
}) {
  const attachmentUrl = message.attachment ? `${API_BASE_URL}${message.attachment.url}` : null
  /**
   * El nombre con el que se eligió en el aparato, si se guardó. En un
   * adjunto mandado antes de que existiera este campo, se cae al nombre
   * que pone el servidor —un UUID sin sentido, pero con la extensión
   * correcta, que es lo mínimo que necesita la hoja de compartir—.
   */
  const fileName = message.attachment?.name ?? attachmentUrl?.split('/').pop() ?? 'archivo'

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <BubbleTail isOwn={isOwn} />

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

        {/*
          Documento o vídeo: una tarjeta con su icono, no una fila de texto
          suelta. La fila de antes —un icono de 16px y una palabra— no se
          leía como una miniatura, y era lo que Robin pedía: algo que se
          note de un vistazo que es un fichero adjunto, igual que la foto
          se ve a sí misma.
        */}
        {attachmentUrl && message.attachment?.kind !== 'IMAGE' && (
          <Pressable
            onPress={() => onOpenFile(attachmentUrl, fileName)}
            disabled={isOpeningFile}
            style={[styles.attachmentDoc, isOwn ? styles.attachmentDocOwn : styles.attachmentDocOther]}
            accessibilityRole="button"
            accessibilityLabel={
              message.attachment?.kind === 'VIDEO' ? 'Abrir vídeo' : 'Abrir documento'
            }
            testID={`thread-detail-attachment-${message.id}`}
          >
            <View
              style={[
                styles.attachmentDocIcon,
                isOwn ? styles.attachmentDocIconOwn : styles.attachmentDocIconOther,
              ]}
            >
              {isOpeningFile ? (
                <ActivityIndicator
                  size="small"
                  color={isOwn ? '#ffffff' : theme.colors.accent700}
                />
              ) : (
                <Icon
                  name={message.attachment?.kind === 'DOCUMENT' ? 'document' : 'paperclip'}
                  size={20}
                  color={isOwn ? '#ffffff' : theme.colors.accent700}
                />
              )}
            </View>
            <View style={styles.attachmentDocLabels}>
              <Text
                style={[styles.attachmentDocText, isOwn && styles.attachmentDocTextOwn]}
                numberOfLines={1}
              >
                {message.attachment?.kind === 'VIDEO' ? 'Vídeo' : 'Documento'}
              </Text>

              {/* El nombre de verdad, si se guardó — no todo adjunto viejo lo tiene */}
              {message.attachment?.name && (
                <Text
                  style={[styles.attachmentDocName, isOwn && styles.attachmentDocNameOwn]}
                  numberOfLines={1}
                >
                  {message.attachment.name}
                </Text>
              )}
            </View>
          </Pressable>
        )}

        {message.body && (
          <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
            {message.body}
          </Text>
        )}

        <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
          {formatTime(new Date(message.createdAt))}
        </Text>
      </View>
    </View>
  )
}
