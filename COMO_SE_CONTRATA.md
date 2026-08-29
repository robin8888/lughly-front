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
   rehacer nada.
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
urgencia). `CommissionPolicy` tiene una fila por cada uno, a 0 %, con
`validFrom`. Los `*_EXTRA` heredan la tasa de su base.

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
  1,41 € por cada uno que se cae, con la comisión de plataforma al 0 %—;
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
