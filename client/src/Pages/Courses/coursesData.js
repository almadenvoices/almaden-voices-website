// Data-only. Edit here to add/update courses.
export const courses = [
    {
        id: "av-spring-24",
        title: "Public Speaking – Spring Cohort",
        status: "current",               // "current" | "past"
        level: "Beginner",
        grades: "3–5",
        format: "In-person",
        location: "Almaden Valley, San Jose",
        startDate: "2025-03-10",
        endDate:   "2025-04-07",
        dayTime: "Mondays · 4:00–5:15 PM",
        seatsRemaining: 6,
        price: 149,
        badge: "Filling fast",
        blurb:
            "Four focused sessions covering voice, eye contact, body language, structure, and delivery. Final mini-speech in week 4.",
        cover:
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1600&auto=format&fit=crop",
        ctaLink: "/enroll"               // or full URL
    },
    {
        id: "av-spring-24-adv",
        title: "Confident Speakers – Advanced",
        status: "current",
        level: "Advanced",
        grades: "6–8",
        format: "In-person",
        location: "Almaden Valley, San Jose",
        startDate: "2025-03-12",
        endDate:   "2025-04-09",
        dayTime: "Wednesdays · 5:15–6:30 PM",
        seatsRemaining: 2,
        price: 169,
        badge: "New",
        blurb:
            "For returning students. Impromptu drills, persuasive frameworks, and audience Q&A.",
        cover:
            "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?q=80&w=1600&auto=format&fit=crop",
        ctaLink: "/enroll"
    },
    {
        id: "summer-camp-24",
        title: "Summer Speaking Camp (1-week)",
        status: "current",
        level: "Mixed",
        grades: "4–8",
        format: "In-person",
        location: "San Jose",
        startDate: "2025-06-16",
        endDate:   "2025-06-20",
        dayTime: "Mon–Fri · 9:30–12:00 PM",
        seatsRemaining: 10,
        price: 225,
        badge: "Popular",
        blurb:
            "Daily practice + showcase on Friday. Great starter for new speakers.",
        cover:
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop",
        ctaLink: "/enroll"
    },

    // ---- Past examples ----
    {
        id: "fall-24",
        title: "Public Speaking – Fall Cohort",
        status: "past",
        level: "Beginner",
        grades: "3–5",
        format: "In-person",
        location: "Almaden Valley, San Jose",
        startDate: "2024-09-09",
        endDate:   "2024-10-07",
        dayTime: "Mondays · 4:00–5:15 PM",
        seatsRemaining: 0,
        price: 149,
        blurb: "Completed with 100% final talks delivered. 🎉",
        cover:
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop",
        recapLink: "/sessions/fall-24"
    },
    {
        id: "winter-24",
        title: "Winter Weekend Workshop",
        status: "past",
        level: "Mixed",
        grades: "5–8",
        format: "Online",
        location: "Zoom",
        startDate: "2024-12-14",
        endDate:   "2024-12-15",
        dayTime: "Sat–Sun · 10:00–12:00 PM",
        seatsRemaining: 0,
        price: 95,
        blurb: "Two-day intensive with storytelling & debate basics.",
        cover:
            "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop",
        recapLink: "/sessions/winter-24"
    }
];
