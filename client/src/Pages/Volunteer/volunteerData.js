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
        summary: "You'll reach out to nonprofits and other organizations to find partnerships where we can teach.",
        intro: "This role is for someone who enjoys starting conversations, building relationships, and helping us find new communities where we can teach.",
        doing: [
            "Research nonprofits, community centers, libraries, and youth organizations that could host a free workshop",
            "Reach out by email and phone to introduce Almaden Voices and propose a partnership",
            "Follow up and send emails. Most partnerships happen on the third email, not the first",
            "Keep a shared spreadsheet of who's been contacted, what they said, and next steps",
        ],
        looking: [
            "Comfortable writing professional emails and speaking on the phone",
            "Persistent without being pushy",
            "Organized enough to keep track of conversations and next steps",
            "Good-to-have: Spanish, since a lot of San José communities are Spanish-speaking",
        ],
    },
    {
        id: "grants",
        title: "Grants Researcher",
        summary: "Funding is what turns free workshops into something we can run all year. This role finds the money.",
        intro: "This role helps us find the funding that allows Almaden Voices to offer more free workshops throughout the year.",
        doing: [
            "Search for grant opportunities that fit a small youth-education nonprofit in Santa Clara County",
            "Build and maintain a spreadsheet of opportunities: funder, amount, deadline, eligibility, status",
            "Identify companies with established community giving or matching programs",
            "Draft outreach to those companies and track responses",
            "Flag deadlines early enough that we can actually meet them",
        ],
        looking: [
            "Genuinely enjoys research and doesn't mind reading eligibility fine print",
            "Detail-oriented— small details matter when we're evaluating grant opportunities",
            "Comfortable in Google Sheets",
            "Clear writer",
        ],
    },
    {
        id: "donor-outreach",
        title: "Donor Outreach & Thank-Yous",
        summary: "The families we've already taught are the people most likely to give. This role is how we ask.",
        intro: "Our families, donors, and volunteers make our work possible. This role helps us build those relationships by thanking people for their support and inviting them to help us continue providing free workshops.",
        doing: [
            "Write and send handwritten thank-you cards to past families, donors, and volunteers",
            "Call families who've been through a workshop and ask whether they'd support the next one",
            "Keep a shared record of who was contacted, what they said, and who asked not to be contacted again",
            "Send the follow-up — a card after a call, a thank-you after a donation",
            "Flag anyone worth asking again later, or who offered something other than money",
        ],
        looking: [
            "Comfortable having warm, respectful conversations about supporting our work",
            "Warm on the phone, and able to hear a no without taking it personally",
            "Handwriting neat enough to make a thoughtful thank-you card",
            "Organized and respectful of each family's communication preferences",
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
            "Proactive about following up on details and keeping things moving",
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
            "Professional and patient — school partnerships often take time to develop",
            "Good written communication",
            "Comfortable following up thoughtfully and staying persistent when conversations take time",
            "Some familiarity with how schools work is a plus",
        ],
    },
    {
        id: "instructor",
        title: "Instructor",
        summary: "You'll be the person teaching students public speaking and confidence skills.",
        intro: "You'll work directly with students and help them become more confident speakers. This is the role that makes everything else worth doing.",
        doing: [
            "Teach public speaking and confidence skills to students in grades K–9, either online or in-person",
            "Run interactive, activity-based sessions using our curriculum",
            "Help students prepare for end-of-session showcases",
            "Collect pre- and post-session surveys",
        ],
        looking: [
            "Genuinely comfortable and patient with kids",
            "Public speaking, debate, theater, or teaching/tutoring experience",
            "Reliable — students and families are counting on you to show up",
            "Spanish is a strong plus",
            "For in-person sessions, must be able to get to session locations around San José",
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
            "Talk to students, instructors, and parents for short pieces about what's happening in our workshops",
            "Keep a simple calendar of what goes out and when, so the newsletter actually ships on schedule",
            "Pull together photos and session details from the team into something people want to read",
        ],
        looking: [
            "Clear, warm writer — this reads like a person, not a press release",
            "Reliable about deadlines, so families and supporters can hear from us consistently",
            "Comfortable asking people for quotes and details",
            "Good-to-have: any experience with a school paper, blog, or email tool",
        ],
    },
    {
        id: "social-media",
        title: "Social Media Manager",
        summary: "We do work worth seeing, and almost nobody sees it. This role is how families find us.",
        intro: "Almaden Voices has very little presence on social media, which means families who would love our workshops never hear they exist. This role builds that presence from close to nothing — so there's a lot of room to shape it.",
        doing: [
            "Plan and post regularly, starting with Instagram and wherever else local families actually are",
            "Turn workshop moments into posts worth sharing — a first speech, a showcase, a warm-up circle",
            "Write short captions that sound like a person, in Spanish too wherever you can",
            "Reply to comments and messages, and pass anything that needs us straight to us",
            "Keep a simple posting calendar, so it doesn't stall the first busy week",
        ],
        looking: [
            "Knows how these platforms actually work, not just how to scroll them",
            "Can take and edit a decent photo or short video on a phone",
            "Writes short and warm rather than formal",
            "Reliable — an account that posts twice and goes quiet looks worse than no account at all",
            "Good-to-have: Spanish, or having run an account for a club, team or school group",
        ],
        note: "Students appear online only when their family has given photo and video permission, which we record for every child and which you'll be able to check before anything goes out. First names only, never a surname.",
    },
    {
        id: "website",
        title: "Website Development & Management",
        summary: "Almost everyone who finds us finds us through almadenvoices.org. This role keeps it working and makes it better.",
        intro: "Almost everyone who finds us finds us through the website. It's where families register for workshops, where volunteers apply, and where coaching gets booked and paid for. This role keeps it running and makes it better.",
        doing: [
            "Keep the site current — new workshops and dates, new photos, new volunteer roles",
            "Fix what breaks, and check that registration and payment still work after every change",
            "Improve how the site reads on a phone, which is how most families open it",
            "Help keep pages fast, accessible, and clearly worded in both English and Spanish",
            "Document how things work so future volunteers can easily build on your work",
        ],
        looking: [
            "Comfortable with HTML, CSS and JavaScript. React is a real plus, since the site is built in it",
            "Willing to learn the parts you haven't met yet — the site also uses Node and Google Cloud",
            "Careful and unhurried around registration and payments, since these systems are used by real families",
            "Able to explain a change in plain language to someone non-technical",
            "Good-to-have: any experience with Git, or with making a site work properly on a phone",
        ],
        note: "Changes are reviewed before they go live, and you won't need access to payment or family data to do the work.",
    },
    {
        id: "bilingual",
        title: "Bilingual Communications Volunteer",
        summary: "Several of the communities we serve are primarily Spanish-speaking.",
        intro: "Several communities we serve are primarily Spanish-speaking. This role helps us make our programs more accessible by ensuring families can find and engage with Almaden Voices in Spanish.",
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

export const DEADLINE_LINE = "Applications close Monday, September 7 at 9:00 PM PT";
export const COMMITMENT_LINE = "About 2–3 hours a week, for at least 3 months";

export const CLOSED_MESSAGE = {
    title: "Applications are closed",
    body: "Thanks to everyone who applied. Applications for our fall volunteer roles closed on September 7. We're reading through them now and will be in touch with applicants directly. If you'd still like to help, email us at almadenvoices@gmail.com and we'll keep you in mind for the next round.",
};

export const CONFIRMATION_MESSAGE =
    "Thanks for applying! Applications close September 7 at 9 PM PT. We'll be in touch the second week of September.";
