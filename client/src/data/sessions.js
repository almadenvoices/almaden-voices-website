/**
 * UPCOMING SESSIONS — the list shown on the Register page (almadenvoices.org/register).
 *
 * Families don't register on our site. Each session here becomes a card with a
 * "Register on AniSetu" button that opens that session's page on AniSetu.
 * When the list is empty, the page says no workshops are open right now.
 *
 * ─── TO ADD A SESSION ───────────────────────────────────────────────────────
 *   1. Below, copy the EXAMPLE block: every line from  // {  to  // },
 *   2. Paste it just above the line that says  ];
 *   3. In the lines you pasted, delete the  //  at the start of each line.
 *   4. Change the words inside the quotes. Keep the quotes and the commas.
 *   5. Save, then deploy.
 *
 * ─── TO REMOVE A SESSION ────────────────────────────────────────────────────
 *   Delete its lines, from its  {  to its  },
 *
 * Sessions show in the order they're listed, so put the soonest first.
 * The Spanish lines (the ones ending in Es) are optional: leave one out and the
 * English shows in both languages.
 */
export const upcomingSessions = [

    // ===== EXAMPLE — copy from here... =====
    // {
    //     title: "Speak Up, Stand Out",
    //     titleEs: "Habla, destaca",
    //     dates: "Saturday, January 10 & Sunday, January 11, 2027",
    //     datesEs: "Sábado 10 y domingo 11 de enero de 2027",
    //     times: "10:00 AM – 1:00 PM",
    //     ages: "Ages 8–12",
    //     agesEs: "De 8 a 12 años",
    //     location: "Almaden Branch Library, San José",
    //     anisetuUrl: "https://anisetu.com/PASTE-THE-SESSION-LINK-HERE",
    // },
    // ===== ...to here =====

];
