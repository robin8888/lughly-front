/**
 * Mis documentos: /mis-documentos
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, o desde el aviso que sale
 * al toparse con una puerta cerrada por falta de documento.
 *
 * Solo profesional. Al cliente no se le pide documento de identidad: se
 * identifica con la tarjeta con la que paga, que ya ha verificado su banco, y
 * eso es una señal más fuerte que una foto de un DNI —además de no obligar a
 * custodiar imágenes de documentos de todos los clientes—.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { MyDocumentsPage } from '@/pages/MyDocumentsPage'

export default function MyDocumentsRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Los documentos son del profesional"
      message="Se piden a quien cobra y entra en casas ajenas. Como cliente no necesitas subir ninguno: para contratar basta con tu forma de pago."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'documents-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay documentos que subir."
      testID="documents-denied"
    >
      <MyDocumentsPage onBack={() => router.navigate('/account')} />
    </RoleGate>
  )
}
