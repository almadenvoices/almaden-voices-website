/**
 * The site's four main pages and the sections on each. The top-nav
 * dropdowns, the mobile menu, the footer and the sticky sub-nav all read from this list, so a section only has to be added
 * once.
 *
 * `id` is the anchor on the finished page, e.g. /programs#interview-prep.
 * Never change an id once it's live: it may be in an email or a grant
 * application.
 *
 * `matches` lists the URLs that count as being on that page, for marking
 * it as current in the nav.
 *
 * `hidden: true` keeps a section out of every menu until its content exists
 * (press and Voices are waiting on content).
 */
export const MAIN_PAGES = [
    {
        key: "about",
        label: "About",
        path: "/about",
        matches: ["/about"],
        sections: [
            { id: "our-story", label: "Our story" },
            { id: "where-weve-worked", label: "Where we've worked" },
            { id: "our-team", label: "Our team" },
            // Waiting on content. Turn on in Pages/About/AboutPage.js too.
            { id: "press", label: "Press", hidden: true },
        ],
    },
    {
        key: "programs",
        label: "Programs",
        path: "/programs",
        matches: ["/programs"],
        sections: [
            { id: "workshops", label: "Workshops" },
            { id: "debate-booster", label: "Debate Booster" },
            { id: "coaching", label: "One-on-one coaching" },
            { id: "interview-prep", label: "Interview prep" },
        ],
    },
    {
        key: "get-involved",
        label: "Get involved",
        path: "/get-involved",
        matches: ["/get-involved"],
        sections: [
            { id: "start-a-chapter", label: "Start a chapter" },
            { id: "volunteer", label: "Volunteer" },
            { id: "upcoming-events", label: "Upcoming events" },
        ],
    },
    {
        key: "stories",
        label: "Stories",
        path: "/stories",
        matches: ["/stories"],
        sections: [
            { id: "past-sessions", label: "Past sessions" },
            { id: "june-survey", label: "June camp survey" },
            { id: "parent-reviews", label: "Parent reviews" },
            { id: "student-videos", label: "Student videos" },
            // Waiting on content. Turn on in Pages/Stories/StoriesPage.js too.
            { id: "voices", label: "Voices", hidden: true },
        ],
    },
];

/** Where a section link points: /programs#interview-prep. */
export const sectionHref = (page, section) => `${page.path}#${section.id}`;

export const visibleSections = (page) => page.sections.filter((s) => !s.hidden);

export const pageByKey = (key) => MAIN_PAGES.find((page) => page.key === key);

/** Which main page the current URL belongs to, for marking it in the nav. */
export function pageForPath(pathname) {
    return MAIN_PAGES.find((page) => page.matches.includes(pathname));
}
