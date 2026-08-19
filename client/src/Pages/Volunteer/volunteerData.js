// ============================================================
// VOLUNTEER POSITIONS — edit here to change the cards
// ============================================================
// `id` is what gets stored in the application form's checkbox list and shown
// in the email, so keep it stable once applications start coming in.

export const POSITIONS = [
    {
        id: "outreach",
        title: "Outreach & Partnerships",
        openings: "2 volunteers",
        summary: "Find and email the nonprofits, libraries, and community centers that could host a free workshop.",
        intro: "You'll be how Almaden Voices meets the rest of San José. This role is for someone who isn't afraid to send the email or make the call, and who can keep track of a lot of conversations at once.",
        doing: [
            "Research nonprofits, community centers, libraries, and youth organizations that could host a free workshop",
            "Reach out by email and phone to introduce Almaden Voices and propose a partnership",
            "Follow up — most partnerships happen on the third email, not the first",
            "Keep a shared tracker of who's been contacted, what they said, and what's next",
        ],
        looking: [
            "Comfortable writing professional emails and speaking on the phone",
            "Persistent without being pushy",
            "Organized enough to remember who you contacted three weeks ago",
            "Spanish is a real plus — several of the communities we serve are Spanish-speaking",
        ],
    },
    {
        id: "grants",
        title: "Grants Researcher",
        summary: "Track down the grants and corporate giving programs that fund a year of free workshops.",
        intro: "Funding is what turns free workshops from something we can do a few times into something we can do all year. This role finds the money.",
        doing: [
            "Search for grant opportunities that fit a small youth-education nonprofit in Santa Clara County",
            "Build and maintain a spreadsheet of opportunities: funder, amount, deadline, eligibility, status",
            "Identify companies with established community giving or matching programs",
            "Draft outreach to those companies and track responses",
            "Flag deadlines early enough that we can actually meet them",
        ],
        looking: [
            "Genuinely enjoys research and doesn't mind reading eligibility fine print",
            "Detail-oriented — a missed deadline or a missed eligibility rule costs us the whole opportunity",
            "Comfortable in Google Sheets",
            "Clear writer",
        ],
    },
    {
        id: "events",
        title: "Events Coordinator",
        summary: "Own the logistics for our one-year anniversary gala in late October, plus fundraisers after it.",
        intro: "We're planning our one-year anniversary gala for late October, plus fundraisers through the year. This role owns the logistics so the events actually happen.",
        doing: [
            "Plan and run fundraising events, starting with the one-year anniversary gala",
            "Handle logistics: venue, timeline, supplies, volunteer assignments, run-of-show",
            "Coordinate outreach to attendees and any local sponsors",
            "Keep a budget and stick to it",
        ],
        looking: [
            "Organized and calm under a deadline",
            "Willing to chase down details nobody else wants to chase",
            "Some event or club-leadership experience is helpful but not required",
            "Available in the run-up to late October",
        ],
    },
    {
        id: "schools",
        title: "School Partnerships Lead",
        summary: "Build the relationships that get our workshops onto school campuses, starting with SJUSD.",
        intro: "Getting into schools is our single biggest goal this year. This role builds and holds those relationships, starting with San José Unified.",
        doing: [
            "Build and maintain our relationship with SJUSD and other districts",
            "Identify the right people — principals, after-school coordinators, expanded learning offices",
            "Send follow-up emails and schedule workshops on campuses",
            "Keep a clear record of every school, contact, and conversation",
        ],
        looking: [
            "Professional and patient — school staff are busy and timelines are slow",
            "Good written communication",
            "Comfortable following up repeatedly without getting discouraged",
            "Some familiarity with how schools work is a plus",
        ],
    },
    {
        id: "instructor",
        title: "Instructor",
        inPerson: true,
        summary: "Be in the room with the kids, teaching public speaking to grades K–9 in person.",
        intro: "You'll be the person in the room with the kids. This is the role that makes everything else worth doing.",
        doing: [
            "Teach public speaking and confidence skills to students in grades K–9, in person",
            "Run interactive, activity-based sessions using our curriculum",
            "Help students prepare for end-of-session showcases",
            "Collect pre- and post-session surveys",
        ],
        looking: [
            "Genuinely comfortable and patient with kids",
            "Public speaking, debate, theater, or teaching/tutoring experience",
            "Reliable — students and families are counting on you to show up",
            "Spanish is a strong plus",
            "Must be able to get to session locations around San José",
        ],
        note: "Volunteers working directly with students may be asked to complete a background check depending on the site, and instructors are never alone one-on-one with a student.",
    },
    {
        id: "bilingual",
        title: "Bilingual Communications Volunteer",
        summary: "Translate our flyers, forms, and outreach into Spanish, and interpret at in-person workshops.",
        intro: "Several communities we serve are primarily Spanish-speaking. Right now our flyers, forms, and outreach are English-only, which limits who can find us.",
        doing: [
            "Translate flyers, registration forms, and outreach emails into Spanish",
            "Help interpret at in-person workshops and community meetings",
            "Review materials for cultural fit, not just literal translation",
        ],
        looking: [
            "Fluent written and spoken Spanish",
            "Comfortable interpreting live",
        ],
    },
];

// ============================================================
// DEADLINE — after applications close, flip this to false and the
// form is replaced by the "applications are closed" message below.
// ============================================================
export const APPLICATIONS_OPEN = true;

export const DEADLINE_LINE = "Applications close Monday, August 31 at 9:00 PM PT";
export const COMMITMENT_LINE = "About 2–3 hours per week, September through December";

export const CLOSED_MESSAGE = {
    title: "Applications are closed",
    body: "Thanks to everyone who applied. Applications for our fall volunteer roles closed on August 31. We're interviewing now and will be in touch with applicants directly. If you'd still like to help, email us at almadenvoices@gmail.com and we'll keep you in mind for the next round.",
};

export const CONFIRMATION_MESSAGE =
    "Thanks for applying! Applications close August 31 at 9 PM PT. We'll be in touch the first week of September to schedule interviews.";
