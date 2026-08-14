/**
 * ScreenShell Template
 * Envoltorio de pantalla con header, scroll y estados loading/empty/error
 *
 * Según README: "estados obligatorios en cada lista: cargando, vacío honesto, error"
 */

import { ReactNode } from 'react'
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/atoms/Button'
import { Skeleton } from '@/components/atoms/Skeleton'
import { styles } from './ScreenShell.styles'

export interface ScreenShellProps {
  children: ReactNode
  title?: string
  onBack?: () => void
  loading?: boolean
  error?: string
  empty?: {
    message: string
    action?: {
      label: string
      onPress: () => void
    }
  }
  scrollable?: boolean
  testID?: string
}

export function ScreenShell({
  children,
  title,
  onBack,
  loading = false,
  error,
  empty,
  scrollable = true,
  testID,
}: ScreenShellProps) {
  const renderHeader = () => {
    if (!title && !onBack) return null

    return (
      <View style={styles.header}>
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton} testID="back-button">
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        )}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
    )
  }

  const renderLoading = () => (
    <View style={styles.stateContainer} testID="loading-state">
      <ActivityIndicator size="large" color="#5980a6" />
      <Skeleton width="80%" height={20} style={styles.skeletonSpacer} />
      <Skeleton width="60%" height={20} />
    </View>
  )

  const renderError = () => (
    <View style={styles.stateContainer} testID="error-state">
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Algo salió mal</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      {onBack && (
        <Button variant="secondary" onPress={onBack} style={styles.retryButton}>
          Volver a intentar
        </Button>
      )}
    </View>
  )

  const renderEmpty = () => {
    if (!empty) return null

    return (
      <View style={styles.stateContainer} testID="empty-state">
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyMessage}>{empty.message}</Text>
        {empty.action && (
          <Button onPress={empty.action.onPress} style={styles.emptyButton}>
            {empty.action.label}
          </Button>
        )}
      </View>
    )
  }

  const renderContent = () => {
    if (loading) return renderLoading()
    if (error) return renderError()
    if (empty) return renderEmpty()
    return children
  }

  const Content = scrollable ? ScrollView : View

  return (
    <SafeAreaView style={styles.safeArea} testID={testID}>
      <View style={styles.container}>
        {renderHeader()}
        <Content
          style={styles.content}
          contentContainerStyle={scrollable ? styles.scrollContent : undefined}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </Content>
      </View>
    </SafeAreaView>
  )
}
