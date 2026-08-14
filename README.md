# Lughly Mobile - Frontend Móvil

Frontend móvil de Lughly, marketplace de oficios, construido con Expo + React Native siguiendo arquitectura atomic design.

## 📋 Estado del Proyecto

### ✅ Fase 1 COMPLETADA: Andamiaje Completo

#### Infraestructura Base
- [x] Proyecto Expo SDK 57 + React Native + TypeScript strict
- [x] Estructura atomic design completa según README
- [x] Sistema de diseño (theme/) con tokens del CSS
- [x] Navegación expo-router con tabs dinámicos por rol
- [x] Jest + React Native Testing Library configurados

#### Dependencias Core
- [x] TanStack Query para datos del servidor
- [x] Zustand para estado del cliente
- [x] react-hook-form + zod para formularios
- [x] expo-secure-store para tokens (OWASP M9)
- [x] @react-native-async-storage/async-storage
- [x] Fuentes Barlow + Barlow Condensed

#### Componentes Implementados

**10 Átomos con Tests:**
1. [x] Button (primary/secondary/ghost, loading, disabled)
2. [x] Input (default/dark, error state)
3. [x] Tag (6 variants: accent, available, urgency, etc.)
4. [x] Corner (esquinas blueprint técnicas)
5. [x] Avatar (con imagen o iniciales, 3 tamaños)
6. [x] StarRating (solo lectura o interactivo)
7. [x] Switch (toggle con theme colors)
8. [x] Dot (indicador circular, 5 colores)
9. [x] Money (formateador de cantidades con Intl)
10. [x] Skeleton (placeholder animado, 3 variants)

**Templates:**
- [x] ScreenShell (header, scroll, estados loading/empty/error)

**Pages:**
- [x] SplashPage (imagen + botones registro/login)

**Stores Zustand:**
- [x] useAuthStore (tokens, usuario, auth state) con tests
- [x] useRoleStore (modo cliente/pro) con tests

**Seguridad:**
- [x] secureStorage adapter (OWASP M9) con tests ✅ 8 passed
- [x] Documentación completa OWASP M1-M10 en SECURITY.md

### ⚠️ Nota sobre Tests

Los tests unitarios están escritos pero hay una incompatibilidad conocida entre React 19 (usado por Expo SDK 57) y react-test-renderer que está siendo resuelta por la comunidad. Los tests de `secureStorage` sí funcionan (8 passed).

Para testing E2E recomendamos Maestro o Detox una vez implementadas las pantallas principales.

## 🏗️ Arquitectura

### Estructura de Carpetas

```
apps/mobile/
├── src/
│   ├── components/
│   │   ├── atoms/         # Button, Input, Tag, Corner
│   │   ├── molecules/     # SearchField, PhotoPicker, etc.
│   │   ├── organisms/     # ProList, BidList, etc.
│   │   └── templates/     # ScreenShell, ModalSheet
│   ├── pages/             # HomePage, DirectoryPage, etc.
│   ├── app/               # expo-router: rutas file-based
│   ├── hooks/
│   │   ├── auth/          # useSession, useLogin, etc.
│   │   ├── data/          # usePros, useJobs (TanStack Query)
│   │   ├── domain/        # usePriceQuote, useSurcharge (reglas de negocio)
│   │   └── ui/            # useCarousel, useLightbox, etc.
│   ├── stores/            # Zustand: useAuthStore, useRoleStore, etc.
│   ├── theme/             # colors, spacing, typography, shadows
│   ├── utils/             # Funciones puras (pricing, coverage, etc.)
│   ├── security/          # secureStorage adapter (OWASP M9)
│   └── api/               # Cliente generado del OpenAPI (cuando exista)
├── jest.config.js
├── jest.setup.js
└── app.json
```

### Reglas de Arquitectura

1. **Atomic Design Estricto**
   - Un átomo no conoce el dominio
   - Las páginas solo componen organisms
   - Cada componente en su directorio: `.tsx`, `.styles.ts`, `.test.tsx`, `index.ts`

2. **Estado**
   - TanStack Query: TODA la data del servidor
   - Zustand: SOLO estado del cliente (rol, modo, borradores, UI)
   - Nunca duplicar en Zustand lo que ya cachea Query

3. **Lógica**
   - Un componente PINTA, un hook DECIDE
   - Reglas de negocio en `hooks/domain/` como funciones puras
   - Fórmulas en `utils/`, hooks las memorizan

4. **Seguridad (OWASP Mobile Top 10)**
   - M1: No secrets en el código ni en `EXPO_PUBLIC_*`
   - M9: Tokens en expo-secure-store, nunca AsyncStorage
   - M5: TLS + certificate pinning (pendiente cuando haya API)
   - M7: Ofuscación + minify en release
   - M8: Entornos separados, deep links verificados

## 🎨 Sistema de Diseño

### Tokens Implementados

Extraídos de `_ds/industry-b237969c-50b4-49b1-bd23-47ccffb071f0/styles.css`:

- **Colores**: accent, neutral, available, urgency, dark theme
- **Espaciado**: 1, 2, 3, 4, 6, 8 (sin 5)
- **Tipografía**: Barlow Condensed (headings) + Barlow (body)
- **Radios**: sm, md, lg, card, pill
- **Sombras**: sm, md, lg (iOS + Android)

### Guía de Componentes

#### Átomos

**Button** - 3 variantes, loading, disabled
```tsx
<Button variant="primary" onPress={handlePress}>Publicar trabajo</Button>
<Button variant="secondary" loading>Cargando...</Button>
<Button variant="ghost" disabled fullWidth>Deshabilitado</Button>
```

**Input** - Dark theme ready
```tsx
<Input
  placeholder="Email"
  variant="dark"
  error={!!errors.email}
  onChangeText={setValue}
/>
```

**Tag** - 6 variantes
```tsx
<Tag variant="available">Disponible ahora</Tag>
<Tag variant="urgency">Urgente +25%</Tag>
<Tag variant="outline">Verificado</Tag>
```

**Avatar** - Con imagen o iniciales
```tsx
<Avatar source={{ uri: url }} size="large" />
<Avatar initials="AB" size="medium" />
```

**StarRating** - Solo lectura o interactivo
```tsx
<StarRating rating={4.5} showValue />
<StarRating rating={rating} interactive onChange={setRating} />
```

**Money** - Formateo automático
```tsx
<Money amount={1500.50} size="large" />
// Renderiza: 1.500,50€
```

**Skeleton** - Para estados de carga
```tsx
<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" width={48} />
<Skeleton variant="rectangular" height={100} />
```

**Switch, Dot, Corner** - Según necesidad

#### Templates

**ScreenShell** - Envoltorio con estados
```tsx
<ScreenShell
  title="Mis Trabajos"
  onBack={router.back}
  loading={isLoading}
  error={error?.message}
  empty={{
    message: 'No hay trabajos disponibles',
    action: { label: 'Publicar', onPress: goPublish }
  }}
>
  {/* Contenido */}
</ScreenShell>
```

#### Stores

**Auth Store**
```tsx
const { user, isAuthenticated } = useAuthStore()
const user = useUser() // Selector atómico
const role = useUserRole()

// Acciones
setAuth(user, accessToken, refreshToken)
updateUser({ verified: true })
clearAuth()
```

**Role Store**
```tsx
const activeRole = useActiveRole()
const isClient = useIsClientMode()
const { switchRole } = useRoleStore()
```

## 🚀 Comandos

```bash
# Desarrollo
npm start              # Abrir Expo Dev Tools
npm run android        # Abrir en Android
npm run ios            # Abrir en iOS (requiere macOS)
npm run web            # Abrir en web

# Testing
npm test               # Ejecutar tests (Jest)
npm run test:watch     # Tests en modo watch
npm run test:coverage  # Cobertura de tests

# Calidad
npm run type-check     # TypeScript check
npm run lint           # ESLint (pendiente configurar)
```

## 📦 Dependencias Principales

- **expo** ~57.0.12 (SDK 57, React 19)
- **react-native** 0.86.2
- **expo-router** ^57.0.12 (navegación file-based)
- **@tanstack/react-query** ^5.101.4
- **zustand** ^5.0.14
- **react-hook-form** ^7.85.0
- **zod** ^4.4.3
- **expo-secure-store** ^57.0.1
- **expo-font** ^57.0.1
- **@expo-google-fonts/barlow** + **barlow-condensed**

## 🔐 Seguridad

### Implementado (Fase 1)

- ✅ **M9 Almacenamiento Inseguro**: `secureStorage` adapter con expo-secure-store
- ✅ **M1 Credenciales**: No secrets en código
- ✅ **M8 Configuración**: Permisos mínimos, no cleartext traffic

### Pendiente (Fases Siguientes)

- M5: Certificate pinning cuando exista API
- M7: Ofuscación + FLAG_SECURE en release
- M3: Biometría para pagos
- M4: Validación zod + sanitización
- M2: Dependabot + npm audit en CI

## 📖 Próximos Pasos (Fase 2)

### Pantallas Principales
1. **LoginPage** con formulario react-hook-form + zod
2. **RegisterPage** con documentos, oficio, tarifa
3. **HomePage** con hero, buscador, carrusel de oficios
4. **DirectoryPage** con filtros y orden por cercanía
5. **ProProfilePage** con mapa de cobertura

### Molecules y Organisms
1. **SearchField** (Input + sugerencias)
2. **PhotoPicker** (rejilla de fotos)
3. **PriceBreakdown** (desglose con recargos)
4. **ProCard** (tarjeta de profesional con ETA)
5. **ProList** (ordenado por cercanía + disponibilidad)

### Hooks de Dominio
1. **usePriceQuote** - cálculo de presupuesto con recargos
2. **useSurcharge** - sábado 20%, domingo 35%, nocturno 25%
3. **useCoverage** - ¿dirección dentro del radio?
4. **useCanBid** - NIF + Stripe + habilitación
5. **useAvailability** - franjas, 24h, próxima hora libre

### Stores Adicionales
1. **useDraftJobStore** - borrador persistido
2. **useUIStore** - modales, filtros, visor de fotos

### Integración API
1. Generar cliente tipado del OpenAPI
2. Configurar TanStack Query hooks
3. Implementar MSW para mocks
4. Certificate pinning (M5)

### Seguridad (Fase 2)
- [ ] Refresh token con rotación (M3)
- [ ] Validación zod en formularios (M4)
- [ ] Biometría para pagos (M3)
- [ ] Dependabot + npm audit en CI (M2)

## 📚 Referencias

- [Expo SDK 57 Docs](https://docs.expo.dev/versions/v57.0.0/)
- [expo-router Guide](https://docs.expo.dev/router/introduction/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [OWASP Mobile Top 10 2024](https://owasp.org/www-project-mobile-top-10/)

---

**🐜 Lughly** — Un experto para cada trabajo
