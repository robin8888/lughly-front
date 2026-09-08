/**
 * Una conversación, y sobre todo **cuándo deja de admitir mensajes**.
 *
 * Es la regla que Robin pidió el 8 de septiembre de 2026 —el chat dura hasta
 * que el trabajador cobra, y se reanuda si le vuelven a contratar— y la parte
 * que más fácil se rompe sin que nadie lo note: el servidor la aplica igual,
 * así que un fallo aquí no deja escribir de más; deja un campo de texto que
 * falla al pulsar enviar, que se lee como una app rota.
 *
 * Cuándo se cierra exactamente lo decide el servidor y se prueba allí
 * (`chat-open.spec.ts`); aquí solo llega ya resuelto, en `canWrite`.
 *
 * Lo otro que se ata es que **cerrada no es escondida**: los mensajes de antes
 * se siguen leyendo. Perderlos sería perder lo que se acordó.
 */

import { render } from '@testing-library/react-native'
import type { ApiConversation } from '@/api/chat.api'
import { ThreadDetailPage } from './ThreadDetailPage'

/*
 * Los dobles van dentro de las factorías: `jest.mock` se eleva al principio
 * del fichero y una constante de aquí abajo aún no existiría. El prefijo
 * `mock` es lo único que jest deja leer de fuera, por lo mismo.
 */
let mockConversacion: ApiConversation | undefined

const MENSAJE = {
  id: 'm1',
  senderId: 'marta-1',
  body: 'Lo dejo cerrado, cualquier cosa me dices',
  attachment: null,
  createdAt: '2026-09-01T10:00:00.000Z',
}

jest.mock('@/hooks/domain/useChat', () => ({
  useConversation: () => ({
    data: mockConversacion,
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
  useSupportMessages: () => ({
    data: [],
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
  useSendMessage: () => ({ send: async () => ({ ok: true, error: null }), isSending: false }),
  useSendSupportMessage: () => ({
    send: async () => ({ ok: true, error: null }),
    isSending: false,
  }),
  useMarkThreadRead: () => ({ markRead: () => {} }),
  useUploadChatAttachment: () => ({ upload: async () => ({ ok: true }), isUploading: false }),
}))

jest.mock('@/hooks/media/usePickImage', () => ({ usePickImage: () => ({ pick: async () => null }) }))
jest.mock('@/hooks/media/usePickDocument', () => ({
  usePickDocument: () => ({ pick: async () => null, isAvailable: false }),
}))
jest.mock('@/hooks/media/useOpenAttachment', () => ({
  useOpenAttachment: () => ({ open: async () => {}, isOpening: false }),
}))

const pintar = (canWrite: boolean) => {
  mockConversacion = {
    otherUserId: 'marta-1',
    otherName: 'Marta',
    otherAvatarUrl: null,
    canWrite,
    messages: [MENSAJE],
  }

  return render(
    <ThreadDetailPage
      mode="direct"
      otherUserId="marta-1"
      otherName="Marta"
      otherAvatarUrl={null}
      onBack={() => {}}
    />,
  )
}

describe('ThreadDetailPage', () => {
  describe('mientras quede algo que hablar', () => {
    it('se puede escribir', () => {
      const { getByTestId, queryByTestId } = pintar(true)

      expect(getByTestId('thread-detail-input')).toBeTruthy()
      expect(queryByTestId('thread-detail-closed')).toBeNull()
    })
  })

  describe('cuando el trabajo está terminado y cobrado', () => {
    it('en vez del campo de escribir se explica por qué', () => {
      const { getByTestId, queryByTestId } = pintar(false)

      expect(queryByTestId('thread-detail-input')).toBeNull()
      expect(getByTestId('thread-detail-closed')).toBeTruthy()
    })

    /*
      Y se dice cómo vuelve a abrirse. Sin decir quién contrata a quién: el
      mismo texto lo leen el cliente y el profesional.
    */
    it('y se dice cómo vuelve a abrirse', () => {
      const { getByTestId } = pintar(false)

      expect(getByTestId('thread-detail-closed')).toHaveTextContent(
        /volvéis a trabajar juntos/,
      )
    })

    /* Cerrada no es escondida: lo que se dijo sigue estando */
    it('lo escrito antes se sigue leyendo', () => {
      const { getByText } = pintar(false)

      expect(getByText('Lo dejo cerrado, cualquier cosa me dices')).toBeTruthy()
    })
  })

  /**
   * La cabecera es la persona y nada más. Llevó el título del encargo hasta
   * que la conversación dejó de ser de un encargo: mantenerlo obligaría a
   * elegir uno de los varios que puede haber, y cualquiera de los dos sería
   * mentira la mitad del tiempo.
   */
  it('la cabecera lleva a la persona, no a un trabajo', () => {
    const { getByText } = pintar(true)

    expect(getByText('Marta')).toBeTruthy()
  })
})
