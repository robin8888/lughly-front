/**
 * MessagesPage
 * "Mensajes" (ROADMAP.md Fase 11): mis hilos de encargo con conversación, más
 * mi hilo de soporte si lo tengo.
 *
 * Un hilo de encargo solo aparece aquí cuando ya tiene un primer mensaje —lo
 * dice el propio backend, `ListMyThreadsUseCase`—, así que no hay nada que
 * listar hasta que alguien escribe. Para empezar una conversación nueva con
 * quien tiene un trabajo se entra desde su ficha (`JobDetailPage`), que es
 * donde se sabe con quién se habla.
 *
 * "Contactar con soporte" es la excepción: siempre está a la vista, tenga o
 * no hilo todavía, porque si no hubiera manera de escribir a soporte por
 * primera vez.
 */

import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { Avatar } from '@/components/atoms/Avatar'
import { Icon } from '@/components/atoms/Icon'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useMyThreads } from '@/hooks/domain/useChat'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { API_BASE_URL } from '@/api'
import type { ApiThreadSummary } from '@/api/chat.api'
import { formatMessageTime } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './MessagesPage.styles'

export interface MessagesPageProps {
  onBack: () => void
  onOpenJobThread: (thread: ApiThreadSummary) => void
  onOpenSupport: () => void
}

export function MessagesPage({ onBack, onOpenJobThread, onOpenSupport }: MessagesPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const { data, isPending, isError, refetch } = useMyThreads()

  const threads = data ?? []

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>Mensajes</Text>
    </View>
  )

  return (
    <View style={styles.screen} testID="messages-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={onOpenSupport}
          style={styles.supportRow}
          accessibilityRole="button"
          testID="messages-support"
        >
          <View style={styles.supportIcon}>
            <Icon name="message" size={20} color={theme.colors.accent700} />
          </View>
          <View style={styles.supportText}>
            <Text style={styles.supportTitle}>Contactar con soporte</Text>
            <Text style={styles.supportHint}>Escríbenos si tienes algún problema</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {isPending ? (
          <View style={styles.state} testID="messages-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar tus mensajes"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              { label: 'Reintentar', onPress: () => void refetch(), testID: 'messages-retry' },
            ]}
            testID="messages-error"
          />
        ) : threads.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Aquí aparecerán tus conversaciones con quien contrate o te contrate a ti. Se abren
              desde la ficha de cada trabajo.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {threads.map((thread) => (
              <Pressable
                key={thread.id}
                onPress={() =>
                  thread.kind === 'JOB' ? onOpenJobThread(thread) : onOpenSupport()
                }
                style={styles.row}
                accessibilityRole="button"
                testID={`messages-thread-${thread.id}`}
              >
                <Avatar
                  uri={
                    thread.otherAvatarUrl ? `${API_BASE_URL}${thread.otherAvatarUrl}` : null
                  }
                  size={48}
                />

                <View style={styles.rowText}>
                  <View style={styles.rowHead}>
                    <Text style={styles.otherName} numberOfLines={1}>
                      {thread.otherName}
                    </Text>
                    {thread.lastMessageAt && (
                      <Text style={styles.time}>
                        {formatMessageTime(new Date(thread.lastMessageAt))}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {thread.title}
                  </Text>
                  {thread.lastMessage && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {thread.lastMessage}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  )
}
