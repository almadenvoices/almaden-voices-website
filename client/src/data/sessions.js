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
 * English shows in both languages. Every line except title is optional too:
 * leave one out and the card just doesn't show it.
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
    //     instructor: "Instructor's first name and last name",
    //     price: "Free",
    //     spots: "20 spots",
    //     description: "One or two sentences about what students will do.",
    //     anisetuUrl: "https://www.anisetu.com/courses?course=PASTE-THE-COURSE-CODE",
    // },
    // ===== ...to here =====

    {
        title: "The Art of Persuasion: Learning How to Use Rhetoric",
        dates: "Wednesday, December 2, 2026",
        datesEs: "Miércoles 2 de diciembre de 2026",
        times: "5:30–6:30 PM PT",
        ages: "Ages 6–10",
        agesEs: "De 6 a 10 años",
        location: "6392 Lillian Way, San José",
        instructor: "Saesha Pal",
        price: "Free",
        priceEs: "Gratis",
        spots: "20 spots",
        spotsEs: "20 lugares",
        description: "Students learn the three pillars of persuasion, how to build an argument from evidence, and how to adapt it to different audiences. Everyone finishes by giving a short persuasive speech.",
        anisetuUrl: "https://www.anisetu.com/courses?course=jp69qfcvw4",
    },

];
