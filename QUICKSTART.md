# 🚀 Quick Start - Continuar Desarrollo

Guía rápida para retomar el desarrollo de Lughly Mobile cualquier día.

---

## 📍 Dónde Estamos

✅ **Fase 1 COMPLETADA** (11 Agosto 2026)
- Andamiaje completo
- 10 átomos + ScreenShell + SplashPage
- Stores Auth + Role
- Seguridad M9 implementada

📍 **Siguiente**: Fase 2 - Autenticación (ver ROADMAP.md)

---

## ⚡ Iniciar Trabajo Hoy

### 1️⃣ Preparar Entorno

```bash
cd apps/mobile

# Instalar/actualizar dependencias
npm install

# Verificar que todo funciona
npm run type-check
npm test

# Iniciar Expo
npm start
```

### 2️⃣ Ver Qué Sigue

Abre `ROADMAP.md` y busca el día actual:

- **Día 1-7**: Fase 2 - Autenticación
- **Día 8-11**: Fase 3 - Directorio
- **Día 12-16**: Fase 4 - Publicar trabajos
- etc.

### 3️⃣ Implementar la Tarea del Día

Cada día del ROADMAP tiene:
- ✅ Objetivo claro
- 📋 Lista de tareas
- 📁 Archivos a crear
- ✓ Criterios de aceptación

---

## 📂 Estructura de Componentes

**SIEMPRE seguir este patrón**:

```
src/components/[atoms|molecules|organisms|templates]/NombreComponente/
├── NombreComponente.tsx        # Componente React
├── NombreComponente.styles.ts  # StyleSheet
├── NombreComponente.test.tsx   # Tests
└── index.ts                    # Export público
```

**Páginas** van en `src/pages/` con la misma estructura.

---

## 🎨 Reglas de Oro

### ❌ PROHIBIDO:
- Valores literales de colores/espaciado
- `any` en TypeScript
- Lógica de negocio en componentes
- AsyncStorage para tokens
- Secrets en código

### ✅ OBLIGATORIO:
- Todo desde `@/theme`
- TypeScript strict
- Lógica en hooks (dominio en `hooks/domain/`)
- Tokens en SecureStore

### 🧪 Sin tests en el front

Decisión del proyecto (14 Agosto 2026): **la app móvil no tiene tests**. Los
que había se eliminaron junto con jest y sus dependencias.

La verificación es:

```bash
npm run type-check   # única red de seguridad automática: úsalo siempre
```

…más comprobarlo en el móvil. Al tocar tipos compartidos (respuestas de la
API, stores), `type-check` es lo que avisa de lo que se ha roto.

El backend sí conserva sus tests de seguridad (`lughly-backend`, `npm test`):
allí un fallo cuesta dinero o filtra datos.

---

## 🔧 Comandos Frecuentes

```bash
# Desarrollo
npm start                    # Expo Dev Tools
npm run android             # Abrir en Android
npm run ios                 # Abrir en iOS

# Testing
npm test                    # Ejecutar todos los tests
npm run test:watch          # Tests en modo watch
npm run test:coverage       # Ver cobertura

# Calidad
npm run type-check          # TypeScript check
npm run lint                # ESLint (cuando esté configurado)

# Git
git status
git add .
git commit -m "Day X: descripción"
git push
```

---

## 📖 Crear un Nuevo Componente

### Ejemplo: Crear un Átomo "Badge"

```bash
# 1. Crear directorio
mkdir -p src/components/atoms/Badge

# 2. Crear archivos
touch src/components/atoms/Badge/Badge.tsx
touch src/components/atoms/Badge/Badge.styles.ts
touch src/components/atoms/Badge/Badge.test.tsx
touch src/components/atoms/Badge/index.ts
```

**Badge.tsx**:
```tsx
import { View, Text } from 'react-native'
import { styles } from './Badge.styles'

export interface BadgeProps {
  label: string
  variant?: 'default' | 'success' | 'error'
  testID?: string
}

export function Badge({ label, variant = 'default', testID }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]} testID={testID}>
      <Text style={styles.text}>{label}</Text>
    </View>
  )
}
```

**Badge.styles.ts**:
```ts
import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radius.pill,
  },
  default: {
    backgroundColor: theme.colors.neutral200,
  },
  success: {
    backgroundColor: theme.colors.available,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  text: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
  },
})
```

**Badge.test.tsx**:
```tsx
import { render, screen } from '@testing-library/react-native'
import { Badge } from './Badge'

describe('Badge', () => {
  it('debe renderizar label', () => {
    render(<Badge label="Nuevo" />)
    expect(screen.getByText('Nuevo')).toBeTruthy()
  })

  it('debe aplicar variant success', () => {
    render(<Badge label="Test" variant="success" testID="badge" />)
    expect(screen.getByTestID('badge')).toBeTruthy()
  })
})
```

**index.ts**:
```ts
export { Badge } from './Badge'
export type { BadgeProps } from './Badge'
```

---

## 🏗️ Crear una Página

### Ejemplo: DirectoryPage

```bash
mkdir -p src/pages/DirectoryPage
# ...crear archivos similares
```

**DirectoryPage.tsx**:
```tsx
import { ScreenShell } from '@/components/templates/ScreenShell'
import { ProList } from '@/components/organisms/ProList'

export function DirectoryPage() {
  const { data: pros, isLoading, error } = usePros() // TanStack Query

  return (
    <ScreenShell
      title="Profesionales"
      loading={isLoading}
      error={error?.message}
      empty={pros?.length === 0 ? { message: 'No hay profesionales' } : undefined}
    >
      <ProList pros={pros} />
    </ScreenShell>
  )
}
```

---

## 🧪 Flujo de Trabajo Recomendado

### Modo TDD (Test-Driven Development)

1. **Escribe el test primero**:
```tsx
it('debe mostrar lista de profesionales', () => {
  render(<DirectoryPage />)
  expect(screen.getByText('Profesionales')).toBeTruthy()
})
```

2. **Implementa lo mínimo para que pase**:
```tsx
export function DirectoryPage() {
  return <Text>Profesionales</Text>
}
```

3. **Refactoriza con diseño real**:
```tsx
export function DirectoryPage() {
  return (
    <ScreenShell title="Profesionales">
      {/* contenido */}
    </ScreenShell>
  )
}
```

---

## 🔍 Consultas Rápidas

### "¿Cómo uso el theme?"
```tsx
import { theme } from '@/theme'

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],           // ✅ Correcto
    backgroundColor: theme.colors.accent, // ✅ Correcto
    // backgroundColor: '#5980a6',        // ❌ MAL - literal
  }
})
```

### "¿Cómo hago un hook de dominio?"
```tsx
// src/hooks/domain/usePriceQuote.ts
import { useMemo } from 'react'
import { calculatePrice } from '@/utils/pricing'

export function usePriceQuote(rate: number, hours: number) {
  return useMemo(() => {
    return calculatePrice(rate, hours)
  }, [rate, hours])
}
```

### "¿Cómo uso los stores?"
```tsx
import { useUser, useAuthStore } from '@/stores/useAuthStore'

function MyComponent() {
  // Selector atómico (solo se re-renderiza si user cambia)
  const user = useUser()

  // O store completo (se re-renderiza en cualquier cambio)
  const { user, isAuthenticated, setAuth } = useAuthStore()
}
```

### "¿Cómo muestro estados de carga?"
```tsx
<ScreenShell
  loading={isLoading}
  error={error?.message}
  empty={
    items.length === 0
      ? {
          message: 'No hay datos',
          action: { label: 'Recargar', onPress: refetch }
        }
      : undefined
  }
>
  {/* contenido */}
</ScreenShell>
```

---

## 📚 Documentos Importantes

| Documento | Cuándo Consultar |
|-----------|------------------|
| **ROADMAP.md** | Cada día - ver qué toca |
| **README.md** | Reglas de negocio, arquitectura |
| **SECURITY.md** | Dudas de seguridad OWASP |
| **PHASE1_COMPLETE.md** | Ver qué ya está hecho |
| **README.md principal** | Lógica de negocio de Lughly |
| **MobileApp.dc.html** | Referencia visual de diseño |

---

## 🎯 Checklist Diaria

### Al Empezar
- [ ] `git pull`
- [ ] `npm install`
- [ ] Revisar ROADMAP.md - día actual
- [ ] Leer tarea del día completa

### Durante
- [ ] Crear estructura de archivos
- [ ] Escribir tests
- [ ] Implementar componente
- [ ] Verificar con `npm run type-check`
- [ ] Tests pasan con `npm test`

### Al Terminar
- [ ] Todos los criterios de aceptación ✅
- [ ] Tests pasan
- [ ] Sin errores de TypeScript
- [ ] `git commit` con mensaje claro
- [ ] `git push`
- [ ] Marcar día como completado en ROADMAP

---

## 🆘 Troubleshooting

### "npm install falla"
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### "TypeScript muestra errores raros"
```bash
npm run type-check
# Revisar tsconfig.json
# Verificar que imports usan @/ correctamente
```

### "Tests no funcionan"
```bash
# Limpiar caché de Jest
npm test -- --clearCache
npm test
```

### "Expo no inicia"
```bash
npx expo start --clear
```

---

## 💡 Tips

- 🎯 **Hazlo simple primero**: No sobre-ingenierices
- 🧪 **Tests son tus amigos**: Te ahorran debugging
- 📐 **Sigue el diseño**: Los .dc.html son tu guía
- 🔒 **Seguridad desde día 1**: Revisa SECURITY.md
- 📝 **Commits frecuentes**: No esperes al final del día
- 🤝 **Reutiliza componentes**: Revisa qué ya existe

---

## 🚀 ¡Listo para Empezar!

```bash
cd apps/mobile
npm start
# Abre ROADMAP.md
# ¡A construir! 🔨
```

**Próxima tarea**: Ver Día 1 en ROADMAP.md

---

**🐜 Lughly** — Un experto para cada trabajo
