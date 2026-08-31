/**
 * Mi nivel: /mi-nivel
 *
 * Fuera de las pestañas: se entra desde Mi cuenta, al lado de la cartera. Va
 * con ella porque es lo mismo visto desde el otro lado — la cartera dice lo que
 * cobra, y esto lo que se le queda la plataforma por hacerlo.
 *
 * Solo profesional. Un cliente no paga comisión: paga el precio que ve, y la
 * comisión sale de lo que se le transfiere a quien trabaja.
 *
 * **A diferencia del horario o los recargos, esta pantalla no tiene versión de
 * empresa mirando a su trabajador**: el nivel es de quien cobra, y un trabajador
 * por cuenta ajena no cobra directo. A él la pantalla ya le explica que la
 * comisión es de la empresa que le dio de alta.
 */

import { useRouter } from 'expo-router'
import { RoleGate } from '@/components/organisms/RoleGate'
import { MyLevelPage } from '@/pages/MyLevelPage'

export default function LevelRoute() {
  const router = useRouter()

  return (
    <RoleGate
      allow="pro"
      title="Los niveles son del profesional"
      message="Cuanto más trabajo saca alguien por Lughly, menos comisión paga. Como cliente tú pagas el precio que ves; la comisión no sale de tu bolsillo."
      actions={[
        {
          label: 'Buscar profesionales',
          onPress: () => router.navigate({ pathname: '/pros', params: { trade: '' } }),
          testID: 'level-denied-directory',
        },
      ]}
      unavailableMessage="Tu cuenta es de cliente, así que no hay nivel que enseñar."
      testID="level-denied"
    >
      <MyLevelPage
        onBack={() => router.navigate('/account')}
        onOpenWallet={() => router.navigate('/wallet')}
      />
    </RoleGate>
  )
}
