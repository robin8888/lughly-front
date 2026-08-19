/**
 * Cambiar la contraseña por gusto: /contrasena
 *
 * **Ojo con no confundirla con `/cambiar-contrasena`**, que es otra cosa y ya
 * existía: aquella es el cambio *obligatorio* de quien entró con la contraseña
 * que le puso su empleador, y vive detrás de un guardián que solo la deja ver
 * mientras ese cambio siga pendiente.
 *
 * Esta es voluntaria: se entra desde Mi cuenta cuando a uno le apetece. Por eso
 * no puede compartir ruta con la otra —bajo aquel guardián, a un usuario normal
 * no se le abriría nunca—.
 *
 * Sin `RoleGate`: la contraseña es de la cuenta, no del rol. La cambian igual un
 * cliente, un profesional y un administrador.
 */

import { useRouter } from 'expo-router'
import { ChangePasswordPage } from '@/pages/ChangePasswordPage'

export default function ChangePasswordRoute() {
  const router = useRouter()

  return <ChangePasswordPage onBack={() => router.navigate('/account')} />
}
