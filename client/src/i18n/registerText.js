import React from "react";

/**
 * English/Spanish strings for the Register page (the list of upcoming workshops).
 *
 * Three display modes:
 *   "en"   — English only
 *   "es"   — Spanish only
 *   "both" — English with the Spanish alongside it (the default): short text
 *            joined with " / ", longer text stacked with the Spanish in muted
 *            italics underneath.
 *
 * Strings with a {n} or {x} placeholder are filled in by fill() below.
 */

export const LANG_STORAGE_KEY = "av-register-lang";
export const DEFAULT_LANG = "both";

export const T = {
    // ---- Hero ----
    heroBadge: { en: "Upcoming Workshops", es: "Próximos talleres" },
    heroTitle: { en: "Register for a Workshop", es: "Inscríbase en un taller" },
    heroSub: {
        en: "Our group workshops are free. Here's what's coming up.",
        es: "Nuestros talleres grupales son gratuitos. Esto es lo que viene.",
    },

    // ---- How registration works ----
    howTitle: { en: "How registration works", es: "Cómo funciona la inscripción" },
    howBody: {
        en: "Registration is handled on AniSetu, an online platform. Each session below links to its page there. A parent or guardian creates the account for children under 13; students 13 and over can register themselves. AniSetu emails you a confirmation, and we'll email you with session details before the session starts.",
        es: "La inscripción se hace en AniSetu, una plataforma en línea. Cada sesión a continuación tiene un enlace a su página allí. Para niños menores de 13 años, un padre, madre o tutor crea la cuenta; los estudiantes de 13 años o más pueden inscribirse por su cuenta. AniSetu le enviará una confirmación por correo electrónico, y nosotros le escribiremos con los detalles antes de que empiece la sesión.",
    },
    policyPrefix: { en: "Before you register, please read our", es: "Antes de inscribirse, lea nuestra" },
    privacyPolicy: { en: "Privacy Policy", es: "Política de privacidad" },
    and: { en: "and", es: "y los" },
    termsOfService: { en: "Terms of Service", es: "Términos de servicio" },

    // ---- Session cards ----
    when: { en: "Dates", es: "Fechas" },
    time: { en: "Time", es: "Horario" },
    ages: { en: "Ages", es: "Edades" },
    where: { en: "Location", es: "Lugar" },
    registerBtn: { en: "Register on AniSetu", es: "Inscribirse en AniSetu" },
    newTab: { en: "(opens in a new tab)", es: "(se abre en una pestaña nueva)" },

    // ---- Nothing open ----
    emptyTitle: { en: "No workshops are open right now", es: "No hay talleres abiertos en este momento" },
    emptyBody: {
        en: "Get our monthly email to hear when the next one opens.",
        es: "Reciba nuestro correo mensual para enterarse cuando abra el próximo.",
    },
    emptyLink: { en: "Sign up at the bottom of this page", es: "Suscríbase al final de esta página" },

    // ---- Coaching pointer ----
    coachingPrefix: { en: "Looking for one-on-one coaching?", es: "¿Busca asesoría individual?" },
    coachingLink: { en: "Book a coaching session", es: "Reserve una sesión de asesoría" },

    langLabel: { en: "Language", es: "Idioma" },
};

/** Substitute {n}/{x} placeholders. */
export function fill(str, values) {
    return Object.keys(values || {}).reduce(
        (out, key) => out.split("{" + key + "}").join(values[key]),
        str
    );
}

/**
 * Plain-string lookup, for placeholders, option text, aria-labels and anywhere
 * else that cannot hold markup. In "both" mode the two languages are joined
 * with a slash.
 */
export function t(entry, lang, values) {
    if (!entry) return "";
    const en = fill(entry.en, values);
    const es = fill(entry.es, values);
    if (lang === "en") return en;
    if (lang === "es") return es;
    return en === es ? en : en + " / " + es;
}

const esInlineStyle = { fontStyle: "italic", opacity: 0.85 };
const esBlockStyle = { display: "block", fontStyle: "italic", opacity: 0.85, fontWeight: 400 };

/**
 * Bilingual text for JSX. `block` puts the Spanish on its own line underneath
 * (headings, labels, paragraphs); otherwise it follows inline after a slash.
 */
export function Bi({ entry, lang, values, block = false }) {
    if (!entry) return null;
    const en = fill(entry.en, values);
    const es = fill(entry.es, values);
    if (lang === "en") return <>{en}</>;
    if (lang === "es") return <>{es}</>;
    if (en === es) return <>{en}</>;
    return (
        <>
            {en}
            <span style={block ? esBlockStyle : esInlineStyle}>{block ? es : " / " + es}</span>
        </>
    );
}
