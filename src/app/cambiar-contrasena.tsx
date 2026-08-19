/**
 * Cambiar contraseña: /cambiar-contrasena
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, donde el formulario estaba
 * antes incrustado en medio de la lista de accesos.
 *
 * Sin `RoleGate`: la contraseña es de la cuenta, no del rol. La cambian igual
 * un cliente, un profesional y un administrador.
 */

import { useRouter } from 'expo-router'
import { ChangePasswordPage } from '@/pages/ChangePasswordPage'

export default function ChangePasswordRoute() {
  const router = useRouter()

  return <ChangePasswordPage onBack={() => router.navigate('/account')} />
}
