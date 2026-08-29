/**
 * Google Apps Script — Almaden Voices Registration Handler
 *
 * Receives form submissions via POST, writes each student row to a Google Sheet,
 * and sends confirmation + admin notification emails.
 *
 * For workshops listed in the WORKSHOPS config below, the parent confirmation
 * email includes the full schedule (the join link is shared separately), and the registrant
 * is automatically sent reminder emails (2 days before, and shortly before each
 * session day) by the sendWorkshopReminders() function running on an hourly
 * time-based trigger.
 *
 * ONE-TIME SETUP FOR REMINDERS: after pasting/deploying this script, open the
 * Apps Script editor, choose the function "setupReminderTrigger" from the
 * dropdown, and click Run once. That schedules the reminder checks.
 */

// ============================================================
// CONFIG
// ============================================================
const ADMIN_EMAIL = "almadenvoices@gmail.com";
const ORG_NAME = "Almaden Voices";

// Where sendTestJoinLinkEmail() sends its preview copy. Change this to try a
// different inbox; it never touches real registrants.
const TEST_EMAIL = ADMIN_EMAIL;

// BCC'd on every join-link email in the blast, so there's a copy of each send.
const BCC_EMAIL = ADMIN_EMAIL;

// Bump this whenever this file changes, then check it shows up at the web app
// URL after redeploying. If the URL still reports the old version, the new
// code is pasted but not deployed.
const SCRIPT_VERSION = "2026-08-29";

// Desired column order for the Registrations sheet. New columns are appended
// automatically to existing sheets, so this is safe to extend over time.
const REG_HEADERS = [
  "Timestamp",
  "Parent Name",
  "Email",
  "Phone",
  "Student First Name",
  "Student Last Name",
  "Age",
  "Session",
  "Session ID",
  "School Name",
  "Country",
  "Street Address",
  "City",
  "State",
  "ZIP",
  "Additional Info",
  "Privacy Policy Agreed",
  "Photo/Video Permission",
  "Press/Media Permission",
  "Future Contact Opt-In"
];

// Desired column order for the "Volunteer Applications" sheet. Same rules as
// REG_HEADERS: columns are matched by name, and new ones are appended to an
// existing sheet rather than shifting what's already there.
const VOL_HEADERS = [
  "Timestamp",
  "Applicant Name",
  "Email",
  "Phone",
  "Age / Grade",
  "Location",
  "Resume",
  "Positions Applied For",
  "Who Is Applying",
  "Parent/Guardian Name",
  "Parent/Guardian Email",
  "Parent/Guardian Phone",
  "Why This Role",
  "Availability",
  "Photo/Video Consent",
  "Parent/Guardian Aware",
  "Status",
  "Notes"
];

// Desired column order for the "Coaching Sessions" tab — paid 1-on-1 coaching
// bookings. Same rules as the two above: columns are matched by name, and any
// new ones are appended to an existing sheet rather than shifting what is
// already there.
//
// These rows are posted by the website's own server (server.js) after PayPal
// confirms the payment, not by the browser, so a row here always means money
// actually changed hands. "Scheduled?" is left blank on purpose — it is for
// you to fill in once you have agreed a time with the family.
// Desired column order for the "Coaching Waitlist" tab — families who asked to
// be told when the next round of coaching slots opens. No money involved;
// "Contacted?" is blank for you to fill in once you have reached out.
const COACH_WAITLIST_HEADERS = [
  "Timestamp",
  "Parent Name",
  "Email",
  "Phone",
  "Student Name",
  "Student Age",
  "Preferred Format",
  "School Name",
  "Home ZIP",
  "What They Want To Work On",
  "Contacted?"
];

const COACH_HEADERS = [
  "Timestamp",
  "Slot",
  "Format",
  "Amount Paid",
  "Parent Name",
  "Email",
  "Phone",
  "Student Name",
  "Student Age",
  "School Name",
  "Home ZIP",
  "What They Want To Work On",
  "Questions/Comments",
  "Photo/Video Permission",
  "PayPal Order ID",
  "Scheduled?"
];

// ============================================================
// WORKSHOPS — keyed by the session "id" used on the website.
// Any registration whose sessionType matches a key here gets the detailed
// confirmation email + automatic reminders.
// ============================================================
const WORKSHOPS = {
  "canada-workshop-aug-2026": {
    name: "Free Canada Public Speaking Workshop for Kids",
    datesText: "Tuesday, August 4 & Wednesday, August 5, 2026",
    // Shown as one "Time" line while both days match; each session can carry
    // its own `time` if they ever diverge, and the schedule block adapts.
    timesText: "3:00–4:00 PM PT (Vancouver) &middot; 6:00–7:00 PM ET (Toronto)",
    // Start times in UTC (ISO 8601). 3:00 PM PDT = 10:00 PM UTC the same day.
    sessions: [
      {
        label: "Day 1: Tuesday, August 4, 2026",
        time: "3:00–4:00 PM PT (Vancouver) &middot; 6:00–7:00 PM ET (Toronto)",
        startUtc: "2026-08-04T22:00:00Z"
      },
      {
        label: "Day 2: Wednesday, August 5, 2026",
        time: "3:00–4:00 PM PT (Vancouver) &middot; 6:00–7:00 PM ET (Toronto)",
        startUtc: "2026-08-05T22:00:00Z"
      }
    ],
    // Webex Personal Room — no meeting password required.
    // The same room hosts both days.
    webex: {
      link: "https://anjikabansal-405.my.webex.com/meet/almadenvoices",
      meetingNumber: "2554 439 4487",
      phone: "+1-650-479-3208",
      phoneTapToJoin: "+1-650-479-3208,,25544394487##",
      videoDial: "almadenvoices.anjikabansal-405.my@webex.com",
      videoIp: "173.243.2.68"
    }
  },
  "nj-workshop-aug-2026": {
    name: "Free New Jersey Public Speaking Workshop for Kids",
    datesText: "Saturday, August 29 &amp; Sunday, August 30, 2026",
    timesText: "2:00–3:00 PM ET (New Jersey) &middot; 11:00 AM–12:00 PM PT",
    // Start times in UTC. Late August is EDT (UTC-4), so 2:00 PM ET = 18:00 UTC.
    sessions: [
      {
        label: "Day 1: Saturday, August 29, 2026",
        time: "2:00–3:00 PM ET (New Jersey) &middot; 11:00 AM–12:00 PM PT",
        startUtc: "2026-08-29T18:00:00Z"
      },
      {
        label: "Day 2: Sunday, August 30, 2026",
        time: "2:00–3:00 PM ET (New Jersey) &middot; 11:00 AM–12:00 PM PT",
        startUtc: "2026-08-30T18:00:00Z"
      }
    ],
    // Same Webex Personal Room as the other online workshops — no password,
    // and it hosts both days.
    webex: {
      link: "https://anjikabansal-405.my.webex.com/meet/almadenvoices",
      meetingNumber: "2554 439 4487",
      phone: "+1-650-479-3208",
      phoneTapToJoin: "+1-650-479-3208,,25544394487##",
      videoDial: "almadenvoices.anjikabansal-405.my@webex.com",
      videoIp: "173.243.2.68"
    }
  }
};

// Reminder timing (milliseconds)
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// ============================================================
// POST handler — called by the React form
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // The Volunteer With Us page posts here too, tagged with formType.
    if (data.formType === "volunteer") {
      return handleVolunteerApplication(data);
    }

    // Paid 1-on-1 coaching bookings, posted by the website's server once
    // PayPal has confirmed the payment.
    if (data.formType === "coaching") {
      return handleCoachingBooking(data);
    }

    // Families waiting for the next round of coaching slots.
    if (data.formType === "coaching-waitlist") {
      return handleCoachingWaitlist(data);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getRegistrationsSheet(ss);

    const timestamp = new Date();
    const students = data.students || [];
    const workshop = WORKSHOPS[data.sessionType];

    // Write one row per student (columns matched by header name)
    students.forEach(function(student) {
      appendMappedRow(sheet, {
        "Timestamp": timestamp,
        "Parent Name": data.parentName,
        "Email": data.email,
        "Phone": data.phone,
        "Student First Name": student.firstName,
        "Student Last Name": student.lastName,
        "Age": student.age,
        "Session": data.sessionLabel || data.sessionType,
        "Session ID": data.sessionType || "",
        "School Name": data.schoolName || "",
        "Country": data.country || "",
        "Street Address": data.streetAddress || "",
        "City": data.city || "",
        "State": data.state || "",
        "ZIP": data.zipCode || "",
        "Additional Info": data.additionalInfo || "",
        "Privacy Policy Agreed": data.privacyAgreed ? "Yes" : "No",
        "Photo/Video Permission": data.photoConsent ? "Yes" : "No",
        "Press/Media Permission": data.pressConsent ? "Yes" : "No",
        "Future Contact Opt-In": data.futureContact ? "Yes" : "No"
      });
    });

    // Shared email pieces
    const studentListHtml = students.map(function(st) {
      return "<li><strong>" + st.firstName + " " + st.lastName + "</strong>" +
        (st.age ? " (Age " + st.age + ")" : "") + "</li>";
    }).join("");
    const studentNames = students.map(function(st) { return st.firstName + " " + st.lastName; }).join(", ");
    const childWord = students.length === 1 ? "child" : students.length + " children";

    // Admin notification
    GmailApp.sendEmail(ADMIN_EMAIL,
      "New Registration (" + childWord + "): " + studentNames + " - " + (data.sessionLabel || ''),
      "New registration received. See HTML version for details.",
      { htmlBody: buildAdminHtml(data, students, studentListHtml, childWord, timestamp), name: ORG_NAME + " Registrations", replyTo: data.email }
    );

    // Parent confirmation — detailed for workshops, generic otherwise
    const firstStudent = students[0] || {};
    const parentHtml = workshop
      ? buildWorkshopConfirmationHtml(data, workshop, students, studentListHtml, firstStudent)
      : buildGenericConfirmationHtml(data, students, studentListHtml, firstStudent);
    const subject = workshop
      ? ("You're registered: " + workshop.name)
      : ("Registration Confirmed: " + (data.sessionLabel || ORG_NAME));

    GmailApp.sendEmail(data.email, subject,
      "Your registration is confirmed. See the HTML version of this email for details.",
      { htmlBody: parentHtml, name: ORG_NAME, bcc: ADMIN_EMAIL }
    );

    return jsonOut({ success: true });
  } catch (err) {
    return jsonOut({ success: false, error: err.message });
  }
}

// ============================================================
// SHEET HELPERS (column-name based, safe for existing sheets)
// ============================================================
function getRegistrationsSheet(ss) {
  return getSheetWithHeaders(ss, "Registrations", REG_HEADERS);
}

// The coaching waitlist gets its own tab beside the bookings.
function getCoachingWaitlistSheet(ss) {
  const sheet = getSheetWithHeaders(ss, "Coaching Waitlist", COACH_WAITLIST_HEADERS);
  sheet.setFrozenRows(1);
  return sheet;
}

// Paid coaching bookings land on their own tab in the registration
// spreadsheet, beside the workshop registrations.
function getCoachingSheet(ss) {
  const sheet = getSheetWithHeaders(ss, "Coaching Sessions", COACH_HEADERS);
  sheet.setFrozenRows(1);
  return sheet;
}

// The volunteer applications land on their own tab in the same spreadsheet.
function getVolunteerSheet(ss) {
  const sheet = getSheetWithHeaders(ss, "Volunteer Applications", VOL_HEADERS);
  sheet.setFrozenRows(1);
  return sheet;
}

// Volunteer applications live in their OWN spreadsheet, separate from the
// registrations one. The first application creates it automatically in the
// almadenvoices@gmail.com Drive and the script remembers its ID from then on.
// To use a spreadsheet you made yourself instead, put its ID in
// VOLUNTEER_SHEET_ID near the top of the volunteer section below.
function getVolunteerSpreadsheet() {
  if (VOLUNTEER_SHEET_ID) return SpreadsheetApp.openById(VOLUNTEER_SHEET_ID);

  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty(VOLUNTEER_SHEET_PROP);
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (err) {
      // Deleted or moved to the trash — fall through and make a fresh one
      // rather than dropping the application on the floor.
      Logger.log("Volunteer spreadsheet " + savedId + " unavailable: " + err.message);
    }
  }

  const ss = SpreadsheetApp.create(VOLUNTEER_SHEET_NAME);
  ss.getSheets()[0].setName("Volunteer Applications");
  props.setProperty(VOLUNTEER_SHEET_PROP, ss.getId());
  return ss;
}

function getSheetWithHeaders(ss, name, wantedHeaders) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(wantedHeaders);
    sheet.getRange(1, 1, 1, wantedHeaders.length).setFontWeight("bold");
    return sheet;
  }
  // Migrate: make sure every desired header exists; append any that are missing.
  const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  const missing = wantedHeaders.filter(function(h) { return headers.indexOf(h) === -1; });
  if (missing.length) {
    const startCol = headers.length + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]).setFontWeight("bold");
  }
  return sheet;
}

function appendMappedRow(sheet, valuesByHeader) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(function(h) {
    return valuesByHeader.hasOwnProperty(h) ? valuesByHeader[h] : "";
  });
  sheet.appendRow(row);
}

function headerIndexMap(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach(function(h, i) { map[h] = i; });
  return map;
}

// ============================================================
// EMAIL BUILDERS
//
// Design matches almadenvoices.org: Playfair Display headings, DM Sans body,
// #2563EB accent. Email clients that block web fonts fall back to
// Georgia / Helvetica, which keeps the serif-heading + sans-body pairing.
// ============================================================
const FONT_HEADING = "'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_BODY = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const C_TEXT = "#111827";
const C_MUTED = "#6B7280";
const C_BODY = "#374151";
const C_ACCENT = "#2563EB";
const C_LINE = "#E5E7EB";
const C_SOFT = "#F9FAFB";

// Wraps content in the branded card layout (table-based for email clients).
function emailShell(headline, subhead, innerHtml) {
  return '' +
    '<style>@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@600;700&display=swap");</style>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';margin:0;padding:24px 12px;font-family:' + FONT_BODY + ';">' +
      '<tr><td align="center">' +
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" ' +
          'style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid ' + C_LINE + ';border-radius:16px;overflow:hidden;">' +

          // Header band — kept compact so the email opens on the actual message
          // rather than on a screenful of blue.
          '<tr><td style="background:' + C_ACCENT + ';padding:18px 28px 16px;">' +
            '<p style="margin:0 0 6px;font-family:' + FONT_BODY + ';font-size:11px;letter-spacing:1.4px;' +
              'text-transform:uppercase;color:#BFDBFE;font-weight:700;">' + ORG_NAME + '</p>' +
            '<h1 style="margin:0;font-family:' + FONT_HEADING + ';font-size:21px;line-height:1.3;' +
              'color:#FFFFFF;font-weight:700;">' + headline + '</h1>' +
            (subhead ? '<p style="margin:5px 0 0;font-family:' + FONT_BODY + ';font-size:13px;line-height:1.45;color:#DBEAFE;">' + subhead + '</p>' : '') +
          '</td></tr>' +

          // Body
          '<tr><td style="padding:32px;font-family:' + FONT_BODY + ';font-size:16px;line-height:1.65;color:' + C_BODY + ';">' +
            innerHtml +
          '</td></tr>' +

          // Footer
          '<tr><td align="center" style="background:' + C_SOFT + ';border-top:1px solid ' + C_LINE + ';padding:24px 32px;' +
            'font-family:' + FONT_BODY + ';font-size:13px;line-height:1.6;color:' + C_MUTED + ';text-align:center;">' +
            '<p style="margin:0 0 4px;color:' + C_TEXT + ';font-weight:700;text-align:center;">' + ORG_NAME + '</p>' +
            '<p style="margin:0;text-align:center;">' +
              '<a href="https://almadenvoices.org" style="color:' + C_ACCENT + ';text-decoration:none;">almadenvoices.org</a>' +
              ' &nbsp;&middot;&nbsp; ' +
              '<a href="mailto:' + ADMIN_EMAIL + '" style="color:' + C_ACCENT + ';text-decoration:none;">' + ADMIN_EMAIL + '</a>' +
            '</p>' +
          '</td></tr>' +

        '</table>' +
      '</td></tr>' +
    '</table>';
}

// Small section heading used inside the body.
function sectionTitle(text) {
  return '<p style="margin:0 0 12px;font-family:' + FONT_BODY + ';font-size:12px;letter-spacing:1.2px;' +
    'text-transform:uppercase;color:' + C_MUTED + ';font-weight:700;">' + text + '</p>';
}

// One label / value row inside the "other ways to join" list.
function detailRow(label, valueHtml, note) {
  return '' +
    '<tr><td style="padding:14px 0;border-top:1px solid ' + C_LINE + ';font-family:' + FONT_BODY + ';">' +
      '<p style="margin:0 0 4px;font-size:13px;font-weight:700;color:' + C_TEXT + ';">' + label + '</p>' +
      '<p style="margin:0;font-size:15px;line-height:1.6;color:' + C_BODY + ';">' + valueHtml + '</p>' +
      (note ? '<p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:' + C_MUTED + ';">' + note + '</p>' : '') +
    '</td></tr>';
}

function scheduleBlockHtml(workshop) {
  // When every day runs at the same hour, print one "Time" line under the list.
  // When they differ, print each day's time beneath its own date instead.
  const times = workshop.sessions.map(function(s) { return s.time || workshop.timesText || ''; });
  const sameEveryDay = times.every(function(t) { return t === times[0]; });

  const rows = workshop.sessions.map(function(s, i) {
    return '<tr><td style="padding:10px 0;' + (i ? 'border-top:1px solid ' + C_LINE + ';' : '') +
      'font-family:' + FONT_BODY + ';">' +
      '<p style="margin:0;font-size:16px;color:' + C_TEXT + ';font-weight:500;">' + s.label + '</p>' +
      (!sameEveryDay && times[i]
        ? '<p style="margin:3px 0 0;font-size:15px;color:' + C_BODY + ';">' + times[i] + '</p>'
        : '') +
      '</td></tr>';
  }).join('');

  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('When') +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + rows + '</table>' +
        (sameEveryDay && times[0]
          ? '<p style="margin:14px 0 0;font-family:' + FONT_BODY + ';font-size:15px;color:' + C_BODY + ';">' +
            '<strong style="color:' + C_TEXT + ';">Time:</strong> ' + times[0] + '</p>'
          : '') +
        '<p style="margin:6px 0 0;font-family:' + FONT_BODY + ';font-size:15px;color:' + C_BODY + ';">' +
          '<strong style="color:' + C_TEXT + ';">Where:</strong> Online. The same link works for both days</p>' +
      '</td></tr>' +
    '</table>';
}

// Full Webex join instructions — used in the join-link email and in reminders.
function joinDetailsHtml(workshop) {
  const w = workshop.webex;
  if (!w) return '';

  const passwordLine = w.password
    ? '<br/>Meeting password: <strong style="color:' + C_TEXT + ';">' + w.password + '</strong>' +
      (w.passwordNumeric ? ' (' + w.passwordNumeric + ' from a phone or video system)' : '')
    : '';

  return '' +
    // Primary call to action
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">' +
      '<tr><td align="center" style="padding:0 0 14px;">' +
        '<a href="' + w.link + '" style="background:' + C_ACCENT + ';color:#FFFFFF;text-decoration:none;' +
          'display:inline-block;padding:16px 40px;border-radius:10px;font-family:' + FONT_BODY + ';' +
          'font-size:17px;font-weight:700;">Join the workshop</a>' +
      '</td></tr>' +
      '<tr><td align="center" style="font-family:' + FONT_BODY + ';font-size:12px;line-height:1.6;color:' + C_MUTED + ';word-break:break-all;">' +
        'Button not working? Paste this into your browser:<br/>' +
        '<a href="' + w.link + '" style="color:' + C_ACCENT + ';">' + w.link + '</a>' +
      '</td></tr>' +
    '</table>' +

    // Alternative ways to join
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px 8px;">' +
        sectionTitle('Other ways to join') +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
          detailRow('Join by meeting number',
            'Meeting number (access code): <strong style="color:' + C_TEXT + ';">' + w.meetingNumber + '</strong>' + passwordLine) +
          detailRow('Tap to join from a mobile device',
            '<a href="tel:' + w.phoneTapToJoin.replace(/[^0-9+,#]/g, '') + '" style="color:' + C_ACCENT + ';">' + w.phoneTapToJoin + '</a> (United States Toll)',
            'Some phones may ask you to enter the meeting number.') +
          detailRow('Join by phone',
            '<a href="tel:' + w.phone.replace(/[^0-9+]/g, '') + '" style="color:' + C_ACCENT + ';">' + w.phone + '</a> (United States Toll)') +
          detailRow('Join from a video system',
            'Dial <strong style="color:' + C_TEXT + ';">' + w.videoDial + '</strong>',
            'You can also dial ' + w.videoIp + ' and enter the meeting number above.') +
        '</table>' +
      '</td></tr>' +
      '<tr><td style="padding:0 22px 18px;font-family:' + FONT_BODY + ';font-size:12px;color:' + C_MUTED + ';">' +
        'Need help with Webex? Visit <a href="https://help.webex.com" style="color:' + C_ACCENT + ';">help.webex.com</a>' +
      '</td></tr>' +
    '</table>';
}

function buildJoinLinkHtml(registrant, workshop) {
  const childList = registrant.studentNames.length
    ? registrant.studentNames.join(" and ")
    : "your child";

  const inner = '' +
    '<p style="margin:0 0 16px;">Dear ' + registrant.parentName + ',</p>' +
    '<p style="margin:0 0 24px;">Here is everything ' + childList + ' needs to join the <strong style="color:' + C_TEXT + ';">' +
      workshop.name + '</strong>. The <strong style="color:' + C_TEXT + ';">same link works for both days</strong>.</p>' +
    scheduleBlockHtml(workshop) +
    joinDetailsHtml(workshop) +
    '<p style="margin:0 0 16px;">Please join a few minutes early so we can start on time. Attending both days is highly recommended for the best learning experience.</p>' +
    '<p style="margin:0;">Questions? Just reply to this email. We\'re happy to help.</p>';

  return emailShell("Your join link is here", workshop.name, inner);
}

// Styled "who's registered" card, built from the student rows.
function registeredBlockHtml(students) {
  const rows = students.map(function(st, i) {
    return '<tr><td style="padding:10px 0;' + (i ? 'border-top:1px solid ' + C_LINE + ';' : '') +
      'font-family:' + FONT_BODY + ';font-size:16px;color:' + C_TEXT + ';font-weight:500;">' +
      st.firstName + ' ' + st.lastName +
      (st.age ? '<span style="color:' + C_MUTED + ';font-weight:400;"> &middot; Age ' + st.age + '</span>' : '') +
      '</td></tr>';
  }).join('');

  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle(students.length === 1 ? 'Registered' : 'Registered students') +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + rows + '</table>' +
      '</td></tr>' +
    '</table>';
}

function buildWorkshopConfirmationHtml(data, workshop, students, studentListHtml, firstStudent) {
  const childPhrase = students.length === 1 ? firstStudent.firstName : "your children";

  const inner = '' +
    '<p style="margin:0 0 16px;">Dear ' + data.parentName + ',</p>' +
    '<p style="margin:0 0 24px;">Thank you for registering ' + childPhrase + ' for our <strong style="color:' + C_TEXT + ';">' +
      workshop.name + '</strong>. ' + (students.length === 1 ? 'Your spot is' : 'Your spots are') + ' confirmed. This is a ' +
      '<strong style="color:' + C_TEXT + ';">free</strong> two-day online workshop where kids learn the fundamentals of ' +
      'public speaking: how to speak clearly and confidently, overcome nervousness, and present in front of others.</p>' +
    registeredBlockHtml(students) +
    scheduleBlockHtml(workshop) +
    '<p style="margin:0 0 24px;">Each day runs about an hour. Students are welcome to attend one or both sessions, but ' +
      'attending both is highly recommended for the best learning experience.</p>' +
    joinDetailsHtml(workshop) +
    '<p style="margin:0 0 16px;">We\'ll also send you a reminder before the workshop so you\'re all set.</p>' +
    '<p style="margin:0;">Questions? Just reply to this email. We\'re happy to help.</p>';

  return emailShell("You're registered", workshop.name, inner);
}

function buildGenericConfirmationHtml(data, students, studentListHtml, firstStudent) {
  const inner = '' +
    '<p style="margin:0 0 16px;">Dear ' + data.parentName + ',</p>' +
    '<p style="margin:0 0 24px;">Thank you for registering ' + (students.length === 1 ? firstStudent.firstName : 'your children') +
      ' for our <strong style="color:' + C_TEXT + ';">' + (data.sessionLabel || 'upcoming session') + '</strong>. ' +
      (students.length === 1 ? 'Your spot is' : 'Your spots are') + ' confirmed.</p>' +
    registeredBlockHtml(students) +
    '<p style="margin:0 0 16px;">We\'ll follow up with schedule details and location information closer to the session date.</p>' +
    '<p style="margin:0;">Questions? Just reply to this email. We\'re happy to help.</p>';

  return emailShell("Registration confirmed", data.sessionLabel || '', inner);
}

function buildAdminHtml(data, students, studentListHtml, childWord, timestamp) {
  return '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color: #2563EB;">New Session Registration (' + childWord + ')</h2>' +
      '<hr style="border: 1px solid #eee;" />' +
      '<h3 style="color: #333;">Student' + (students.length > 1 ? 's' : '') + ' Registered</h3>' +
      '<ul style="line-height: 1.8;">' + studentListHtml + '</ul>' +
      '<p><strong>Session:</strong> ' + (data.sessionLabel || '') + '</p>' +
      '<h3 style="color: #333;">Parent/Guardian Information</h3>' +
      '<p><strong>Name:</strong> ' + data.parentName + '</p>' +
      '<p><strong>Email:</strong> ' + data.email + '</p>' +
      '<p><strong>Phone:</strong> ' + data.phone + '</p>' +
      (data.schoolName ? '<p><strong>School:</strong> ' + data.schoolName + '</p>' : '') +
      (data.country ? '<p><strong>Country:</strong> ' + data.country + '</p>' : '') +
      // Online registrations collect a home ZIP without a full mailing address.
      (data.zipCode && !data.streetAddress ? '<p><strong>Home ZIP:</strong> ' + data.zipCode + '</p>' : '') +
      (data.streetAddress ?
        '<h3 style="color: #333;">Mailing Address</h3>' +
        '<p>' + data.streetAddress + '<br/>' + (data.city || '') + ', ' + (data.state || '') + ' ' + (data.zipCode || '') + '</p>'
        : '') +
      (data.additionalInfo ?
        '<h3 style="color: #333;">Additional Information</h3>' +
        '<p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">' + data.additionalInfo + '</p>'
        : '') +
      '<h3 style="color: #333;">Preferences</h3>' +
      '<ul style="line-height: 1.8;">' +
        '<li>Privacy Policy Agreed: <strong>' + (data.privacyAgreed ? 'Yes' : 'No') + '</strong></li>' +
        '<li>Photo/Video Permission: <strong>' + (data.photoConsent ? 'Yes' : 'No') + '</strong></li>' +
        '<li>Press/Media Permission: <strong>' + (data.pressConsent ? 'Yes' : 'No') + '</strong></li>' +
        '<li>Future Contact Opt-In: <strong>' + (data.futureContact ? 'Yes' : 'No') + '</strong></li>' +
      '</ul>' +
      '<hr style="border: 1px solid #eee;" />' +
      '<p style="color: #666; font-size: 12px;">Registered: ' + timestamp.toLocaleString() + '</p>' +
    '</div>';
}

// ============================================================
// VOLUNTEER APPLICATIONS
//
// The "Volunteer With Us" page (almadenvoices.org/volunteer) posts here with
// formType: "volunteer". Each application becomes one row on the
// "Volunteer Applications" tab, and two emails go out: a branded confirmation
// to the applicant and a notification to ADMIN_EMAIL.
//
// The two lines below are the only wording you normally need to change --
// they appear in the applicant's confirmation email.
// ============================================================
// The spreadsheet volunteer applications are written to. Leave VOLUNTEER_SHEET_ID
// empty and the script makes the spreadsheet itself the first time someone
// applies (or when you run createVolunteerSheetNow() from the editor), then
// keeps using it. Paste a spreadsheet ID here only to point it somewhere else --
// the ID is the long code in the sheet's web address, between /d/ and /edit.
const VOLUNTEER_SHEET_ID = "";
const VOLUNTEER_SHEET_NAME = "Almaden Voices Volunteer Applications";
const VOLUNTEER_SHEET_PROP = "volunteerSheetId";

// Uploaded resumes land in this Drive folder. It's created the first time
// someone attaches one, and lives in the almadenvoices@gmail.com Drive.
const VOLUNTEER_RESUME_FOLDER = "Almaden Voices Volunteer Resumes";

const VOLUNTEER_DEADLINE_TEXT = "Applications close September 4 at 9 PM PT.";
const VOLUNTEER_NEXT_STEP_TEXT =
  "We read every application ourselves. We'll be in touch the second week of September to let you know either way.";

// Resumes arrive base64-encoded in the JSON payload. Each one is saved into a
// "Volunteer Resumes" folder in the same Drive as the spreadsheet, and the
// sheet gets a link rather than the file itself. Returns "" when there's no
// resume, and never throws — a bad upload must not lose the application.
function saveVolunteerResume(data) {
  if (!data.resumeData) return "";
  try {
    const folders = DriveApp.getFoldersByName(VOLUNTEER_RESUME_FOLDER);
    const folder = folders.hasNext()
      ? folders.next()
      : DriveApp.createFolder(VOLUNTEER_RESUME_FOLDER);

    // Name the file after the applicant so the folder stays browsable.
    const safeName = String(data.fullName || "applicant").replace(/[^\w .-]/g, "_");
    const original = String(data.resumeName || "resume");
    const dotAt = original.lastIndexOf(".");
    const ext = dotAt > -1 ? original.slice(dotAt) : "";
    const stamp = Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd");

    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.resumeData),
      data.resumeType || "application/octet-stream",
      safeName + " - " + stamp + ext
    );
    const file = folder.createFile(blob);
    return file.getUrl();
  } catch (err) {
    Logger.log("Resume upload failed: " + err.message);
    return "Upload failed - ask the applicant to email it";
  }
}

// ============================================================
// 1-ON-1 COACHING BOOKINGS
//
// Posted by the website's server (server.js) after PayPal confirms payment,
// so a row on this tab always means the family has actually paid.
//
// This writes the row and nothing else — the server already sends both the
// parent's confirmation and the admin notification, and sending them from
// here too would just duplicate every email.
// ============================================================
function handleCoachingBooking(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getCoachingSheet(ss);

    // The server sends an ISO timestamp; turn it back into a real date so the
    // column sorts and formats like the Timestamp column on the other tabs.
    const stamp = data.timestamp ? new Date(data.timestamp) : new Date();

    appendMappedRow(sheet, {
      "Timestamp": stamp,
      "Slot": data.slotLabel || ("Coaching Slot " + (data.slotId || "")),
      "Format": data.format || "",
      "Amount Paid": data.amountPaid === undefined || data.amountPaid === null
        ? "" : Number(data.amountPaid),
      "Parent Name": data.parentName || "",
      "Email": data.parentEmail || "",
      "Phone": data.phone || "",
      "Student Name": data.studentName || "",
      "Student Age": data.studentAge || "",
      "School Name": data.schoolName || "",
      "Home ZIP": data.zipCode || "",
      "What They Want To Work On": data.notes || "",
      "Questions/Comments": data.comments || "",
      "Photo/Video Permission": data.photoConsent ? "Yes" : "No",
      "PayPal Order ID": data.orderId || "",
      "Scheduled?": ""
    });

    return jsonOut({ success: true });
  } catch (err) {
    // The server logs this against the PayPal order id so a booking that never
    // reached the sheet can be found and added by hand.
    return jsonOut({ success: false, error: err.message });
  }
}

// Waitlist signups. Like handleCoachingBooking, this only writes the row —
// the server sends both the confirmation and the admin notification.
function handleCoachingWaitlist(data) {
  try {
    const sheet = getCoachingWaitlistSheet(SpreadsheetApp.getActiveSpreadsheet());

    appendMappedRow(sheet, {
      "Timestamp": data.timestamp ? new Date(data.timestamp) : new Date(),
      "Parent Name": data.parentName || "",
      "Email": data.parentEmail || "",
      "Phone": data.phone || "",
      "Student Name": data.studentName || "",
      "Student Age": data.studentAge || "",
      "Preferred Format": data.preferredFormat || "",
      "School Name": data.schoolName || "",
      "Home ZIP": data.zipCode || "",
      "What They Want To Work On": data.notes || "",
      "Contacted?": ""
    });

    return jsonOut({ success: true });
  } catch (err) {
    return jsonOut({ success: false, error: err.message });
  }
}

function handleVolunteerApplication(data) {
  const ss = getVolunteerSpreadsheet();
  const sheet = getVolunteerSheet(ss);

  const timestamp = new Date();
  const resumeUrl = saveVolunteerResume(data);
  const whoIsApplying = data.applyingAs === "parent"
    ? "Parent/guardian, on behalf of their child"
    : "Applying for themselves";

  appendMappedRow(sheet, {
    "Timestamp": timestamp,
    "Applicant Name": data.fullName || "",
    "Email": data.email || "",
    "Phone": data.phone || "",
    "Age / Grade": data.ageOrGrade || "",
    "Location": data.location || "",
    "Resume": resumeUrl,
    "Positions Applied For": data.positions || "",
    "Who Is Applying": whoIsApplying,
    "Parent/Guardian Name": data.parentName || "",
    "Parent/Guardian Email": data.parentEmail || "",
    "Parent/Guardian Phone": data.parentPhone || "",
    "Why This Role": data.why || "",
    "Availability": data.availability || "",
    "Photo/Video Consent": data.mediaConsent ? "Yes" : "No",
    "Parent/Guardian Aware": data.guardianConsent === null || data.guardianConsent === undefined
      ? ""
      : (data.guardianConsent ? "Yes" : "No"),
    "Status": "New",
    "Notes": ""
  });

  // Admin notification -- reply goes straight to the applicant.
  GmailApp.sendEmail(ADMIN_EMAIL,
    "Volunteer application: " + (data.fullName || "") + " - " + (data.positions || ""),
    "New volunteer application received. See the HTML version for details.",
    {
      htmlBody: buildVolunteerAdminHtml(data, whoIsApplying, timestamp, ss.getUrl(), resumeUrl),
      name: ORG_NAME + " Volunteer Form",
      replyTo: data.email || ADMIN_EMAIL
    }
  );

  // Applicant confirmation. A bad address here shouldn't lose the application,
  // which is already safely on the sheet.
  try {
    GmailApp.sendEmail(data.email,
      "We got your volunteer application",
      "Thanks for applying to volunteer with Almaden Voices. See the HTML version of this email for details.",
      {
        htmlBody: buildVolunteerApplicantHtml(data),
        name: ORG_NAME,
        bcc: ADMIN_EMAIL
      }
    );
  } catch (mailErr) {
    Logger.log("Volunteer confirmation email failed: " + mailErr.message);
  }

  return jsonOut({ success: true });
}

// Run this once from the Apps Script editor (pick it in the function dropdown
// and click Run) to create the volunteer spreadsheet right away instead of
// waiting for the first application. It emails the link to ADMIN_EMAIL, and is
// safe to run more than once -- it reuses the spreadsheet if one already exists.
function createVolunteerSheetNow() {
  const ss = getVolunteerSpreadsheet();
  getVolunteerSheet(ss);
  const url = ss.getUrl();

  Logger.log("Volunteer applications spreadsheet: " + url);
  GmailApp.sendEmail(ADMIN_EMAIL,
    "Your volunteer applications spreadsheet is ready",
    "Volunteer applications will be added to this spreadsheet: " + url,
    {
      htmlBody: emailShell("Volunteer applications spreadsheet", VOLUNTEER_SHEET_NAME,
        '<p style="margin:0 0 16px;">Every volunteer application from the website will be added to this spreadsheet, one row each:</p>' +
        '<p style="margin:0 0 16px;"><a href="' + url + '" style="color:' + C_ACCENT + ';font-weight:700;text-decoration:none;">Open the volunteer applications spreadsheet</a></p>' +
        '<p style="margin:0;">It lives in the almadenvoices@gmail.com Google Drive, separate from the registrations spreadsheet.</p>'),
      name: ORG_NAME
    }
  );
  return url;
}

// Applications are typed in by hand, so escape anything that lands in HTML.
function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Escape, then keep the applicant's line breaks in the email.
function escMultiline(value) {
  return esc(value).replace(/\r\n|\r|\n/g, "<br/>");
}

// Soft card used for the longer, free-text answers.
function quoteBlockHtml(label, text) {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 16px;">' +
      '<tr><td style="padding:18px 20px;font-family:' + FONT_BODY + ';">' +
        sectionTitle(label) +
        '<p style="margin:0;font-size:15px;line-height:1.65;color:' + C_BODY + ';">' + escMultiline(text) + '</p>' +
      '</td></tr>' +
    '</table>';
}

// The "here's what you sent us" / "here's who applied" detail table.
function volunteerDetailsHtml(rows) {
  const body = rows.filter(function(r) { return r && r[1]; })
    .map(function(r) { return detailRow(r[0], esc(r[1])); })
    .join('');

  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#FFFFFF;border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:6px 22px 18px;">' +
        '<p style="margin:16px 0 2px;font-family:' + FONT_BODY + ';font-size:12px;letter-spacing:1.2px;' +
          'text-transform:uppercase;color:' + C_MUTED + ';font-weight:700;">Your application</p>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + body + '</table>' +
      '</td></tr>' +
    '</table>';
}

function buildVolunteerApplicantHtml(data) {
  const firstName = String(data.fullName || "").trim().split(/\s+/)[0] || "there";

  const steps = [
    ["1. We review your application", VOLUNTEER_DEADLINE_TEXT],
    ["2. We get back to you", VOLUNTEER_NEXT_STEP_TEXT],
    ["3. Getting started", "If it's a fit, we'll walk you through onboarding and pair you with someone on the team."]
  ].map(function(step, i) {
    return '<tr><td style="padding:14px 0;' + (i ? 'border-top:1px solid ' + C_LINE + ';' : '') +
      'font-family:' + FONT_BODY + ';">' +
      '<p style="margin:0 0 4px;font-size:15px;font-weight:700;color:' + C_TEXT + ';">' + step[0] + '</p>' +
      '<p style="margin:0;font-size:15px;line-height:1.6;color:' + C_BODY + ';">' + step[1] + '</p>' +
      '</td></tr>';
  }).join('');

  const inner = '' +
    '<p style="margin:0 0 16px;">Hi ' + esc(firstName) + ',</p>' +
    '<p style="margin:0 0 24px;">Thank you for applying to volunteer with ' + ORG_NAME + '. Your application is in, ' +
      'and nothing more is needed from you right now.</p>' +

    volunteerDetailsHtml([
      ["Applying for", data.positions],
      ["Name", data.fullName],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Age / grade", data.ageOrGrade]
    ]) +

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('What happens next') +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + steps + '</table>' +
      '</td></tr>' +
    '</table>' +

    '<p style="margin:0 0 16px;">Every one of our volunteers helps a kid stand up and speak with confidence. ' +
      'We\'re glad you want to be part of that.</p>' +
    '<p style="margin:0;">Questions in the meantime? Just reply to this email.</p>';

  return emailShell("Application received", data.positions ? esc(data.positions) : "", inner);
}

function buildVolunteerAdminHtml(data, whoIsApplying, timestamp, sheetUrl, resumeUrl) {
  const guardian = (data.parentName || data.parentEmail || data.parentPhone)
    ? esc(data.parentName) +
      (data.parentEmail ? ' &middot; ' + esc(data.parentEmail) : '') +
      (data.parentPhone ? ' &middot; ' + esc(data.parentPhone) : '')
    : '';

  const consent = 'Photo/video: ' + (data.mediaConsent ? 'Yes' : 'No') +
    (data.guardianConsent === null || data.guardianConsent === undefined
      ? ''
      : ' &middot; Parent/guardian aware: ' + (data.guardianConsent ? 'Yes' : 'No'));

  // Third slot marks a value that is already HTML, so it isn't escaped twice.
  const rows = [
    ["Applying for", data.positions],
    ["Who is applying", whoIsApplying],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Age / grade", data.ageOrGrade],
    ["Location", data.location],
    ["Resume", resumeUrl && resumeUrl.indexOf('http') === 0
      ? '<a href="' + esc(resumeUrl) + '" style="color:' + C_ACCENT + ';font-weight:700;">Open resume</a>'
      : esc(resumeUrl || ''), true],
    ["Parent/guardian", guardian, true],
    ["Consent", consent, true],
    ["Received", timestamp.toLocaleString()]
  ].filter(function(r) { return r[1]; })
   .map(function(r) { return detailRow(r[0], r[2] ? r[1] : esc(r[1])); })
   .join('');

  const inner = '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#FFFFFF;border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:6px 22px 18px;">' +
        '<p style="margin:16px 0 2px;font-family:' + FONT_BODY + ';font-size:12px;letter-spacing:1.2px;' +
          'text-transform:uppercase;color:' + C_MUTED + ';font-weight:700;">Applicant</p>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + rows + '</table>' +
      '</td></tr>' +
    '</table>' +
    quoteBlockHtml('Why this role, and what they\'d bring', data.why) +
    quoteBlockHtml('Availability (2-3 hrs/week, 3-month minimum)', data.availability) +
    '<p style="margin:24px 0 0;font-size:14px;color:' + C_MUTED + ';">Reply to this email to answer ' +
      esc(data.fullName) + ' directly.' +
      (sheetUrl ? ' &middot; <a href="' + sheetUrl + '" style="color:' + C_ACCENT + ';text-decoration:none;">Open the applications sheet</a>' : '') +
    '</p>';

  return emailShell("New volunteer application",
    esc(data.fullName) + (data.positions ? ' &mdash; ' + esc(data.positions) : ''),
    inner);
}

// ============================================================
// REMINDERS
// Run sendWorkshopReminders() hourly via a time-based trigger.
// Call setupReminderTrigger() once to create that trigger.
// ============================================================
function setupReminderTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "sendWorkshopReminders") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("sendWorkshopReminders").timeBased().everyHours(1).create();
}

function sendWorkshopReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() < 2) return;

  const logSheet = getReminderLogSheet(ss);
  const alreadySent = getSentSet(logSheet); // set of "email|reminderKey"
  const now = Date.now();

  Object.keys(WORKSHOPS).forEach(function(workshopId) {
    const workshop = WORKSHOPS[workshopId];
    const registrants = getWorkshopRegistrants(sheet, workshopId); // email -> {parentName, studentNames}
    const emails = Object.keys(registrants);
    if (!emails.length) return;

    const firstStart = Date.parse(workshop.sessions[0].startUtc);

    // Reminder 1 — two days before the first session (24h send window on that day)
    if (now >= firstStart - 2 * DAY && now < firstStart - DAY) {
      emails.forEach(function(email) {
        const key = "2day";
        if (alreadySent[sentKey(email, workshopId, key)]) return;
        sendReminderEmail(email, registrants[email], workshop, null, "2day");
        recordSent(logSheet, email, workshopId, key);
        alreadySent[sentKey(email, workshopId, key)] = true;
      });
    }

    // Reminder 2 — shortly before EACH session day (from 2h before up to start time)
    workshop.sessions.forEach(function(session) {
      const start = Date.parse(session.startUtc);
      if (now >= start - 2 * HOUR && now <= start) {
        emails.forEach(function(email) {
          const key = "dayof-" + session.startUtc;
          if (alreadySent[sentKey(email, workshopId, key)]) return;
          sendReminderEmail(email, registrants[email], workshop, session, "dayof");
          recordSent(logSheet, email, workshopId, key);
          alreadySent[sentKey(email, workshopId, key)] = true;
        });
      }
    });
  });
}

// ============================================================
// JOIN-LINK BLAST
// Run sendTestJoinLinkEmail() first to preview, then
// sendJoinLinkToAllRegistrants() to send to everyone who registered.
// Safe to re-run: anyone already sent is skipped via the ReminderLog.
// ============================================================
const JOIN_LINK_KEY = "joinlink";

// Preview only — sends one copy to TEST_EMAIL for a fake registrant.
function sendTestJoinLinkEmail() {
  const workshopId = Object.keys(WORKSHOPS)[0];
  const workshop = WORKSHOPS[workshopId];
  const registrant = { parentName: "Test Parent", studentNames: ["Test Kid"] };

  GmailApp.sendEmail(TEST_EMAIL,
    "[TEST] Your join link: " + workshop.name,
    "See the HTML version of this email for the join link and workshop details.",
    { htmlBody: buildJoinLinkHtml(registrant, workshop), name: ORG_NAME });

  Logger.log("Test join-link email sent to " + TEST_EMAIL);
}

// Sends the real (non-[TEST]) join-link email to the most recent registration
// whose Parent Name contains "test" — i.e. the "Test Parent" row in the
// Registrations sheet. Use this to see exactly what registrants will receive.
// The send is recorded in the ReminderLog so the full blast won't double-send.
function sendJoinLinkToTestParent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("No registrations found.");
    return;
  }

  const idx = headerIndexMap(sheet);
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  // Walk from the bottom up so we pick the newest matching row.
  let match = null;
  for (let i = values.length - 1; i >= 0 && !match; i--) {
    const parentName = String(values[i][idx["Parent Name"]] || "");
    if (parentName.toLowerCase().indexOf("test") !== -1) match = values[i];
  }
  if (!match) {
    Logger.log('No row found with "test" in the Parent Name column.');
    return;
  }

  const email = String(match[idx["Email"]] || "").trim();
  if (!email) {
    Logger.log("The matching test row has no email address.");
    return;
  }

  const workshopId = String(match[idx["Session ID"]] || "") || Object.keys(WORKSHOPS)[0];
  const workshop = WORKSHOPS[workshopId];
  if (!workshop) {
    Logger.log("No workshop config found for session ID: " + workshopId);
    return;
  }

  const firstName = String(match[idx["Student First Name"]] || "").trim();
  const registrant = {
    parentName: String(match[idx["Parent Name"]] || "").trim() || "there",
    studentNames: firstName ? [firstName] : []
  };

  GmailApp.sendEmail(email,
    "Your join link: " + workshop.name,
    "See the HTML version of this email for the join link and workshop details.",
    { htmlBody: buildJoinLinkHtml(registrant, workshop), name: ORG_NAME });

  recordSent(getReminderLogSheet(ss), email, workshopId, JOIN_LINK_KEY);
  Logger.log("Join-link email sent to " + registrant.parentName + " <" + email + ">");
}

// When the scheduled blast should go out, as a UTC instant.
// 2026-08-02T22:00:00Z = 3:00 PM PDT on Sunday, August 2, 2026 —
// exactly two days before Day 1 begins.
const BLAST_TIME_UTC = "2026-08-02T22:00:00Z";

// Run this ONCE to schedule the blast. It creates a one-time trigger that fires
// sendJoinLinkToAllRegistrants() at BLAST_TIME_UTC. Re-running replaces any
// blast trigger already scheduled, so it's safe to run again after edits.
// To call the whole thing off, run cancelScheduledJoinLinkBlast().
function scheduleJoinLinkBlast() {
  cancelScheduledJoinLinkBlast();

  const when = new Date(BLAST_TIME_UTC);
  if (when.getTime() <= Date.now()) {
    Logger.log("BLAST_TIME_UTC is in the past — nothing scheduled. Update it and run again.");
    return;
  }

  ScriptApp.newTrigger("sendJoinLinkToAllRegistrants").timeBased().at(when).create();
  Logger.log("Join-link blast scheduled for " + when + " (BCC: " + BCC_EMAIL + ")");
}

// Removes a scheduled blast trigger, if one exists.
function cancelScheduledJoinLinkBlast() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "sendJoinLinkToAllRegistrants") {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log("Blast triggers removed: " + removed);
}

// The real send — one email per registered family.
function sendJoinLinkToAllRegistrants() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("No registrations found.");
    return;
  }

  const logSheet = getReminderLogSheet(ss);
  const alreadySent = getSentSet(logSheet);
  let sent = 0, skipped = 0;

  Object.keys(WORKSHOPS).forEach(function(workshopId) {
    const workshop = WORKSHOPS[workshopId];
    const registrants = getWorkshopRegistrants(sheet, workshopId);

    Object.keys(registrants).forEach(function(email) {
      if (alreadySent[sentKey(email, workshopId, JOIN_LINK_KEY)]) { skipped++; return; }

      GmailApp.sendEmail(email,
        "Your join link: " + workshop.name,
        "See the HTML version of this email for the join link and workshop details.",
        { htmlBody: buildJoinLinkHtml(registrants[email], workshop), name: ORG_NAME, bcc: BCC_EMAIL });

      recordSent(logSheet, email, workshopId, JOIN_LINK_KEY);
      alreadySent[sentKey(email, workshopId, JOIN_LINK_KEY)] = true;
      sent++;
    });
  });

  Logger.log("Join-link emails sent: " + sent + " (skipped, already sent: " + skipped + ")");
}

function getWorkshopRegistrants(sheet, workshopId) {
  const idx = headerIndexMap(sheet);
  const emailCol = idx["Email"];
  const idCol = idx["Session ID"];
  const sessionCol = idx["Session"];
  const parentCol = idx["Parent Name"];
  const firstNameCol = idx["Student First Name"];
  const workshopName = WORKSHOPS[workshopId] ? WORKSHOPS[workshopId].name : "";

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const out = {};
  values.forEach(function(row) {
    // Match by Session ID when present; otherwise fall back to matching the label text.
    const rowId = idCol != null ? String(row[idCol] || "") : "";
    const rowSession = sessionCol != null ? String(row[sessionCol] || "") : "";
    const matches = rowId
      ? rowId === workshopId
      : (workshopName && rowSession.indexOf(workshopName) !== -1);
    if (!matches) return;

    const email = String(row[emailCol] || "").trim();
    if (!email) return;
    if (!out[email]) out[email] = { parentName: String(row[parentCol] || "").trim() || "there", studentNames: [] };
    const fn = firstNameCol != null ? String(row[firstNameCol] || "").trim() : "";
    if (fn && out[email].studentNames.indexOf(fn) === -1) out[email].studentNames.push(fn);
  });
  return out;
}

function sendReminderEmail(email, registrant, workshop, session, type, opts) {
  const childList = registrant.studentNames.length
    ? registrant.studentNames.join(" and ")
    : "your child";

  let subject, headline, intro;
  if (type === "2day") {
    subject = "In 2 days: " + workshop.name;
    headline = "See you in 2 days";
    intro = 'This is a friendly reminder that <strong style="color:' + C_TEXT + ';">' + workshop.name +
      '</strong> begins in <strong style="color:' + C_TEXT + ';">2 days</strong>. We can\'t wait to see ' + childList + ' there!';
  } else if (type === "1day") {
    subject = "Tomorrow: " + workshop.name;
    headline = "See you tomorrow";
    intro = 'Just one more day! <strong style="color:' + C_TEXT + ';">' + workshop.name +
      '</strong> begins <strong style="color:' + C_TEXT + ';">tomorrow</strong>, and we can\'t wait to see ' +
      childList + ' there. Everything ' + (registrant.studentNames.length > 1 ? 'they' : 'you') +
      ' need to join is below, and the same link works for both days.';
  } else if (type === "1hour") {
    subject = "Starting in 1 hour: " + workshop.name;
    headline = "We start in one hour";
    intro = '<strong style="color:' + C_TEXT + ';">' + workshop.name + '</strong> begins in about ' +
      '<strong style="color:' + C_TEXT + ';">one hour</strong>. A few quick things to know before we begin, ' +
      'and then the join link for ' + childList + ' is just below them.';
  } else {
    subject = "Starting soon: your public speaking workshop is today";
    headline = "It's almost time";
    intro = 'Your workshop session starts in about <strong style="color:' + C_TEXT + ';">1&ndash;2 hours</strong>' +
      (session ? ' (<strong style="color:' + C_TEXT + ';">' + session.label + '</strong>)' : '') +
      '. Here is the join link again so ' + childList + ' can hop on when it\'s time.';
  }

  // The last two reminders carry the camera/lighting rule and the note about
  // how long parents are actually needed, right up top.
  const showLastMinuteNotes = (type === "1hour" || type === "dayof");

  const inner = '' +
    '<p style="margin:0 0 14px;">Dear ' + registrant.parentName + ',</p>' +
    '<p style="margin:0 0 20px;">' + intro + '</p>' +
    (showLastMinuteNotes ? lastMinuteNotesHtml() : '') +
    (type === "1hour" ? '' : scheduleBlockHtml(workshop)) +
    joinDetailsHtml(workshop) +
    (type === "1day" ? prepBlockHtml() : '') +
    '<p style="margin:0;">Questions? Just reply to this email. We\'re happy to help.</p>';

  const options = { htmlBody: emailShell(headline, workshop.name, inner), name: ORG_NAME };
  if (opts && opts.bcc) options.bcc = opts.bcc;
  if (opts && opts.subjectPrefix) subject = opts.subjectPrefix + subject;

  GmailApp.sendEmail(email, subject, "See the HTML version of this email for your workshop details and join link.",
    options);
}

// The things we most need families to read, placed above the join button so
// they land in the first screenful without any scrolling.
function lastMinuteNotesHtml() {
  return cameraBlockHtml() + onTimeBlockHtml() + parentsBlockHtml();
}

// Camera + lighting rule. Highlighted, because this is the one thing we
// really need every student to get right in a public speaking workshop.
function cameraBlockHtml() {
  const items = [
    'Please keep your <strong style="color:' + C_TEXT + ';">camera on</strong> for the whole session. ' +
      'This is a public speaking workshop, so we need to be able to see you.',
    'Sit facing a <strong style="color:' + C_TEXT + ';">window or a lamp</strong> so your face is well lit. ' +
      'Try not to sit with a bright window right behind you, since that turns you into a silhouette.',
    'Check that your whole face and shoulders fit in the frame, and that the camera is close to eye level.'
  ];

  const rows = items.map(function(text, i) {
    return '<tr><td style="padding:10px 0;' + (i ? 'border-top:1px solid ' + C_LINE + ';' : '') +
      'font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' + text + '</td></tr>';
  }).join('');

  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#EFF6FF;border:2px solid ' + C_ACCENT + ';border-radius:12px;margin:0 0 20px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('Camera and lighting') +
        '<p style="margin:0 0 12px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_TEXT + ';font-weight:700;">' +
          'This one really matters. We need to be able to see every student clearly.</p>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + rows + '</table>' +
      '</td></tr>' +
    '</table>';
}

// We start on the hour, so arriving early is not optional padding.
function onTimeBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 20px;">' +
      '<tr><td style="padding:20px 22px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
        sectionTitle('Please be a few minutes early') +
        '<p style="margin:0;">We will <strong style="color:' + C_TEXT + ';">start right on time</strong>, so joining a few ' +
          'minutes early is crucial. It gives everyone a moment to sort out sound and video, and it means we do not lose ' +
          'any of our hour together.</p>' +
      '</td></tr>' +
    '</table>';
}

// How long parents are actually needed — the first ten minutes only.
function parentsBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
        sectionTitle('For parents') +
        '<p style="margin:0 0 10px;">You do not need to stay for the whole workshop. We only need a parent nearby for the ' +
          '<strong style="color:' + C_TEXT + ';">first ten minutes</strong>, to help with sign-in and to make sure the camera, ' +
          'microphone and sound are all working.</p>' +
        '<p style="margin:0;">After that, your child is in good hands and you are free to step away. ' +
          'If you would rather stay and watch the whole session, you are very welcome to.</p>' +
      '</td></tr>' +
    '</table>';
}

// Short "how to get ready" checklist — used in the day-before reminder.
function prepBlockHtml() {
  const items = [
    'Join a few minutes early so we can start right on time.',
    'Find a quiet spot with a steady internet connection.',
    'Headphones and a working microphone help a lot, since students will get a chance to speak.',
    'Bring a notebook and pen in case you\'d like to jot down personal notes. Either way, ' +
      'our notes and slideshows will be sent to you after both workshops.'
  ];

  const rows = items.map(function(text, i) {
    return '<tr><td style="padding:10px 0;' + (i ? 'border-top:1px solid ' + C_LINE + ';' : '') +
      'font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' + text + '</td></tr>';
  }).join('');

  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('How to get ready') +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + rows + '</table>' +
      '</td></tr>' +
    '</table>';
}

// ============================================================
// ONE-DAY-BEFORE REMINDER BLAST
// Run sendTestOneDayReminder() first to preview, then
// scheduleOneDayReminder() to have it go out automatically.
// Safe to re-run: anyone already sent is skipped via the ReminderLog.
// ============================================================
const ONE_DAY_KEY = "1day";

// When the day-before reminder should go out, as a UTC instant.
// 2026-08-03T22:00:00Z = 3:00 PM PDT on Monday, August 3, 2026 —
// exactly 24 hours before Day 1 begins.
const ONE_DAY_REMINDER_TIME_UTC = "2026-08-03T22:00:00Z";

// Preview only — sends one copy to TEST_EMAIL for a fake registrant.
function sendTestOneDayReminder() {
  const workshopId = Object.keys(WORKSHOPS)[0];
  const workshop = WORKSHOPS[workshopId];
  const registrant = { parentName: "Test Parent", studentNames: ["Test Kid"] };

  sendReminderEmail(TEST_EMAIL, registrant, workshop, null, ONE_DAY_KEY, { subjectPrefix: "[TEST] " });
  Logger.log("Test day-before reminder sent to " + TEST_EMAIL);
}

// Run this ONCE to schedule the reminder. Creates a one-time trigger that fires
// sendOneDayReminderToAll() at ONE_DAY_REMINDER_TIME_UTC. Re-running replaces any
// reminder trigger already scheduled, so it's safe to run again after edits.
// To call it off, run cancelScheduledOneDayReminder().
function scheduleOneDayReminder() {
  cancelScheduledOneDayReminder();

  const when = new Date(ONE_DAY_REMINDER_TIME_UTC);
  if (when.getTime() <= Date.now()) {
    Logger.log("ONE_DAY_REMINDER_TIME_UTC is in the past — nothing scheduled. Update it and run again.");
    return;
  }

  ScriptApp.newTrigger("sendOneDayReminderToAll").timeBased().at(when).create();
  Logger.log("Day-before reminder scheduled for " + when + " (BCC: " + BCC_EMAIL + ")");
}

function cancelScheduledOneDayReminder() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "sendOneDayReminderToAll") {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log("Day-before reminder triggers removed: " + removed);
}

// The real send — one email per registered family.
function sendOneDayReminderToAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("No registrations found.");
    return;
  }

  const logSheet = getReminderLogSheet(ss);
  const alreadySent = getSentSet(logSheet);
  let sent = 0, skipped = 0;

  Object.keys(WORKSHOPS).forEach(function(workshopId) {
    const workshop = WORKSHOPS[workshopId];
    const registrants = getWorkshopRegistrants(sheet, workshopId);

    Object.keys(registrants).forEach(function(email) {
      if (alreadySent[sentKey(email, workshopId, ONE_DAY_KEY)]) { skipped++; return; }

      sendReminderEmail(email, registrants[email], workshop, null, ONE_DAY_KEY, { bcc: BCC_EMAIL });

      recordSent(logSheet, email, workshopId, ONE_DAY_KEY);
      alreadySent[sentKey(email, workshopId, ONE_DAY_KEY)] = true;
      sent++;
    });
  });

  Logger.log("Day-before reminders sent: " + sent + " (skipped, already sent: " + skipped + ")");
}

// ============================================================
// ONE-HOUR-BEFORE REMINDER BLAST
// Run sendTestOneHourReminder() first to preview, then
// scheduleOneHourReminder() to have it go out automatically.
// Safe to re-run: anyone already sent is skipped via the ReminderLog.
// ============================================================
const ONE_HOUR_KEY = "1hour";

// When the one-hour reminder should go out, as a UTC instant.
// 2026-08-04T21:00:00Z = 2:00 PM PDT on Tuesday, August 4, 2026 —
// exactly one hour before Day 1 begins.
const ONE_HOUR_REMINDER_TIME_UTC = "2026-08-04T21:00:00Z";

// Preview only — sends one copy to TEST_EMAIL for a fake registrant.
function sendTestOneHourReminder() {
  const workshopId = Object.keys(WORKSHOPS)[0];
  const workshop = WORKSHOPS[workshopId];
  const registrant = { parentName: "Test Parent", studentNames: ["Test Kid"] };

  sendReminderEmail(TEST_EMAIL, registrant, workshop, null, ONE_HOUR_KEY, { subjectPrefix: "[TEST] " });
  Logger.log("Test one-hour reminder sent to " + TEST_EMAIL);
}

// Run this ONCE to schedule the reminder. Creates a one-time trigger that fires
// sendOneHourReminderToAll() at ONE_HOUR_REMINDER_TIME_UTC. Re-running replaces any
// reminder trigger already scheduled, so it's safe to run again after edits.
// To call it off, run cancelScheduledOneHourReminder().
function scheduleOneHourReminder() {
  cancelScheduledOneHourReminder();

  const when = new Date(ONE_HOUR_REMINDER_TIME_UTC);
  if (when.getTime() <= Date.now()) {
    Logger.log("ONE_HOUR_REMINDER_TIME_UTC is in the past — nothing scheduled. Update it and run again.");
    return;
  }

  ScriptApp.newTrigger("sendOneHourReminderToAll").timeBased().at(when).create();
  Logger.log("One-hour reminder scheduled for " + when + " (BCC: " + BCC_EMAIL + ")");
}

function cancelScheduledOneHourReminder() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "sendOneHourReminderToAll") {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log("One-hour reminder triggers removed: " + removed);
}

// The real send — one email per registered family.
function sendOneHourReminderToAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("No registrations found.");
    return;
  }

  const logSheet = getReminderLogSheet(ss);
  const alreadySent = getSentSet(logSheet);
  let sent = 0, skipped = 0;

  Object.keys(WORKSHOPS).forEach(function(workshopId) {
    const workshop = WORKSHOPS[workshopId];
    const registrants = getWorkshopRegistrants(sheet, workshopId);
    // Day 1's "dayof" key, so the hourly trigger doesn't send a second
    // near-identical reminder in the two hours before the session starts.
    const dayOfKey = "dayof-" + workshop.sessions[0].startUtc;

    Object.keys(registrants).forEach(function(email) {
      if (alreadySent[sentKey(email, workshopId, ONE_HOUR_KEY)]) { skipped++; return; }

      sendReminderEmail(email, registrants[email], workshop, null, ONE_HOUR_KEY, { bcc: BCC_EMAIL });

      recordSent(logSheet, email, workshopId, ONE_HOUR_KEY);
      alreadySent[sentKey(email, workshopId, ONE_HOUR_KEY)] = true;
      if (!alreadySent[sentKey(email, workshopId, dayOfKey)]) {
        recordSent(logSheet, email, workshopId, dayOfKey);
        alreadySent[sentKey(email, workshopId, dayOfKey)] = true;
      }
      sent++;
    });
  });

  Logger.log("One-hour reminders sent: " + sent + " (skipped, already sent: " + skipped + ")");
}

// ============================================================
// AFTER DAY 1 — RECAP + PRE-SURVEY EMAIL
// Run sendTestDay1Recap() first to preview it in your own inbox, then
// sendDay1RecapToAll() when you're happy with it.
// Safe to re-run: anyone already sent is skipped via the ReminderLog.
// ============================================================
const DAY1_RECAP_KEY = "day1recap";

// Quick 2-question pre-survey, meant to capture where students stood before
// any teaching — which is why we ask families to fill it in with their child.
const PRE_SURVEY_URL = "https://forms.gle/57L2AyFPyR9XkbQB8";

// Day 1 transcript + meeting notes.
const DAY1_NOTES_URL = "https://docs.google.com/document/d/1hsEY9DJQR55K40-23TQYFQMjgXAKOZDUlw-JvDrA4w0/edit?usp=sharing";

// Preview only — sends one copy to TEST_EMAIL for a fake registrant.
function sendTestDay1Recap() {
  const workshopId = Object.keys(WORKSHOPS)[0];
  const workshop = WORKSHOPS[workshopId];
  const registrant = { parentName: "Test Parent", studentNames: ["Test Kid"] };

  sendDay1RecapEmail(TEST_EMAIL, registrant, workshop, { subjectPrefix: "[TEST] " });
  Logger.log("Test Day 1 recap sent to " + TEST_EMAIL);
}

// The real send — one email per registered family.
function sendDay1RecapToAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("No registrations found.");
    return;
  }

  const logSheet = getReminderLogSheet(ss);
  const alreadySent = getSentSet(logSheet);
  let sent = 0, skipped = 0;

  Object.keys(WORKSHOPS).forEach(function(workshopId) {
    const workshop = WORKSHOPS[workshopId];
    const registrants = getWorkshopRegistrants(sheet, workshopId);

    Object.keys(registrants).forEach(function(email) {
      if (alreadySent[sentKey(email, workshopId, DAY1_RECAP_KEY)]) { skipped++; return; }

      sendDay1RecapEmail(email, registrants[email], workshop, { bcc: BCC_EMAIL });

      recordSent(logSheet, email, workshopId, DAY1_RECAP_KEY);
      alreadySent[sentKey(email, workshopId, DAY1_RECAP_KEY)] = true;
      sent++;
    });
  });

  Logger.log("Day 1 recap emails sent: " + sent + " (skipped, already sent: " + skipped + ")");
}

function sendDay1RecapEmail(email, registrant, workshop, opts) {
  const childList = registrant.studentNames.length
    ? registrant.studentNames.join(" and ")
    : "your child";

  // Written to work for families who came to Day 1 AND families who did not.
  // We have no attendance data here, so the copy must never assume they were there.
  const inner = '' +
    '<p style="margin:0 0 14px;">Dear ' + registrant.parentName + ',</p>' +
    '<p style="margin:0 0 20px;">Thank you to everyone who joined Day 1 of the <strong style="color:' + C_TEXT + ';">' +
      workshop.name + '</strong>. It was so much fun, and we are already looking forward to Day 2 tomorrow. ' +
      'If ' + childList + ' was not able to make Day 1, that is completely fine, and we would still love to see ' +
      'them tomorrow. Everything you need is below.</p>' +
    surveyBlockHtml() +
    day1NotesBlockHtml() +
    mobileAppBlockHtml() +
    joinDetailsHtml(workshop) +
    inviteBlockHtml() +
    '<p style="margin:0;">Thank you so much. We are excited to see you all tomorrow. If you have any questions or ' +
      'concerns, please do not hesitate to reply to this email or write to us at ' +
      '<a href="mailto:' + ADMIN_EMAIL + '" style="color:' + C_ACCENT + ';">' + ADMIN_EMAIL + '</a>.</p>';

  let subject = ORG_NAME + ": thank you for Day 1, plus a quick survey and tomorrow's link";
  if (opts && opts.subjectPrefix) subject = opts.subjectPrefix + subject;

  const options = { htmlBody: emailShell("Thank you for Day 1", workshop.name, inner), name: ORG_NAME };
  if (opts && opts.bcc) options.bcc = opts.bcc;

  GmailApp.sendEmail(email, subject,
    "See the HTML version of this email for the pre-survey, Day 1 notes, and tomorrow's join link.", options);
}

// The pre-survey, for families who did not fill it in before Day 1. Answers
// have to describe how the child felt before any teaching, or the before/after
// comparison means nothing.
function surveyBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#EFF6FF;border:2px solid ' + C_ACCENT + ';border-radius:12px;margin:0 0 20px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('Quick pre-survey') +
        '<p style="margin:0 0 12px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_TEXT + ';font-weight:700;">' +
          'Just 2 multiple choice questions, and it only takes a minute.</p>' +
        '<p style="margin:0 0 12px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
          'If you have not filled this in yet, please do it together with your child ' +
          '<strong style="color:' + C_TEXT + ';">based on how they felt before the workshop started</strong>. ' +
          'That way we can see where each student began, before any teaching at all.</p>' +
        honestyNoteHtml() +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>' +
          '<a href="' + PRE_SURVEY_URL + '" style="background:' + C_ACCENT + ';color:#FFFFFF;text-decoration:none;' +
            'display:inline-block;padding:13px 30px;border-radius:10px;font-family:' + FONT_BODY + ';' +
            'font-size:15px;font-weight:700;">Take the pre-survey</a>' +
        '</td></tr></table>' +
        '<p style="margin:14px 0 0;font-family:' + FONT_BODY + ';font-size:12px;line-height:1.6;color:' + C_MUTED + ';word-break:break-all;">' +
          '<a href="' + PRE_SURVEY_URL + '" style="color:' + C_ACCENT + ';">' + PRE_SURVEY_URL + '</a></p>' +
      '</td></tr>' +
    '</table>';
}

// Day 1 transcript + notes, and when the rest of the materials arrive.
function day1NotesBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 20px;">' +
      '<tr><td style="padding:20px 22px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
        sectionTitle('Day 1 transcript and notes') +
        '<p style="margin:0 0 10px;">Here is the transcript and the meeting notes from today\'s session: ' +
          '<a href="' + DAY1_NOTES_URL + '" style="color:' + C_ACCENT + ';">Day 1 transcript and notes</a>.</p>' +
        '<p style="margin:0;">The recordings and slideshows will be sent out after tomorrow\'s session.</p>' +
      '</td></tr>' +
    '</table>';
}

// Mobile users need the Webex app installed before they can join.
function mobileAppBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
        sectionTitle('Joining from a phone or tablet') +
        '<p style="margin:0;">If you are joining from a mobile device, you will need to ' +
          '<strong style="color:' + C_TEXT + ';">download the Webex app</strong> first. Please allow an extra five ' +
          'minutes for that, or simply join about five minutes before we start so the download does not cut into the session.</p>' +
      '</td></tr>' +
    '</table>';
}

// It is not too late for friends to register.
function inviteBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
        sectionTitle('Invite a friend') +
        '<p style="margin:0;">It is not too late to invite your friends. Send them to ' +
          '<a href="https://almadenvoices.org/register" style="color:' + C_ACCENT + ';">almadenvoices.org/register</a> ' +
          'and they will receive an automatic link to this free workshop.</p>' +
      '</td></tr>' +
    '</table>';
}

// ============================================================
// PRE-SURVEY — send this BEFORE Day 1.
// Asks every registered family to fill in the 2-question baseline survey, with
// an explicit ask to answer honestly, and repeats the join link underneath.
// Run sendTestPreSurveyNudge() first to preview it in your own inbox, then
// sendPreSurveyNudgeToAll() when you're happy with it.
// Safe to re-run: anyone already sent is skipped via the ReminderLog.
// ============================================================
const PRE_SURVEY_NUDGE_KEY = "presurveynudge";

// Preview only — sends one copy to TEST_EMAIL for a fake registrant.
function sendTestPreSurveyNudge() {
  const workshopId = Object.keys(WORKSHOPS)[0];
  const workshop = WORKSHOPS[workshopId];
  const registrant = { parentName: "Test Parent", studentNames: ["Test Kid"] };

  sendPreSurveyNudgeEmail(TEST_EMAIL, registrant, workshop, { subjectPrefix: "[TEST] " });
  Logger.log("Test pre-survey nudge sent to " + TEST_EMAIL);
}

// The real send — one email per registered family.
function sendPreSurveyNudgeToAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("No registrations found.");
    return;
  }

  const logSheet = getReminderLogSheet(ss);
  const alreadySent = getSentSet(logSheet);
  let sent = 0, skipped = 0;

  Object.keys(WORKSHOPS).forEach(function(workshopId) {
    const workshop = WORKSHOPS[workshopId];
    const registrants = getWorkshopRegistrants(sheet, workshopId);

    Object.keys(registrants).forEach(function(email) {
      if (alreadySent[sentKey(email, workshopId, PRE_SURVEY_NUDGE_KEY)]) { skipped++; return; }

      sendPreSurveyNudgeEmail(email, registrants[email], workshop, { bcc: BCC_EMAIL });

      recordSent(logSheet, email, workshopId, PRE_SURVEY_NUDGE_KEY);
      alreadySent[sentKey(email, workshopId, PRE_SURVEY_NUDGE_KEY)] = true;
      sent++;
    });
  });

  Logger.log("Pre-survey nudge emails sent: " + sent + " (skipped, already sent: " + skipped + ")");
}

function sendPreSurveyNudgeEmail(email, registrant, workshop, opts) {
  const childList = registrant.studentNames.length
    ? registrant.studentNames.join(" and ")
    : "your child";

  // Goes out before Day 1, so it asks how the child feels right now rather
  // than asking anyone to think back past a session.
  const firstDay = workshop.sessions && workshop.sessions[0] ? workshop.sessions[0] : null;

  const inner = '' +
    '<p style="margin:0 0 14px;">Dear ' + registrant.parentName + ',</p>' +
    '<p style="margin:0 0 20px;">One small thing before the ' +
      '<strong style="color:' + C_TEXT + ';">' + workshop.name + '</strong> begins' +
      (firstDay ? ' on ' + firstDay.label.replace(/^Day 1:\s*/, '') : '') + '. ' +
      'Please fill in our short pre-survey together with ' + childList + '. It takes about a minute, ' +
      'and it is how we measure whether the workshop actually helps.</p>' +
    preSurveyNudgeBlockHtml() +
    '<p style="margin:0 0 20px;">Your join link is below — the same link works for both days.</p>' +
    joinDetailsHtml(workshop) +
    '<p style="margin:0;">Thank you so much. We are excited to meet ' + childList + '. If you have any questions or ' +
      'concerns, please do not hesitate to reply to this email or write to us at ' +
      '<a href="mailto:' + ADMIN_EMAIL + '" style="color:' + C_ACCENT + ';">' + ADMIN_EMAIL + '</a>.</p>';

  let subject = ORG_NAME + ": please fill in this 1-minute survey before the workshop";
  if (opts && opts.subjectPrefix) subject = opts.subjectPrefix + subject;

  const options = { htmlBody: emailShell("Before we begin: a 1-minute survey", workshop.name, inner), name: ORG_NAME };
  if (opts && opts.bcc) options.bcc = opts.bcc;

  GmailApp.sendEmail(email, subject,
    "See the HTML version of this email for the pre-survey and today's join link.", options);
}

// The nudge version of the survey block. The one instruction that really
// matters: answer it as of before yesterday's session, not as of today.
function preSurveyNudgeBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#EFF6FF;border:2px solid ' + C_ACCENT + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('Quick pre-survey') +
        '<p style="margin:0 0 12px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_TEXT + ';font-weight:700;">' +
          'Just 2 multiple choice questions, and it only takes a minute.</p>' +
        '<p style="margin:0 0 12px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
          'Please fill it in <strong style="color:' + C_TEXT + ';">before the first session begins</strong>, ' +
          'sitting with your child so the answers are really theirs.</p>' +
        honestyNoteHtml() +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td>' +
          '<a href="' + PRE_SURVEY_URL + '" style="background:' + C_ACCENT + ';color:#FFFFFF;text-decoration:none;' +
            'display:inline-block;padding:13px 30px;border-radius:10px;font-family:' + FONT_BODY + ';' +
            'font-size:15px;font-weight:700;">Take the pre-survey</a>' +
        '</td></tr></table>' +
        '<p style="margin:14px 0 0;font-family:' + FONT_BODY + ';font-size:12px;line-height:1.6;color:' + C_MUTED + ';word-break:break-all;">' +
          '<a href="' + PRE_SURVEY_URL + '" style="color:' + C_ACCENT + ';">' + PRE_SURVEY_URL + '</a></p>' +
      '</td></tr>' +
    '</table>';
}

// The honesty ask, shared by every place the pre-survey appears. The survey is
// a baseline measurement, so a flattering answer is worse than an unflattering
// one — this spells out why, rather than just saying "be honest".
function honestyNoteHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#FFFFFF;border:1px solid ' + C_LINE + ';border-radius:10px;margin:0 0 16px;">' +
      '<tr><td style="padding:14px 16px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
        '<p style="margin:0 0 8px;font-weight:700;color:' + C_TEXT + ';">Please answer honestly</p>' +
        '<p style="margin:0 0 8px;">There are no right or wrong answers, and nobody is being graded or judged. ' +
          'If your child feels nervous or has never spoken in front of a group, say exactly that.</p>' +
        '<p style="margin:0;">We ask the same questions again at the end. An honest answer now is the only way ' +
          'we can see how far your child has come — a generous one today just hides their progress later.</p>' +
      '</td></tr>' +
    '</table>';
}

function getReminderLogSheet(ss) {
  let sheet = ss.getSheetByName("ReminderLog");
  if (!sheet) {
    sheet = ss.insertSheet("ReminderLog");
    sheet.appendRow(["Email", "Workshop ID", "Reminder Key", "Sent At"]);
    sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
  }
  return sheet;
}

// Key for the "already sent" set. Scoped per workshop so a family that
// attended an earlier workshop still receives every email for the next one.
function sentKey(email, workshopId, reminderKey) {
  return String(email).trim() + "|" + String(workshopId).trim() + "|" + String(reminderKey).trim();
}

function getSentSet(logSheet) {
  const set = {};
  if (logSheet.getLastRow() < 2) return set;
  const values = logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 3).getValues();
  values.forEach(function(row) {
    set[sentKey(row[0], row[1], row[2])] = true;
  });
  return set;
}

function recordSent(logSheet, email, workshopId, reminderKey) {
  logSheet.appendRow([email, workshopId, reminderKey, new Date()]);
}

// ============================================================
// NEWSLETTER
//
// A formal newsletter in the same centered card as every other email this
// script sends: blue header band with the Almaden Voices name, your headline,
// the body, then the footer with the website and contact address.
//
// ------------------------------------------------------------
// HOW TO SEND ONE
//
//   1. Edit NEWSLETTER below — the subject, headline and paragraphs.
//   2. Put the addresses in NEWSLETTER_TO, one per line.
//   3. Change NEWSLETTER_ID to something new for this edition.
//   4. Save (Cmd+S).
//   5. Choose "sendTestNewsletter" from the function dropdown at the top of
//      the editor and press Run. One copy arrives at almadenvoices@gmail.com.
//      Open it on your phone as well as your laptop and read it properly.
//   6. Happy with it? Choose "sendNewsletterToAll" and press Run.
//
// You do NOT need to Deploy for any of this. Deploy is only for the
// registration form. Saving and running is enough.
//
// Nobody receives the same edition twice. Every send is written to the
// ReminderLog tab, so if you add three more addresses tomorrow and run it
// again, only those three get it.
//
// Gmail will not send more than 100 emails a day from a free account. The
// send checks how many you have left and stops cleanly rather than failing
// halfway, telling you exactly who still needs it.
// ============================================================

// Change this for every new newsletter. It is what separates one edition from
// the next in the "already sent" log — reusing an old id means nobody who got
// that edition receives this one.
const NEWSLETTER_ID = "2026-09-edition-1";

// Who it goes to. One address per line, each in quotes with a comma after.
const NEWSLETTER_TO = [
  // "parent@example.com",
  // "someone.else@example.com",
];

// Set to true to also send to every family in the Registrations tab. Leave it
// false to mail only the addresses listed above.
const NEWSLETTER_INCLUDE_REGISTRANTS = false;

// ---- The newsletter itself ----
//
// In the text you can use <strong>bold</strong>, <em>italics</em> and links
// written as <a href="https://example.com">the words you want shown</a>.
// Leave subhead, bullets or button as "" / null to leave that part out.
const NEWSLETTER = {
  subject: "What's coming up at Almaden Voices",

  // The big line inside the blue header band.
  headline: "What's coming up at Almaden Voices",

  // Small supporting line under it. Use "" for none.
  subhead: "Free workshops, 1-on-1 coaching, and how to join us",

  greeting: "Hi there,",

  // Each string becomes its own paragraph.
  paragraphs: [
    "Thank you for being part of Almaden Voices. Here is what we have coming up.",
    "Our next free workshop is on <strong>Friday, September 4th, 6–7 PM</strong>. It is a one-hour introduction to public speaking for students ages 5 to 14 — speaking clearly, standing with confidence, and settling the nerves that come with presenting to a group. No experience needed, and there is no cost.",
  ],

  // An optional list. Set to null to leave it out entirely.
  bullets: {
    title: "What we cover",
    items: [
      "Speaking clearly and at the right pace",
      "Standing and moving with confidence",
      "Settling nerves before you begin",
      "Answering questions on the spot",
    ],
  },

  // An optional button. Set to null to leave it out.
  button: {
    label: "Register for the workshop",
    url: "https://almadenvoices.org/register",
  },

  signoff: "Warmly,<br>Anjika Bansal<br>Almaden Voices",

  // Adds a quiet line letting people ask to be taken off the list. Keep this
  // true on anything that goes to more than a handful of people — it is what
  // separates a newsletter from spam, both to a reader and to Gmail.
  showUnsubscribe: true,
};

// Renders the newsletter into the standard card.
function buildNewsletterHtml() {
  const n = NEWSLETTER;
  let body = "";

  if (n.greeting) {
    body += '<p style="margin:0 0 16px;">' + n.greeting + '</p>';
  }

  (n.paragraphs || []).forEach(function(text) {
    body += '<p style="margin:0 0 16px;">' + text + '</p>';
  });

  if (n.bullets && n.bullets.items && n.bullets.items.length) {
    body += '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="margin:24px 0;background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;">' +
      '<tr><td style="padding:20px 24px;">';
    if (n.bullets.title) body += sectionTitle(n.bullets.title);
    body += '<ul style="margin:0;padding-left:20px;color:' + C_BODY + ';font-size:15px;line-height:1.8;">';
    n.bullets.items.forEach(function(item) {
      body += '<li style="margin:0 0 6px;">' + item + '</li>';
    });
    body += '</ul></td></tr></table>';
  }

  if (n.button && n.button.url) {
    // Table-wrapped rather than a styled <a>, because Outlook ignores padding
    // on a link and the button collapses to plain blue text.
    body += '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">' +
      '<tr><td align="center" style="border-radius:10px;background:' + C_ACCENT + ';">' +
        '<a href="' + n.button.url + '" ' +
          'style="display:inline-block;padding:13px 28px;font-family:' + FONT_BODY + ';font-size:15px;' +
          'font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px;">' +
          n.button.label + '</a>' +
      '</td></tr></table>';
  }

  if (n.signoff) {
    body += '<p style="margin:24px 0 0;">' + n.signoff + '</p>';
  }

  if (n.showUnsubscribe) {
    body += '<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid ' + C_LINE + ';' +
      'font-size:12px;line-height:1.6;color:' + C_MUTED + ';">' +
      'You are receiving this because you registered for an Almaden Voices workshop or asked us to keep you posted. ' +
      'To stop receiving these, just <a href="mailto:' + ADMIN_EMAIL + '?subject=Unsubscribe" ' +
      'style="color:' + C_ACCENT + ';">reply and say so</a> and we will take you off the list.' +
      '</p>';
  }

  return emailShell(n.headline, n.subhead, body);
}

// Every address this edition should go to, lowercased and de-duplicated so a
// parent listed by hand who is also in Registrations only gets one copy.
function newsletterRecipients() {
  const seen = {};
  const out = [];

  const add = function(email) {
    const clean = String(email || "").trim().toLowerCase();
    // Good enough to catch typos and stray blanks; Gmail rejects the rest.
    if (!clean || clean.indexOf("@") < 1 || seen[clean]) return;
    seen[clean] = true;
    out.push(clean);
  };

  NEWSLETTER_TO.forEach(add);

  if (NEWSLETTER_INCLUDE_REGISTRANTS) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registrations");
    if (sheet && sheet.getLastRow() > 1) {
      const idx = headerIndexMap(sheet);
      const emailCol = idx["Email"];
      if (emailCol !== undefined) {
        sheet.getRange(2, emailCol + 1, sheet.getLastRow() - 1, 1)
          .getValues()
          .forEach(function(row) { add(row[0]); });
      }
    }
  }

  return out;
}

// Sends one copy to yourself. Never touches the real list, and never writes to
// the log — run it as many times as you like.
function sendTestNewsletter() {
  GmailApp.sendEmail(TEST_EMAIL,
    "[TEST] " + NEWSLETTER.subject,
    "See the HTML version of this email.",
    { htmlBody: buildNewsletterHtml(), name: ORG_NAME });

  const count = newsletterRecipients().length;
  Logger.log("Test newsletter sent to " + TEST_EMAIL + ".");
  Logger.log("The real send would go to " + count + " address(es) under id \"" + NEWSLETTER_ID + "\".");
}

// The real send — one email each, so every reader sees only their own address.
function sendNewsletterToAll() {
  const recipients = newsletterRecipients();
  if (!recipients.length) {
    Logger.log("No recipients. Add addresses to NEWSLETTER_TO (or set NEWSLETTER_INCLUDE_REGISTRANTS to true).");
    return;
  }

  const logSheet = getReminderLogSheet(SpreadsheetApp.getActiveSpreadsheet());
  const alreadySent = getSentSet(logSheet);
  const html = buildNewsletterHtml();

  let sent = 0, skipped = 0;
  const notSent = [];

  for (let i = 0; i < recipients.length; i++) {
    const email = recipients[i];

    if (alreadySent[sentKey(email, NEWSLETTER_ID, "newsletter")]) { skipped++; continue; }

    // Stop before Gmail does. Hitting the quota mid-send throws, which would
    // leave you unable to tell who had already received it.
    if (MailApp.getRemainingDailyQuota() < 1) {
      notSent.push(email);
      continue;
    }

    GmailApp.sendEmail(email, NEWSLETTER.subject,
      "See the HTML version of this email.",
      { htmlBody: html, name: ORG_NAME });

    recordSent(logSheet, email, NEWSLETTER_ID, "newsletter");
    alreadySent[sentKey(email, NEWSLETTER_ID, "newsletter")] = true;
    sent++;
  }

  Logger.log("Newsletter \"" + NEWSLETTER_ID + "\" sent to " + sent + " address(es).");
  if (skipped) Logger.log("Skipped " + skipped + " who already had this edition.");
  if (notSent.length) {
    Logger.log("OUT OF GMAIL QUOTA — " + notSent.length + " still to go. Run this again tomorrow " +
      "and only they will receive it. Waiting: " + notSent.join(", "));
  }
  Logger.log("Gmail sends left today: " + MailApp.getRemainingDailyQuota());
}

// Send it later instead of now. Set the time, run this once, then leave it —
// it fires whether or not the editor is open.
const NEWSLETTER_SEND_TIME_UTC = "2026-09-01T16:00:00Z";  // 9:00 AM PT

function scheduleNewsletter() {
  cancelScheduledNewsletter();

  const when = new Date(NEWSLETTER_SEND_TIME_UTC);
  if (when.getTime() <= Date.now()) {
    Logger.log("NEWSLETTER_SEND_TIME_UTC is in the past — nothing scheduled. Update it and run again.");
    return;
  }

  ScriptApp.newTrigger("sendNewsletterToAll").timeBased().at(when).create();
  Logger.log("Newsletter scheduled for " + when + " — " + newsletterRecipients().length + " recipient(s).");
}

function cancelScheduledNewsletter() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "sendNewsletterToAll") {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  Logger.log("Scheduled newsletters removed: " + removed);
}

// ============================================================
// UTILITIES
// ============================================================
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// GET handler — for testing that the script is deployed
function doGet() {
  return jsonOut({
    status: "ok",
    version: SCRIPT_VERSION,
    message: "Almaden Voices Registration Script is running."
  });
}
