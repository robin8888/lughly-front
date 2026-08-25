/**
 * Icon Atom
 * Iconos de trazo (estilo lucide), no de relleno.
 *
 * Trazos tomados de BOTTOM_NAV_MOBILE.md §5. Se dibujan con react-native-svg
 * para que el grosor (1.8) y el color se controlen desde la propiedad, igual
 * que en el diseño web.
 */

import Svg, { Path, Circle, Rect } from 'react-native-svg'

export type IconName =
  | 'home'
  | 'users'
  | 'plus'
  | 'alert'
  | 'briefcase'
  | 'user-circle'
  | 'gavel'
  | 'calendar'
  | 'wallet'
  | 'search'
  // De aquí para abajo, los accesos de "Mi cuenta" (src/images/icons/*.svg)
  | 'profile'
  | 'trades'
  | 'photos'
  | 'clock'
  | 'map-pin'
  | 'vacation'
  | 'surcharge'
  | 'holidays'
  | 'clipboard-check'
  | 'team'
  | 'card-wallet'
  | 'message'
  | 'bar-chart'
  | 'document'
  | 'lock'
  | 'bell'
  | 'settings'
  | 'card'
  | 'logout'
  | 'publish'
  // Del chat (ROADMAP.md Fase 11)
  | 'send'
  | 'paperclip'
  | 'pencil'
  | 'heart'

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
  /** Solo lo usa 'heart': relleno sólido en vez de trazo, para el favorito ya marcado */
  filled?: boolean
  testID?: string
}

export function Icon({
  name,
  size = 21,
  color = '#ffffff',
  strokeWidth = 1.8,
  filled = false,
  testID,
}: IconProps) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" testID={testID}>
      {name === 'home' && (
        <>
          <Path d="m3 10 9-7 9 7" {...stroke} />
          <Path d="M5 9v11h14V9" {...stroke} />
        </>
      )}

      {name === 'users' && (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...stroke} />
          <Circle cx="9" cy="7" r="4" {...stroke} />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" {...stroke} />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...stroke} />
        </>
      )}

      {name === 'plus' && (
        <>
          <Path d="M12 5v14" {...stroke} />
          <Path d="M5 12h14" {...stroke} />
        </>
      )}

      {name === 'alert' && (
        <>
          <Path
            d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            {...stroke}
          />
          <Path d="M12 9v4" {...stroke} />
          <Path d="M12 17h.01" {...stroke} />
        </>
      )}

      {name === 'briefcase' && (
        <>
          <Rect x="2" y="7" width="20" height="14" rx="2" {...stroke} />
          <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" {...stroke} />
        </>
      )}

      {name === 'user-circle' && (
        <>
          <Circle cx="12" cy="12" r="10" {...stroke} />
          <Circle cx="12" cy="10" r="3" {...stroke} />
          <Path d="M7 20.66a8 8 0 0 1 10 0" {...stroke} />
        </>
      )}

      {name === 'gavel' && (
        <>
          <Path d="m14.5 12.5-8 8a2.12 2.12 0 1 1-3-3l8-8" {...stroke} />
          <Path d="m16 16 6-6" {...stroke} />
          <Path d="m8 8 6-6" {...stroke} />
          <Path d="m9 7 8 8" {...stroke} />
          <Path d="m21 11-8-8" {...stroke} />
        </>
      )}

      {name === 'calendar' && (
        <>
          <Rect x="3" y="4" width="18" height="18" rx="2" {...stroke} />
          <Path d="M16 2v4" {...stroke} />
          <Path d="M8 2v4" {...stroke} />
          <Path d="M3 10h18" {...stroke} />
        </>
      )}

      {name === 'wallet' && (
        <>
          <Path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" {...stroke} />
          <Path d="M17 13h.01" {...stroke} />
        </>
      )}

      {/* Lupa: la lente y el mango, en el mismo trazo que el resto */}
      {name === 'search' && (
        <>
          <Circle cx="11" cy="11" r="7" {...stroke} />
          <Path d="m20 20-3.6-3.6" {...stroke} />
        </>
      )}

      {name === 'profile' && (
        <>
          <Circle cx="12" cy="8" r="4" {...stroke} />
          <Path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" {...stroke} />
        </>
      )}

      {name === 'trades' && (
        <>
          <Path d="M15.5 4.5l4 4" {...stroke} />
          <Path d="M14 6l4 4" {...stroke} />
          <Path d="M5 19l6-6" {...stroke} />
          <Path d="M9 15l5-5" {...stroke} />
          <Circle cx="6" cy="18" r="1" {...stroke} />
        </>
      )}

      {name === 'photos' && (
        <>
          <Rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
          <Circle cx="8" cy="10" r="1.5" {...stroke} />
          <Path d="M4 17l5-5 4 4 3-3 4 4" {...stroke} />
        </>
      )}

      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M12 7v5l3 2" {...stroke} />
        </>
      )}

      {name === 'map-pin' && (
        <>
          <Path d="M12 21s-6-5-6-11a6 6 0 1112 0c0 6-6 11-6 11z" {...stroke} />
          <Circle cx="12" cy="10" r="2" {...stroke} />
        </>
      )}

      {name === 'vacation' && (
        <>
          <Rect x="3" y="5" width="18" height="16" rx="2" {...stroke} />
          <Path d="M8 3v4M16 3v4M3 10h18" {...stroke} />
          <Path d="M17 18v-5" {...stroke} />
          <Path d="M15.5 16h3" {...stroke} />
        </>
      )}

      {name === 'surcharge' && (
        <>
          <Path d="M12 3l9 9-9 9-9-9 9-9z" {...stroke} />
          <Path d="M12 8v8" {...stroke} />
          <Path d="M9 11h6" {...stroke} />
        </>
      )}

      {name === 'holidays' && (
        <>
          <Rect x="3" y="4" width="18" height="17" rx="2" {...stroke} />
          <Path d="M8 2v4M16 2v4M3 9h18" {...stroke} />
          <Circle cx="12" cy="15" r="2" {...stroke} />
        </>
      )}

      {name === 'clipboard-check' && (
        <>
          <Rect x="5" y="3" width="14" height="18" rx="2" {...stroke} />
          <Path d="M9 8h6M9 12h6M9 16h3" {...stroke} />
          <Path d="M15.5 16.5l1.5 1.5 3-3" {...stroke} />
        </>
      )}

      {name === 'team' && (
        <>
          <Circle cx="12" cy="8" r="3" {...stroke} />
          <Circle cx="6" cy="10" r="2" {...stroke} />
          <Circle cx="18" cy="10" r="2" {...stroke} />
          <Path d="M4 20c0-2.5 2-4 5-4" {...stroke} />
          <Path d="M15 16c3 0 5 1.5 5 4" {...stroke} />
          <Path d="M8 20c0-3 2-5 4-5s4 2 4 5" {...stroke} />
        </>
      )}

      {name === 'card-wallet' && (
        <>
          <Rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
          <Path d="M16 12h5" {...stroke} />
          <Circle cx="16" cy="12" r="0.8" fill={color} stroke="none" />
        </>
      )}

      {name === 'message' && (
        <Path
          d="M4 5h16a2 2 0 012 2v8a2 2 0 01-2 2H9l-5 4v-4H4a2 2 0 01-2-2V7a2 2 0 012-2z"
          {...stroke}
        />
      )}

      {name === 'bar-chart' && (
        <>
          <Path d="M5 19V9" {...stroke} />
          <Path d="M10 19V5" {...stroke} />
          <Path d="M15 19v-7" {...stroke} />
          <Path d="M20 19V3" {...stroke} />
        </>
      )}

      {name === 'document' && (
        <>
          <Path d="M7 3h7l5 5v13H7z" {...stroke} />
          <Path d="M14 3v5h5" {...stroke} />
          <Path d="M10 13h6M10 17h6" {...stroke} />
        </>
      )}

      {name === 'lock' && (
        <>
          <Rect x="5" y="11" width="14" height="10" rx="2" {...stroke} />
          <Path d="M8 11V8a4 4 0 118 0v3" {...stroke} />
          <Circle cx="12" cy="16" r="1" {...stroke} />
          <Path d="M12 17v2" {...stroke} />
        </>
      )}

      {name === 'bell' && (
        <>
          <Path d="M18 16V11a6 6 0 10-12 0v5L4 18h16z" {...stroke} />
          <Path d="M10 20a2 2 0 004 0" {...stroke} />
        </>
      )}

      {/*
        Sol y no rueda dentada (25 Agosto 2026). Origen:
        src/images/icons/configuracion.svg. El SVG trae `stroke="#416180"` y
        `stroke-width="2"` escritos; aquí no se copian, porque el color y el
        grosor llegan por propiedad y así el icono sigue al tema y al estado
        de la fila en vez de quedarse fijo.
      */}
      {name === 'settings' && (
        <>
          <Circle cx="12" cy="12" r="3" {...stroke} />
          <Circle cx="12" cy="12" r="7" {...stroke} />
          <Path d="M12 2.5v2" {...stroke} />
          <Path d="M12 19.5v2" {...stroke} />
          <Path d="M2.5 12h2" {...stroke} />
          <Path d="M19.5 12h2" {...stroke} />
          <Path d="M5.2 5.2l1.4 1.4" {...stroke} />
          <Path d="M17.4 17.4l1.4 1.4" {...stroke} />
          <Path d="M18.8 5.2l-1.4 1.4" {...stroke} />
          <Path d="M6.6 17.4l-1.4 1.4" {...stroke} />
        </>
      )}

      {name === 'card' && (
        <>
          <Rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
          <Path d="M3 10h18" {...stroke} />
          <Path d="M7 15h3" {...stroke} />
        </>
      )}

      {name === 'logout' && (
        <>
          <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" {...stroke} />
          <Path d="M16 17l5-5-5-5" {...stroke} />
          <Path d="M21 12H9" {...stroke} />
        </>
      )}

      {name === 'publish' && (
        <>
          <Rect x="4" y="4" width="16" height="16" rx="2" {...stroke} />
          <Path d="M12 8v8" {...stroke} />
          <Path d="M8 12h8" {...stroke} />
        </>
      )}

      {name === 'send' && (
        <Path d="m22 2-7 20-4-9-9-4Z" {...stroke} />
      )}

      {name === 'paperclip' && (
        <Path
          d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
          {...stroke}
        />
      )}

      {name === 'pencil' && (
        <>
          <Path
            d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .622.622l4.353-1.321a2 2 0 0 0 .83-.497z"
            {...stroke}
          />
          <Path d="m15 5 4 4" {...stroke} />
        </>
      )}

      {name === 'heart' && (
        <Path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          {...(filled ? { fill: color, stroke: 'none' } : stroke)}
        />
      )}
    </Svg>
  )
}
