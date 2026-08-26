import React from "react";

/**
 * English/Spanish strings for the register flow.
 *
 * Three display modes:
 *   "en"   — English only
 *   "es"   — Spanish only
 *   "both" — English with the Spanish alongside it (the default), matching the
 *            bilingual interest form: short text joined with " / ", longer text
 *            stacked with the Spanish in muted italics underneath.
 *
 * Strings with a {n} or {x} placeholder are filled in by fill() below.
 */

export const LANG_STORAGE_KEY = "av-register-lang";
export const DEFAULT_LANG = "both";

export const T = {
    // ---- Hero ----
    heroBadge: { en: "Limited Spots Available", es: "Cupos limitados" },
    heroTitle: { en: "Register for a Session", es: "Regístrese para una sesión" },
    heroSub: {
        en: "Choose an option below to get started, and watch your child grow into a confident communicator.",
        es: "Elija una opción a continuación para comenzar y vea a su hijo/a convertirse en un comunicador seguro.",
    },

    // ---- Chooser buttons ----
    chooseWorkshopPrefix: { en: "Click here to sign up for our", es: "Haga clic aquí para inscribirse en nuestro" },
    chooseInterestTitle: {
        en: "Click here if you're interested in an upcoming workshop",
        es: "Haga clic aquí si le interesa un próximo taller",
    },
    chooseInterestSub: {
        en: "Leave your info and we'll email you as soon as the next one opens.",
        es: "Deje su información y le avisaremos cuando abra el próximo taller.",
    },
    chooseCoachingTitle: {
        en: "Click here to book a 1-on-1 coaching session",
        es: "Haga clic aquí para reservar una sesión de asesoría individual",
    },
    chooseCoachingSub: {
        en: "One hour of personal coaching · $20 online or $30 in person · Funds our free workshops",
        es: "Una hora de asesoría personal · $20 en línea o $30 en persona · Financia nuestros talleres gratuitos",
    },

    // ---- Left rail ----
    whoTitle: { en: "Who Can Join?", es: "¿Quién puede participar?" },
    whoBody: {
        en: "This free workshop is open to kids ages 5 to 14. No experience needed — all levels welcome!",
        es: "Este taller gratuito está abierto a niños de 5 a 14 años. No se necesita experiencia: ¡todos los niveles son bienvenidos!",
    },
    learnTitle: { en: "What You'll Learn", es: "Qué aprenderá" },
    learnBody: {
        en: "The fundamentals of public speaking — how to speak clearly and confidently, overcome nervousness, and present in front of others.",
        es: "Los fundamentos de hablar en público: cómo hablar con claridad y confianza, superar el nerviosismo y presentar frente a otras personas.",
    },
    expectTitle: { en: "What to Expect", es: "Qué esperar" },
    expectBody: {
        en: "Short, hands-on live sessions with plenty of practice. Once you're registered, we'll send all the details and reminders before the workshop begins.",
        es: "Sesiones en vivo, breves y prácticas, con mucho tiempo para practicar. Una vez inscrito, le enviaremos todos los detalles y recordatorios antes de que comience el taller.",
    },

    // ---- Session picker ----
    chooseSession: { en: "Choose a Session", es: "Elija una sesión" },
    whichSession: { en: "Which session are you registering for?", es: "¿Para qué sesión se está inscribiendo?" },
    notSurePrefix: { en: "Not sure which session is right?", es: "¿No sabe cuál sesión es la adecuada?" },
    browseSessions: { en: "Browse our upcoming sessions", es: "Vea nuestras próximas sesiones" },
    notSureSuffix: { en: "to learn more.", es: "para saber más." },
    selectSession: { en: "Select a session...", es: "Seleccione una sesión..." },
    fullTag: { en: "(Full)", es: "(Lleno)" },
    noSessionsTitle: {
        en: "No sessions are open for registration right now",
        es: "No hay sesiones abiertas para inscripción en este momento",
    },
    noSessionsBody: {
        en: "New sessions are announced regularly. Leave your info in the form below and we'll email you as soon as the next workshop opens!",
        es: "Anunciamos nuevas sesiones con regularidad. Deje su información en el formulario de abajo y le avisaremos en cuanto abra el próximo taller.",
    },
    waitlistNote: {
        en: "This session is full — submit your form to join the waitlist",
        es: "Esta sesión está llena: envíe el formulario para unirse a la lista de espera",
    },

    // ---- Student info ----
    studentInfo: { en: "Student Information", es: "Información del estudiante" },
    howMany: { en: "How many children are you registering?", es: "¿Cuántos niños está inscribiendo?" },
    howManyHint: {
        en: "Registering multiple children? Add them all here — no need to fill out the form again!",
        es: "¿Inscribe a varios niños? Agréguelos todos aquí; no hace falta llenar el formulario otra vez.",
    },
    childN: { en: "Child {n}", es: "Niño/a {n}" },
    remove: { en: "Remove", es: "Eliminar" },
    firstName: { en: "First Name", es: "Nombre" },
    lastName: { en: "Last Name", es: "Apellido" },
    studentFirstName: { en: "Student First Name", es: "Nombre del estudiante" },
    studentLastName: { en: "Student Last Name", es: "Apellido del estudiante" },
    phFirstName: { en: "First name", es: "Nombre" },
    phLastName: { en: "Last name", es: "Apellido" },
    age: { en: "Age", es: "Edad" },
    selectAge: { en: "Select age...", es: "Seleccione la edad..." },
    yearsOld: { en: "{n} years old", es: "{n} años" },
    addAnotherChild: { en: "Add Another Child", es: "Agregar otro niño/a" },

    // ---- Parent info ----
    parentInfo: { en: "Parent/Guardian Information", es: "Información del padre, madre o tutor" },
    parentFirstName: { en: "Parent/Guardian First Name", es: "Nombre del padre, madre o tutor" },
    parentLastName: { en: "Parent/Guardian Last Name", es: "Apellido del padre, madre o tutor" },
    nameConflict: {
        en: "Parent/guardian name cannot be the same as the child's name. Please enter the parent's actual name.",
        es: "El nombre del padre, madre o tutor no puede ser igual al del niño/a. Por favor escriba el nombre real del adulto.",
    },
    email: { en: "Email", es: "Correo electrónico" },
    phone: { en: "Phone Number", es: "Número de teléfono" },
    schoolName: { en: "School Name", es: "Nombre de la escuela" },
    phSchool: { en: "e.g. Graystone Elementary", es: "p. ej. Graystone Elementary" },
    country: { en: "Country", es: "País" },
    phCountry: { en: "e.g. Canada, India, United States", es: "p. ej. Canadá, India, Estados Unidos" },
    homeZip: { en: "Home ZIP / Postal Code", es: "Código postal de su casa" },
    phHomeZip: { en: "e.g. V6B 1A1 or 95120", es: "p. ej. V6B 1A1 o 95120" },

    // ---- Mailing address ----
    mailingAddress: { en: "Mailing Address", es: "Dirección postal" },
    mailingNote: {
        en: "We send personalized welcome letters and certificates to our students by mail. Your address is never shared with third parties.",
        es: "Enviamos cartas de bienvenida personalizadas y certificados a nuestros estudiantes por correo. Su dirección nunca se comparte con terceros.",
    },
    streetAddress: { en: "Street Address", es: "Dirección" },
    city: { en: "City", es: "Ciudad" },
    state: { en: "State", es: "Estado" },
    zipCode: { en: "ZIP Code", es: "Código postal" },

    // ---- Extras ----
    additionalInfo: { en: "Additional Information", es: "Información adicional" },
    phAdditional: {
        en: "Any special requirements, allergies, or information we should know...",
        es: "Cualquier necesidad especial, alergia o información que debamos saber...",
    },

    // ---- Donation ----
    supportTitle: { en: "Support Our Workshop", es: "Apoye nuestro taller" },
    supportFree: { en: "completely free", es: "completamente gratuito" },
    supportLeadEn: { en: "This workshop is", es: "Este taller es" },
    supportNoDonation: {
        en: "— no donation is required to register.",
        es: "; no se requiere ninguna donación para inscribirse.",
    },
    supportOnline: {
        en: "However, a small $5–$10 contribution helps us cover the cost of hosting the workshop online. Every bit helps us keep these workshops free and accessible for families around the world!",
        es: "Sin embargo, una pequeña contribución de $5 a $10 nos ayuda a cubrir el costo de realizar el taller en línea. ¡Cada aporte nos ayuda a mantener estos talleres gratuitos y accesibles para familias de todo el mundo!",
    },
    supportInPerson: {
        en: "However, a small $5–$10 contribution helps us cover the cost of the library room, materials, and supplies. Every bit helps us keep these workshops accessible for all families!",
        es: "Sin embargo, una pequeña contribución de $5 a $10 nos ayuda a cubrir el costo del salón de la biblioteca, los materiales y los suministros. ¡Cada aporte nos ayuda a mantener estos talleres accesibles para todas las familias!",
    },
    noThanks: { en: "No thanks", es: "No, gracias" },
    donateThanks: {
        en: "Thank you for your generosity! You'll be directed to complete your donation after registering.",
        es: "¡Gracias por su generosidad! Le llevaremos a completar su donación después de inscribirse.",
    },
    donateSkip: {
        en: "No worries at all — your spot is secured either way!",
        es: "No se preocupe: su lugar está asegurado de todos modos.",
    },

    // ---- Consent + submit ----
    photoTitle: { en: "Photo and video permission", es: "Permiso de fotos y video" },
    photoIntro: {
        en: "We sometimes photograph or record students during sessions and showcases. Please choose one:",
        es: "A veces tomamos fotos o grabamos a los estudiantes durante las sesiones y presentaciones. Por favor elija una opción:",
    },
    photoYes: {
        en: "Yes, I give permission for photos or video of my child to appear on the Almaden Voices website, program materials, and social media, identified by first name only.",
        es: "Sí, doy permiso para que aparezcan fotos o videos de mi hijo/a en el sitio web, los materiales del programa y las redes sociales de Almaden Voices, identificado/a solo por su nombre de pila.",
    },
    photoNo: {
        en: "No, please do not photograph or record my child.",
        es: "No, por favor no fotografíen ni graben a mi hijo/a.",
    },
    futureContact: {
        en: "I would like to be contacted about future Almaden Voices sessions and events, and to receive the Almaden Voices newsletter.",
        es: "Deseo recibir información sobre futuras sesiones y eventos de Almaden Voices, y suscribirme al boletín de Almaden Voices.",
    },
    agreePrefix: { en: "I have read and agree to the Almaden Voices", es: "He leído y acepto la" },
    privacyPolicy: { en: "Privacy Policy", es: "Política de Privacidad" },
    and: { en: "and", es: "y los" },
    termsOfService: { en: "Terms of Service", es: "Términos de Servicio" },
    agreeSuffix: { en: ".", es: "de Almaden Voices." },
    submitting: { en: "Submitting...", es: "Enviando..." },
    registerNow: { en: "Register Now", es: "Inscribirse ahora" },
    registerCount: { en: "Register {n} Children", es: "Inscribir a {n} niños" },

    // ---- Errors ----
    errPhotoConsent: {
        en: "Please choose a photo and video permission option to continue.",
        es: "Por favor elija una opción de permiso de fotos y video para continuar.",
    },
    errAgree: {
        en: "Please agree to the Privacy Policy to continue.",
        es: "Por favor acepte la Política de Privacidad para continuar.",
    },
    errNameConflict: {
        en: "The parent/guardian name cannot be the same as the child's name. Please enter the parent's actual name.",
        es: "El nombre del padre, madre o tutor no puede ser igual al del niño/a. Por favor escriba el nombre real del adulto.",
    },
    errSubmit: {
        en: "Failed to submit registration. Please try again.",
        es: "No se pudo enviar la inscripción. Por favor intente de nuevo.",
    },
    errNetwork: {
        en: "Network error. Please check your connection and try again.",
        es: "Error de conexión. Por favor revise su conexión e intente de nuevo.",
    },

    // ---- Success ----
    successTitle: { en: "Registration Confirmed!", es: "¡Inscripción confirmada!" },
    successBody: {
        en: "Thank you for registering! Your spot is confirmed. A confirmation email with workshop details has been sent to your email.",
        es: "¡Gracias por inscribirse! Su lugar está confirmado. Le enviamos un correo de confirmación con los detalles del taller.",
    },
    toast: {
        en: "Registration submitted! Check your email for confirmation.",
        es: "¡Inscripción enviada! Revise su correo para la confirmación.",
    },
    close: { en: "Close", es: "Cerrar" },

    // ---- Language toggle ----
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
