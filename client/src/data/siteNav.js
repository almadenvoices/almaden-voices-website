/**
 * The site's four main pages and the sections on each. The top-nav
 * dropdowns, the mobile menu, the footer and (from the About rebuild on) the
 * sticky sub-nav all read from this list, so a section only has to be added
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
 *
 * WHILE THE RESTRUCTURE IS IN PROGRESS: pages that haven't been rebuilt yet
 * still live at their old URLs, so their entries carry a `to` that points at
 * the old location. When a page is rebuilt, change its `path`, delete the
 * `to` overrides, and add the old URL to the redirect list in server.js and
 * App.js.
 */
export const MAIN_PAGES = [
    {
        key: "about",
        label: "About",
        path: "/about",
        matches: ["/about"],
        sections: [
            { id: "our-story", label: "Our story", to: "/about#mission" },
            { id: "our-team", label: "Our team", to: "/about#team" },
            { id: "where-weve-worked", label: "Where we've worked", to: "/impact#our-work" },
            { id: "press", label: "Press", hidden: true },
        ],
    },
    {
        key: "programs",
        label: "Programs",
        path: "/courses1",
        matches: ["/courses1"],
        sections: [
            { id: "workshops", label: "Workshops", to: "/courses1" },
            { id: "debate-booster", label: "Debate Booster", to: "/courses1#debate-booster" },
            { id: "coaching", label: "One-on-one coaching", to: "/register" },
            // Goes live with the Programs page rebuild.
            { id: "interview-prep", label: "Interview prep", hidden: true },
        ],
    },
    {
        key: "get-involved",
        label: "Get involved",
        path: "/volunteer",
        matches: ["/volunteer", "/chapters", "/events"],
        sections: [
            { id: "volunteer", label: "Volunteer", to: "/volunteer" },
            { id: "start-a-chapter", label: "Start a chapter", to: "/chapters" },
            { id: "upcoming-events", label: "Upcoming events", to: "/events" },
        ],
    },
    {
        key: "stories",
        label: "Stories",
        path: "/impact",
        matches: ["/impact"],
        sections: [
            { id: "parent-reviews", label: "Parent reviews", to: "/impact#parent-reviews" },
            { id: "student-videos", label: "Student videos", to: "/impact#testimonials" },
            { id: "voices", label: "Voices", hidden: true },
        ],
    },
];

/** Where a section link points: its interim override, or path#id. */
export const sectionHref = (page, section) => section.to || `${page.path}#${section.id}`;

export const visibleSections = (page) => page.sections.filter((s) => !s.hidden);

/** Which main page the current URL belongs to, for marking it in the nav. */
export function pageForPath(pathname) {
    return MAIN_PAGES.find((page) => page.matches.includes(pathname));
}
