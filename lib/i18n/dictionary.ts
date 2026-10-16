// Diccionario de traducción del sitio.
//
// Estructura: un objeto organizado por sección (nav, hero, about, askTute,
// projects, skills, footer). Cada hoja es un `Entry` con:
//   - `es`: el texto real que hoy está hardcodeado en el componente.
//   - `en`: su traducción.
//
// El `en` es opcional a propósito: si una clave todavía no tiene traducción
// (p. ej. cuando se sume /evals), `translate()` cae automáticamente al `es`
// en vez de romper o mostrar un hueco vacío.

export type Lang = "es" | "en";

export type Entry = { es: string; en?: string };

export function translate(entry: Entry, lang: Lang): string {
  if (lang === "en" && entry.en != null && entry.en !== "") return entry.en;
  return entry.es;
}

export const dictionary = {
  // ---------------------------------------------------------------- NAV
  nav: {
    about: { es: "Sobre mí", en: "About" },
    tute: { es: "Tute", en: "Tute" },
    projects: { es: "Proyectos", en: "Projects" },
    skills: { es: "Skills", en: "Skills" },
    contact: { es: "Contacto", en: "Contact" },
  },

  // ---------------------------------------------------------------- HERO
  hero: {
    eyebrow: {
      es: "status: soporte de aplicaciones → IA & agentes",
      en: "status: application support → AI & agents",
    },
    // El <h1> se arma con estos fragmentos + <br/> + <span> de acento:
    //   {titleLine1}<br/>{titleLine2}<br/>{titleLine3Lead}<span>{titleAccent}</span>.
    titleLine1: { es: "6 años haciendo", en: "6 years doing" },
    titleLine2: { es: "soporte.", en: "support." },
    titleLine3Lead: { es: "Ahora, resuelvo problemas ", en: "Now, I solve " },
    titleAccent: {
      es: "reales con agentes de IA",
      // Espacio no separable entre "with" y "AI" para que "with" no quede
      // colgando solo al final de una línea.
      en: "real problems with AI agents",
    },
    lead: {
      es: "Soy Matías Oviedo. Hago soporte de aplicaciones web y mobile, y poco a poco fui metiéndome en programación, entornos cloud (AWS) e inteligencia artificial - hoy diseño y testeo sistemas que automatizan lo que antes hacía a mano.",
      en: "I'm Matías Oviedo. I do support for web and mobile apps, and little by little I got into programming, cloud environments (AWS) and artificial intelligence - today I design and test systems that automate what I used to do by hand.",
    },
    stat1Value: { es: "6", en: "6" },
    stat1Label: { es: "años en soporte", en: "years in support" },
    stat2Value: { es: "AWS", en: "AWS" },
    stat2Label: { es: "cloud & serverless", en: "cloud & serverless" },
    stat3Value: { es: "IA", en: "AI" },
    stat3Label: { es: "agentes & tool use", en: "agents & tool use" },
  },

  // ---------------------------------------------------------------- ABOUT
  about: {
    eyebrow: { es: "seccion: quién soy", en: "section: who I am" },
    // Cada párrafo se arma como <p>[lead]<strong>[strong]</strong>[rest]</p>.
    p1Strong: {
      es: "Trabajo en soporte de aplicaciones hace 6 años",
      en: "I've worked in application support for 6 years",
    },
    p1Rest: {
      es: ", resolviendo incidentes, entendiendo sistemas complejos y hablando con usuarios que necesitan que las cosas funcionen ya.",
      en: ", resolving incidents, making sense of complex systems and talking to users who need things working right now.",
    },
    p2Lead: { es: "En el camino sumé ", en: "Along the way I picked up " },
    p2Strong: {
      es: "programación, AWS e inteligencia artificial",
      en: "programming, AWS and artificial intelligence",
    },
    p2Rest: {
      es: " con el fin de automatizar y mejorar el mismo trabajo de soporte que vengo haciendo.",
      en: " in order to automate and improve the very support work I've been doing.",
    },
    p3Lead: {
      es: "Hoy busco orientar eso hacia roles de ",
      en: "Now I want to steer that toward roles in ",
    },
    p3Strong: {
      es: "IA y testing de agentes",
      en: "AI and agent testing",
    },
    p3Rest: {
      es: ', donde ese ojo de "¿esto realmente funciona como debería?" es justamente el skill que más importa.',
      en: ', where that instinct for "does this actually work the way it should?" is exactly the skill that matters most.',
    },
    tag1: { es: "Soporte de aplicaciones", en: "Application support" },
    tag2: { es: "Troubleshooting", en: "Troubleshooting" },
    tag3: { es: "Programación", en: "Programming" },
    tag4: { es: "AWS", en: "AWS" },
    tag5: { es: "Agentes de IA", en: "AI agents" },
    tag6: { es: "Testing", en: "Testing" },
  },

  // -------------------------------------------------------------- ASK TUTE
  askTute: {
    eyebrow: { es: "tute.status: online", en: "tute.status: online" },
    heading: { es: "Conocé a Tute", en: "Meet Tute" },
    intro: {
      es: "Es mi agente de IA. Me conoce bastante y te puede contar lo que quieras saber de mí. Preguntale sobre:",
      en: "He's my AI agent. He knows me pretty well and can tell you whatever you want to know about me. Ask him about:",
    },
    card1Title: {
      es: "Info profesional o personal",
      en: "Professional or personal info",
    },
    card1Body: {
      es: "Mi experiencia laboral, mi stack, o cosas más generales sobre mí.",
      en: "My work experience, my stack, or more general things about me.",
    },
    card2Title: { es: "Detalles de mis proyectos", en: "Details about my projects" },
    card2Body: {
      es: "Qué hice, con qué tecnologías, y por qué lo armé así.",
      en: "What I built, with which technologies, and why I built it that way.",
    },
    card3Title: { es: "Cómo está hecho Tute", en: "How Tute is built" },
    card3Body: {
      es: "Te lleva directo a la sección donde explico como lo construí y como lo testeo.",
      en: "Takes you straight to the section where I explain how I built it and how I test it.",
    },
    cta: { es: "¡Preguntale!", en: "Ask him!" },
  },

  // ------------------------------------------------------------------ TUTE
  // Textos del widget de chat (components/TuteWidget.tsx). Mientras el
  // backend real (RAG + AWS Bedrock) no esté conectado, el widget arranca
  // con un aviso de "en construcción" y responde en modo demo.
  tute: {
    // Primer mensaje fijo que Tute manda al abrir el chat, antes de que el
    // usuario escriba nada.
    constructionNotice: {
      es:
        "¡Hola! Soy Tute 👋 Un aviso antes de arrancar: todavía estoy en construcción. " +
        "Mi cerebro de verdad (RAG + AWS Bedrock) se está terminando de conectar, así que " +
        "por ahora te contesto con respuestas de ejemplo armadas a mano. Igual sirven para " +
        "que veas cómo va a ser la conversación cuando esté 100% online.",
      en:
        "Hi! I'm Tute 👋 Quick heads-up before we start: I'm still under construction. " +
        "My real brain (RAG + AWS Bedrock) is still being wired up, so for now I reply with " +
        "hand-written sample answers. They're still handy for seeing how the conversation " +
        "will feel once I'm fully online.",
    },
    // Banda persistente arriba del chat.
    devBadge: {
      es: "🚧 En construcción — respuestas de ejemplo mientras conecto el backend real (RAG + AWS Bedrock).",
      en: "🚧 Under construction — sample replies while I wire up the real backend (RAG + AWS Bedrock).",
    },
    // Estado que se muestra en el header, al lado del nombre.
    demoStatus: { es: "● en construcción", en: "● under construction" },

    // Conversación de ejemplo precargada en el chat (modo demo). Cuando el
    // backend real esté conectado deja de tener sentido, pero mientras tanto
    // muestra el tipo de ida y vuelta que va a poder tener Tute.
    demoUserQ1: { es: "¿Qué hace Matías?", en: "What does Matías do?" },
    demoTuteA1: {
      es: "Soporte de aplicaciones hace 6 años, y desde ahí sumó programación, AWS e IA. ¿Querés que te cuente de algún proyecto puntual?",
      en: "Application support for 6 years, and from there he picked up programming, AWS and AI. Want me to tell you about a specific project?",
    },
    demoUserQ2: { es: "¿Cómo te hicieron a vos?", en: "How were you built?" },
    demoTuteA2: {
      es: "Buena pregunta - te llevo a la explicación completa de cómo me armaron y me testean 👇",
      en: "Good question - let me take you to the full rundown of how I was built and how I'm tested 👇",
    },
    demoTuteA2Link: {
      es: "Ver cómo me testean →",
      en: "See how I'm tested →",
    },

    // Mensaje de fallback cuando el backend real no responde bien (falla el
    // fetch, o la respuesta no trae "reply"). El caso de rate limit (429)
    // no usa esto - ese viene con su propio "reply" y se muestra tal cual.
    errorReply: {
      es: "Uy, tuve un problema para responder. Probá de nuevo en un rato.",
      en: "Oops, I had trouble replying. Try again in a bit.",
    },
  },

  // ----------------------------------------------------------------- EVALS
  // Textos de la página /evals (components/EvalsContent.tsx). Solo lo
  // ESTRUCTURAL se traduce: título, intro, label del contador y los títulos y
  // descripciones de las 4 categorías. Las preguntas y respuestas puntuales
  // de cada caso (con PASS/FAIL) siguen hardcodeadas en español porque van a
  // cambiar de contenido cuando conectemos el backend real y corramos evals
  // de verdad.
  evals: {
    devNotice: {
      es: "🚧 Estos son casos de ejemplo mientras conecto el backend real de Tute — cuando esté online, esta sección va a mostrar resultados reales de testing.",
      en: "🚧 These are sample cases while I wire up Tute's real backend — once it's online, this section will show real testing results.",
    },
    heading: { es: "Cómo testeo a Tute", en: "How I test Tute" },
    intro: {
      es: "Un eval es un caso de prueba: le hago una pregunta a Tute y reviso si respondió como debía. Así confirmo que no alucina información, que usa bien sus herramientas, y que se mantiene dentro de los límites que le puse - antes de que un usuario real se tope con eso.",
      en: "An eval is a test case: I ask Tute a question and check whether it answered the way it should. That's how I confirm it doesn't hallucinate information, that it uses its tools properly, and that it stays within the limits I set - before a real user runs into any of that.",
    },
    passLabel: { es: "casos pasan", en: "cases pass" },

    cat1Title: { es: "Mantiene los límites", en: "Stays within bounds" },
    cat1Desc: {
      es: "Pruebo pedidos que buscan sacarlo del personaje o hacerle decir cosas que no debería - opiniones personales, saltarse instrucciones, datos privados.",
      en: "I try requests that aim to break character or make it say things it shouldn't - personal opinions, skipping instructions, private data.",
    },
    cat2Title: { es: "No alucina información", en: "Doesn't hallucinate information" },
    cat2Desc: {
      es: "Le pregunto cosas que suenan plausibles pero son falsas o no están en su base de conocimiento, para confirmar que dice que no sabe en vez de inventar.",
      en: "I ask it things that sound plausible but are false or aren't in its knowledge base, to confirm it says it doesn't know instead of making something up.",
    },
    cat3Title: { es: "Usa la herramienta correcta", en: "Uses the right tool" },
    cat3Desc: {
      es: "Tute tiene dos herramientas - una busca en mi base de conocimiento (RAG), otra consulta la API de GitHub. Acá verifico que elija la correcta según la pregunta.",
      en: "Tute has two tools - one searches my knowledge base (RAG), the other queries the GitHub API. Here I check that it picks the right one for the question.",
    },
    cat4Title: { es: "Tono adecuado", en: "Right tone" },
    cat4Desc: {
      es: "Reviso que las respuestas mantengan un tono cercano y profesional, sin sonar robótico ni irse de tema, incluso en preguntas fuera de lo esperado.",
      en: "I check that the answers keep a warm, professional tone, without sounding robotic or drifting off-topic, even on unexpected questions.",
    },
  },

  // -------------------------------------------------------------- PROJECTS
  projects: {
    eyebrow: { es: "seccion: trabajo hecho", en: "section: work done" },
    heading: { es: "Proyectos", en: "Projects" },
    intro: {
      es: "Lo que fui construyendo para aprender y para resolver problemas concretos.",
      en: "Things I've been building to learn and to solve concrete problems.",
    },

    cloudResumeTag: {
      es: "AWS · Cloud · Funciona como mi CV",
      en: "AWS · Cloud · Doubles as my resume",
    },
    cloudResumeTitle: { es: "Cloud Resume Challenge", en: "Cloud Resume Challenge" },
    cloudResumeDesc: {
      es: "Currículum online con arquitectura 100% serverless: S3, CloudFront, Route53, API Gateway, Lambda y DynamoDB para el contador de visitas.",
      en: "Online resume with a 100% serverless architecture: S3, CloudFront, Route53, API Gateway, Lambda and DynamoDB for the visit counter.",
    },
    cloudResumeLink: { es: "Ver en GitHub →", en: "View on GitHub →" },

    tuteTag: { es: "IA · Agentes", en: "AI · Agents" },
    tuteTitle: { es: "Tute", en: "Tute" },
    tuteDesc: {
      es: "Agente conversacional con tool use real, pensado para responder sobre mi experiencia y demostrar buenas prácticas de diseño de agentes.",
      en: "Conversational agent with real tool use, built to answer questions about my experience and to show good agent-design practices.",
    },
    tuteLink: { es: "Probarlo acá ↑", en: "Try it here ↑" },

    jobfitTag: { es: "IA · Pipeline", en: "AI · Pipeline" },
    jobfitTitle: { es: "JobFit", en: "JobFit" },
    jobfitDesc: {
      es: "Sistema que analiza una oferta laboral en 4 pasos: extrae los requisitos, compara mi perfil real contra la oferta, y genera un mensaje para LinkedIn y un CV optimizado para ATS — sin scores ni porcentajes, todo el análisis es cualitativo.",
      en: "A system that analyzes a job posting in 4 steps: it extracts the requirements, compares my real profile against the posting, and generates a LinkedIn message and an ATS-optimized resume — no scores or percentages, the whole analysis is qualitative.",
    },
    jobfitLink: { es: "Ver en GitHub →", en: "View on GitHub →" },
  },

  // ---------------------------------------------------------------- SKILLS
  skills: {
    eyebrow: { es: "seccion: stack", en: "section: stack" },
    heading: { es: "Con qué trabajo", en: "What I work with" },

    group1Title: { es: "Soporte & Operaciones", en: "Support & Operations" },
    group1Tag1: { es: "Gestión de tickets", en: "Ticket management" },
    group1Tag2: { es: "Troubleshooting", en: "Troubleshooting" },
    group1Tag3: { es: "Documentación", en: "Documentation" },
    group1Tag4: { es: "Atención a usuarios", en: "User support" },

    group2Title: { es: "Programación", en: "Programming" },
    group2Tag1: { es: "Python", en: "Python" },
    group2Tag2: { es: "JavaScript", en: "JavaScript" },
    group2Tag3: { es: "Automatización", en: "Automation" },
    group2Tag4: { es: "APIs", en: "APIs" },

    group3Title: { es: "IA & Cloud", en: "AI & Cloud" },
    group3Tag1: { es: "AWS", en: "AWS" },
    group3Tag2: { es: "Agentes de IA", en: "AI agents" },
    group3Tag3: { es: "Tool use", en: "Tool use" },
    group3Tag4: { es: "Prompt design", en: "Prompt design" },
  },

  // ---------------------------------------------------------------- FOOTER
  footer: {
    heading: { es: "Hablemos.", en: "Let's talk." },
    body: {
      es: "Escribime si querés charlar sobre alguna oportunidad, o consultarme sobre alguno de mis proyectos.",
      en: "Drop me a line if you'd like to talk about an opportunity, or ask me about any of my projects.",
    },
    cvLink: { es: "Ver mi CV", en: "View my resume" },
  },

  // ============================================================ /curriculum
  // El CV se organiza por sub-área. Las tarjetas que se repiten (experiencia,
  // educación, certificaciones, proyectos) van como arrays de objetos con
  // hojas { es, en }, para que agregar/quitar una entrada sea un solo bloque.
  curriculum: {
    header: {
      roleTag: {
        es: "// Application Support Engineer · Buenos Aires, AR",
        en: "// Application Support Engineer · Buenos Aires, AR",
      },
      downloadCv: { es: "Descargar CV", en: "Download resume" },
      backToPortfolio: { es: "← Volver al portfolio", en: "← Back to portfolio" },
      visitsLabel: { es: "Visitas al perfil", en: "Profile visits" },
      visitsLoading: { es: "Cargando...", en: "Loading..." },
      visitsRecorded: { es: "Visitas registradas", en: "Visits recorded" },
      // Se muestra solo cuando el fetch del contador falla de verdad.
      visitsConnect: {
        es: "Conectar a API para activar",
        en: "Connect an API to enable",
      },
      visitsError: { es: "Error", en: "Error" },
    },

    experience: {
      label: { es: "Experiencia", en: "Experience" },
      jobs: [
        {
          title: {
            es: "Application Support Engineer",
            en: "Application Support Engineer",
          },
          company: {
            es: "Consultores en Desarrollos Tecnológicos S.A. - Tiempo completo",
            en: "Consultores en Desarrollos Tecnológicos S.A. - Full-time",
          },
          period: {
            es: "Jun 2022 - Presente · 3 años 9 meses",
            en: "Jun 2022 - Present · 3 years 9 months",
          },
          desc: {
            es: "Especialista en soporte técnico y funcional para aplicaciones críticas, gestionando el ciclo completo de vida de incidencias a través de Invgate bajo estrictos acuerdos de nivel de servicio (SLA). Realizo diagnósticos técnicos, ejecución de pruebas funcionales y documentación de procesos, actuando como el principal punto de resolución para problemas complejos y garantizando la continuidad operativa del negocio mediante soporte evolutivo y preventivo.",
            en: "Technical and functional support specialist for critical applications, managing the full incident lifecycle through Invgate under strict service level agreements (SLAs). I run technical diagnostics, execute functional testing and document processes, acting as the main point of resolution for complex problems and safeguarding business continuity through adaptive and preventive support.",
          },
          tags: [
            { es: "SQL", en: "SQL" },
            { es: "Invgate", en: "Invgate" },
            { es: "Azure DevOps", en: "Azure DevOps" },
            { es: "Troubleshooting", en: "Troubleshooting" },
            { es: "Postman", en: "Postman" },
          ],
        },
        {
          title: {
            es: "Implementation Consultant",
            en: "Implementation Consultant",
          },
          company: {
            es: "NovaRed S.A. · Tiempo completo",
            en: "NovaRed S.A. · Full-time",
          },
          period: {
            es: "Ene 2021 - Jun 2022 · 1 año 6 meses",
            en: "Jan 2021 - Jun 2022 · 1 year 6 months",
          },
          desc: {
            es: "Participé activamente en la implementación y parametrización de la plataforma RSA Archer (GRC) para entidades del sector bancario. Trabajé como nexo técnico-funcional, encargándome del relevamiento de requerimientos, la negociación de alcances y la configuración del sistema para la gestión de KPIs y documentación normativa, asegurando soluciones alineadas a las necesidades del cliente.",
            en: "Took an active part in implementing and configuring the RSA Archer (GRC) platform for banking-sector organizations. Worked as the technical-functional liaison, handling requirements gathering, scope negotiation and system configuration for KPI management and regulatory documentation, ensuring solutions aligned with client needs.",
          },
          tags: [
            { es: "GRC", en: "GRC" },
            { es: "Análisis de Requerimientos", en: "Requirements Analysis" },
            { es: "Troubleshooting", en: "Troubleshooting" },
            { es: "Parametrización", en: "Configuration" },
            { es: "Sector Bancario", en: "Banking Sector" },
          ],
        },
      ],
    },

    certifications: {
      label: { es: "Certificaciones", en: "Certifications" },
      items: [
        {
          title: {
            es: "AWS Certified Solutions Architect – Associate (En curso)",
            en: "AWS Certified Solutions Architect – Associate (In progress)",
          },
          issuer: {
            es: "Amazon Web Services (AWS)",
            en: "Amazon Web Services (AWS)",
          },
          period: { es: "Dic 2026", en: "Dec 2026" },
          desc: {
            es: "Formación enfocada en el diseño de soluciones resilientes, de alto rendimiento y costo-eficientes en la nube de AWS. Incluye el despliegue de arquitecturas multi-capa, gestión de servicios de cómputo, almacenamiento, bases de datos y estrategias avanzadas de seguridad y red.",
            en: "Training focused on designing resilient, high-performance and cost-efficient solutions on AWS. Covers deploying multi-tier architectures, managing compute, storage and database services, and advanced security and networking strategies.",
          },
        },
      ],
    },

    education: {
      label: { es: "Educación", en: "Education" },
      items: [
        {
          title: { es: "Data Science", en: "Data Science" },
          institution: {
            es: "UTN.BA - Centro de e-Learning",
            en: "UTN.BA - e-Learning Center",
          },
          period: { es: "Ene 2025 - Mar 2025", en: "Jan 2025 - Mar 2025" },
          desc: {
            es: "Formación especializada en la extracción, limpieza y análisis estadístico de grandes volúmenes de datos para la generación de insights estratégicos. Incluye el desarrollo de modelos predictivos utilizando Python, manejo de librerías de Machine Learning y visualización de datos complejos para facilitar la toma de decisiones basada en evidencia.",
            en: "Specialized training in extracting, cleaning and statistically analyzing large data volumes to produce strategic insights. Covers building predictive models with Python, working with Machine Learning libraries, and visualizing complex data to support evidence-based decision-making.",
          },
        },
        {
          title: { es: "Javascript", en: "JavaScript" },
          institution: { es: "Coderhouse", en: "Coderhouse" },
          period: { es: "Nov 2023 - Ene 2024", en: "Nov 2023 - Jan 2024" },
          desc: {
            es: "Especialización en programación funcional y lógica de desarrollo con JavaScript (ES6+). Implementación de interactividad avanzada, manipulación del DOM y consumo de APIs externas para la creación de aplicaciones web dinámicas y escalables.",
            en: "Specialization in functional programming and development logic with JavaScript (ES6+). Building advanced interactivity, DOM manipulation and consumption of external APIs to create dynamic, scalable web applications.",
          },
        },
        {
          title: { es: "Desarrollo Web", en: "Web Development" },
          institution: { es: "Coderhouse", en: "Coderhouse" },
          period: { es: "Sep 2023 - Nov 2023", en: "Sep 2023 - Nov 2023" },
          desc: {
            es: "Capacitación en la creación de sitios web profesionales utilizando HTML y CSS. Enfoque en diseño responsivo, optimización de rendimiento y buenas prácticas de maquetación para garantizar una excelente experiencia de usuario en cualquier dispositivo.",
            en: "Training in building professional websites with HTML and CSS. Focus on responsive design, performance optimization and solid markup practices to ensure an excellent user experience on any device.",
          },
        },
        {
          title: { es: "Técnico en Informática", en: "Computer Technician" },
          institution: {
            es: "Instituto Técnico Dr. Emilio Lamarca",
            en: "Instituto Técnico Dr. Emilio Lamarca",
          },
          period: { es: "2012 - 2015", en: "2012 - 2015" },
          desc: {
            es: "Secundario técnico con orientación en informática.",
            en: "Technical secondary school with a specialization in computing.",
          },
        },
      ],
    },

    skills: {
      skillsLabel: { es: "Habilidades", en: "Skills" },
      languagesLabel: { es: "Idiomas", en: "Languages" },
      methodologiesLabel: { es: "Metodologías", en: "Methodologies" },
      items: [
        { es: "Troubleshooting", en: "Troubleshooting" },
        { es: "SQL", en: "SQL" },
        { es: "Scripting & Logic", en: "Scripting & Logic" },
        { es: "API Testing", en: "API Testing" },
        { es: "AWS", en: "AWS" },
        { es: "IA", en: "AI" },
      ],
      languages: [
        { es: "Español", en: "Spanish" },
        { es: "Inglés", en: "English" },
      ],
      methodologies: [
        { es: "Agile / Scrum", en: "Agile / Scrum" },
        { es: "SLA Management", en: "SLA Management" },
        { es: "Root Cause Analysis (RCA)", en: "Root Cause Analysis (RCA)" },
        { es: "Technical Documentation", en: "Technical Documentation" },
        { es: "ITIL Foundations", en: "ITIL Foundations" },
      ],
    },

    projects: {
      label: { es: "Proyectos", en: "Projects" },
      githubLink: { es: "Ver en GitHub ↗", en: "View on GitHub ↗" },
      items: [
        {
          title: {
            es: "Cloud Resume Challenge (AWS | DevOps)",
            en: "Cloud Resume Challenge (AWS | DevOps)",
          },
          period: { es: "2026", en: "2026" },
          desc: {
            es: "Despliegue de una infraestructura Serverless en AWS para hostear un portfolio profesional. Implementación de CI/CD mediante GitHub Actions, almacenamiento en S3, seguridad con CloudFront y un contador de visitas dinámico utilizando API Gateway, Lambda y DynamoDB.",
            en: "Deployment of a serverless AWS infrastructure to host a professional portfolio. CI/CD with GitHub Actions, S3 storage, CloudFront for security, and a dynamic visit counter built with API Gateway, Lambda and DynamoDB.",
          },
          tags: [
            { es: "AWS S3", en: "AWS S3" },
            { es: "Serverless", en: "Serverless" },
            { es: "CI/CD", en: "CI/CD" },
            { es: "API Gateway", en: "API Gateway" },
            { es: "AWS Lambda & DynamoDB", en: "AWS Lambda & DynamoDB" },
          ],
        },
        {
          title: { es: "Tute (Agente de IA)", en: "Tute (AI Agent)" },
          period: { es: "2026", en: "2026" },
          desc: {
            es: "Agente conversacional embebido en este mismo portfolio. RAG sobre una base de conocimiento propia y tool use, todo armado a mano sin frameworks de agentes. Hoy corre en modo demo con respuestas simuladas; el backend serverless (API Gateway + Lambda) está en integración.",
            en: "Conversational agent embedded in this portfolio. RAG over a custom knowledge base plus tool use, all built by hand without agent frameworks. It currently runs in demo mode with simulated responses; the serverless backend (API Gateway + Lambda) is being integrated.",
          },
          tags: [
            { es: "IA", en: "AI" },
            { es: "RAG", en: "RAG" },
            { es: "Tool use", en: "Tool use" },
            { es: "AWS Lambda", en: "AWS Lambda" },
            { es: "API Gateway", en: "API Gateway" },
          ],
        },
        {
          title: {
            es: "JobFit (IA | Pipeline)",
            en: "JobFit (AI | Pipeline)",
          },
          period: { es: "En desarrollo", en: "In development" },
          desc: {
            es: "Sistema que analiza una oferta laboral en 4 pasos: extrae los requisitos, compara mi perfil real contra la oferta, y genera un mensaje para LinkedIn y un CV optimizado para ATS — sin scores ni porcentajes, todo el análisis es cualitativo.",
            en: "A system that analyzes a job posting in 4 steps: it extracts the requirements, compares my real profile against the posting, and generates a LinkedIn message and an ATS-optimized resume — no scores or percentages, the whole analysis is qualitative.",
          },
          tags: [
            { es: "IA", en: "AI" },
            { es: "Pipeline", en: "Pipeline" },
            { es: "ATS", en: "ATS" },
            { es: "Python", en: "Python" },
          ],
        },
      ],
    },

    footer: {
      copyright: { es: "© 2026 Matías Oviedo", en: "© 2026 Matías Oviedo" },
    },
  },
} as const;

export type Dictionary = typeof dictionary;
