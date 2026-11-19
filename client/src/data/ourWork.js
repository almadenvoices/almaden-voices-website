/**
 * Programs, partnerships and community events — the source for both the
 * homepage numbers band and the "Where We've Worked" section on the Impact
 * page, so the two can't drift apart.
 *
 * ADDING A PHOTO: drop the file in client/public/images/ and add an entry to
 * that item's `photos` array — { src, alt, caption }. Photos are shown whole,
 * never cropped to fit a card, so nobody ends up with their head cut off.
 * Items with no photos render as a text-only card, so the layout never looks
 * broken while images are pending.
 *
 * A NOTE ON WORDING: we describe what we did rather than claiming an
 * institutional relationship. No "partner", no logos, no implied endorsement.
 * Copy is deliberately short — the numbers carry the weight.
 */

// Headline numbers for the homepage band. `value` is what the counter counts
// up to; keep it a plain number. These are the site-wide figures: if one
// changes, also check the Impact page metrics and the Volunteer page intro.
export const headlineStats = [
    { value: 350, label: "students taught", note: "Since our first class in April 2025" },
    { value: 15, label: "sessions run", note: "Workshops, camps and debate classes" },
    { value: 5, label: "countries", note: "US, Canada, India, Singapore and Kenya" },
    { value: 300, label: "people in one audience", note: "When our summer camp students MC'd a two-hour show" },
];

// The lead story — rendered large, with its numbers pulled out.
export const featuredWork = {
    id: "mexican-heritage-plaza-2026",
    kicker: "Summer 2026 · East San José",
    title: "Mexican Heritage Plaza Summer Camps",
    body: "We brought a free public speaking program to the June and July summer camp sessions, the first ever offered at these camps. At the end of the summer, the students MC'd a two-hour performance.",
    bigNumber: "300",
    bigNumberLabel: "people in the audience",
    stats: [
        { value: "24", label: "students in June" },
        { value: "28", label: "students in July" },
        { value: "1st", label: "program of its kind there" },
    ],
    photo: null,
    photoAlt: "",
};

// Everything else, newest first.
export const ourWork = [
    {
        id: "national-night-out-2026",
        category: "Community",
        accent: "#F59E0B",
        date: "August 2026",
        place: "San José, CA",
        title: "National Night Out",
        body: "Our first community table, meeting neighbourhood families and talking with parents in English and Spanish.",
        // Factual captions. Being photographed with someone is not an
        // endorsement, and we don't print titles we can't verify.
        photos: [
            {
                src: "/images/nno-mayor-mahan-full.jpg",
                alt: "Anjika Bansal and San José Mayor Matt Mahan behind the Almaden Voices table at National Night Out",
                caption: "With San José Mayor Matt Mahan",
            },
            {
                src: "/images/nno-mahan-and-salcido-full.jpg",
                alt: "Anjika Bansal with Mayor Matt Mahan and Jose Salcido at the Almaden Voices table",
                caption: "With Mayor Matt Mahan and Jose Salcido",
            },
            {
                src: "/images/nno-with-emily-full.jpg",
                alt: "Anjika Bansal with Emily at the Almaden Voices table at National Night Out",
                caption: "With Emily at the Almaden Voices table",
            },
        ],
    },
    {
        id: "canada-workshop-2026",
        category: "International",
        accent: "#2563EB",
        date: "August 2026",
        place: "Online · Canada",
        title: "Canada Public Speaking Workshop",
        body: "A free two-day workshop for kids across Canada on speaking clearly and confidently to a group.",
        photos: [
            {
                src: "/images/canada-workshop.jpg",
                alt: "Video call grid of students taking part in the Almaden Voices Canada public speaking workshop",
                caption: "Day one of the Canada workshop",
            },
        ],
    },
    {
        id: "intl-workshop-2026",
        category: "International",
        accent: "#7C3AED",
        date: "July 2026",
        place: "Online · Singapore & India",
        title: "Singapore & India Workshop",
        body: "A free two-day workshop run across time zones for about 15 students. It was our first workshop taught outside North America.",
        photos: [
            {
                src: "/images/singapore-india-workshop.jpg",
                alt: "Video call grid of students joining the Almaden Voices international public speaking workshop from Singapore and India",
                caption: "Students joining from Singapore and India",
            },
        ],
    },
    {
        id: "kenya-mentoring-2026",
        category: "Mentoring",
        accent: "#059669",
        date: "2026",
        place: "Remote · Kenya",
        title: "One-on-One Interview Coaching",
        body: "One-on-one sessions with a university graduate in Kenya preparing for her first interview. Remote, free, and on her schedule.",
        photos: [
            {
                src: "/images/dorcas-and-anjika.jpg",
                alt: "Anjika Bansal and Dorcas side by side on a video call during a one-on-one coaching session",
                caption: "A session with Dorcas, who joins from Kenya. These are free one-on-one video sessions built around interview practice, run on her schedule across time zones.",
            },
        ],
    },
];
