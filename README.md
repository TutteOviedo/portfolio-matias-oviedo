# Portfolio de Matías Oviedo - proyecto Next.js

Portfolio en Next.js (App Router + TypeScript), migrado desde un prototipo
estático en HTML. Se exporta como sitio 100% estático (`output: 'export'` ->
carpeta `/out`) y se hostea en AWS (S3 + CloudFront + Route53). El chat de
"Tute" está en producción en matiasoviedo.com.ar, con un backend serverless
aparte: API Gateway (HTTP API) + Lambda + Bedrock (Claude Haiku 4.5), con la
base de conocimiento en S3 y el rate limit en DynamoDB. Ver `aws-roadmap.md`
para el detalle de infraestructura.

## Páginas

El sitio tiene tres páginas más la 404:

- **`/`** - el portfolio. Hero, "Sobre mí", "Conocé a Tute", Proyectos, Skills
  y Contacto, todo en una sola página con anclas internas.
- **`/curriculum`** - CV interactivo (el "Cloud Resume Challenge"). Tiene su
  propio sistema tipográfico (Playfair Display + IBM Plex, cargadas con
  `next/font/google`; Bootstrap y Font Awesome vienen de CDN, solo en esta
  ruta), pero comparte el sistema de tema claro/oscuro con el resto del sitio
  (mismo toggle, mismos tokens de color). Incluye un contador de visitas real
  que le pega a la API del Cloud Resume Challenge y un botón de descarga del CV
  en PDF.
- **`/evals`** - panel de testing de Tute: qué casos de prueba le corro y
  cuáles pasan. No está en el nav; se llega desde la tarjeta "Cómo está hecho
  Tute" de la sección "Conocé a Tute", o desde los links que Tute deja en el
  chat. Hoy los casos son data de ejemplo, hardcodeada.
- **404** (`app/not-found.tsx`) - página propia, sin Header/Footer y sin el
  widget de Tute.

## Cómo correrlo local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000. Para que el chat le pegue al backend real de Tute,
copiá `.env.local.example` a `.env.local` (que no se sube al repo) y poné en
`NEXT_PUBLIC_TUTE_API_URL` la misma URL que está en `.env.production`. Sin esa
variable, el widget cae a un modo demo silencioso (respuesta simulada, sin
pegarle a ninguna API), útil para laburar el front sin gastar llamadas al
modelo.

## Internacionalización (ES / EN)

El sitio arranca en español y tiene un selector ES/EN en el nav (con banderas
en SVG, no emojis). La preferencia se guarda en `localStorage` y se aplica sin
recargar la página.

- **Diccionario:** `lib/i18n/dictionary.ts`. Un objeto `dictionary` organizado
  por sección (`nav`, `hero`, `about`, `askTute`, `projects`, `skills`,
  `footer`). Cada hoja es un `Entry`: `{ es: string; en?: string }`.
- **Provider:** `components/LanguageProvider.tsx` envuelve la app en el layout
  raíz y expone el hook `useLanguage()` -> `{ lang, setLanguage, t }`.
- **En los componentes:** `const { t } = useLanguage()` y después
  `t(dictionary.hero.titleLine1)`.
- **Fallback:** `translate()` devuelve el `en` solo si existe y no está vacío;
  si no, devuelve el `es`. Una clave sin traducir no rompe nada.

### `/evals` y `/curriculum` no están traducidas

Su texto vive hardcodeado en español en los componentes y no pasa por el
diccionario. `/evals` en particular va a cambiar de contenido, así que se deja
así por ahora: en modo EN se ve en español (por el fallback), y cuando el
contenido se estabilice se van moviendo las claves al diccionario de a poco
(cada clave sin `en` sigue cayendo al `es`).

### Agregar una clave nueva

1. Agregá el `Entry` en la sección que corresponda de `dictionary.ts`
   (`{ es: "...", en: "..." }`; el `en` podés completarlo después).
2. En el componente (tiene que ser client component), usá
   `t(dictionary.<seccion>.<clave>)`.

## El widget de Tute

- Vive en `components/TuteProvider.tsx`, montado **una sola vez en el layout
  raíz** (`app/layout.tsx`), no en `HomeClient`. Como el layout no se
  desmonta al navegar entre páginas, la conversación se mantiene al pasar de
  `/` a `/curriculum` o `/evals`.
- Solo se muestra en las rutas conocidas
  (`KNOWN_ROUTES = ["/", "/curriculum", "/evals"]`). Cualquier otra ruta - la
  404 incluida - queda sin widget automáticamente, sin tocar nada de esa
  página.
- `useTute()` devuelve una función para abrirlo desde cualquier componente
  (por ejemplo el botón "¡Preguntale!" de la home).
- `components/TuteWidget.tsx` es autocontenido: maneja sus mensajes, el estado
  del avatar (`idle` / `thinking` / `talking`, mapeado en `lib/tuteImages.ts`)
  y el input. Cuando `NEXT_PUBLIC_TUTE_API_URL` está seteada (en producción
  siempre, vía `.env.production`), hace `POST` a ese endpoint con
  `{ message, history }` y muestra el `reply` (y el `link`, si viene). Si la
  variable no está, responde con un texto de relleno (modo demo, solo para
  desarrollo local).
- El backend es la Lambda `aws/lambda/tute-handler/index.mjs`: rate limit en
  DynamoDB, Claude Haiku 4.5 vía Bedrock con tool use (`search_knowledge_base`
  con RAG armado a mano sobre embeddings de Titan guardados en S3,
  `get_github_repo_info` y `redirigir_a_evals`). El CORS lo maneja API
  Gateway, no la Lambda.

## Sistema de tema

Un solo estado de verdad, en `lib/useTheme.ts`: el atributo `data-theme` en
`<html>` más la clave `theme` de `localStorage`. Lo usan tanto el
`ThemeToggle` del nav como el de `/curriculum` (es el mismo componente). Los
tokens de color se definen en `app/globals.css` (`:root` y
`[data-theme="dark"]`); `curriculum.css` los consume, así que el CV sigue el
mismo tema que el resto del sitio. El SSR arranca en `data-theme="light"` y
`useTheme` lo corrige al montar según `localStorage` / `prefers-color-scheme`.

## Deploy

Automático: el workflow `.github/workflows/deploy.yml` corre en **cada push a
`main`** y hace:

1. `npm install` + `npm run build` (genera `/out` por `output: 'export'`).
2. `aws s3 sync ./out s3://<bucket> --delete`.
3. `aws cloudfront create-invalidation --paths "/*"`.

No hay paso manual. Necesita estos secrets en el repo: `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`
(región `us-east-1`).

Para revisar el estático a mano: `npm run build` y mirás `/out`.

El workflow solo despliega el sitio estático. La Lambda de Tute se despliega
aparte (ver `aws-roadmap.md`).

### robots.txt

El sitio ya es público (se sacó el Basic Auth que tenía mientras se integraba
el backend de Tute), pero `public/robots.txt` sigue bloqueando toda la
indexación (`Disallow: /`). Hay que actualizarlo: permitir `/` y decidir qué
hacer con `/evals`.

## Qué falta completar

Buscá `ACA REEMPLAZAR` en el código. Lo que sigue pendiente hoy:

- **`components/EvalsContent.tsx`** - los casos de `/evals` siguen siendo data
  de ejemplo a mano; hay que reemplazarlos por corridas reales de evals.
- **`public/robots.txt`** - aflojar las reglas ahora que el sitio es público
  (ver arriba).
- **`.env.local.example`** - el comentario todavía habla de "una vez que
  despliegues el Lambda"; la URL real ya está en `.env.production`.

Respecto de versiones anteriores del README, ya quedaron resueltos: el mail y
los links de LinkedIn y GitHub del footer, los links de GitHub de Proyectos
(Cloud Resume Challenge y JobFit), el link "Ver en GitHub" de `/evals`, y
sobre todo la Lambda de Tute, que dejó de ser un esqueleto y es el código que
corre en producción.

## Stack

Next.js 14.2 (App Router) - React 18.3 - TypeScript 5.5 - `lucide-react`
(íconos) - `next/font/google` (fuentes del CV). Sin framework de estilos: CSS
plano con custom properties en `globals.css` y `curriculum.css`; `/curriculum`
además usa la grilla de Bootstrap por CDN.

## Estructura

```
app/
  layout.tsx              layout raíz: metadata + <LanguageProvider><TuteProvider>
  page.tsx                /  -> <HomeClient />
  globals.css             tokens de color/tipografía + estilos del sitio y del widget
  not-found.tsx           404 (sin Header/Footer/widget)
  favicon.ico / icon.png / apple-icon.png   íconos del sitio (Next los detecta por convención)
  curriculum/
    layout.tsx            fuentes propias + Bootstrap/Font Awesome, solo en esta ruta
    page.tsx              /curriculum -> <CvPage />
    curriculum.css        estilos del CV, scopeados a .cv-page (solo tipografía/espaciado)
  evals/
    page.tsx              /evals -> Header + panel de evals (data hardcodeada) + Footer

components/
  HomeClient.tsx          compone las secciones del home
  Header.tsx              nav + selector de idioma + toggle de tema (se reusa en /evals)
  Hero / About / AskTute / Projects / Skills / Footer
  ThemeToggle.tsx         claro/oscuro (usa lib/useTheme)
  LanguageProvider.tsx    contexto de idioma + hook useLanguage()
  LanguageToggle.tsx      desplegable ES/EN con banderas SVG
  TuteProvider.tsx        monta el widget una vez en el layout; expone useTute()
  TuteWidget.tsx          widget flotante + panel de chat (autocontenido)
  curriculum/
    CvPage - CvHeader - CvFooter
    Experience - Certifications - Education
    SkillsSidebar - ProjectsSidebar
    VisitCounter          le pega a la API de visitas del Cloud Resume Challenge

lib/
  i18n/dictionary.ts      diccionario es/en por sección + translate()
  i18n/index.ts           re-export
  useTheme.ts             estado único de tema (data-theme + localStorage)
  tuteImages.ts           estados del avatar -> .webp en /public/tute

public/
  og-image.png
  robots.txt              todavía bloquea toda la indexación; falta aflojar las reglas
                          ahora que el sitio es público
  tute/                   avatar de Tute (idle/talking/thinking, head/full)
  curriculum/             cv-matias-oviedo.pdf

aws/lambda/tute-handler/  Lambda del chat en producción (Bedrock + RAG + tools; se despliega aparte)
.github/workflows/deploy.yml   build + deploy a S3 + invalidación de CloudFront
```
