# Cómo se contrata y cómo se cobra

**Propuesta de lógica de negocio, versión 3 — 21 Agosto 2026. Nada de esto
está implementado.**

Tres versiones en un día. La v1 tenía el eje (síntoma contra encargo); la v2
incorporó la primera revisión crítica (empresas, válvula de escape, comisión,
fuga a negro); la v3 incorpora la segunda, que se hizo sobre los ciclos
(`CICLOS_DE_CONTRATACION.md`) y encontró que **la máquina de estados única no
aguantaba**: colgar del mismo `JobStatus` la cita, la confirmación del
trabajador, el parte de horas y el dinero dejaba sin sitio a la segunda cita,
a la recurrencia, a la cancelación por el profesional y al cerrajero bloqueado
hasta que el cliente confirma.

Lo que cambia de fondo en la v3: **tres entidades donde había una**.

- **`Job`** es el contrato: qué se contrata, con quién, a qué precio congelado,
  en qué modo. Sus estados son pocos y son de contrato.
- **`Appointment`** es cada cita: cuándo, quién va, si lo ha confirmado, si se
  hizo. Un trabajo puede tener varias (visita + arreglo; las clases de los
  martes) y cada una tiene su propia confirmación y su propia cancelación.
- **`Charge`** es cada cobro: cuánto, de quién a quién, en qué estado está el
  dinero. Se mueve por su propio ciclo, desligado del estado del trabajo.

---

## §0. Decisiones tomadas y supuestos

**Decisiones de Robin, 21 Agosto 2026:**

1. Comisión **0 % en la primera etapa**, pero todo preparado para cobrarla sin
   rehacer nada. **Revisado el 31 Agosto 2026: se cobra el 10 %**, y se baja por
   niveles según el volumen que el profesional traiga a la plataforma. El plan
   entero, en §12.
2. Se comisiona la **visita**, las **horas** y el **trabajo de importe
   definido**. El porcentaje se define después. Si el presupuesto aceptado se
   comisiona sigue **sin decidir**; queda preparado a 0 como el resto.
3. **Todo pago pasa por la app** (consecuencia de la 2, y porque el trabajador
   por cuenta ajena no ve importes).
4. **Sin subasta** en esta versión de la app.

**Supuestos de esta versión, marcados para que se cambien si no convencen:**

- **S1 — El dinero se cobra al reservar y se retiene hasta liberarlo.** Con
  Stripe Connect: el cargo se hace en el momento, el dinero queda en la
  plataforma (Stripe lo custodia, Lughly no necesita licencia de entidad de
  pago) y se transfiere al profesional al liberar. Devolver es un reembolso
  normal. Se elige frente a «autorizar y capturar después» porque una
  autorización de tarjeta caduca a los 7 días y una visita a dos semanas o una
  obra de un mes no llegarían vivas al cobro.
- **S2 — Un trabajador por cuenta ajena puede añadir a un trabajo en marcha
  líneas de la carta de su empresa, sin ver el precio.** El servidor las
  valora con la carta, el cliente ve el importe y acepta. Lo que no está en la
  carta espera al empleador. Es lo que hace posible la cerradura de las tres
  de la mañana sin romper el muro de importes del 18 de Agosto.

---

## §1. El diagnóstico, corregido

Lo que el código hace hoy, verificado:

- `ProTrade.hourlyRate` es **no nulo** para los 18 oficios.
- La «reserva instantánea» (`INSTANT`) **no tiene precio acordado; peor, se
  inventa uno**: `get-job` sirve como «importe» el `maxBudget` que el cliente
  escribió como tope orientativo, y la agenda se lo enseña al profesional como
  lo que va a cobrar.
- `request-urgency` **no guarda la tarifa** que el cliente vio; `Job` no tiene
  campo para ella.
- Los recargos del perfil (sábado, domingo/festivo, noche) y las tres capas de
  festivos (autonómico por CP, `HolidayChoice` fecha a fecha, locales) existen,
  tienen pantalla, y **ningún caso de uso de trabajos los aplica**. El móvil
  además pinta en la ficha de todos una constante propia (`surcharges.ts`:
  domingo +35 %, «recargo de urgencia 25–50 %») en vez de los recargos de cada
  profesional que el servidor ya sirve.
- **Se sale en el directorio con la cuenta activa**, verificada o no; la
  verificación es una insignia, no un filtro.
- `finish-urgency` cierra en `COMPLETED` sin pasar por `IN_PROGRESS` ni
  preguntar al cliente; para el resto de tipos no hay paso de cierre.
- `cancel-job` es **solo del cliente y solo hasta `PENDING_*`**. El profesional
  no puede cancelar nunca; el comentario del código dice que «romper un
  acuerdo tendrá sus condiciones y su pantalla cuando toque».
- El trabajador ve la **dirección exacta en cuanto la empresa le asigna**,
  antes de confirmar (`get-job`: `awardedProId` ya está puesto en
  `PENDING_WORKER`).
- Una empresa no «se registra como empleadora»: alguien se registra como
  profesional y **se hace empleador después**. El empleador **tiene
  `ProProfile`** y puede asignarse trabajos a sí mismo.
- Las valoraciones no se pueden crear desde la API.
- Ningún pago, retención, comisión ni cuenta de cobro en ningún sitio.

---

## §2. Tres modos de cobro

**Por hora.** El cliente conoce el precio unitario y decide la cantidad. Lo
que le falta hoy: parte de horas, y el importe que se le enseña al profesional
es el tope del cliente.

**Tarifa cerrada (carta).** Lista de servicios con nombre, **duración** y
**dos precios: en horario normal y en urgencia**. El de urgencia es nulo si
ese servicio no se ofrece de guardia. El cliente marca uno o varios, la app
suma, y eso es lo que paga entero al reservar. Todos los oficios la admiten
—la v1 la negaba a fontanería y electricidad, y «cambio de grifo» es justo su
catálogo más frecuente. En la tarjeta del directorio sale «desde X €» (el
servicio más barato); en la ficha, la carta entera.

**Visita y presupuesto.** Lo que se cobra por adelantado es ir a ver. Firme,
pública, por oficio. Se descuenta si se acepta el presupuesto. El cero es
válido pero **no es filtro ni orden**: el directorio sigue ordenando por
disponibilidad, distancia y nota.

El oficio fija el modo por defecto y los admisibles; los números los pone el
profesional; al menos un modo por oficio. La tabla de §2 de la v2 se mantiene.

**Los recargos del perfil aplican a `HOURS` y `FIXED_SERVICE`**, calculados por
el servidor con la función de festivos que ya existe (`holidays.use-case`),
que respeta «el 15 de agosto trabajo sin recargo». **No aplican** a la visita,
a la salida de urgencia ni a la hora extra de urgencia: esos precios son
finales (regla del 18 de Agosto, extendida). Un servicio que cruza la franja
nocturna se recarga **por la hora de inicio**: es una regla simple, el cliente
la ve antes de pagar, y el profesional puede poner su hora de corte donde
quiera.

---

## §3. La ruta la elige el cliente, y el profesional puede corregirla

La pregunta al contratar —«¿sabes exactamente lo que hay que hacer, o
prefieres que alguien vaya a verlo primero?»— se mantiene de la v2, vive en
`RequestProPage`, y `PublishPage` se retira.

**La válvula de escape, ahora con su mecánica completa:**

- **Antes de ir**: el profesional responde a un encargo definido con «esto no
  se puede cerrar sin verlo» (`propose-visit`). El `Charge` del servicio se
  **reembolsa**, el `Job` pasa a modo visita con el `visitFee` público, y al
  cliente le llega **un nuevo paso de pago**: acepta la visita (nuevo
  `Charge VISIT`) o cancela sin coste. Plazo: 24 h para el cliente; si calla,
  cancelado y devuelto.
- **Estando allí**: presupuesto adicional. Con autónomo, desde la carta o con
  líneas libres. Con empleado, **solo desde la carta de la empresa y sin ver
  el precio** (S2); lo que no esté en la carta —la obra grande que sale de una
  urgencia— sigue la ruta de presupuesto completa (§5) sobre el mismo `Job`,
  con informe de visita y emisión por el empleador.

---

## §4. La visita

Sin cambios de fondo respecto a la v2 (firme, pública, descontable, cobrada
aunque se rechace, el cero válido pero no premiado, valorable, tasa
visita→aceptación guardada, garantía solo de lo pagado por la app). Lo que se
añade:

- **La visita es una `Appointment`** como cualquier otra: la empresa asigna,
  el trabajador confirma, puede haber sustituto con aprobación del cliente.
- **Plazo para presupuestar tras la visita**: 72 h. Si el profesional no emite
  nada, el `Job` se cierra (`CLOSED`, no `EXPIRED`), la visita **ya está
  cobrada** y cuenta en su tasa. `reassign-job` —que hoy permite encargárselo
  a otro desde `EXPIRED`— **no se aplica** a un trabajo con cobros liberados.
- **Plantón, en los dos sentidos, para todos los tipos de cita** (§6), no solo
  para la visita.
- **Valorar la visita** no espera a `COMPLETED`: una `Review` cuelga de una
  `Appointment` hecha, y el trabajo con presupuesto rechazado tiene su
  valoración igual. Una por cita hecha.

---

## §5. Las entidades

### `Job`, el contrato

Campos que se congelan al contratar: `mode` (`HOURLY` | `FIXED` | `QUOTE` |
`URGENT`), `agreedHourlyRate`, `agreedMinHours`, `agreedVisitFee`,
`agreedCalloutFee`, y las líneas de carta copiadas (`JobServiceLine`). Lo que
el cliente vio es lo que paga, cambie lo que cambie el profesional después.

Estados, **solo de contrato**:

```
PENDING_PRO ─┬─► DECLINED / EXPIRED / CANCELLED
             └─► CONTRACTED ──► QUOTED ⇄ QUOTE_REJECTED ──► CLOSED
                      │            │
                      │            └──(acepta)──► CONTRACTED
                      └─► IN_PROGRESS ──► COMPLETED
                                     └──► DISPUTED ──► COMPLETED / CANCELLED
```

- `CONTRACTED` sustituye a `AWARDED`: hay acuerdo y dinero. Para visita,
  significa «la visita está contratada»; tras aceptar un presupuesto, «el
  arreglo está contratado». Es el mismo estado porque es el mismo hecho.
- `SUBSTITUTE_PROPOSED` y `PENDING_WORKER` **dejan de ser estados del
  trabajo** y pasan a serlo de la cita (`Appointment`). Hoy están en `Job`
  porque solo había una cita por trabajo.
- `QUOTE_REJECTED` no es terminal pero **vence**: 15 días sin reemisión →
  `CLOSED`.
- `DISPUTED` lo abre el cliente sobre cualquier `Charge` no liberado, y lo
  resuelve administración (`resolve-dispute`, en el módulo `admin` que ya
  existe). Mientras, el dinero en disputa se queda; el resto sigue su curso.

### `Appointment`, la cita

`jobId`, `kind` (`VISIT` | `WORK` | `SESSION`), `scheduledAt`, `durationMin`,
`assignedProId`, `status`:

```
PENDING_WORKER ─► SUBSTITUTE_PROPOSED ─► CONFIRMED ─► STARTED ─► DONE
       │                  │                  │
       └─ rechaza ────────┘                  ├─► NO_SHOW_PRO
                                             ├─► NO_SHOW_CLIENT
                                             └─► CANCELLED (por quién, cuándo)
```

- Cada cita pasa por la **confirmación del trabajador** (2 h, como hoy) y la
  **sustitución con aprobación del cliente** (18 Agosto). El sustituto
  aceptado queda `CONFIRMED` directamente, como hoy.
- **La dirección exacta se entrega con `CONFIRMED`**, no antes. Cambia
  `get-job`.
- **`STARTED` suelta `busyWithJobId`… no: lo suelta `DONE`**, que es *Terminar*
  del profesional. El dinero sigue su plazo aparte. Un cerrajero de guardia
  vuelve a estar libre en cuanto termina, no cuando el cliente confirma.
- **Recurrencia** («los martes de 17 a 18»): un `Job` `HOURLY` con N
  `Appointment` `SESSION`, y **un `Charge` por sesión**, cobrado 24 h antes
  de cada una (S1 lo permite: se cobra cerca). Cancelar una sesión no cancela
  el contrato.
- **Antelación mínima de reserva**: 2 h si responde un autónomo; 4 h si
  responde una empresa (tiene que asignar y el trabajador confirmar). El
  plazo de respuesta es `min(24 h, cita − antelación)`.
- **Nadie empieza**: `scheduledAt` + 2 h sin `STARTED` → `expire-overdue`
  marca `NO_SHOW_PRO` salvo que el profesional haya marcado antes
  «cliente ausente» con hora y foto, que es `NO_SHOW_CLIENT`. El cliente puede
  declarar plantón él mismo desde la cita.

### `Charge`, el cobro

`jobId`, `appointmentId?`, `kind`, `amount`, `payerId`, `payeeId` (autónomo o
**`Employer`**, nunca el trabajador por cuenta ajena), `commissionRate` y
`commissionAmount` congelados, `status`, `providerRef`.

**`kind`, lista única**: `VISIT`, `HOURS`, `HOURS_EXTRA`, `FIXED_SERVICE`,
`FIXED_EXTRA`, `QUOTE`, `QUOTE_EXTRA`, `MATERIALS_ADVANCE`, `URGENT_CALLOUT`,
`URGENT_HOURS`, `URGENT_SERVICE` (un servicio de la carta a precio de
urgencia). `CommissionPolicy` tiene una fila por cada uno, con `validFrom`. Los `*_EXTRA`
heredan la tasa de su base. Nacieron a 0 %; **desde el 31 Agosto 2026 van al
10 %**, y con los niveles de §12 la fila pasa a ser por `(kind, nivel)`.

Ciclo (S1), **corregido el 29 Agosto 2026**: entre reservar y cobrar hay un
paso más, y ese paso es dinero.

```
PENDING_ACTION (la tarjeta pide 3D Secure; nada apartado todavía)
     │
     └─► AUTHORIZED (retenido en la tarjeta, sin cobrar)
     │
     ├─► VOIDED    el pro rechaza, expira, o se rompe antes de aceptar → 0 € de coste
     │
     └─► PAID (cobrado, retenido en la plataforma) ─► RELEASED (transferido)
              │                                          ▲
              ├─► REFUNDED                               └── confirmación del
              └─► DISPUTED ─► RELEASED / REFUNDED / PARTIAL      cliente, o silencio 24 h
```

- **Se autoriza al crear el `Job`** (o la cita, en recurrencia) y **se captura
  cuando el profesional acepta**. Si el banco pide autenticación, el cobro
  espera en `PENDING_ACTION` y el `Job` en `DRAFT` hasta que el cliente
  resuelve el reto en la app. Sin dinero puesto no hay contrato. Si
  rechaza o expira, la retención se **anula** (`VOIDED`).
- **Por qué el paso de más.** Un cobro reembolsado no recupera la comisión de
  Stripe —1,5 % + 0,25 € con tarjeta europea, que en un encargo de 77 € son
  1,41 € por cada uno que se cae—;
  cancelar una autorización no cuesta nada. Es lo que la propia documentación
  de Stripe recomienda para esto.
- **Por qué se captura al aceptar y no el día de la cita.** Una autorización de
  tarjeta vive 7 días (5 en Visa si la red la clasifica como iniciada por el
  comercio). El plazo de respuesta son 24 h, así que la captura entra con
  margen; el día de la cita puede caer dos semanas después y la autorización
  ya no existiría.
- `MATERIALS_ADVANCE` **también se retiene** hasta que el profesional marca
  «material comprado» con justificante; se libera entonces. Si cancela antes,
  se devuelve. Es el cobro de más riesgo y en la v2 era el único sin retención.
- **Cuenta de cobro en `Employer`**, no en `ProProfile`: el sujeto fiscal es
  el empleador (NIF/CIF, razón social), y el autónomo sin gente tiene su
  `Employer` propio como hoy ya lo tiene quien se hace empleador. Quien va y
  quien factura pueden ser la misma persona; el modelo lo admite.

### `Quote`, `WorkLog`, `VisitReport`

Como en la v2, con dos precisiones: `Quote.issuedBy` es siempre el `Employer`;
y `WorkLog` cuelga de la `Appointment`, no del `Job`.

---

## §6. Cancelaciones y plantones, una tabla para todo

| Caso | Horas / carta | Visita | Urgencia | Presupuesto aceptado |
|---|---|---|---|---|
| Cliente cancela con antelación | gratis hasta 24 h antes | gratis hasta 4 h antes | — (ya hay alguien de camino) | gratis hasta 48 h antes |
| Cliente cancela tarde | se cobra el mínimo (o el servicio más barato si es carta) | se cobra la visita | se cobra la salida | 10 % del presupuesto, máx. el material ya comprado |
| Cliente cancela a mitad | se cobra lo trabajado redondeado, mínimo el mínimo | — | 1.ª hora | lo hecho según parte, mínimo el material |
| **Profesional cancela** (nuevo: `cancel-by-pro`) | devolución íntegra + marca en ficha | íd. | íd., y se le quita la guardia 24 h | devolución íntegra de lo no hecho + marca |
| Profesional no aparece | devolución + marca | devolución + marca | devolución + marca + guardia fuera | devolución de lo no hecho + marca |
| Cliente no está | se cobra el mínimo | se cobra la visita | se cobra la salida | se cobra la cita como mínimo |

«Marca en ficha» es un contador visible de cancelaciones y plantones del
profesional en los últimos 12 meses. «Guardia fuera» apaga `availableNow` y
exige volver a encenderlo.

**Precisión pedida por Robin, 23 Ago 2026: «Profesional cancela» también es
el trabajador, después de haber confirmado.** El recorrido de confirmación
de ROADMAP.md («El trabajador confirma el trabajo») ya cubre que pueda
decir que no **antes** de aceptar; lo que faltaba decir es que la misma
puerta sigue abierta **después**, si le surge un imprevisto de fuerza
mayor una vez que ya había dicho que sí. No es un mecanismo nuevo: es
`cancel-by-pro` sobre un trabajo ya confirmado, y tiene que enrutarse
igual que el rechazo inicial —con empresa, vuelve al empleador para que
mande a otro por la vía de sustitución que ya existe; sin empresa, un
autónomo, vuelve al cliente y el trabajo queda libre—. El motivo tampoco
se le enseña al cliente aquí, por el mismo criterio que en la confirmación:
una baja médica es asunto de quien la tiene.

Y del lado del cliente: **puede rechazar lo contratado mientras no haya
empezado**, que es justo la fila «Cliente cancela con antelación / tarde»
de la tabla de arriba —antes de que haya nada que deshacer, no a mitad de
trabajo—.

**El plazo, en los dos sentidos, no se fija aquí.** Los números de esta
tabla —24 h, 4 h, 48 h— son la propuesta que ya recogía §10, no una
decisión cerrada: cuánto margen cuenta como «a tiempo» para rechazar,
tanto para el cliente como para el trabajador, se valora al escribir los
términos y condiciones, con asesoría, no en este documento.

---

## §7. Las empresas

Se mantiene la v2 (la visita es una cita, el trabajador describe y no valora,
el dinero va a la empresa), con lo que la revisión obligó a precisar:

- Un empleador puede ir él mismo; entonces es asignado y emisor a la vez.
- El trabajador añade líneas de la carta sin precio (S2).
- La dirección, con `CONFIRMED`.
- **La cuenta de cobro es del `Employer`**; sin ella, la empresa y **todos sus
  trabajadores** se quedan sin poder ser contratados (ver §9, despliegue).

---

## §8. Las urgencias

**Dos vías, según se sepa o no lo que hay que hacer** (añadido el 21 de
Agosto por la noche):

1. **Alcance conocido** —abrir una puerta, cambiar una rueda, desatascar—: el
   cliente elige de la carta **al precio de urgencia** del profesional, y paga
   eso. Cerrado, sin parte de horas. En `UrgencyProsPage` la tarjeta de Tomás
   dice «Apertura de puerta · 110 € · a 3 km», no «salida + €/h».
2. **Alcance desconocido** —una fuga, un olor a quemado—: salida cerrada con
   primera hora incluida, después €/h con parte.

Un profesional puede ofrecer las dos cosas o solo una: `ServiceItem.
urgencyPrice` nulo = ese servicio no se da de guardia; `urgencyCalloutFee`
nulo = no sale a lo desconocido. El listado de urgencias filtra según lo que
el cliente eligió. Los dos precios son **finales**, sin recargos encima
(regla del 18 de Agosto). Con empresa, la carta de urgencia la pone el
empleador en `ServiceItem` —un dato por empresa—; la franja `UrgencyWindow`
sigue diciendo *cuándo* y la salida/€/h de quien no elige carta.

Si eligió «apertura» y la cerradura resulta rota, el presupuesto adicional de
la carta (S2 para empleados) sigue igual: «cambio de bombín 150 €» que el
cliente acepta con la puerta delante. Consecuencia: en los oficios de
urgencia real el cliente ve un número cerrado casi siempre; la salida + €/h
queda para el caso raro.

Lo demás de la v3:

- **El cobro se hace al aceptar, no al pedir.** El cliente guarda el método de
  pago al pedir (una vez); el `Charge URGENT_CALLOUT` se crea cuando alguien
  acepta. Evita tres pasos por la pasarela a las 2:30 y la autorización
  huérfana cuando nadie acepta.
- `accept-urgency` **revalida** la franja y `availableNow` en ese instante y
  congela `agreedCalloutFee` y `agreedHourlyRate` en el `Job`. «Empieza la
  urgencia», a efectos de franja, **al pedirla**: es lo que vio el cliente.
- La urgencia que se vuelve obra grande (la fuga taponada que necesita
  reparación): el mismo `Job` pasa a `QUOTED` con la ruta de §5, con informe
  de visita si es empleado.

---

## §9. En qué orden, y el despliegue

1. **Cobros**: `Charge`, `CommissionPolicy`, `Employer.stripeAccountId`,
   Stripe Connect, cobro/retención/liberación/reembolso, webhooks. Y
   `resolve-dispute` en admin.
2. **`Appointment`** extraída de `Job`, migrando `PENDING_WORKER` y
   `SUBSTITUTE_PROPOSED`. Todo lo que hoy funciona (asignar, confirmar,
   sustituir, 2 h, 5 min, dirección, `busyWithJobId`) se conserva, solo cambia
   de tabla. Es la fase sin cambio visible y la más delicada.
3. **Los modos en el perfil y la visita entera**, juntos.
4. **Urgencias** con salida cerrada, cobro al aceptar y `WorkLog`.
5. **Por hora** con parte, mínimo y recurrencia.
6. **La carta**.
7. **Se retira la subasta**.

**Despliegue de la cuenta de cobro**: exigirla de golpe vacía el directorio.
Periodo de gracia de 30 días en que **se sale pero no se puede contratar**
(la ficha lo dice: «aún no acepta reservas por la app»), como hoy hace la
regla del NIF para pujar. Migración de los `Job` vivos: los `INSTANT`/`QUOTE`
sin `agreed*` ni `Charge` se cierran con aviso a las dos partes cuando entre
el código nuevo; no se intenta cobrarlos retroactivamente.

**Corregir de paso**: `surcharges.ts` (la ficha lee los recargos del
profesional), el ROADMAP («30 minutos» de urgencia y «+35 %» de domingo están
desfasados; `usePriceQuote` de la Fase 7 se sustituye por cálculo del
servidor).

---

## §10. Lo que sigue sin decidir

- **Si el presupuesto aceptado se comisiona.** Preparado a 0.
- **S1 y S2**, si no convencen.
- **Los números** de §6: son propuesta, no estructura.
- **Desistimiento e IVA**: con asesor, antes de escribir el texto del cobro.
- **Fase 10 (hitos)**: un presupuesto grande debería partirse en `Charge`s por
  hito. El modelo lo admite (`Charge.appointmentId` opcional, varios por
  `Job`); el diseño de hitos no se hace aquí.

---

## §11. Favoritos del cliente (pedido por Robin, 23 Ago 2026 — sin diseñar)

Cuando un profesional hace bien un trabajo, el cliente debería poder
guardarlo para la próxima vez sin tener que volver a buscarlo entre todos
los del oficio: marcarlo como favorito y tener una lista propia desde la
que contratar directamente, en vez de repasar el directorio entero cada
vez que hace falta el mismo oficio.

No se ha diseñado todavía —ni la tabla, ni el endpoint, ni dónde vive el
botón en la tarjeta del directorio, en la ficha y en la lista de
favoritos—. Es cliente-profesional, uno a uno, y no depende de que exista
`Job`/`Appointment` en curso ni de en qué punto esté el resto de §9: se
puede construir en paralelo, no bloquea ni le bloquea nada a lo demás.

---

## §12. La comisión, y los niveles (decidido por Robin, 31 Ago 2026)

**El 10 % se cobra ya.** Lo que sigue en propuesta es la escalera.

### 12.1. Lo que no hay que construir

Casi nada. El mecanismo se hizo entero cuando se construyeron los pagos:

- `CommissionPolicy` existe, con una fila por `ChargeKind` y su `rate` en
  decimal —10 son diez por ciento—.
- `CreateChargeUseCase` **congela** `commissionRate` y `commissionAmount` al
  crear cada cobro, con la política vigente en ese instante.
- `ReleaseChargeUseCase` transfiere `importe − comisión` al `Employer`.

Así que **pasar de 0 % a 10 % es actualizar filas, no tocar código**. Y una cosa
que ya funciona y que resulta ser justo lo que los niveles necesitan: como la
comisión se congela **al crear cada cobro**, y en un contrato fijo hay un cobro
por sesión (§F3), un profesional que suba de nivel lo nota **en su siguiente
sesión**, también en los contratos que ya tiene firmados. No hay que esperar a
que se renueve nada.

### 12.2. A quién se le cobra

Al `Employer`, que es el `payee` del cobro. Un trabajador por cuenta ajena no
paga comisión: la paga la empresa que le da de alta. Un autónomo tiene su propio
`Employer` y es él.

Por eso **el nivel es del `Employer`, no de la persona**. Una empresa con cinco
trabajadores acumula volumen cinco veces más rápido y llegará arriba enseguida;
es un descuento por volumen y es lo normal, pero conviene saberlo antes de fijar
los umbrales, no después.

### 12.3. Un porcentaje puro no puede tener suelo

Esto es lo primero, porque cambia la forma de la comisión y no solo el número.

Stripe cobra **1,5 % + 0,25 € fijos**. Ese fijo no depende del importe, así que
con una comisión que sea solo un porcentaje **siempre existe un importe por
debajo del cual se pierde dinero**, por alto que se ponga el porcentaje:

| Comisión | Se pierde dinero por debajo de |
|---|---|
| 10 % | 2,94 € |
| 6 % | 5,56 € |
| 5 % | 7,14 € |
| 4 % | 10,00 € |
| 3 % | 16,67 € |
| 2 % | 50,00 € |

Al 3 %, una clase de una hora a 14 € **deja 4 céntimos de pérdida**. Y no vale
con poner un mínimo en euros —`max(4 %, 1 €)`—, porque eso no quita el problema,
lo mueve: el punto peor deja de ser el importe más pequeño y pasa a ser **el
cruce**, justo donde el porcentaje alcanza al mínimo.

| Regla | El cruce cae en | Y ahí el neto baja a |
|---|---|---|
| `max(5 %, 0,75 €)` | 15,00 € | 0,28 € |
| `max(5 %, 1,00 €)` | 20,00 € | 0,45 € |
| `max(4 %, 1,00 €)` | 25,00 € | 0,38 € |

Funciona, pero es una regla con un agujero en medio que hay que ir tapando a
mano cada vez que se toca un número.

### 12.4. La forma: porcentaje **más** fijo

**`comisión = porcentaje × importe + 0,40 €`**

Es la misma forma con la que cobra Stripe, y por eso es la única que no se
rompe: el fijo cubre el fijo y el porcentaje cubre el porcentaje.

```
neto = importe × (comisión% − 1,5 %) + (0,40 € − 0,25 €)
```

Mientras el porcentaje pase del 1,5 %, **el neto nunca es negativo y crece con
el importe, sin ningún punto malo en medio**. El suelo absoluto son 15 céntimos,
que es lo que queda aunque el cobro sea de un euro.

### 12.4b. La escalera, con los números

| Nivel | Cómo se llega | Comisión |
|---|---|---|
| **Obrera** | al darse de alta | 10 % + 0,40 € |
| **Forrajera** | 1.000 € facturados en 90 días | 8 % + 0,40 € |
| **Soldado** | 3.000 € en 90 días | 6 % + 0,40 € |
| **Reina** | 6.000 € en 90 días | **4 % + 0,40 €** |

**Los nombres son las castas de un hormiguero** (decisión de Robin, 31 Ago
2026), y no son adorno: cada una dice qué es ese profesional para la colonia.

- **Obrera** — la casta más numerosa del hormiguero. Construye, cuida y sale a
  cazar. Es por donde se empieza y donde está casi todo el mundo.
- **Forrajera** — la obrera grande que sale a buscar comida y, cuando encuentra
  un buen sitio, **vuelve y deja un rastro para que las demás lo sigan**. Es
  literalmente lo que hace un profesional que trae volumen a la plataforma, y
  por eso es el primer escalón: el que empieza a traer.
- **Soldado** — cuerpo más robusto y mandíbulas más grandes; sostiene y defiende
  la colonia. El que ya es parte de la estructura.
- **Reina** — de la que depende el hormiguero, y la que vive treinta años cuando
  una obrera vive meses. La longevidad es el punto: este nivel se gana con
  volumen sostenido, no con un buen trimestre.

Fuera quedan a propósito los **zánganos**, que son los machos: no trabajan, solo
se aparean y mueren. No hay nivel para eso.

Si algún día hicieran falta más escalones, las obreras se subdividen por tamaño
y tarea —**nodrizas** las pequeñas, que cuidan a la reina y las crías; las
medianas reparan y amplían el nido—, así que hay nombres de sobra sin salirse
del hormiguero.

**El nivel más alto —Reina— es el 4 % + 0,40 €**, y ese es el número que pedía
fijarse.
No pierde a ningún importe, y lo que deja:

| Cobro | Se le cobra | Le queda a Lughly |
|---|---|---|
| 14 € (1 h) | 0,96 € | **0,50 €** |
| 28 € (2 h) | 1,52 € | 0,85 € |
| 42 € (3 h) | 2,08 € | 1,20 € |
| 84 € (6 h) | 3,76 € | 2,25 € |
| 150 € | 6,40 € | 3,90 € |

Y en Obrera, para comparar: un cobro de 42 € deja 3,72 € en vez de 1,20 €.

**Por qué el 4 % y no el 5 %**: al 5 % la sesión de una hora dejaría 0,64 € en
vez de 0,50 €, catorce céntimos más. No compensa: el nivel más alto es el que
compra la lealtad del profesional que más factura y más motivos tiene para
irse, y ahí un punto de comisión vale más como argumento que como margen. Por
debajo del 4 % sí que dejaría de tener sentido: al 3 % + 0,40 € una sesión de
42 € deja 0,78 €, y ya no paga el trabajo de sostener la plataforma.

**Lo que se le enseña al profesional es la tasa efectiva**, no la fórmula: en
Reina, del 6,9 % en un cobro de 14 € al 4,3 % en uno de 150 €. Un fijo de
0,40 € pesa más cuanto más pequeño es el cobro, y eso hay que decirlo en la
pantalla de 12.6 en vez de que lo descubra al ver la transferencia.

### 12.4c. Lo que este suelo **no** cubre

Que cada cobro deje margen no es lo mismo que ganar dinero con cada
profesional, y conviene no confundirlo antes de dar el número por bueno:

- **Coste mensual por cuenta de Connect.** Si Stripe cobra una cuota por cuenta
  Express activa, un profesional que haga dos trabajos al mes deja 1 € y puede
  no cubrirla. **Hay que mirarlo en el contrato real de Stripe antes de fijar
  esto**; no está comprobado aquí.
- **Impagados y reclamaciones.** Una reclamación de tarjeta en Europa ronda los
  15 € de penalización. A 0,50 € por cobro, una se lleva por delante treinta.
- **Los reembolsos no devuelven la comisión de Stripe** (§5). Es lo que ya
  justificó retener en vez de cobrar, y sigue valiendo.

Ninguna de las tres se arregla con el porcentaje. Las dos primeras se arreglan
con volumen, que es justo lo que la escalera persigue.

### 12.5. Por qué al que más factura se le cobra menos

Es al revés que en casi todo, y merece la pena decir el motivo en voz alta:
**el profesional con más volumen es el que más incentivo tiene para llevarse a
sus clientes fuera de la plataforma.** A ese es a quien hay que comprarle la
lealtad. Un autónomo con dos trabajos al mes no se va a montar su propio sistema
de cobros; uno que factura 6.000 € al trimestre, sí.

Lo que cuesta, sobre el contrato fijo de Lucía (546 €/mes):

| Nivel | Comisión de las 13 sesiones | Menos Stripe | Neto para Lughly |
|---|---|---|---|
| Obrera 10 % + 0,40 € | 59,80 € | 11,44 € | 48,36 €/mes |
| Forrajera 8 % + 0,40 € | 48,88 € | 11,44 € | 37,44 €/mes |
| Soldado 6 % + 0,40 € | 37,96 € | 11,44 € | 26,52 €/mes |
| Reina 4 % + 0,40 € | 27,04 € | 11,44 € | 15,60 €/mes |

Una Reina deja 15,60 € al mes por contrato en vez de 48,36 €. Ese es el precio
de que no se vaya, y solo lo paga quien ya trae mucho.

**Y engancha con §F**: un contrato fijo son 546 € al mes de volumen constante,
así que **dos contratos fijos son el camino más rápido y más estable para subir
de nivel**. La escalera hace que el profesional quiera contratos recurrentes, que
es justo la función que se está construyendo. No es casualidad buscada, pero
conviene no romperla.

### 12.6. Que se vea

Un descuento que nadie sabe que existe no incentiva nada. Hace falta, en «Mi
cuenta»: el nivel actual, lo facturado en los últimos 90 días, **cuánto falta
para el siguiente**, y qué comisión se está pagando ahora. Sin esa pantalla, la
escalera es solo una línea en una tabla de precios.

### 12.7. Lo que sí hay que construir

| Pieza | Cambio |
|---|---|
| `CommissionLevel` | **nuevo** enum: `WORKER`, `FORAGER`, `SOLDIER`, `QUEEN`. En inglés como el resto de enums del esquema —`JobStatus`, `AppointmentStatus`—; el nombre que se lee (Obrera, Forrajera, Soldado, Reina) lo pone el móvil, que es donde vive el idioma |
| `Employer` | + `commissionLevel` (por defecto `BASE`), + `levelReviewedAt` |
| `CommissionPolicy` | la clave única pasa de `kind` a **`(kind, level)`**: cuatro filas por tipo de cobro en vez de una. Y **`fixedFee Decimal`** además de `rate`, que es lo que hace que el suelo exista (12.4) |
| `CreateChargeUseCase` | busca la política por `(kind, nivel del payee)` en vez de solo por `kind`, y calcula `rate × importe + fixedFee` en vez de solo el porcentaje. **Es el único punto del código que cambia** |
| `review-commission-levels` | nuevo paso mensual: suma lo liberado en 90 días por `Employer`, aplica umbrales y la traba por plantones, avisa de subidas y bajadas |
| `MyAccountPage` | el bloque de 12.6 |

### 12.8. Lo que queda por decidir

- **Los umbrales**: son propuesta, calibrada sobre 14 €/h. Un oficio caro los
  cruza sin esfuerzo y uno barato no llega nunca; puede que tengan que ir por
  oficio, pero eso es complicarlo antes de tener datos.
- **Si el volumen se mide por `Employer` o por trabajador activo.** Por
  `Employer` favorece a las empresas (12.2). Por trabajador es más justo con el
  autónomo y más difícil de explicar.
- **El coste mensual por cuenta de Connect** (12.4c). Es lo único que puede
  hacer que un profesional de poco volumen no salga rentable por mucho suelo por
  cobro que haya. Hay que mirarlo en el contrato real antes de dar 12.4 por
  cerrado.
- **Si los niveles aplican a todos los `ChargeKind` o solo a los de trabajo.**
  Un `MATERIALS_ADVANCE` no es margen del profesional; comisionarlo al mismo
  porcentaje que su trabajo es discutible.

---
