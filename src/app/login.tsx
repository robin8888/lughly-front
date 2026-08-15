/**
 * Ruta /login
 * Solo conecta la navegación; la UI y la lógica viven en LoginPage + useLogin.
 */

import { useRouter } from 'expo-router'
import { LoginPage } from '@/pages/LoginPage'

export default function LoginRoute() {
  const router = useRouter()

  return (
    <LoginPage
      // El trabajador que entra con la contraseña temporal de su empleador
      // va directo a cambiarla; el resto, a su inicio.
      onSuccess={(user) =>
        router.replace(user.mustChangePassword ? '/cambiar-contrasena' : '/inicio')
      }
      onRegister={() => router.replace('/registro')}
      onForgotPassword={() => router.push('/recuperar')}
    />
  )
}
