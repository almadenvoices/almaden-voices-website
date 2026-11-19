/**
 * Old URLs and where they live now. The server answers these with a
 * permanent (301) redirect before the page even loads (see OLD_URL_REDIRECTS
 * in server.js, which must list the same paths). This copy covers links
 * followed inside the app, where the server never sees the request.
 */
export const OLD_URL_REDIRECTS = {
    "/home": "/",
    "/courses1": "/programs",
    "/impact": "/stories",
    "/volunteer": "/get-involved#volunteer",
    "/chapters": "/get-involved#start-a-chapter",
    "/events": "/get-involved#upcoming-events",
};

/**
 * Old "/path#anchor" links whose section moved somewhere specific. Checked
 * before OLD_URL_REDIRECTS. Only works inside the app: servers never see the
 * part after the #, so a fresh visit lands on the target above instead.
 */
export const HASH_REDIRECTS = {
    "/about#mission": "/about#our-story",
    "/about#team": "/about#our-team",
    "/impact#our-work": "/about#where-weve-worked",
    "/impact#testimonials": "/stories#student-videos",
    "/impact#past-sessions": "/stories#past-sessions",
    "/impact#session-outcomes": "/stories#june-survey",
    "/impact#parent-reviews": "/stories#parent-reviews",
    "/events#host": "/get-involved#host-an-event",
    "/chapters#apply": "/get-involved#chapter-application",
    "/chapters#learn-more": "/get-involved#what-is-a-chapter",
    "/volunteer#apply": "/get-involved#apply",
    // The server sends /impact to /stories and the browser keeps the old
    // anchor, so these catch fresh visits from old links too.
    "/stories#testimonials": "/stories#student-videos",
    "/stories#our-work": "/about#where-weve-worked",
    "/stories#session-outcomes": "/stories#june-survey",
};
