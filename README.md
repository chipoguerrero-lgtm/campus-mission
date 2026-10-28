# Campus Mission · UPSRJ

Actividad por equipos de **Tutoring for Immersion** para que los alumnos de nuevo ingreso conozcan las academias y los servicios del campus.

- **Página de alumnos:** `index.html`, en inglés. No necesitan cuenta.
- **Panel docente:** `docente.html`, protegido con tu PIN.
- **Datos:** se guardan en el Google Drive de **cguerrero@upsrj.edu.mx**, en una hoja de cálculo y una carpeta de fotos, a través de Google Apps Script (`apps-script/Code.gs`).

## Cómo funciona

| Fase | Qué hacen los equipos |
|---|---|
| **Entrada** | Escriben el **código de grupo** que les das, eligen su equipo y crean un **PIN de 4 dígitos**. Con eso vuelven a entrar cualquier día, desde cualquier celular. |
| **Fase 1 · Mapa y foto** | Ubican su edificio en el mapa (los nombres están ocultos), van al lugar, se toman la foto y la publican en el muro del grupo. |
| **Fase 2 · Edificio** | Se abre su edificio Lego en 3D. Investigan durante la semana y responden las preguntas; todo se guarda solo. |
| **Fase 3 · Explícalo** | Cuando **tú la abres** para el grupo, cada equipo explica lo que encontró. Después ven los hallazgos de todo el grupo y los descargan para hacer su mapa mental (.md, .opml, texto o PDF). |

## Instalación (una sola vez, unos 15 minutos)

### 1. Servidor en Google Apps Script (cuenta institucional)

1. Entra a <https://script.google.com> con **cguerrero@upsrj.edu.mx** y crea un **Proyecto nuevo**. Ponle de nombre *Campus Mission*.
2. Borra lo que trae el archivo `Código.gs` y pega todo el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
3. En la línea `const PIN_DOCENTE = 'CAMBIA-ESTE-PIN';` cambia el texto por un PIN que solo tú conozcas, por ejemplo `'Chipo2026'`. Guarda.
4. En la barra de arriba elige la función **instalar** y pulsa **Ejecutar**. Google pedirá permisos: pulsa *Revisar permisos*, elige tu cuenta y acepta.
   Se crea en tu Drive la carpeta **Campus Mission (datos)**, con la hoja *Campus Mission – Respuestas* y la carpeta *Fotos*.
5. Pulsa **Implementar › Nueva implementación**. En el engrane elige **Aplicación web** y configura:
   - **Ejecutar como:** Yo (cguerrero@upsrj.edu.mx)
   - **Quién tiene acceso:** Cualquier usuario
6. Pulsa **Implementar** y copia la **URL de la aplicación web**, la que termina en `/exec`.

> Si la opción "Cualquier usuario" no aparece, tu universidad restringe las aplicaciones públicas. Pide a TI que lo permita o usa tu cuenta personal para este paso.

### 2. Conectar la página con el servidor

1. En este repositorio abre `config.js` y pulsa el lápiz (*Edit*).
2. Pega la URL entre las comillas: `API_URL: 'https://script.google.com/macros/s/…/exec'`
3. Pulsa **Commit changes**.

### 3. Publicar con GitHub Pages

1. En el repositorio ve a **Settings › Pages**.
2. En *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)**, y pulsa **Save**.
3. En uno o dos minutos aparece la liga, algo como `https://chipoguerrero-lgtm.github.io/campus-mission/`.
   - Alumnos: esa liga.
   - Tú: la misma liga con `docente.html` al final.

## Antes de cada grupo

1. Abre el **panel docente** e inicia sesión con tu PIN.
2. En **Nuevo grupo** escribe el nombre (por ejemplo *IRC 01*) y pulsa **Crear grupo y código**.
3. Proyecta o comparte el código (por ejemplo `IRC01-K7P3`) junto con la liga de alumnos.
4. Al terminar la semana de recolección, activa **Fase 3 abierta** para ese grupo.

Si un equipo olvida su PIN, en el panel pulsa **Reiniciar PIN** en su tarjeta.

## Modo de prueba

Mientras `config.js` no tenga URL, la página funciona en **modo de prueba**: todo se guarda solo en ese navegador. Sirve para ensayar.
- Código de grupo de prueba: `DEMO-A1B2`
- PIN docente de prueba: `0000`

## Cambiar preguntas, pistas o lugares

Todo está en `data.js`:
- `LUGARES`: nombres y pistas.
- `EQUIPOS`: academias, áreas y preguntas específicas.
- `preguntas()`: preguntas base.
- `EXPLICACION`: campos de la fase 3.
- `CONSTRUCCIONES`: posición de cada edificio en el mapa.

Si cambias el lugar de un equipo, cámbialo también en `LUGAR_EQUIPO`, dentro de `apps-script/Code.gs`.

## Si actualizas `Code.gs`

Después de pegar una versión nueva, ve a **Implementar › Administrar implementaciones**, edita la implementación, elige **Versión: Nueva versión** e implementa. La URL no cambia.
