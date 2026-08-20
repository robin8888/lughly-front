/**
 * Mis datos: /mis-datos
 *
 * Fuera de las pestañas: se entra desde Mi cuenta. Aquí se cambian el nombre,
 * el teléfono y —si es profesional— la descripción, que son los datos del alta
 * que hasta ahora se quedaban como se escribieron el primer día.
 *
 * Sin `RoleGate`: el nombre y el teléfono los tienen los dos roles. La
 * descripción se enseña solo al profesional, que es de quien la lee el cliente.
 *
 * La de aquí es la general —quién es y cómo trabaja—. La de cada oficio vive
 * en Mis oficios, pegada a su precio, y por eso desde aquí se enlaza allí en
 * vez de repetir los mismos campos en dos pantallas.
 */

import { useRouter } from 'expo-router'
import { MyProfilePage } from '@/pages/MyProfilePage'

export default function MyProfileRoute() {
  const router = useRouter()

  return (
    <MyProfilePage
      onBack={() => router.navigate('/account')}
      /* La descripción de cada oficio vive allí, con su precio */
      onEditTrades={() => router.navigate('/oficios')}
    />
  )
}
