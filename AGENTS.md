# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Este repositorio es SOLO la app móvil

Lughly son dos repositorios separados. Este es el cliente; el servidor está en
otro sitio del disco y no se ve desde aquí.

| | Dónde | Qué es |
|---|---|---|
| **Móvil** (este) | `C:\Users\robin\Desktop\design_handoff_lughly\apps\mobile` | Expo / React Native. Es la raíz de git: `design_handoff_lughly` **no** es el repositorio. |
| **Backend** | `C:\Users\robin\Desktop\lughly-backend` | NestJS + Prisma + PostgreSQL. Repositorio propio, rama `main`. |

- Móvil: https://github.com/robin8888/lughly-front
- Backend: https://github.com/robin8888/lughly-backend

## Por qué esto está escrito aquí

Porque no verlo lleva a conclusiones falsas, y ya ha pasado: mirando solo esta
carpeta, la asignación de trabajos por el empleador parecía sin construir
—no hay tablas, ni endpoints, ni envío de avisos— cuando estaba entera en el
backend. El `ROADMAP.md` de aquí describe el producto completo, así que hay
cosas marcadas en él que se implementan allí.

**Antes de dar por ausente cualquier cosa de servidor, mírala en el otro
repositorio.**

## Qué va en cada uno

**En el backend**: el esquema de la base de datos y sus migraciones (Prisma),
los endpoints, las reglas de negocio, los permisos, el envío de notificaciones
push y todo lo que decida qué datos ve cada rol.

**Aquí**: pantallas, componentes, estado del cliente, y los tipos que copian el
contrato de la API. Esos tipos son un **espejo**, no la fuente: viven en
`src/api/*.api.ts` y 9 de los 11 dicen en su cabecera de qué controlador del
backend son reflejo, con una línea `Contrato: lughly-backend/src/modules/…`.
Si cambia el contrato, se tocan los dos lados.

Un cambio que necesite servidor **no se puede terminar en este repositorio**.
Se abre el otro, se hace allí, y cada repositorio lleva su propio commit.

## Materiales de origen

Las piezas en bruto que llegan de diseño —secuencias de fotogramas, imágenes a
tamaño completo— viven en `C:\Users\robin\Desktop\design_handoff_lughly\_fuentes`,
**fuera del repositorio**, con un `LEEME.md` que explica de qué asset es origen
cada una y el comando exacto para regenerarlo.

No se meten aquí: son cientos de veces más grandes que el asset que se saca de
ellas, no hacen falta para compilar, y GitHub rechaza cualquier fichero de más
de 100 MiB —cosa que un zip de fotogramas se pasa él solo—. `*.zip` está en el
`.gitignore` como red por si alguno vuelve a caer dentro.
