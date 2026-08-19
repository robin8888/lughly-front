/**
 * Mis datos: /mis-datos
 *
 * Fuera de las pestañas: se entra desde Mi cuenta. Aquí se cambian el nombre,
 * el teléfono y —si es profesional— la descripción, que son los datos del alta
 * que hasta ahora se quedaban como se escribieron el primer día.
 *
 * Sin `RoleGate`: el nombre y el teléfono los tienen los dos roles. La
 * descripción se enseña solo al profesional, que es de quien la lee el cliente.
 */

import { useRouter } from 'expo-router'
import { MyProfilePage } from '@/pages/MyProfilePage'

export default function MyProfileRoute() {
  const router = useRouter()

  return <MyProfilePage onBack={() => router.navigate('/account')} />
}
