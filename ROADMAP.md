# 🗺️ Roadmap de Desarrollo - Lughly Mobile

Plan de trabajo estructurado para continuar el desarrollo después de la Fase 1.

---

## ⚠️ Regla del proyecto: sin tests en el front

**La app móvil no tiene tests** (decisión del 14 Agosto 2026): se eliminaron
junto con jest y sus dependencias. La verificación es `npm run type-check` más
comprobarlo en el móvil. No se añaden tests en ninguna tarea de este roadmap.

El backend sí conserva los suyos.

---

## 📋 Estado Actual

✅ **Fase 1 Completada** (11 Agosto 2026)
- Andamiaje completo
- 10 átomos
- Stores base (Auth + Role)
- Seguridad M9 implementada
- Template ScreenShell
- SplashPage

---

## 🔌 Backend

El backend vive en `C:\Users\robin\Desktop\lughly-backend` (NestJS + PostgreSQL +
Prisma) y se construye **en paralelo**: cada función del front que necesite
servidor se implementa allí primero.

Ya conectado:
- `POST /v1/auth/register` ← `useRegister`
- `POST /v1/auth/login` ← `useLogin`
- `POST /v1/auth/refresh` ← renovación automática en `src/api/http.ts`
- `POST /v1/auth/logout`, `GET /v1/auth/me`, `GET /v1/trades`
- `POST /v1/me/avatar` y `POST /v1/me/documents` ← adjuntos del registro
- `POST /v1/auth/password/forgot` y `/reset` ← `PasswordResetPage`
- `POST /v1/auth/email/verify/resend` ← `VerifyEmailNotice`
- `GET /v1/pros` ← `usePros` (directorio) · `GET /v1/pros/:id` ← `useProProfile` (ficha)

Correo: **Brevo** (verificado funcionando el 13/08/2026). En desarrollo se
puede usar `EMAIL_PROVIDER=console`, que imprime el correo por consola.

La app resuelve sola la URL del backend a partir del host de Metro; para fijarla
crea `apps/mobile/.env` con `EXPO_PUBLIC_API_URL=http://<ip-del-pc>:3000`.

---

## 🎯 Fase 2: Autenticación y Navegación Base

**Duración estimada**: 5-7 días
**Objetivo**: Usuario puede registrarse, hacer login y navegar entre roles

### Día 1: Login y Formularios Base ✅ (12 Agosto 2026)
**Objetivo**: Implementar sistema de login funcional

**Tareas**:
- [x] Crear LoginPage con formulario
  - Input email + password
  - Validación con zod
  - Estado de error
  - Link a "¿Olvidaste tu contraseña?"
- [x] Hook useLogin (mock inicial)
  - Validar credenciales
  - Guardar tokens en useAuthStore
  - Navegar a tabs (la navegación la hace la ruta vía `onSuccess`)
- [x] Actualizar navegación: splash → login → tabs

**Extras necesarios para que el flujo funcione**:
- Rutas placeholder `/registro` (Día 2) y `/recuperar` (con backend de auth)
- Todas las imágenes movidas a `src/images` y consumidas desde `@/images`
- Corregidas rutas rotas de assets en `app.json` y en SplashPage

**Archivos a crear**:
```
src/pages/LoginPage/
  ├── LoginPage.tsx
  ├── LoginPage.styles.ts
  └── index.ts
src/hooks/auth/
  ├── useLogin.ts
```

**Criterio de aceptación**:
- [x] Usuario puede escribir email y password
- [x] Validación muestra errores
- [x] Mock login guarda tokens y navega a tabs

---

### Día 2: Registro de Usuario (Parte 1) ✅ (12 Agosto 2026)
**Objetivo**: Formulario de registro básico

**Tareas**:
- [x] Crear RegisterPage: datos básicos
  - Nombre, email, password (mín. 10)
  - Selector de rol (cliente/profesional)
  - Validación zod + consentimiento RGPD obligatorio
- [x] Molecule FormField (label + acción + helper/hint + error)
- [x] Hook useRegister (mock)

**Nota**: el diseño no es multi-paso. MobileApp.dc.html usa un único formulario
con bloque condicional para profesional, y así se ha implementado.
Además se extrajo el template `AuthShell` (tarjeta blueprint compartida
por Login y Registro) y el átomo `Checkbox`.

**Archivos a crear**:
```
src/pages/RegisterPage/
  ├── RegisterPage.tsx
  ├── RegisterPage.styles.ts
  └── index.ts
src/components/molecules/FormField/
  ├── FormField.tsx
  ├── FormField.styles.ts
  └── index.ts
```

**Criterio de aceptación**:
- [x] Formulario multi-paso funciona
- [x] Validación reactiva
- [x] Navegación entre pasos

---

### Día 3: Registro de Usuario (Parte 2) ✅ (12 Agosto 2026)
**Objetivo**: Completar registro con datos profesionales

**Tareas**:
- [x] Bloque condicional de RegisterPage (solo si rol=pro):
  - Selector de oficio (18 opciones)
  - Tarifa por hora (acepta coma decimal)
  - Ciudad
  - Aviso de habilitación en oficios regulados
- [x] Molecule Picker (hoja inferior; sustituye al `<select>` del diseño)
- [x] `src/utils/trades.ts` con los 18 oficios + imagen por oficio
- [x] Conectar registro completo

### Adjuntos del registro ✅ (13 Agosto 2026)
- [x] Molécula `ImagePickerField` + hook `usePickImage`
- [x] Foto de perfil, documento de identidad (DNI/NIE 2 caras o pasaporte)
      y habilitación profesional (opcional)
- [x] Backend: `POST /v1/me/avatar`, `POST /v1/me/documents`, tabla `documents`
- [x] Compresión y borrado de EXIF en el móvil antes de subir

**Pendiente**: panel de backoffice que revise los documentos y ponga
`identity_verified_at` — hoy nada lo escribe, así que ninguna cuenta llega a
verificarse. Y pasar el almacenamiento de disco local a S3/R2 antes de
producción (ver `PENDIENTE_PARA_PRODUCCION.md` del backend).

**Archivos a crear**:
```
src/components/molecules/Picker/
  ├── Picker.tsx
  ├── Picker.styles.ts
  └── index.ts
src/utils/trades.ts  # Lista de 18 oficios
```

**Criterio de aceptación**:
- [x] Registro completo funciona
- [x] Datos se guardan en useAuthStore
- [x] Redirección según rol

---

### Día 4: HomePage Cliente ✅ (13 Agosto 2026)
**Objetivo**: Pantalla principal del cliente

**Tareas**:
- [x] Crear HomePage (versión cliente)
  - Hero con título y descripción
  - Buscador rápido **con sugerencias por sinónimos** ("fuga" → Fontanería)
  - CTA "Publicar", "Ver profesionales" y "Lo necesito urgente"
  - Carrusel de los 18 oficios con sus ilustraciones
  - Sección "02 · Cómo funciona" y bloque "03 · Subasta inversa"
- [x] Molecule HeroSection
- [x] Organism TradeCarousel
- [x] Molecule BlueprintCard (tarjeta con esquinas, reutilizable)
- [x] `src/utils/tradeSearch.ts` con los sinónimos del diseño

**Nota de diseño**: el prototipo web coloca los oficios en posiciones
absolutas y los mueve con flechas. En móvil se ha hecho carrusel horizontal
con ajuste por página, que es el gesto natural; se conservan los puntos.

**Archivos a crear**:
```
src/pages/HomePage/
  ├── HomePage.tsx
  ├── HomePage.styles.ts
  └── index.ts
src/components/molecules/HeroSection/
src/components/organisms/TradeCarousel/
```

**Criterio de aceptación**:
- [x] Hero visible con estilo del diseño
- [x] Carrusel muestra 18 oficios
- [x] Botones navegan a rutas correctas
- [x] Responsive

---

### Mi cuenta ✅ (14 Agosto 2026)
**Objetivo**: Pantalla de cuenta completa

- [x] Ficha con avatar, nombre, email y rol
- [x] **Foto de perfil**: añadir o cambiar desde la propia pantalla
- [x] Cambio de modo cliente/profesional (solo cuentas profesionales)
- [x] Cambiar contraseña (`PATCH /v1/me/password`), cierra las demás sesiones
- [x] Aviso de email sin confirmar, con reenvío
- [x] Cerrar sesión con confirmación
- [x] Accesos por rol; los que aún no tienen pantalla salen como "Pronto"

**Nota técnica**: la subida de ficheros pasó de `fetch` con FormData a la vía
nativa de `expo-file-system`. En iOS, `fetch` con un fichero dentro de un
FormData falla con un error de red genérico aunque el servidor responda al
resto de peticiones. Afectaba también a los documentos del registro.

---

### Día 5: Navegación y Estados ✅ (14 Agosto 2026)
**Objetivo**: Sistema completo de navegación

**Tareas**:
- [x] Organism RoleGate — bloquea y explica, con salidas concretas
- [x] Hook useRoleGate
- [x] Rutas protegidas: `publish`, `urgent`, `jobs` (cliente) ·
      `offers`, `schedule`, `wallet` (profesional)
- [ ] ~~Pantalla "Cambiar Modo"~~ — no se hace, ver abajo

**Criterio de aceptación**:
- [x] Cliente no puede ver pantallas de pro
- [x] Pro no puede ver pantallas de cliente
- [x] Switch de modo funciona (hecho en "Mi cuenta")
- [x] Mensaje claro al intentar acceso no autorizado

**Decisiones**:

- **Nada de mensajes genéricos.** El diseño (`isPublicarDenied`,
  `isUrgenciaDenied`) no dice "no tienes permiso": dice qué le toca a esa
  persona en su lugar y le enseña dónde. Por eso título, texto y acciones
  llegan por props, y cada una de las seis rutas trae los suyos.
- **Se distingue "modo equivocado" de "cuenta equivocada".** Una cuenta
  profesional en modo cliente que abre Agenda solo tiene que cambiar de modo.
  Una cuenta de cliente **no tiene** modo profesional al que cambiar: se le
  explica que hay que darse de alta, en vez de darle un botón inerte. Este
  caso no está en el diseño, que da por hecho que todo el mundo tiene ambos.
- **Sin `SwitchModePage`.** El cambio de modo ya está en "Mi cuenta" y en el
  propio RoleGate, que es donde hace falta. Una pantalla dedicada sería un
  destino al que solo se llega a propósito para hacer algo que ya se puede
  hacer donde surge la necesidad.

**Ojo**: esto es cosmético, como dice el README. La autorización real la hace
el backend en cada operación; el RoleGate solo evita enseñar pantallas que no
tienen sentido para quien mira.

---

### Día 6-7: HomePage Pro ✅ (14 Agosto 2026)
**Objetivo**: Pantalla principal del profesional

**Tareas**:
- [x] `HomePagePro` — pantalla propia, no la del cliente con otros textos
- [x] Estadísticas **reales** (no mock): valoración, trabajos terminados,
      tarifa y radio de cobertura
- [x] Estado "Disponible ahora" con `PATCH /v1/pro/available-now`
- [x] Molecule StatCard
- [x] "Cómo te valoran" reutilizando `ReviewList`
- [ ] ~~Trabajos cerca de ti~~ · ~~Plan y contador de pujas~~ — sin datos, ver abajo
- [ ] ~~Switch mejorado~~ — el átomo actual sirve

**Criterio de aceptación**:
- [x] Dashboard pro muestra estadísticas
- [x] Switch "Disponible ahora" funciona (probado contra el servidor)
- [x] Todo el flujo login → home → cambio de modo funciona

**Backend nuevo**: `PATCH /v1/pro/available-now`, en un controlador aparte
(`ProSelfController`, espacio `v1/pro`) para no mezclar rutas privadas con el
directorio público de `v1/pros`. Protegido con `@Roles(PRO)`.

**Decisiones**:

- **Las estadísticas no son mock.** El roadmap las pedía inventadas; salen de
  `ProProfile`, que ya tiene todo lo necesario. Un panel con cifras falsas se
  queda así durante meses porque parece terminado.
- **El interruptor escribe en el perfil, no en el móvil.** "Disponible ahora"
  decide a quién se avisa en una urgencia (README §7). Si viviera en el
  dispositivo, cerrar la app dejaría al cliente esperando a alguien que ya no
  está. Se actualiza de forma optimista para que no se sienta lento.
- **Fuera por falta de tablas**: trabajos cerca de ti y contador de pujas
  (necesitan `Job` y `Bid`, Fases 4-5), reserva instantánea (Fase 7) e
  ingresos de 6 meses (`Payment`, Fase 9).

---

## 🎯 Fase 3: Directorio y Perfiles

**Duración estimada**: 4-5 días
**Objetivo**: Buscar y ver perfiles de profesionales

### Día 8: Directorio de Profesionales ✅ (14 Agosto 2026)
**Tareas**:
- [x] DirectoryPage — con datos reales, no mock: `GET /v1/pros`
- [x] Buscador con sinónimos (`searchTrades`) en vez de un SearchField propio
- [x] Filtro por oficio (`Picker`) y por "disponible ahora"
- [x] Orden por cercanía y disponibilidad — lo decide el backend, no la app
- [x] Molecule ProDirectoryCard

**Criterio de aceptación**:
- [x] Lista muestra profesionales
- [x] Filtro funciona
- [x] Tap en card navega a perfil

**Nota**: no se hicieron `SearchField` ni `ProList`. El buscador con
sugerencias ya existía en la home (`QuickSearch`) y la lista es un `map` de
cinco líneas: envolverla en un organism solo añadía una capa que atravesar.

---

### Día 9: Perfil de Profesional ✅ (14 Agosto 2026)
**Tareas**:
- [x] `GET /v1/pros/:id` en el backend (`GetProUseCase`), público
- [x] ProProfilePage: avatar, nombre, oficio, ciudad, tarifa, valoración,
      distintivos, bio, trabajos terminados, recargos y radio de cobertura
- [x] Molecule PriceBreakdown
- [x] Ruta `/pro/[id]` y enlace desde el directorio
- [x] Hook `useProProfile` — sin reintentos ante un 404

**Criterio de aceptación**:
- [x] Perfil muestra todos los datos que hoy existen en la base
- [x] Recargos visibles
- [x] Botones preparados para acciones (avisan de en qué fase llegan)

**Fuera de alcance a propósito** — el diseño (`isPerfil`) los pinta, pero no
hay tablas que los sostengan y no se inventan:

| Bloque | Necesita | Llega en |
| --- | --- | --- |
| Resumen de reputación (IA) y etiquetas de carácter | `Review` | Día 10 |
| Rejilla de disponibilidad por día y franja | `Availability` | Fase 6 |
| Mapa de cobertura | react-native-maps + lat/lng | Día 11 |

Los recargos salen de `src/utils/surcharges.ts`, con los valores del README
§6. Son informativos: el servidor los vuelve a aplicar al cobrar.

---

### Día 10: Valoraciones ✅ (14 Agosto 2026)
**Tareas**:
- [x] Modelo `Review` + migración `20260814131115_reviews`
- [x] `GET /v1/pros/:id/reviews`, público y paginado
- [x] Organism ReviewList — desglose por criterio + lista + "ver más"
- [x] Molecule ReviewCard — firma, nota, comentario, las 8 notas plegadas
      y respuesta pública del profesional
- [x] Datos reales por seed (`npm run db:seed:reviews`), no mock en el front

**Decisiones**:

- **No hay `POST /v1/reviews`.** Quién puede valorar a quién depende de haber
  contratado y terminado un trabajo, y `Job` llega en la Fase 10. Crear sin esa
  comprobación sería un buzón abierto para inflar o hundir reputaciones.
  Cuando exista `Job`, `Review` gana `jobId` y unicidad por trabajo.
- **El autor es opcional** (`authorId` nullable + `authorLabel` congelado). Si
  un cliente se da de baja la reseña sobrevive: si no, un profesional podría
  perder su reputación entera porque sus clientes se dieran de baja.
- **Las 8 notas van plegadas** tras "Ver las 8 notas". Desplegadas, tres
  reseñas son veinticuatro filas de estrellas y nadie las lee.
- **`ratingAverage` y `reviewCount` se recalculan desde las reseñas reales.**
  Antes los escribía a mano `seed-pros.ts` (Lucía decía tener 187 y no había
  ninguna). Ahora salen de contar y promediar, y por eso bajaron a una docena.

Falta el **resumen de reputación por IA** que pinta el diseño: ya hay datos que
resumir, pero exige llamar a un modelo y decidir cuándo se recalcula.

---

### Día 11: Mapas ✅ (14 Agosto 2026)

Especificación completa en `MAPS_MOBILE.md`. **No se usa react-native-maps ni
Google Maps**: MapLibre con teselas de OpenFreeMap, sin cuenta ni clave.

**Tareas**:
- [x] `@maplibre/maplibre-react-native` + `expo-location`, con el permiso
      solo "mientras se usa la app"
- [x] `theme/map.ts` — la URL del estilo vive en un único sitio
- [x] `utils/geo.ts` — `haversineKm`, `circleToPolygon`, `formatDistance`
- [x] Organism `CoverageMap` — círculo geodésico, no una vista redonda
- [x] Organism `ProsMap` — con agrupación desde el primer momento
- [x] Molecule `MapAttribution` · Atom `MapMarker`
- [x] Hook `useCoverage` · Hook `useUserLocation`
- [x] `POST /v1/geocode` en el backend (Photon, sin clave en el cliente)
- [x] `haversineKm` también en el backend, con los mismos casos de prueba
- [x] Enganchados: `CoverageMap` en la ficha, `ProsMap` en el directorio
- [ ] Deslizador de radio (1–50 km) — llega con Disponibilidad, Fase 6
- [ ] **Development build con EAS**: lo tiene que lanzar el usuario

**Tests**: 39 en el móvil y 7 en el backend. Se reinstaló jest para esto,
revirtiendo la regla de "sin tests en el front" solo para los mapas.

**Decisiones**:

- El círculo es un polígono geodésico de 65 vértices. Un test comprueba que
  todos caen al radio pedido con 1% de tolerancia, **y lo repite en Reikiavik**
  (lat. 64°), que es donde un círculo dibujado con una vista deja de valer.
- La agrupación va activada desde el principio, no cuando empiece a ir lento.
- La atribución de OpenStreetMap no tiene prop para ocultarla: la exige la
  licencia ODbL. Si se pudiera apagar, alguien la apagaría.
- Los marcadores no llevan dirección ni datos personales en sus `properties`,
  solo id, nombre y disponibilidad. Hay un test que lo fija.
- El mapa del directorio se monta solo al pulsar "Mapa": mantenerlo vivo bajo
  la lista gastaría teselas y batería sin que nadie lo mire.

---

## 🎯 Fase 4: Publicar Trabajo y Urgencias

**Duración estimada**: 5-6 días
**Objetivo**: Cliente puede publicar trabajos normales y urgentes

### Día 12-13: PublishPage
**Tareas**:
- [ ] PublishPage (subasta inversa)
  - Selector de oficio
  - Título y descripción
  - AI assistant para redacción
  - Presupuesto orientativo
  - Fecha límite
  - PhotoPicker (4 fotos)
- [ ] Molecule PhotoPicker
- [ ] Hook useDraftJobStore

---

### Día 14-15: UrgencyPage
**Tareas**:
- [ ] UrgencyPage
  - Oficio
  - Dirección con indicador de cobertura
  - Descripción breve
  - PhotoPicker
  - Recargo automático +25-50%
- [ ] Organism CoverageIndicator
- [ ] Hook useSurcharge

---

### Día 16: Confirmación y Draft
**Tareas**:
- [ ] Template ConfirmationModal
- [ ] Persistir borradores en useDraftJobStore
- [ ] Recovery de borradores

---

## 🎯 Fase 5: Flujo de Pujas (Profesional)

**Duración estimada**: 4-5 días

### Día 17-18: OffersPage (Pro)
**Tareas**:
- [ ] OffersPage
  - Lista de subastas disponibles
  - Filtro por oficio
  - Orden por cercanía
  - Indicador de distancia
- [ ] Organism AuctionList
- [ ] Molecule AuctionCard

---

### Día 19-20: Pujar en Subasta
**Tareas**:
- [ ] AuctionDetailPage
  - Detalles completos
  - Fotos en galería
  - Pujas actuales
  - Formulario de puja
- [ ] Molecule BidForm
- [ ] Hook useCanBid (validación NIF + Stripe)

---

### Día 21: Bloqueos y Validaciones
**Tareas**:
- [ ] Implementar bloqueos según README:
  - Sin Stripe verificado → no puede pujar
  - Límite de plan Free
  - Recargos no acumulables
- [ ] Mensajes de error claros

---

## 🎯 Fase 6: Calendario y Disponibilidad (Pro)

**Duración estimada**: 4-5 días

### Día 22-23: AvailabilityPage
**Tareas**:
- [ ] AvailabilityPage
  - Calendario semanal
  - Por franja: mañana/tarde/noche
  - Hora inicio y fin
  - Toggle 24h
  - "Aplicar a todos los lunes"
- [ ] Organism AvailabilityWeek
- [ ] Molecule TimeRangeRow
- [ ] Hook useAvailability

---

### Día 24-25: Recargos y Ausencias
**Tareas**:
- [ ] Sección de recargos
  - Sábado +20%
  - Domingo/festivo +35%
  - Nocturno +25%
  - Vista previa de precio
- [ ] Sección de ausencias
  - Rango de fechas
  - Motivo
  - Lista de ausencias
- [ ] Hook useSurcharge (fórmula completa)

---

## 🎯 Fase 7: Reserva Instantánea y Presupuesto

**Duración estimada**: 3-4 días

### Día 26-27: Reserva Instantánea
**Tareas**:
- [ ] BookingFlow
  - Selector de día
  - Selector de hora
  - Duración
  - Dirección
  - Desglose de precio
- [ ] Molecule DateTimePicker
- [ ] Hook usePriceQuote (cálculo completo)

---

### Día 28: Presupuesto Directo
**Tareas**:
- [ ] QuoteRequestPage
  - Formulario privado
  - 24h para responder
  - Mock de envío

---

## 🎯 Fase 8: Integración con Backend

**Duración estimada**: 5-7 días
**Prerequisito**: Backend con OpenAPI disponible

### Día 29-30: Cliente API
**Tareas**:
- [ ] Instalar openapi-typescript + openapi-fetch
- [ ] Generar tipos del schema OpenAPI
- [ ] Configurar cliente base
- [ ] Interceptors para tokens
- [ ] Refresh token automático

---

### Día 31-32: TanStack Query Hooks
**Tareas**:
- [ ] Hook usePros (GET /v1/pros)
- [ ] Hook useProProfile (GET /v1/pros/:id)
- [ ] Hook useJobs (GET /v1/jobs)
- [ ] Hook useCreateJob (POST /v1/jobs)
- [ ] Hook useBids (GET /v1/jobs/:id/bids)

---

### Día 33-34: Reemplazar Mocks
**Tareas**:
- [ ] Conectar todas las pantallas a API real
- [ ] Eliminar datos mock
- [ ] Manejo de errores
- [ ] Estados de carga

---

## 🎯 Fase 9: Cartera y Pagos (Pro)

**Duración estimada**: 4-5 días

### Día 35-36: WalletPage
**Tareas**:
- [ ] WalletPage
  - Saldo actual
  - Onboarding Stripe Connect
  - Botón retirar
  - Historial de movimientos
- [ ] Integrar @stripe/stripe-react-native

---

### Día 37-38: Retiradas
**Tareas**:
- [ ] WithdrawalFlow
  - Importe
  - IBAN (validación)
  - Estándar gratis / Instantáneo 1%
  - Confirmación
- [ ] IBAN validator

---

## 🎯 Fase 10: Trabajos y Hitos (Cliente)

**Duración estimada**: 5-6 días

### Día 39-40: JobDetailPage
**Tareas**:
- [ ] JobDetailPage
  - Progreso visual
  - Fotos del trabajo (galería)
  - Lista de hitos
  - Acciones según estado
- [ ] Organism JobGallery
- [ ] Organism MilestoneTimeline

---

### Día 41-42: Gestión de Hitos
**Tareas**:
- [ ] MilestoneCard interactivo
  - Retener pago
  - Solicitar liberación
  - Aprobar
  - Pedir cambios
  - Abrir disputa
- [ ] Hook useMilestoneFlow

---

### Día 43: Valoraciones Mutuas
**Tareas**:
- [ ] ReviewForm
  - 8 criterios con estrellas
  - Comentario
  - Recomendación sí/no
- [ ] Organism CriteriaRating

---

## 🎯 Fase 11: Notificaciones y Chat

**Duración estimada**: 4-5 días

### Día 44-45: Notificaciones
**Tareas**:
- [ ] NotificationsPage
  - Lista de notificaciones
  - Leído/no leído
  - Filtro
  - Marcar todas
  - Accionables (navegan)
- [ ] Integrar expo-notifications
- [ ] Push notifications (EAS)

---

### Día 46-47: Chat
**Tareas**:
- [ ] MessagesPage (lista de threads)
- [ ] ThreadDetailPage
  - Mensajes con contexto del trabajo
  - Adjuntos
  - WebSocket real-time

---

## 🎯 Fase 12: Seguridad y Release

**Duración estimada**: 5-7 días

### Día 48-49: Seguridad Completa
**Tareas**:
- [ ] Certificate pinning (M5)
- [ ] Biometría para pagos (M3)
- [ ] Root/jailbreak detection (M7)
- [ ] FLAG_SECURE en Android (M7)

---

### Día 50-51: Build de Release
**Tareas**:
- [ ] Configurar EAS Build
- [ ] Ofuscación y minify (M7)
- [ ] Eliminar console.log
- [ ] Sourcemaps privados

---

### Día 52: CI/CD
**Tareas**:
- [ ] GitHub Actions / GitLab CI
- [ ] npm audit en pipeline
- [ ] SAST scanning
- [ ] Dependabot
- [ ] Auto-deploy a EAS

---

## 📊 Resumen de Fases

| Fase | Días | Componentes Clave | Prioridad |
|------|------|-------------------|-----------|
| 2 - Auth | 7 | Login, Register, HomePage | 🔴 Alta |
| 3 - Directorio | 5 | ProList, ProProfile, Reviews | 🔴 Alta |
| 4 - Publicar | 6 | PublishPage, UrgencyPage | 🔴 Alta |
| 5 - Pujas | 5 | OffersPage, BidForm | 🔴 Alta |
| 6 - Disponibilidad | 5 | Calendar, TimeRanges | 🟡 Media |
| 7 - Reservas | 4 | BookingFlow, PriceQuote | 🔴 Alta |
| 8 - API | 7 | OpenAPI, TanStack Query | 🔴 Alta |
| 9 - Cartera | 5 | WalletPage, Stripe | 🔴 Alta |
| 10 - Trabajos | 6 | JobDetail, Milestones | 🔴 Alta |
| 11 - Notif+Chat | 5 | Push, WebSocket | 🟡 Media |
| 12 - Security | 7 | Pinning, Biometrics | 🔴 Alta |

**Total estimado**: ~54 días (~11 semanas)

---

## 🎯 Cómo Usar Este Roadmap

### Cada Día:
1. ✅ Lee la tarea del día
2. 🔧 Implementa los componentes listados
3. 📱 Compruébalo en el móvil
4. 📝 Actualiza el checklist
5. 🚀 Commit al final del día

### Cada Semana:
- 📊 Revisar progreso vs estimado
- 🔄 Ajustar prioridades si es necesario
- 🧹 Refactorizar código acumulado
- 📚 Actualizar documentación

### Flexibilidad:
- ⏩ Puedes saltar días si ya dominas el tema
- ⏸️ Puedes tomar más tiempo en secciones complejas
- 🔀 Puedes reordenar fases según necesidades del proyecto

---

## 📌 Comandos Útiles Diarios

```bash
# Al empezar el día
git pull
npm install  # Por si hay nuevas deps
npm run type-check

# Durante desarrollo
npm start  # Expo en un terminal
npm run type-check  # Comprobación de tipos

# Al terminar el día
npm run type-check
git add .
git commit -m "Day X: [descripción de lo implementado]"
git push
```

---

## 🆘 Si te Bloqueas

1. **Revisa el README.md principal** - Tiene todas las reglas de negocio
2. **Mira los .dc.html** - Referencia visual exacta
3. **Consulta SECURITY.md** - Para dudas de seguridad
4. **Revisa componentes ya implementados** - Busca patrones similares
5. **Revisa componentes parecidos** - Muestran los patrones del proyecto

---

## ✅ Checklist de Calidad (Para Cada Componente)

- [ ] Sigue atomic design (átomo no conoce el dominio)
- [ ] No tiene valores literales (usa theme)
- [ ] TypeScript strict (no any)
- [ ] Props tipadas con interface
- [ ] Exporta tipos en index.ts
- [ ] Comentarios JSDoc en props complejas

---

**🐜 Lughly** — Un experto para cada trabajo
**Próximo paso**: Día 1 - LoginPage

_Última actualización: Fase 1 completada - 11 Agosto 2026_
