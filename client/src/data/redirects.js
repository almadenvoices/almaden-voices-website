/**
 * Old URLs and where they live now. The server answers these with a
 * permanent (301) redirect before the page even loads (see OLD_URL_REDIRECTS
 * in server.js, which must list the same paths). This copy covers links
 * followed inside the site, where the server never sees the request.
 *
 * Anything after the # is kept, and can be remapped in HASH_REDIRECTS when a
 * section has moved to a different page.
 */
export const OLD_URL_REDIRECTS = {
    "/home": "/",
};

/** "/old-path#old-anchor" -> "/new-path#new-anchor", for moved sections. */
export const HASH_REDIRECTS = {};
