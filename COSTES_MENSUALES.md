# Costes mensuales de Lughly

**Fecha: 3 de octubre de 2026.** Para saber en cualquier momento cuánto cuesta
mantener esto funcionando, sin tener que reconstruir la cuenta desde cero cada
vez. Se actualiza a mano cuando cambie un precio, se suba de plan, o se
confirme algo que hoy está pendiente.

Cada partida lleva marcado si el número es **verificado** (contra la factura
o la página de precios real) o **estimado** (no comprobado hoy, puede estar
mal).

---

## Infraestructura y software

| Partida | €/mes | Estado |
|---|---|---|
| Holded (facturación — plan Plus) | 15,00 € | ✅ Verificado (`holded.com/es/autonomos`) |
| Render — Web Service (Starter) | ~6,50 € (7 $) | ✅ Verificado (captura de la cuenta) |
| Render — PostgreSQL (0,1 CPU/256 MB + 15 GB) | ~9,75 € (10,50 $) | ✅ Verificado (captura de la cuenta) |
| Brevo (correo — plan Starter) | 8,47 € | ✅ Verificado (factura real) |
| Almacenamiento (Cloudflare R2) | 0,00 € | Capa gratuita hasta ~10 GB — ver `PENDIENTE_PARA_PRODUCCION.md` |
| Avisos push (Expo) | 0,00 € | Gratis sin límite — mismo documento |
| Apple Developer | ~8,25 € (99 $/año) | Ya se paga; no es gasto nuevo de este proyecto |
| Dominio | ~1,00 € | ⏳ **Pendiente de comprar, no bloqueante.** Hace falta para que el correo de Brevo no caiga en spam (SPF/DKIM/DMARC con dominio propio), no para publicar en las tiendas |
| **Subtotal infraestructura** | **≈ 48,97 €** | |

Render factura en dólares: el € exacto varía un poco con el cambio y con la
comisión de la tarjeta — la cifra de arriba es aproximada aunque el precio en
dólares esté verificado.

## Costes de operar como autónomo

| Partida | €/mes | Estado |
|---|---|---|
| Gestoría | 150,00 € | Dado por Robin |
| Cuota de autónomo (tarifa plana) | 80,00 € | Dado por Robin — **temporal, solo los dos primeros años** (ver nota abajo) |
| **Subtotal autónomo** | **230,00 €** | |

---

## Total fijo de hoy

**≈ 279 €/mes**, al nivel de uso de hoy (plan Plus de Holded, Starter de
Render y de Brevo).

## Lo que no es fijo: Stripe

Esto **no** se suma a la tabla de arriba porque no es una cuota, es un
porcentaje de cada cobro: **1,5 % + 0,25 €** por cargo con tarjeta europea.
Ya está descontado dentro del diseño de la comisión y de la tarifa de
servicio (`commission-levels.ts`, `service-fee.ts`) — no es un gasto que se
reste aparte del ingreso, ya está contado en el neto por trabajo de más
abajo.

## Cuánto hay que facturar para que a Robin le queden 2.000 € limpios

Cálculo hecho el 3 de octubre de 2026, con el ejemplo de siempre (profesional
a 14 €/h, 3 h = 42 €, nivel de comisión Obrera):

| | |
|---|---|
| Comisión (10 % + 0,40 €) | 4,60 € |
| Tarifa de servicio (7 %) | 2,94 € |
| − Stripe (1,5 % + 0,25 € sobre el total cobrado) | −0,92 € |
| **Neto por trabajo para Lughly** | **≈ 6,62 €** |

> Trabajos/mes = (2.000 € ÷ 0,80 [20 % IRPF] + gestoría + cuota autónomo +
> fijos de plataforma) ÷ 6,62 €
> = (2.500 + 150 + 80 + ~115\*) ÷ 6,62
> ≈ **444 trabajos al mes** (unos 14-15 al día)

\* A ese volumen (444 × 2 facturas/mes) Holded se sale del plan Avanzado y
hace falta el Premium (199 €/mes) — por eso el fijo de plataforma sube de
~49 € a ~115 € solo en ese escenario, no al nivel de uso de hoy.

**Este número depende de tres cosas que pueden cambiar**: el ticket medio
real (aquí 42 € de ejemplo), el nivel de comisión de los profesionales que
contraten (sube con el volumen, así que el neto por trabajo baja), y si la
cuota de autónomo sigue en tarifa plana o no (ver nota siguiente).

## Aviso: la cuota de autónomo sube al tercer año

Los 80 €/mes son la tarifa plana, válida los dos primeros años. Pasado ese
plazo, la cuota real de alguien con un beneficio del orden de 2.000-2.500 €
netos al mes es bastante más alta — el sistema la liga a los ingresos
reales—, y no tenemos la cifra exacta de 2026 verificada. Cuando se acerque
esa fecha, hay que recalcular el total con la cifra real de la gestoría y
repetir la cuenta de trabajos/mes.

## Pendiente de verificar

- **El precio exacto del dominio**, cuando se compre.
- **Si Render necesita un plan mayor** que Starter/el nivel básico de
  PostgreSQL al crecer el tráfico — los precios de arriba son los de hoy, con
  poco uso.
- **El proveedor de facturación activado** (`INVOICING_PROVIDER=holded` en
  producción): pendiente hasta que Robin se afilie a un plan de Holded de
  verdad. Ver `PENDIENTE_PARA_PRODUCCION.md` (backend) para lo técnico.

Ver también `PENDIENTE_PARA_PRODUCCION.md` (backend, lista de lo que falta
para producción) y `LOGICA_DE_NEGOCIO.md` §6 y §13 (el dinero y los huecos
legales).
