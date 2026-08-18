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

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
  testID?: string
}

export function Icon({
  name,
  size = 21,
  color = '#ffffff',
  strokeWidth = 1.8,
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
    </Svg>
  )
}
