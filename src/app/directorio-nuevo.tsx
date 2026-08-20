/**
 * Directorio nuevo: /directorio-nuevo — **PANTALLA DE PRUEBA**, 20 Agosto 2026.
 *
 * Es el mismo directorio de la pestaña Profesionales con el aspecto propuesto,
 * puesto en una ruta aparte para poder abrir las dos seguidas y compararlas.
 *
 * Se entra desde Mi cuenta, en "Probar el aspecto nuevo". Cuando se decida:
 * si se adopta, `DirectoryFeedPage` sustituye a `DirectoryPage` y esta ruta
 * desaparece; si no, se borran esta ruta, la página, `ProFeedCard`, el enlace
 * de Mi cuenta y `src/theme/feed.ts`, y no queda nada suelto.
 */

import { useRouter } from 'expo-router'
import { DirectoryFeedPage } from '@/pages/DirectoryFeedPage'

export default function DirectoryFeedRoute() {
  const router = useRouter()

  return (
    <DirectoryFeedPage
      onSelectPro={(id) =>
        router.navigate({ pathname: '/pro/[id]', params: { id } })
      }
      onBack={() => router.navigate('/account')}
    />
  )
}
