/**
 * Border radius tokens
 *
 * OJO: el tema industrial anula la escala para los componentes principales
 * (`_ds/.../styles.css`, línea 291):
 *
 *   .card, .btn, .input, .tag, .seg, .dialog { border-radius: 0; }
 *
 * Es lo que da el aire técnico del sistema, y además es lo que hace que las
 * marcas de registro de las esquinas tengan sentido: sobre una esquina
 * redondeada quedan flotando fuera del papel.
 *
 * **Los botones se salieron de esa regla el 18 Agosto 2026** y usan `card`:
 * el logotipo son letras gordas de esquinas redondas, y un botón en escuadra
 * al lado parecía de otro producto. Los demás —tarjetas, campos, etiquetas,
 * diálogos— siguen cuadrados, y con ellos las marcas de esquina siguen
 * teniendo sentido.
 *
 * Por eso el resto usa `none` y no `md` ni `card`. La escala se
 * mantiene entera porque el diseño móvil sí redondea algunas cajas con
 * estilos propios (los desplegables de sugerencias y el desglose de precio
 * van a 9 px en `MobileApp.dc.html`).
 */

export const radius = {
  /** Componentes que el tema industrial deja cuadrados */
  none: 0,
  sm: 2,
  md: 4,
  lg: 7,
  card: 14,
  pill: 999,
} as const

export type Radius = keyof typeof radius
