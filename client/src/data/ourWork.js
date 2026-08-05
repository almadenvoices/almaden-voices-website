/**
 * Programs, partnerships and community events — the source for both the
 * homepage numbers band and the "Where We've Worked" section on the Impact
 * page, so the two can't drift apart.
 *
 * ADDING A PHOTO: drop the file in client/public/images/ and set `photo` to
 * "/images/your-file.jpg". Entries with no photo render as text only, which
 * looks fine — better an honest text card than an empty placeholder box.
 *
 * A NOTE ON WORDING: we describe what we did rather than claiming an
 * institutional relationship. No "partner", no logos, no implied endorsement.
 */

// Headline numbers. `note` is the small print under each figure.
export const headlineStats = [
    {
        number: "300",
        label: "Audience Our Students MC'd For",
        note: "A two-hour performance in East San José",
    },
    {
        number: "150",
        label: "Students Taught",
        note: "Beginner through advanced",
    },
    {
        number: "5",
        label: "Countries Reached",
        note: "United States, Canada, India, Singapore, Kenya",
    },
    {
        number: "52",
        label: "Students This Summer",
        note: "Across two Mexican Heritage Plaza camp sessions",
    },
];

export const ourWork = [
    {
        id: "mexican-heritage-plaza-2026",
        title: "Mexican Heritage Plaza Summer Camps",
        place: "East San José, California",
        date: "June & July 2026",
        body: "We brought a free public speaking program to the June and July summer camp sessions at Mexican Heritage Plaza — 24 students in June and 28 in July. It was the first public speaking program offered at these camps. At the end of the summer, students from the program MC'd a two-hour performance in front of an audience of 300.",
        photo: null,
        photoAlt: "",
    },
    {
        id: "national-night-out-2026",
        title: "National Night Out",
        place: "San José, California",
        date: "August 2026",
        body: "Our first community table. We spent the evening meeting neighborhood families and talking with parents, in both English and Spanish, about what public speaking can do for their kids.",
        photo: null,
        photoAlt: "",
        // Captions stay factual: being photographed with someone is not an
        // endorsement, and we don't print titles we can't verify.
        captions: [
            "Almaden Voices at National Night Out 2026 with San José Mayor Matt Mahan",
            "With Jose Salcido, City of San José",
        ],
    },
    {
        id: "canada-workshop-2026",
        title: "Free Canada Public Speaking Workshop",
        place: "Online",
        date: "August 2026",
        body: "A free two-day online workshop for kids across Canada, covering the fundamentals of speaking clearly and confidently in front of a group.",
        photo: null,
        photoAlt: "",
    },
    {
        id: "intl-workshop-2026",
        title: "International Workshop — Singapore & India",
        place: "Online",
        date: "July 2026",
        body: "A free two-day online workshop run across time zones for about 15 students in Singapore and India — our first program taught to families outside North America.",
        photo: null,
        photoAlt: "",
    },
    {
        id: "kenya-mentoring-2026",
        title: "One-on-One Interview Coaching",
        place: "Kenya, remote",
        date: "2026",
        body: "We worked one-on-one with a college student in Kenya preparing for job interviews — remote, free, and on their schedule.",
        photo: null,
        photoAlt: "",
    },
];
