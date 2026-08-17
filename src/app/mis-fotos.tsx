/**
 * Mis fotos: /mis-fotos
 *
 * Fuera de las pestañas, como oficios y trabajadores: se entra desde Mi cuenta
 * y se toca al terminar un trabajo que merece la pena enseñar, no a diario.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { MyPhotosPage } from '@/pages/MyPhotosPage'

export default function MyPhotosRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Las fotos son del profesional"
      message="Aquí se enseña el trabajo hecho para que un cliente decida. Como cliente, lo que buscas es justo eso: verlo."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'photos-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente. Las fotos de trabajo aparecen al darse de alta como profesional."
      testID="photos-denied"
    >
      <MyPhotosPage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
