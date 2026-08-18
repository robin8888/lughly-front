/**
 * Mis documentos: /mis-documentos
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, o desde el aviso que sale
 * al toparse con una puerta cerrada por falta de documento.
 *
 * Sin `RoleGate`: el documento de identidad se le pide igual al cliente que al
 * profesional, porque las dos partes se comprometen.
 */

import { useRouter } from 'expo-router'
import { MyDocumentsPage } from '@/pages/MyDocumentsPage'

export default function MyDocumentsRoute() {
  const router = useRouter()

  return <MyDocumentsPage onBack={() => router.navigate('/account')} />
}
