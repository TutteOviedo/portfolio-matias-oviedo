# Roadmap de AWS - Portfolio + Tute

Qué levantamos en AWS, en qué orden, y por qué cada pieza. Pensado para
alguien que ya tiene el Cloud Resume Challenge andando (S3 + CloudFront +
Route53 + algo de Lambda/DynamoDB), así que reutilizamos ese mismo patrón en
vez de inventar uno nuevo.

**Estado actual:** todo esto ya está andando. El sitio y Tute están en
producción en matiasoviedo.com.ar, con el backend de Tute en API Gateway
(HTTP API) + Lambda + Bedrock, la base de conocimiento en S3 y el rate limit
en DynamoDB. Las fases quedan como registro de cómo se armó y por qué.

## Arquitectura, de un vistazo

```
Visitante
   │
   ├── matiasoviedo.com.ar (Route53) ──► CloudFront ──► S3 (sitio Next.js exportado, estático)
   │
   └── Widget de Tute ──► fetch a API Gateway ──► Lambda (tute-handler) ──┬──► DynamoDB (rate limiting)
                          (HTTP API, POST /tute)                          ├──► Bedrock (Claude Haiku 4.5 + embeddings de Titan)
                                                                          ├──► S3 (base de conocimiento para el RAG)
                                                                          ├──► API de GitHub (tool get_github_repo_info)
                                                                          └──► CloudWatch (logs y métricas)
```

Dos piezas separadas a propósito:

1. **El sitio** es 100% estático (HTML/CSS/JS generado por `next build` con
   `output: 'export'`) → no necesita servidor, se sirve solo desde S3 +
   CloudFront. Barato, rápido, y es el mismo patrón que ya usás en el Cloud
   Resume Challenge.
2. **El chat de Tute** sí necesita ejecutar código en el momento (llamar a un
   modelo de IA) → eso va en Lambda, detrás de API Gateway. El front le pega
   a esa API por HTTP, nada más.

Esta separación es justamente lo que le da consistencia a tu propio
portfolio: es el mismo patrón serverless que mostrás en el Cloud Resume
Challenge, aplicado de nuevo acá.

---

## Fase 0 - Antes de tocar nada

- **Cuenta de AWS y CLI configurado.** Si ya desplegaste el Cloud Resume
  Challenge, esto ya lo tenés. `aws configure` con un usuario IAM (no el root)
  con permisos acotados a los servicios que vas a usar.
- **Confirmar que `matiasoviedo.com.ar` ya está como Hosted Zone en Route53.**
  Si ya lo usás para el Cloud Resume Challenge, es el mismo - no hay que crear
  nada nuevo acá, solo vamos a sumar registros.
- **Decidir si el nuevo sitio reemplaza al Cloud Resume Challenge en el
  dominio raíz, o si conviven en subrutas/subdominios.** Recomendación: el
  portfolio nuevo pasa a ser el sitio principal (`matiasoviedo.com.ar`), y el
  Cloud Resume Challenge queda linkeado desde ahí como uno de los proyectos
  (tal como está armado en `components/Projects.tsx`) - no hace falta que
  compitan por el mismo dominio.

---

## Fase 1 - Frontend estático (S3 + CloudFront + Route53)

**Por qué así:** es la misma arquitectura que el Cloud Resume Challenge, así
que ya sabés cómo se comporta, y aparte es literalmente gratis o casi gratis
para el tráfico de un portfolio personal.

1. **Bucket S3** para el sitio (podés reusar el bucket del Cloud Resume
   Challenge si querés todo junto, o crear uno nuevo - más prolijo si en
   algún momento querés versionar/desplegar cada proyecto por separado).
   Sin hosting público directo del bucket: el acceso público lo maneja
   CloudFront (Origin Access Control), el bucket queda privado.
2. **Build del sitio:** `npm run build` genera `/out` con todo el HTML/CSS/JS
   estático. Ese es el contenido que se sube al bucket (`aws s3 sync ./out
   s3://tu-bucket --delete`).
3. **Certificado SSL (ACM)** para `matiasoviedo.com.ar`, en la región
   `us-east-1` (CloudFront lo exige ahí específicamente, sin importar en qué
   región esté el resto).
4. **Distribución de CloudFront** apuntando al bucket como origen, con el
   certificado de ACM, y comportamiento configurado para servir `index.html`
   como default y como error 404 (típico para sitios de una sola página con
   anclas internas como el nuestro).
5. **Route53:** registro tipo A (alias) apuntando el dominio a la
   distribución de CloudFront.
6. **Invalidación de caché** después de cada deploy (`aws cloudfront
   create-invalidation --distribution-id XXXX --paths "/*"`), para que
   CloudFront no siga sirviendo la versión vieja del sitio.

---

## Fase 2 - Backend de Tute (Lambda + API Gateway)

**Por qué así:** el chat necesita ejecutar lógica real (armar el prompt,
llamar al modelo, eventualmente usar herramientas) - eso no puede vivir en un
sitio estático. Lambda cobra solo por uso, así que para un portfolio con
tráfico bajo/medio el costo es mínimo o nulo (dentro del free tier).

1. **Proveedor de IA: AWS Bedrock.** Todo se queda dentro de AWS, no hay que
   guardar una API key de un tercero y los permisos se manejan con IAM. Se
   usan dos modelos: Claude Haiku 4.5 (perfil de inferencia
   `us.anthropic.claude-haiku-4-5-20251001-v1:0`, vía la Converse API) para
   el chat, y Titan Text Embeddings v2 (`amazon.titan-embed-text-v2:0`, 1024
   dimensiones, normalizado) para el RAG.
2. **Función Lambda** (`tute-handler`, Node 22): el código está en
   `aws/lambda/tute-handler/index.mjs`. Por cada mensaje:
   - chequea el rate limit en DynamoDB (Fase 3) y, si se pasó, corta ahí sin
     tocar Bedrock;
   - llama a Claude con el system prompt de Tute (con la fecha actual
     inyectada) y tres tools: `search_knowledge_base` (RAG armado a mano:
     embedding de la consulta con Titan + similitud coseno contra
     `knowledge-base.json` en el bucket `tute-knowledge-base`),
     `get_github_repo_info` (API de GitHub, owner fijo `TutteOviedo`) y
     `redirigir_a_evals` (devuelve el link a `/evals`);
   - ejecuta las tools que pida Claude (hasta 4 rondas) y devuelve
     `{ reply, link? }` al front.
   Solo usa los módulos `@aws-sdk/*` que ya vienen en el runtime de Lambda,
   así que no lleva dependencias ni hace falta empaquetar nada.
3. **Rol de IAM de la Lambda:** permisos mínimos para lo que usa el código -
   invocar en Bedrock los dos modelos de arriba, leer
   `knowledge-base.json` del bucket `tute-knowledge-base`, y actualizar/escribir
   items en la tabla `tute-rate-limit` (Fase 3).
4. **API Gateway (HTTP API, no REST API - es más simple y más barata para
   este caso):** una sola ruta `POST /tute` que dispara la Lambda. El CORS se
   configura acá y no en la Lambda: si se setea en los dos lados los headers
   se duplican y el navegador rechaza la respuesta.
5. **Variable de entorno del front:** la Invoke URL de API Gateway está en
   `.env.production` como `NEXT_PUBLIC_TUTE_API_URL` (es pública, queda
   embebida en el JS, así que ese archivo sí se commitea y lo usa el build del
   deploy). Para desarrollo local va la misma URL en `.env.local`.
6. **Overrides por variable de entorno (opcionales):** `MODEL_ID`,
   `KB_BUCKET`, `RATE_LIMIT_TABLE`, `MAX_MESSAGES_PER_WINDOW` y
   `GITHUB_TOKEN` (sube el límite de la API de GitHub de 60 a 5000 requests
   por hora). Los valores por defecto del código son los recursos reales.

---

## Fase 3 - Control de costos y abuso

**Por qué:** un chat conectado a una API de IA es el único componente de todo
esto que puede generarte un costo variable e impredecible si alguien lo usa
de forma abusiva (o si el sitio se viraliza). Esta fase es la que evita
sorpresas en la factura.

1. **Tabla DynamoDB** `tute-rate-limit`, con partition key `ip` (un hash
   SHA-256 de la IP, nunca la IP en crudo), un contador `hits` y un
   vencimiento `expiresAt` (TTL). La Lambda la actualiza con un contador
   atómico antes de llamar al modelo: el límite por defecto es 20 mensajes
   por hora por IP, y si se pasa devuelve un 429 con un mensaje fijo de Tute
   sin gastar ni un token. Como el TTL de DynamoDB puede tardar en borrar el
   item, la Lambda reinicia la ventana a mano cuando ya venció.
2. **Throttling en API Gateway:** la API `tute-api` tiene un límite de 5
   requests por segundo con burst de 10, a nivel de la API completa. Es la
   segunda barrera además del rate limit por IP: frena picos de tráfico
   antes de que lleguen a la Lambda.
3. **AWS Budgets:** el presupuesto `Tute-budget`, de USD 10 mensuales, es la
   señal temprana de que el gasto se está yendo de rango y algo raro está
   pasando.

---

## Fase 4 - Observabilidad

**Por qué:** para poder ver qué le preguntan a Tute, si está fallando, y de
paso tener contenido real para la página `/evals` (hoy sus casos todavía son
de ejemplo).

1. **CloudWatch Logs** de la Lambda - vienen activados por default, no hay
   que configurar nada extra. La Lambda loguea en JSON tres eventos:
   `rag` (la consulta y el ranking completo de fragmentos), `respuesta`
   (primeros 200 caracteres de la pregunta, tools usadas y tokens de entrada
   y salida) y `rate_limit`. En todos la IP va hasheada y recortada.
2. **Métricas básicas:** cantidad de invocaciones, errores, duración - todo
   esto ya lo trackea CloudWatch automáticamente para cualquier Lambda /
   API Gateway, sin trabajo adicional.
3. (Opcional, más adelante) **Un dashboard simple de CloudWatch** con esas
   métricas, que podrías incluso llegar a mostrar como parte de la sección
   "detrás de escena" del sitio.

---

## Fase 5 - Deploys (opcional pero recomendado)

Para no tener que subir archivos a mano cada vez:

1. **Frontend:** un GitHub Action simple que en cada push a `main` corre
   `npm run build` y sincroniza `/out` al bucket S3 + invalida CloudFront.
2. **Lambda:** no está en el workflow, se despliega aparte. Como no tiene
   dependencias, alcanza con subir `index.mjs` (pegándolo en la consola o
   como `.zip` con `aws lambda update-function-code`). Más adelante, si
   querés, se puede migrar a algo como AWS SAM o CDK para manejar toda la
   infraestructura como código - es una mejora, no una necesidad.

---

## Orden en que se fue armando

1. Fase 1 completa (sitio estático funcionando en el dominio) - es la base y
   no depende de nada más.
2. Fase 2, pero probando la Lambda primero desde la consola de AWS (con un
   evento de prueba) antes de conectarla al front - así aislás errores.
3. Fase 3 **antes** de compartir el link con nadie más allá de vos - es la
   parte que te protege de un costo inesperado.
4. Fase 4 en paralelo a la 3, son casi gratis y te dan visibilidad desde el
   día uno.
5. Fase 5 cuando el resto ya esté estable - automatizar algo que todavía
   cambia mucho no ahorra tiempo, ahorra tiempo cuando ya se volvió rutina.

## Sobre los costos

Para un portfolio personal con tráfico bajo/medio, la gran mayoría de esto
entra dentro del free tier de AWS (S3, CloudFront, Lambda, API Gateway,
DynamoDB tienen niveles gratuitos generosos para este volumen). El único
costo variable real es el de las llamadas a Bedrock (Claude y los embeddings
de Titan), que es exactamente lo que la Fase 3 existe para controlar. Por
eso la Lambda también acota todo lo que puede: respuestas de hasta 500
tokens, mensajes de hasta 1000 caracteres, historial de hasta 10 mensajes, y
el embedding se genera solo si Claude pide buscar en la base de conocimiento.
