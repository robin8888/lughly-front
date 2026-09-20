# Lughly — cómo funciona, para revisión jurídica

**Fecha: 20 de septiembre de 2026.** Este documento describe lo que la
aplicación **hace hoy**, no lo que se pensó hacer ni lo que se hará. Está
escrito para que un abogado pueda redactar o revisar los Términos y
Condiciones, la política de privacidad y el análisis de responsabilidad, sin
tener que leer código.

Cuando algo no está construido, se dice. Cuando algo es una decisión de negocio
del titular y no una restricción técnica, también.

Al final hay dos apartados que conviene leer los primeros si el tiempo es poco:
**§11, lo que Lughly no hace** —es el núcleo del análisis de
responsabilidad— y **§13, los huecos jurídicos conocidos**.

---

## §1. Qué es Lughly

Una aplicación móvil que **pone en contacto** a particulares que necesitan un
trabajo (fontanería, limpieza, cerrajería, clases, cuidados…) con profesionales
que lo ofrecen, y que **cobra por la app** el precio de ese trabajo, quedándose
una comisión.

Dos cosas que conviene fijar desde el principio porque condicionan todo el
análisis:

1. **El contrato de servicio es entre el cliente y el profesional.** Lughly no
   presta el servicio, no lo ejecuta, no lo supervisa y no tiene empleados que
   lo hagan.
2. **Pero el dinero pasa por Lughly.** No es un mero tablón de anuncios: el
   cobro se hace a nombre de la plataforma y después se transfiere al
   profesional menos la comisión (ver §6). Esto es lo que más pesa a la hora de
   decidir si una plataforma es «mera intermediaria».

### Los cuatro papeles

| Papel | Qué es | Cómo nace |
|---|---|---|
| **Cliente** | Quien contrata. Se presume consumidor. | Registro normal. |
| **Profesional** | Quien hace el trabajo. Puede ser autónomo o trabajador por cuenta ajena de una empresa dada de alta en la app. | Registro con rol profesional. |
| **Empleador** (`Employer`) | La unidad **que cobra**: un autónomo es su propio empleador; una empresa tiene varios trabajadores a su cargo. Es quien tiene la cuenta bancaria y el NIF/CIF. | Se crea al completar los datos fiscales. |
| **Administración** | El equipo de Lughly. Revisa documentos, resuelve reclamaciones y puede suspender cuentas. | Cuenta interna. |

Un trabajador por cuenta ajena **nunca cobra directamente**: el dinero va a su
empleador. La empresa, al dar de alta a alguien, **acepta expresamente responder
de las personas que incorpora**, y se guarda la fecha y hora de esa aceptación.

---

## §2. El alta, y qué se comprueba de verdad

### Qué se pide a todo el mundo

Correo electrónico (verificado por enlace, con 24 h de validez), contraseña,
nombre, y **aceptación de los Términos**, que hoy es una casilla obligatoria sin
documento detrás: se guarda la fecha y la hora de la aceptación
(`termsAcceptedAt`). La aceptación de comunicaciones comerciales es **separada y
opcional** (`marketingOptIn`).

Se guardan además, según el uso: teléfono, dirección, código postal y
coordenadas (para calcular distancias y llegar al domicilio), foto de perfil,
fotos del trabajo, conversaciones y documentos.

### Qué se comprueba de un profesional

- **Identidad**: sube DNI/NIE (anverso y reverso) o pasaporte. Lo revisa una
  persona de administración y queda `APPROVED` o `REJECTED`. Hasta entonces la
  cuenta funciona, pero sin verificar.
- **Datos fiscales**: forma jurídica, NIF o CIF (único en toda la plataforma) y
  razón social o nombre.
- **Cuenta de cobro**: se abre a través de Stripe Connect, que hace su propia
  verificación (KYC). **Sin ella no se puede aceptar ningún trabajo**: el
  profesional aparece en el directorio pero nadie puede contratarle.
- **Habilitación profesional**: se puede subir y administración la aprueba
  (`licenseVerifiedAt`). Tres oficios están marcados como **regulados** en la
  base de datos —fontanería, electricidad y climatización—.

> ⚠️ **Punto para el abogado.** Hoy la marca de «oficio regulado» **no bloquea
> nada**: un profesional puede ofrecer fontanería o electricidad sin haber
> subido ninguna habilitación. La app enseña si está verificada, pero no lo
> exige. Es una decisión pendiente y tiene consecuencias de responsabilidad
> (§11).

### Lo que **no** se comprueba en absoluto

- **La edad.** No se pide fecha de nacimiento ni hay declaración de mayoría de
  edad.
- **Antecedentes penales**, ni siquiera en los oficios que entran en domicilios
  o cuidan de niños y mayores (`cuidados`, `domiciliario`, `clases`).
- **Seguro de responsabilidad civil.** No se pide, no se guarda y no se enseña.
- **La veracidad de la experiencia, las fotos de trabajo o la descripción.**

---

## §3. Los oficios y quién pone los precios

Hay 19 oficios cerrados por catálogo. El profesional elige los suyos y, **en
cada uno, sus propias tarifas**. Lughly no fija, sugiere ni tope ningún precio.

Cada oficio suyo se configura con **una de dos formas de cobrar, que son
excluyentes**:

- **Por horas** (`hourlyRate` + mínimo de horas): vende ratos de su agenda. A
  quien cobra por horas **no se le puede pedir presupuesto**.
- **Tarifa de visita** (`visitFee`): cobra por desplazarse a ver el problema
  antes de dar un precio. Quien la tiene es quien da presupuestos.

Y, opcionalmente:

- **Carta de servicios**: lista de servicios con nombre, duración y **dos
  precios**, el normal y el de urgencia.
- **Urgencias**: tarifa de salida y precio por hora fuera de horario.
- **Recargos** que él mismo configura: sábado, domingo y noche.

---

## §4. Las cuatro formas de contratar

Todas empiezan igual: el cliente elige a **un profesional concreto** del
directorio. No hay subasta, ni asignación automática, ni «el más cercano».

### A. Por horas

1. El cliente elige día, hora y cuántas horas. El servidor calcula el precio
   —tarifa × horas, con el mínimo y los recargos del profesional— y se lo enseña
   desglosado antes de confirmar.
2. Al confirmar, **se retiene** el importe en su tarjeta. El hueco queda
   apartado para que nadie más lo reserve.
3. El profesional tiene **24 horas** para aceptar. Si acepta, se cobra; si
   rechaza o no contesta, la retención se suelta y el cliente no paga nada.
4. El día señalado, el profesional pulsa «He llegado» (desde 10 minutos antes de
   la hora, no antes) y al acabar «He terminado».
5. Si se ha pasado del rato reservado, **puede ofrecer cobrar el exceso**, por
   cuartos de hora completos y con la cifra calculada. Lo decide él; la app no
   lo cobra sola.
6. El cliente tiene **24 horas** para dar el trabajo por bueno o poner un
   reparo. Si calla, se da por bueno y **el dinero sale hacia el profesional**.

### B. Tarifa cerrada (carta de servicios)

Igual que la anterior, pero el cliente marca servicios de una lista y el precio
es la suma. Se cobra entero al contratar y se retiene hasta el visto bueno.

### C. Visita y presupuesto

1. El cliente pide que vaya a verlo. **Se cobra la visita** (la tarifa que el
   profesional tenga puesta), retenida primero y cobrada cuando él acepta.
2. El profesional va, y al terminar la visita el trabajo **queda cerrado y
   cobrado**. La visita no se devuelve aunque el presupuesto no convenza: el
   viaje se hizo.
3. **El presupuesto del arreglo no pasa por la app.** Se lo manda al cliente
   como un documento por el chat, y lo que acuerden —y el pago del arreglo— es
   **entre ellos, fuera de la plataforma**. El chat se mantiene abierto 15 días
   para que pueda llegar.

> Esto último es una **decisión de negocio del titular, del 12 y el 20 de
> septiembre de 2026**, tomada expresamente para reducir el riesgo de
> *chargebacks* sobre importes altos y la exposición de la plataforma. Antes,
> el arreglo se cobraba por la app.

### D. Urgencia

1. El cliente describe la urgencia y la app le enseña quién está disponible
   **ahora**, con su tarifa de salida.
2. Al elegir, se retiene la salida y el profesional tiene **5 minutos** para
   contestar.
3. Se cobra la salida (que incluye la primera hora) y el exceso por bloques de
   15 minutos, redondeando hacia arriba.

### E. Contrato fijo (recurrente)

Para limpieza y similares: el cliente contrata unos días fijos a la semana
durante meses. **El dinero va por sesión**: el importe de cada día se retiene
**24 horas antes** de esa sesión, no por adelantado. Si la tarjeta falla tres
veces seguidas, el contrato se corta.

---

## §5. Plazos, todos juntos

| Qué | Cuánto | Qué pasa si vence |
|---|---|---|
| Responder a un encargo | 24 h | El encargo caduca; no se cobra nada |
| Responder a una urgencia | 5 min | Se suelta la retención; el cliente elige a otro |
| Confirmación del trabajador (empresa) | 2 h | Se puede reasignar a otro |
| Dar el trabajo por bueno | 24 h desde «he terminado» | Se da por bueno solo y se paga |
| Empezar a su hora | 15 min de margen | Se avisa a los dos; 10 min para acordar otra hora o el trabajo se cae |
| Contestar a un reparo | 72 h | Se abre la revisión interna |
| Revisión interna | 15 días | Lo retenido vuelve al cliente |
| Presupuesto tras la visita | 15 días de chat abierto | El chat se cierra; nada más |
| Retención de una sesión de contrato fijo | 24 h antes | — |
| Verificación de correo | 24 h | Hay que pedir otro enlace |
| Revisión del nivel de comisión | cada mes, sobre 90 días | — |

---

## §6. El dinero: cómo se cobra exactamente

**Pasarela: Stripe.** La configuración es *separate charges and transfers*, y
esto es lo jurídicamente relevante:

- **El cargo nace en la cuenta de Lughly**, no en la del profesional. A efectos
  de la pasarela, Lughly es quien cobra.
- Después se **transfiere** al empleador del profesional el importe menos la
  comisión.
- **Consecuencia directa**: si el cliente discute el cargo con su banco
  (*chargeback*), **el dinero sale del saldo de Lughly**, no del profesional. La
  plataforma se lo tendría que reclamar a él por su cuenta. Es el motivo por el
  que el presupuesto salió de la app.

### Los cuatro estados del dinero

1. **Retenido** (autorizado, sin cobrar): el cliente ve una retención en su
   tarjeta; soltarla no cuesta nada ni deja rastro en su extracto.
2. **Cobrado** (capturado): el dinero está en la cuenta de Lughly. Devolverlo ya
   cuesta la comisión de la pasarela.
3. **Liberado**: transferido al empleador. **Solo ocurre cuando el trabajo se da
   por bueno** (por el cliente o por silencio a las 24 h).
4. **Devuelto** o **anulado**.

Entre «cobrado» y «liberado» el dinero está **en poder de Lughly**. Ese es el
periodo en el que se resuelven los reparos y las reclamaciones.

### La comisión

Se queda de cada cobro y **se congela en el momento de cobrar**: cambiar la
comisión después no altera cobros ya hechos.

| Nivel | Del trabajo | De la visita y la salida | Cómo se llega |
|---|---|---|---|
| Obrera | 10 % + 0,40 € | 15 % + 0,40 € | De partida |
| Forrajera | 8 % + 0,40 € | 13 % + 0,40 € | 1.000 € liberados en 90 días |
| Soldado | 6 % + 0,40 € | 11 % + 0,40 € | 3.000 € |
| Reina | 4 % + 0,40 € | 9 % + 0,40 € | 6.000 € |

**Dos escalas desde el 20 de septiembre de 2026.** La visita para presupuesto y
la salida de urgencia llevan cinco puntos más porque no son trabajo del
profesional: son el servicio que presta la propia plataforma —encontrarle a
alguien que se desplace, y encontrárselo de madrugada—. Las horas trabajadas de
una urgencia (`URGENT_HOURS`) se quedan en la escala normal por lo mismo, al
revés: eso sí es su trabajo.

Se revisa el día 1 de cada mes sobre los 90 días anteriores, y **un plantón
frena la subida**. El fijo de 0,40 € existe porque la pasarela cobra un fijo por
operación.

**El IVA va dentro del precio.** Las tarifas son finales: de 42 € al 21 % salen
34,71 de base y 7,29 de impuesto, y el cliente paga 42 €. Cada profesional
declara su tipo —21 %, 10 % o exento con el motivo— en sus datos fiscales, y la
ficha lo desglosa. **No hay facturación todavía** (§13).

**Se le dice al profesional, y solo a él.** La ficha de cada trabajo le enseña
lo que va a recibir y lo que se queda Lughly, y tiene además la pantalla de su
nivel con las dos escalas. La cifra sale de la **comisión congelada en cada
cobro**, no de la tarifa vigente.

**Al cliente no se le enseña**, y es una decisión expresa del titular: él paga
un precio cerrado, no compra un desglose del negocio de la plataforma. El
servidor no se lo manda siquiera.

> ⚠️ **Punto para el abogado.** La comisión se le descuenta al profesional de lo
> que cobra. **No se emite factura de la comisión** hoy, ni hay identificación
> fiscal de Lughly en ninguna pantalla, ni se dice si los precios llevan IVA
> (§13).

---

## §7. Cancelaciones y penalizaciones

Construido el 20 de septiembre de 2026. **El cliente puede cancelar** un trabajo
ya contratado, y el profesional también; los dos deben escribir un motivo, que
se guarda y se le manda al otro.

| Ciclo | Gratis si avisa con | Si avisa más tarde se le cobra |
|---|---|---|
| Por horas | más de 24 h | el mínimo del profesional |
| Carta | más de 24 h | el servicio más barato de los contratados |
| Visita | más de 4 h | la visita entera |
| Urgencia | *nunca es gratis* | la salida |

**La penalización es del profesional, no de la plataforma**: se le transfiere
entera (menos su comisión habitual). Si por lo que sea no se le puede
transferir, **se le devuelve al cliente**; la plataforma no se queda con ella.

**Si el que cancela es el profesional**, la devolución al cliente es íntegra
aunque falten dos horas, y le queda anotado internamente. Ese contador **todavía
no se enseña en ninguna pantalla**.

---

## §8. Qué pasa cuando algo sale mal

Este es el apartado que más cerca está de ser una cláusula contractual, y por
eso **no se puede aplicar a clientes reales hasta que existan los Términos**.

1. **El reparo.** Dentro de sus 24 horas, el cliente dice que algo no ha quedado
   bien, con un motivo escrito. El pago se congela: no se libera por silencio.
2. **La respuesta del profesional**, en 72 horas: puede **volver y arreglarlo**
   —y entonces el cliente recupera sus 24 horas— o decir que no está de acuerdo.
3. **La revisión interna**, que pueden pedir los dos. Dura **15 días como
   máximo**, y ese plazo se eligió por el **art. 21.2 TRLGDCU** (un mes máximo
   para contestar una reclamación).
4. **Las pruebas**: cada parte puede aportar hasta ocho imágenes con su fecha
   —la del servidor, no la del móvil—. Las ven los dos. No hay forma de
   borrarlas.
5. **La decisión** la toma administración y **solo puede recaer sobre el dinero
   retenido**: pagar al profesional, devolver al cliente, o repartir (rebaja de
   precio). Se exige motivo escrito.
6. **Si vencen los 15 días sin decisión, lo retenido vuelve al cliente.**

Dos límites que ya están escritos en la app:

- **No es un arbitraje ni un laudo.** La pantalla dice expresamente que las dos
  partes conservan sus derechos como consumidor y la vía judicial.
- **Solo existe donde hay dinero nuestro.** En un presupuesto —que se paga
  fuera— no hay revisión: al cliente se le dice que le quedan reclamar al
  profesional, consumo o el juzgado.

---

## §9. Reputación y datos que se publican

- **Valoración**: una por trabajo terminado, del cliente al profesional. Nota de
  1 a 5, comentario opcional y ocho criterios detallados opcionales. Se publica
  con el nombre abreviado del autor («Miguel A.»), y **sobrevive a la baja del
  autor** quedando anónima.
- **Contadores públicos**: nota media, número de valoraciones y trabajos
  terminados.
- **El profesional no valora al cliente.** No hay reputación del cliente.
- **No hay derecho de réplica**: el profesional no puede responder públicamente
  a una valoración, ni pedir su retirada desde la app.

> ⚠️ **Punto para el abogado.** Valoraciones públicas de personas
> identificables: procede revisar el régimen de reseñas (Directiva Ómnibus,
> transpuesta en el art. 20.4 y 97 TRLGDCU: hay que informar de si se comprueba
> que provienen de consumidores reales — aquí **sí**, cada valoración cuelga de
> un trabajo pagado, y conviene decirlo porque es un punto fuerte) y el
> procedimiento de retirada de un comentario injurioso.

---

## §10. Comunicación entre las partes

- **Chat** uno a uno, con adjuntos (imagen, vídeo o PDF, hasta 30 MB).
- Se puede escribir **mientras haya un encargo vivo entre esas dos personas, o
  dinero sin liquidar**, más el plazo de 15 días de la visita. Después el hilo
  queda **de solo lectura**: no se borra, pero no admite mensajes nuevos.
- **Avisos push** de todo lo que tiene plazo.
- Hay un canal de **soporte** con administración.

> Los mensajes se conservan sin límite y son legibles por administración cuando
> hay una reclamación. Esto hay que declararlo en la política de privacidad.

---

## §11. Lo que Lughly **no** hace — el núcleo del análisis

Esto es lo que sostiene cualquier limitación de responsabilidad, y conviene
comprobar que sigue siendo cierto cada vez que se toque el producto.

**Lughly no:**

1. **No presta el servicio ni tiene empleados que lo presten.** Quien va a la
   casa es el profesional o el trabajador de su empresa, con su propia relación
   laboral con ella.
2. **No fija los precios.** Los pone cada profesional, incluidos recargos y
   mínimos. Lughly solo calcula la suma y cobra su comisión.
3. **No elige al profesional.** Lo elige el cliente del directorio. No hay
   asignación automática, ni reparto, ni «el sistema le asignó a alguien».
4. **No dirige ni controla el trabajo.** No impone horarios, métodos,
   herramientas, uniforme ni exclusividad. El profesional decide su
   disponibilidad, su radio de desplazamiento y qué acepta.
5. **No supervisa la ejecución** ni comprueba la calidad de lo hecho.
6. **No garantiza** la habilitación, la solvencia, la honradez ni la idoneidad
   de nadie.
7. **No interviene en el presupuesto ni en el arreglo** del ciclo de visita: ese
   dinero no pasa por la plataforma.

**Lughly sí:**

- Cobra a nombre propio y transfiere después (§6) — el punto que más matiza lo
  anterior.
- Retiene el dinero hasta el visto bueno y **decide sobre esa retención** en una
  reclamación (§8).
- Verifica identidad y datos fiscales, y puede suspender cuentas.
- Decide qué oficios existen y quién aparece en el directorio.

> ⚠️ **Lo que hay que valorar** (jurisprudencia de plataformas: *Asociación
> Profesional Élite Taxi*, C-434/15, frente a *Airbnb Ireland*, C-390/18, y el
> criterio de «influencia decisiva»): que Lughly **no fije precios y no asigne
> profesionales** juega a favor de la calificación como servicio de la sociedad
> de la información. Que **cobre a nombre propio y resuelva disputas sobre el
> dinero** es lo que puede empujar en sentido contrario. Conviene una opinión
> expresa sobre esto, porque de ahí cuelga todo lo demás.

---

## §12. Datos personales que se tratan

Para la política de privacidad. Se guarda, de quien se registra:

**De todos**: correo, contraseña (cifrada), nombre, teléfono, dirección, código
postal, coordenadas, foto de perfil, fecha de aceptación de términos, preferencia
de comunicaciones comerciales, historial de accesos (último acceso, intentos
fallidos, bloqueos), identificador de dispositivo para los avisos push.

**De los profesionales, además**: DNI/NIE o pasaporte (imagen), habilitaciones
profesionales, NIF/CIF, razón social, forma jurídica, identificador de cuenta en
Stripe, tarifas, horarios, ausencias y vacaciones.

**De cada trabajo**: descripción, fotos del cliente, fotos del resultado,
dirección exacta, coordenadas, fechas y horas de todo, conversaciones, pruebas
aportadas en una reclamación, importes y estado de cada cobro, motivos de
cancelación, valoraciones.

**Registro de auditoría**: cada acción relevante queda apuntada con quién, qué y
cuándo.

**Terceros que tratan datos**: Stripe (pagos y verificación de identidad), el
proveedor de avisos push, el de correo y el de geocodificación.

> ⚠️ **Puntos para el abogado**: (a) **no existe borrado de cuenta** en la app,
> lo que choca con el derecho de supresión; (b) las imágenes de documentos de
> identidad exigen su propia base de licitud y plazo de conservación; (c) las
> pruebas de una reclamación se conservan sin ruta de borrado a propósito, para
> que valgan como prueba; (d) no hay plazos de conservación definidos en ningún
> sitio.

---

## §13. Huecos jurídicos conocidos, a día de hoy

Ordenados por lo que más urge.

1. **No existen los Términos ni la política de privacidad.** En el registro se
   acepta un texto que no tiene documento detrás. Esto bloquea además la
   revisión interna del §8, que es una cláusula contractual.
2. ~~**No se dice el IVA en ninguna parte.**~~ **Resuelto el 20 de septiembre de
   2026**: las tarifas del profesional son **precios finales** —lo que teclea es
   lo que paga el cliente— y cada profesional declara su tipo en sus datos
   fiscales: general (21 %), reducido (10 %) o **exento con su motivo legal**,
   que hacía falta porque las clases particulares de materias curriculares están
   exentas (art. 20.Uno.10º LIVA) y parte de los cuidados también. El desglose
   parte el precio en base e impuesto y lo enseña en la ficha. **Lo que sigue
   pendiente es la factura**: ni la del profesional al cliente, ni la de la
   comisión de Lughly al profesional, que lleva su propio 21 %.
3. **No se recoge el consentimiento de ejecución anticipada** (arts. 102-108
   TRLGDCU). Sin él, un cliente podría desistir en 14 días de un servicio ya
   ejecutado. Hace falta una casilla al contratar y el texto que la sostenga.
4. **Falta la identificación del prestador** exigida por el art. 10 LSSI:
   denominación, NIF, domicilio, correo de contacto y datos registrales. No
   aparecen en ninguna pantalla.
5. **El enlace de la plataforma europea de resolución de litigios en línea ya no
   sirve**: la ODR europea cerró en julio de 2025. Conviene decidir qué se
   ofrece en su lugar (sistema arbitral de consumo, u otro).
6. **Los oficios regulados no exigen habilitación.** Está marcado quién lo es,
   pero no se impide ofrecer el oficio sin acreditarla.
7. **No se comprueba la mayoría de edad.**
8. **No se pide seguro de responsabilidad civil** a los profesionales.
9. **No hay borrado de cuenta** ni plazos de conservación (§12).
10. **Obligaciones de plataforma del Reglamento (UE) 2022/2065 (DSA)**: canal de
    notificación de contenidos ilícitos, motivación de las suspensiones,
    trazabilidad de los profesionales (art. 30), punto de contacto. Hay
    suspensión de cuentas y un canal de soporte, pero no están articulados como
    los exige el reglamento.
11. **Art. 97.3 TRLGDCU (mercados en línea)**: hay que informar al consumidor de
    **si el tercero es o no empresario**, y de cómo se reparten las obligaciones
    entre el tercero y la plataforma. Hoy no se dice.

---

## §14. Nota final

Este documento lo ha redactado el equipo técnico a partir del código en
producción, no un abogado, y **no es asesoramiento jurídico**. Su propósito es
que quien sí lo sea pueda trabajar sobre hechos exactos.

Cualquier cambio en el producto que toque los §6, §7, §8 u §11 debería
revisarse contra este documento, porque son los que sostienen el reparto de
responsabilidad.
