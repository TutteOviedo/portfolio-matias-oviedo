"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { TUTE_HEAD_IMAGES, TUTE_FULL_IMAGES, TuteState } from "@/lib/tuteImages";
import { useLanguage } from "./LanguageProvider";
import { dictionary, Entry } from "@/lib/i18n/dictionary";

export type TuteWidgetHandle = { open: () => void };

type Message = {
  role: "user" | "tute";
  text: string;
  link?: { href: string; label: string };
  // Marca los mensajes que no son conversación real (la respuesta automática
  // de playDemo al abrir el widget), para no mandarlos como "history" al
  // backend.
  demo?: boolean;
};

type Translate = (entry: Entry) => string;

// Decide si un link que manda Tute apunta al propio sitio o a algo externo.
// A los internos los navegamos con el router de Next (usando solo el
// pathname) para que la conversación del widget sobreviva al cambio de
// página; a los externos los abrimos en pestaña nueva.
function resolveTuteLink(href: string): { internal: boolean; path: string } {
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://matiasoviedo.com.ar";
    const url = new URL(href, base);
    const internal = url.hostname === "matiasoviedo.com.ar" || url.hostname === "localhost";
    return { internal, path: `${url.pathname}${url.search}${url.hash}` };
  } catch {
    // Si el href no es una URL válida, lo tratamos como path interno tal cual.
    return { internal: true, path: href };
  }
}

// Arma el "history" que le mandamos al backend: los últimos 10 mensajes de
// la conversación real (sin la semilla, el aviso de construcción ni la
// respuesta de playDemo, que no entran a este arreglo), mapeados al formato
// { role, content } que espera la Lambda.
function buildHistoryPayload(msgs: Message[]) {
  return msgs
    .filter((m) => !m.demo)
    .slice(-10)
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
}

// Mensajes precargados que se muestran al abrir el chat: el aviso de "en
// construcción" y una conversación de ejemplo (modo demo). Se arman con el
// idioma activo, así el toggle ES/EN también los traduce. Cuando el backend
// real esté conectado, esto se reduce al historial vacío.
function buildSeedMessages(t: Translate): Message[] {
  const d = dictionary.tute;
  return [
    { role: "tute", text: t(d.constructionNotice) },
    { role: "user", text: t(d.demoUserQ1) },
    { role: "tute", text: t(d.demoTuteA1) },
    { role: "user", text: t(d.demoUserQ2) },
    {
      role: "tute",
      text: t(d.demoTuteA2),
      link: { href: "/evals", label: t(d.demoTuteA2Link) },
    },
  ];
}

// ACA REEMPLAZAR: esta es la respuesta de relleno que se usa en "modo demo"
// (cuando todavía no hay una API real conectada). Cuando el backend esté
// funcionando, este texto deja de usarse - la respuesta real la arma el
// Lambda de /aws/lambda/tute-handler.
const DEMO_REPLY = "Así voy a responder en vivo una vez que esté conectado a la API 👋";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TuteWidget = forwardRef<TuteWidgetHandle>(function TuteWidget(_, ref) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tuteState, setTuteState] = useState<TuteState>("idle");
  // Solo el historial que se va agregando (respuesta de demo, mensajes del
  // usuario y sus respuestas). Los mensajes precargados salen de
  // buildSeedMessages() en cada render, para que reaccionen al idioma.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const demoPlayedRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  }

  async function playDemo() {
    await sleep(1000);
    setTuteState("thinking");
    setTyping(true);
    scrollToBottom();
    await sleep(1600);
    setTyping(false);
    setTuteState("talking");
    setMessages((prev) => [...prev, { role: "tute", text: DEMO_REPLY, demo: true }]);
    scrollToBottom();
    await sleep(1400);
    setTuteState("idle");
  }

  function openWidget() {
    setIsOpen(true);
    if (!demoPlayedRef.current) {
      demoPlayedRef.current = true;
      playDemo();
    }
  }

  useImperativeHandle(ref, () => ({ open: openWidget }));

  async function sendMessage() {
    const text = input.trim();
    if (!text || busy) return;

    // El history se arma ANTES de pushear el mensaje actual, así solo manda
    // los turnos previos (el actual ya va aparte en "message").
    const history = buildHistoryPayload(messages);

    setBusy(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    scrollToBottom();

    setTuteState("thinking");
    setTyping(true);
    scrollToBottom();

    let reply: Omit<Message, "role"> = { text: DEMO_REPLY };

    // NEXT_PUBLIC_TUTE_API_URL apunta al endpoint de API Gateway que dispara
    // el Lambda (ver /aws/lambda/tute-handler y aws-roadmap.md), configurado
    // en .env.local. Mientras no esté seteada, el chat sigue funcionando en
    // "modo demo" para no bloquear el resto del desarrollo del sitio.
    const apiUrl = process.env.NEXT_PUBLIC_TUTE_API_URL;

    if (apiUrl) {
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history }),
        });
        const data = await res.json();
        // Si viene "reply" lo mostramos tal cual, incluso cuando la respuesta
        // no es ok (el 429 de rate limit manda igual un reply armado). Si no
        // vino reply (ni con 200 ni con error), caemos al mensaje amable.
        if (data?.reply) {
          reply = { text: data.reply, link: data.link };
        } else {
          reply = { text: t(dictionary.tute.errorReply) };
        }
      } catch (err) {
        reply = { text: t(dictionary.tute.errorReply) };
      }
    } else {
      await sleep(2000); // simula el tiempo de "pensar" mientras no hay API real conectada

      // ACA REEMPLAZAR: esto es un placeholder de prueba nomás, para tener
      // algo que mostrar en modo demo - busca la palabra "evals" a lo bruto
      // en el texto del usuario. Cuando el backend real esté conectado esta
      // lógica no importa en absoluto: es la Lambda la que decide, según el
      // significado de la pregunta (no la palabra literal), cuándo llamar a
      // la herramienta redirigir_a_evals().
      if (text.toLowerCase().includes("evals")) {
        reply = {
          text: "Tengo tool use real y hago RAG sobre la base de conocimiento de Matías - no invento nada. Podés ver los casos de prueba que uso para chequear que respondo bien 👇",
          link: { href: "/evals", label: "Ver evals →" },
        };
      }
    }

    setTyping(false);
    setTuteState("talking");
    setMessages((prev) => [...prev, { role: "tute", ...reply }]);
    scrollToBottom();

    await sleep(1300);
    setTuteState("idle");
    setBusy(false);
  }

  const allMessages = [...buildSeedMessages(t), ...messages];

  return (
    <>
      <div className={`tute-widget${isOpen ? " open" : ""}`}>
        <button
          className="tute-widget-close"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar chat"
        >
          ✕
        </button>
        <div className="tute-header">
          <img className="tute-avatar-img" src={TUTE_HEAD_IMAGES[tuteState]} alt="Tute" />
          <div>
            <b>Tute</b>
            <span className="tute-status-demo">{t(dictionary.tute.demoStatus)}</span>
          </div>
        </div>
        <div className="tute-dev-notice" role="status">
          {t(dictionary.tute.devBadge)}
        </div>
        <div className="chat-log" ref={logRef}>
          {allMessages.map((m, i) => {
            const link = m.link;
            // Interno: navegamos con el router (sin recargar la página) para
            // que el estado del widget y la conversación no se pierdan.
            // Externo: pestaña nueva, como cualquier link que saca del sitio.
            const linkInfo = link ? resolveTuteLink(link.href) : null;
            return (
              <div key={i} className={`bubble ${m.role === "user" ? "user" : "tute"}`}>
                {m.text}
                {link && linkInfo && (
                  linkInfo.internal ? (
                    <button
                      type="button"
                      className="bubble-link"
                      onClick={() => router.push(linkInfo.path)}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      className="bubble-link"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            );
          })}
          {typing && (
            <div className="bubble tute">
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          )}
        </div>
        <div className="chat-input-mock">
          <input
            type="text"
            value={input}
            placeholder="Escribile algo a Tute..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button className="send" onClick={sendMessage} aria-label="Enviar mensaje">
            ➤
          </button>
        </div>
      </div>

      <button
        className={`tute-fab${isOpen ? " open" : ""}`}
        onClick={() => (isOpen ? setIsOpen(false) : openWidget())}
        aria-label="Abrir chat con Tute"
      >
        <img className="fab-avatar-img" src={TUTE_FULL_IMAGES[tuteState]} alt="Tute" />
      </button>
    </>
  );
});

export default TuteWidget;
