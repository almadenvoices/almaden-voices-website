# The Almaden Voices monthly newsletter

There are two copies of the newsletter, and they are kept deliberately identical:

| File | What it's for |
| --- | --- |
| `newsletter/almaden-voices-newsletter-2026-09.html` | The readable copy. Open it in a browser to see what the email looks like, or paste it into a Gmail compose window to send it by hand. |
| The `NEWSLETTER` block inside `google-apps-script/RegistrationScript.js` | **This is the one that actually gets sent.** It builds exactly the same email, and it's what `sendNewsletterToAll` uses. |

Editing one does **not** change the other. If you only ever send through the Apps
Script, the `NEWSLETTER` block is the only thing you need to edit — the HTML file
is there so you can look at the design without running anything.

---

## Sending it

The live script lives in your Google account, not in this repo. Editing the file
here changes nothing until you paste it in.

1. Go to [script.google.com](https://script.google.com) and open the Almaden
   Voices registration script.
2. Paste in the updated code from `google-apps-script/RegistrationScript.js`.
3. Edit the newsletter (see the next section), including the list of addresses.
4. Save (Cmd+S).
5. Pick **`sendTestNewsletter`** from the function dropdown at the top and press
   **Run**. One copy arrives at almadenvoices@gmail.com. Open it on your phone as
   well as your laptop and actually read it.
6. Happy? Pick **`sendNewsletterToAll`** and press **Run**.

You do **not** need to Deploy. Deploy is only for the registration form — saving
and running is enough for a newsletter.

Three things the script handles for you:

- **Nobody gets the same edition twice.** Every send is recorded in the
  `ReminderLog` tab of the spreadsheet. Add five more addresses tomorrow, run it
  again, and only those five receive it.
- **One email per person.** Everyone sees only their own address, never the list.
- **Gmail's 100-a-day limit.** The script stops cleanly when you run out and logs
  exactly who still needs it, so you can run it again the next day.

---

## What to edit each month

Everything below lives at the top of the `NEWSLETTER` section of
`RegistrationScript.js`. Look for the line `const NEWSLETTER = {`.

### 1. The edition ID — change this every single month

```js
const NEWSLETTER_ID = "2026-09-issue-1";
```

This is what separates one edition from the next in the "already sent" log.
**If you forget to change it, nobody who received last month's newsletter will
receive this one.** Use the month, e.g. `"2026-10-issue-2"`.

### 2. Who it goes to

```js
const NEWSLETTER_TO = [
  "someone@example.com",
  "someone.else@example.com",
];
```

One address per line, each in quotes, each with a comma after it. Blank lines and
duplicates are ignored, and addresses are matched case-insensitively.

To also send to every family in the Registrations tab, set:

```js
const NEWSLETTER_INCLUDE_REGISTRANTS = true;
```

### 3. The issue number, month, and subject

```js
subject:    "Almaden Voices Newsletter — Issue #1, September 2026",
monthLabel: "Monthly Newsletter &middot; September 2026",   // small text, top right
issueLine:  "Issue #1 &middot; September 2026",             // under the blue rule
```

`&middot;` is the `·` separator — leave it as-is and just change the words
around it.

### 4. The greeting

```js
greeting: [
  "Hi everyone,",
  "Welcome to the very first Almaden Voices monthly newsletter!",
  "I have a few exciting updates...",
],
```

Each line in quotes becomes its own paragraph.

### 5. The sections

Each story is one `{ ... }` block inside `sections: [ ... ]`:

```js
{
  heading: "We Made the Front Page!",     // printed uppercase automatically
  paragraphs: [
    "First paragraph.",
    "Second paragraph.",
  ],
  button: {
    label: "Read the Almaden Times feature",
    url: "https://timesmedia.pageflip.site/publications/AlmadenTimes",
  },
},
```

Only `heading` and `paragraphs` are required. The optional pieces:

| Field | What it does |
| --- | --- |
| `button: { label, url }` | The blue call-to-action button. Add `wide: true` for a short label like "Donate" so it doesn't look cramped. |
| `image: { src, alt }` | A photo under the paragraphs. See "Swapping the logo and images" below. |
| `bullets: [ "one", "two" ]` | A bulleted list. |
| `paragraphsAfterBullets: [ ... ]` | Paragraphs printed after the list. |
| `paragraphsAfterButton: [ ... ]` | Paragraphs printed after the button. |
| `callout: { label, text }` | The tinted box with the blue left edge, for a deadline or key announcement. |
| `tinted: true` | Draws the whole section inside a shaded, bordered box. This is what makes the donation ask look different from a normal story. |

Leave a field out entirely and that piece simply isn't drawn.

### 6. The sign-off and the unsubscribe line

```js
signoff: [ "Warmly,", "...Anjika Bansal...", ... ],
unsubscribe: "You&rsquo;re receiving this email because...",
```

Keep the unsubscribe line. It is what separates a newsletter from spam, both to a
reader and to Gmail.

---

## Adding a section

Copy an existing `{ ... }` block inside `sections: [ ... ]`, paste it where you
want the new story to appear, and change the text. Watch the commas: every block
ends with `},`.

```js
sections: [
  { heading: "First story",  paragraphs: [ "..." ] },
  { heading: "New story",    paragraphs: [ "..." ] },   // ← pasted in
  { heading: "Third story",  paragraphs: [ "..." ] },
],
```

Spacing, the dividing lines between sections, and the order all follow
automatically — you never adjust padding by hand.

**In the HTML file**, the same thing means copying everything between
`<!-- CONTENT SECTION -->` and `</tr>`, including both `<tr>` and `</tr>`, plus
the `<!-- section divider -->` row that goes above it.

## Removing a section

Delete the whole `{ ... }` block, from the opening `{` to the `},`. In the HTML
file, delete the whole `<tr>...</tr>` and its divider row.

## Reordering sections

Cut and paste whole `{ ... }` blocks. The donation block doesn't have to be third
— wherever you put the section with `tinted: true`, it draws its shaded box and
the spacing around it adjusts.

---

## Swapping the logo and images

**The logo** is set once, near the top of the rendering code:

```js
const NL_LOGO = "https://almadenvoices.org/almaden_voices_logo.png";
```

**Images must be on a public web address.** A file on your laptop will show up as
a broken box for everyone else. The easy route: anything in `client/public/` on
the site is already public once deployed, so a photo saved as
`client/public/images/october-workshop.png` becomes
`https://almadenvoices.org/images/october-workshop.png`.

To put a photo in a section:

```js
image: {
  src: "https://almadenvoices.org/images/october-workshop.png",
  alt: "Students presenting at the October workshop",
},
```

Always write real `alt` text. Outlook and Gmail block images by default, so for a
lot of readers the alt text *is* the picture. Photos are drawn at full width and
scale down on a phone — no cropping, no fixed height.

In the HTML file there's a commented-out **OPTIONAL IMAGE SLOT** in the first
section. Delete the `<!--` above it and the `-->` below it to switch it on.

---

## The rules this email follows (please don't break these)

Email clients are not browsers. Roughly half of what works on the website is
stripped or ignored in an inbox, so:

- **Tables for layout.** No flexbox, no grid, no positioning.
- **All CSS written onto the elements themselves.** No `<style>` block — Gmail
  throws it away the moment anything is pasted into a compose window, which is
  why this newsletter doesn't reuse the fonts the registration emails use.
- **Web-safe fonts only** — Helvetica/Arial for text, Georgia available for
  headings. No Google Fonts.
- **600px wide, centred**, and fluid below that, so it stays one readable column
  on a phone without needing media queries.
- **Body text is 16px** with 26px line height. Small print is 14px. Those are the
  only two text sizes — adding more is what makes an email look amateur.
- **Buttons are padded table cells with a link inside**, never `<button>`.
- **Background colours, never background images**, and no JavaScript.

The palette matches the website: accent `#2563EB`, body text `#374151`, muted
`#6B7280`, rules `#E5E7EB`. One accent colour, used for the header bar, the
section headings, the buttons and the rules.

---

## Checking your work before you send

1. Open `newsletter/almaden-voices-newsletter-2026-09.html` in Chrome and read it.
2. Drag the window narrow, down to about the width of a phone. Nothing should be
   cut off at the right edge and no text should shrink.
3. Run `sendTestNewsletter` and read the real thing in Gmail, on your phone too.
4. Click every link in the test email. It's the one mistake you can't take back.
