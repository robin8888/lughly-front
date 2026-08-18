/**
 * La cabecera de las dos home.
 *
 * Perdió a propósito el botón principal, el titular, el párrafo y la etiqueta
 * de novedad: era discurso de captación en la pantalla de alguien que ya ha
 * entrado. Lo que quedó es quién eres y por dónde seguir. Como todo eso son
 * ausencias, se fijan aquí — una ausencia no se ve en una revisión de código
 * tan fácilmente como algo que sobra.
 */

import { StyleSheet, type ViewStyle } from 'react-native'
import { theme } from '@/theme'
import { render } from '@testing-library/react-native'
import { HeroCard } from './HeroCard'

const noop = () => {}

describe('HeroCard — lo que ya no lleva', () => {
  it.each(['client', 'pro'] as const)(
    'no tiene botón principal (%s)',
    (role) => {
      const { queryByTestId, getByTestId } = render(
        <HeroCard role={role} variant="light" onSecondary={noop} />
      )

      expect(queryByTestId('hero-primary')).toBeNull()
      expect(getByTestId('hero-secondary')).toBeTruthy()
    }
  )

  it.each(['client', 'pro'] as const)(
    'no anuncia las subastas inversas (%s)',
    (role) => {
      const { queryByText } = render(
        <HeroCard role={role} variant="light" onSecondary={noop} />
      )

      expect(queryByText(/Subastas inversas/)).toBeNull()
    }
  )

  it('no lleva el contorno azul que sí llevan las demás tarjetas', () => {
    /*
     * `InfoCard` lo pone por defecto para que cada tarjeta se despegue del
     * fondo. La cabecera no es una tarjeta dentro de la pantalla, es la
     * pantalla: con marco parecería un recuadro pegado arriba.
     */
    const { getByTestId } = render(
      <HeroCard role="client" variant="light" onSecondary={noop} testID="hero" />
    )

    const card = StyleSheet.flatten(
      getByTestId('hero').props.style as never
    ) as ViewStyle

    expect(card.borderWidth).toBeFalsy()
  })

  it('no repite el reclamo que ahora vive en "Cómo funciona"', () => {
    const { queryByText } = render(
      <HeroCard role="client" variant="light" onSecondary={noop} />
    )

    expect(queryByText(/Encuentra al profesional de confianza/)).toBeNull()
    expect(queryByText(/Encuentra tu próximo trabajo/)).toBeNull()
  })
})

describe('HeroCard — quién eres', () => {
  it.each(['client', 'pro'] as const)(
    'enseña foto y nombre en los dos roles (%s)',
    (role) => {
      const { getByTestId, getByText } = render(
        <HeroCard
          role={role}
          variant="light"
          userName="Robin"
          avatarUri="https://ejemplo.test/foto.jpg"
          onSecondary={noop}
        />
      )

      expect(getByTestId('hero-avatar')).toBeTruthy()
      expect(getByText('Robin')).toBeTruthy()
    }
  )

  it('sin foto sigue habiendo avatar, con su reserva', () => {
    // Un hueco vacío donde va la cara se lee como que algo ha fallado
    const { getByTestId } = render(
      <HeroCard role="pro" variant="light" userName="Robin" onSecondary={noop} />
    )

    expect(getByTestId('hero-avatar')).toBeTruthy()
  })

  it('dibuja el logotipo con etiqueta para el lector de pantalla', () => {
    // Al dejar de ser texto, sin etiqueta el nombre de la app desaparecería
    const { getByTestId } = render(
      <HeroCard role="client" variant="light" onSecondary={noop} />
    )

    expect(getByTestId('hero-brand').props.accessibilityLabel).toBe('Lughly')
  })
})

describe('HeroCard — ficha del profesional', () => {
  it('enseña su oficio y su ciudad bajo el nombre', () => {
    const { getByTestId } = render(
      <HeroCard
        role="pro"
        variant="light"
        userName="Robin"
        profile={{ tradeLabel: 'Fontanería', city: 'Valencia' }}
        onSecondary={noop}
      />
    )

    expect(getByTestId('hero-profile-identity').props.children).toBe(
      'Fontanería · Valencia'
    )
  })

  it('sin ciudad no deja el separador colgando', () => {
    const { getByTestId } = render(
      <HeroCard
        role="pro"
        variant="light"
        profile={{ tradeLabel: 'Fontanería', city: null }}
        onSecondary={noop}
      />
    )

    expect(getByTestId('hero-profile-identity').props.children).toBe('Fontanería')
  })

  it('enseña la valoración cuando le han puntuado', () => {
    const { getByTestId, getByText } = render(
      <HeroCard
        role="pro"
        variant="light"
        profile={{ rating: 4.6, reviewCount: 12 }}
        onSecondary={noop}
      />
    )

    expect(getByTestId('hero-profile-rating')).toBeTruthy()
    expect(getByText(/12 valoraciones/)).toBeTruthy()
  })

  it('no enseña estrellas si todavía no le han puntuado', () => {
    /*
     * Cinco huecos grises se leerían como un cero, y no es que le hayan
     * valorado mal: es que aún no le han valorado.
     */
    const { queryByTestId } = render(
      <HeroCard
        role="pro"
        variant="light"
        profile={{ rating: 0, reviewCount: 0 }}
        onSecondary={noop}
      />
    )

    expect(queryByTestId('hero-profile-rating')).toBeNull()
  })

  it('aguanta sin ficha mientras carga', () => {
    // Foto y nombre salen de la sesión; el resto llega con el perfil
    const { getByTestId, queryByTestId } = render(
      <HeroCard role="pro" variant="light" userName="Robin" onSecondary={noop} />
    )

    expect(getByTestId('hero-avatar')).toBeTruthy()
    expect(queryByTestId('hero-profile-identity')).toBeNull()
  })
})

describe('HeroCard — por dónde seguir (cliente)', () => {
  it('su botón lleva a Cómo funciona, no al directorio', () => {
    /*
     * El directorio ya está en la barra de abajo, en el buscador rápido y en
     * el carrusel. Cómo funciona no se alcanza desde ningún otro sitio.
     */
    const { getByTestId, queryByText } = render(
      <HeroCard role="client" variant="light" onSecondary={noop} />
    )

    expect(getByTestId('hero-secondary')).toBeTruthy()
    expect(queryByText('Ver profesionales')).toBeNull()
  })

  it('lo pinta relleno de azul, con contraste suficiente para el blanco', () => {
    /*
     * `accent700` y no `accent`: el blanco sobre el azul de marca da 4,15:1 y
     * este texto va a 14 px, por debajo del 4,5:1 que pide WCAG.
     */
    const { getByTestId } = render(
      <HeroCard role="client" variant="light" onSecondary={noop} />
    )

    const boton = StyleSheet.flatten(
      getByTestId('hero-secondary').props.style as never
    ) as ViewStyle

    expect(boton.backgroundColor).toBe(theme.colors.accent700)
    expect(boton.backgroundColor).not.toBe(theme.colors.accent)
  })

  it('el del profesional sigue hueco', () => {
    // Debajo no tiene nada que destaque más; sólido pesaría de más
    const { getByTestId } = render(
      <HeroCard role="pro" variant="light" onSecondary={noop} />
    )

    const boton = StyleSheet.flatten(
      getByTestId('hero-secondary').props.style as never
    ) as ViewStyle

    expect(boton.backgroundColor).toBe('transparent')
  })

  it('lleva el buscador de oficios y la salida de urgencia', () => {
    const { getByTestId } = render(
      <HeroCard
        role="client"
        variant="light"
        onSecondary={noop}
        onUrgent={noop}
        onSelectTrade={noop}
      />
    )

    expect(getByTestId('quick-search')).toBeTruthy()
    expect(getByTestId('hero-urgent')).toBeTruthy()
  })

  it('no le cuelga la ficha del profesional', () => {
    const { queryByTestId } = render(
      <HeroCard
        role="client"
        variant="light"
        userName="Robin"
        profile={{ tradeLabel: 'Fontanería', rating: 4.6, reviewCount: 12 }}
        onSecondary={noop}
      />
    )

    expect(queryByTestId('hero-profile-identity')).toBeNull()
    expect(queryByTestId('hero-profile-rating')).toBeNull()
  })

  it('al profesional no le pone ni buscador ni urgencia', () => {
    const { queryByTestId } = render(
      <HeroCard
        role="pro"
        variant="light"
        onSecondary={noop}
        onUrgent={noop}
        onSelectTrade={noop}
      />
    )

    expect(queryByTestId('quick-search')).toBeNull()
    expect(queryByTestId('hero-urgent')).toBeNull()
  })
})
