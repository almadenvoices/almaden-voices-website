// ============================================================
//  VOLUNTEER PAGE — ALL THE TEXT LIVES IN THIS FILE
// ============================================================
//
//  You can change any wording on the Volunteer page by editing this file.
//  Everything between "quotation marks" is text that shows up on the site.
//  Edit what's inside the quotes, keep the quotes and the commas.
//
//  Where things are, top to bottom:
//    POSITIONS ............ the roles and their bullet lists
//    MIN_GRADE ............ the grade floor (currently 8th)
//    APPLICATIONS_OPEN .... true = form showing, false = "closed" message
//    The banner lines, closed message, and confirmation message
//
//  To add a role, copy one whole { ... } block inside POSITIONS, paste it,
//  and change the text. Give it an "id" no other role uses.
//  To remove a role, delete its whole { ... } block.
//
//  Two things to be careful with:
//    - Don't change an "id" once applications are coming in. It's what
//      shows up in the application emails.
//    - Apostrophes inside text need a backslash: 'you\'ll' or use "you'll".
//
//  When you're done, tell me and I'll put it live. Nothing changes on the
//  real site until it's deployed.
//
// ============================================================

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
        summary: "You'll be how Almaden Voices meets the rest of San José.",
        intro: "You'll be how Almaden Voices meets the rest of San José. This role is for someone who isn't afraid to send the email or make the call, and who can keep track of a lot of conversations at once.",
        doing: [
            "Research nonprofits, community centers, libraries, and youth organizations that could host a free workshop",
            "Reach out by email and phone to introduce Almaden Voices and propose a partnership",
            "Follow up and send emails. Most partnerships happen on the third email, not the first",
            "Keep a shared spreadsheet of who's been contacted, what they said, and next steps",
        ],
        looking: [
            "Comfortable writing professional emails and speaking on the phone",
            "Persistent without being pushy",
            "Organized enough to remember who you contacted three weeks ago",
            "Good-to-have: Spanish, since a lot of San José communities are Spanish-speaking",
        ],
    },
    {
        id: "grants",
        title: "Grants Researcher",
        summary: "Funding is what turns free workshops into something we can run all year. This role finds the money.",
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
        id: "donor-outreach",
        title: "Donor Outreach & Thank-Yous",
        summary: "The families we've already taught are the people most likely to give. This role is how we ask.",
        intro: "Hundreds of families have been through a free Almaden Voices workshop, and most of them have never once been asked to help pay for the next one. This role writes to them and calls them — first to say thank you, then to ask.",
        doing: [
            "Write and send handwritten thank-you cards to past families, donors, and volunteers",
            "Call families who've been through a workshop and ask whether they'd support the next one",
            "Keep a shared record of who was contacted, what they said, and who asked not to be contacted again",
            "Send the follow-up — a card after a call, a thank-you after a donation",
            "Flag anyone worth asking again later, or who offered something other than money",
        ],
        looking: [
            "Comfortable asking for money out loud — that's the whole role, and it's harder than it sounds",
            "Warm on the phone, and able to hear a no without taking it personally",
            "Handwriting neat enough that a card reads as a thank-you rather than a chore",
            "Organized — nobody should get the same call twice, and nobody should get one after asking us to stop",
        ],
        note: "You'll always contact a parent or guardian, never a student directly. Anyone who asks not to be contacted goes on a do-not-contact list and stays there.",
    },
    {
        id: "events",
        title: "Events Coordinator",
        summary: "Our one-year anniversary gala is in late October, and there are fundraisers after it.",
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
        summary: "Getting into schools is our single biggest goal this year.",
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
        summary: "You'll be the person in the room with the kids.",
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
        id: "newsletter",
        title: "Newsletter Writer",
        summary: "Families sign up to hear from us. This role is what actually lands in their inbox.",
        intro: "Families, volunteers, and donors sign up to hear from us. This role is what actually lands in their inbox — the stories from our workshops, what's coming up, and where we need help.",
        doing: [
            "Write and send our newsletter to families, volunteers, and donors",
            "Interview students, instructors, and parents for short pieces about what's happening in our workshops",
            "Keep a simple calendar of what goes out and when, so the newsletter actually ships on schedule",
            "Pull together photos and session details from the team into something people want to read",
        ],
        looking: [
            "Clear, warm writer — this reads like a person, not a press release",
            "Reliable about deadlines, since a newsletter nobody sends doesn't help anyone",
            "Comfortable asking people for quotes and details",
            "Good-to-have: any experience with a school paper, blog, or email tool like Mailchimp",
        ],
    },
    {
        id: "bilingual",
        title: "Bilingual Communications Volunteer",
        summary: "Several of the communities we serve are primarily Spanish-speaking.",
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

// Minimum grade level for every role. The form checks what's typed into the
// age/grade box against this and blocks anything clearly below it.
export const MIN_GRADE = 8;
export const GRADE_REQUIREMENT_LINE =
    "Volunteers must be in 8th grade or higher.";

export const DEADLINE_LINE = "Applications close Friday, September 4 at 9:00 PM PT";
export const COMMITMENT_LINE = "About 2–3 hours a week, for at least 3 months";

export const CLOSED_MESSAGE = {
    title: "Applications are closed",
    body: "Thanks to everyone who applied. Applications for our fall volunteer roles closed on September 4. We're interviewing now and will be in touch with applicants directly. If you'd still like to help, email us at almadenvoices@gmail.com and we'll keep you in mind for the next round.",
};

export const CONFIRMATION_MESSAGE =
    "Thanks for applying! Applications close September 4 at 9 PM PT. We'll be in touch the second week of September to schedule interviews.";
