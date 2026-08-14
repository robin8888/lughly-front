/**
 * Tab Profesionales (directorio).
 * Acepta `?trade=` para llegar ya filtrado desde la home.
 */

import { useLocalSearchParams, useRouter } from 'expo-router'
import { DirectoryPage } from '@/pages/DirectoryPage'

export default function ProsRoute() {
  const router = useRouter()
  const { trade } = useLocalSearchParams<{ trade?: string }>()

  return (
    <DirectoryPage
      initialTrade={trade}
      onSelectPro={(id) => router.navigate({ pathname: '/pro/[id]', params: { id } })}
      onBack={() => router.navigate('/inicio')}
    />
  )
}
