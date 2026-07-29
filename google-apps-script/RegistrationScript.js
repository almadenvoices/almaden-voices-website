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
  "Country",
  "Street Address",
  "City",
  "State",
  "ZIP",
  "Additional Info",
  "Privacy Policy Agreed",
  "Future Contact Opt-In"
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
    timesText: "6:00–7:00 PM PT (Vancouver) &middot; 9:00–10:00 PM ET (Toronto)",
    // Each session's start time in UTC (ISO 8601). 6:00 PM PDT is 1:00 AM UTC
    // the following day, so these dates are one ahead of the labels.
    sessions: [
      { label: "Day 1: Tuesday, August 4, 2026", startUtc: "2026-08-05T01:00:00Z" },
      { label: "Day 2: Wednesday, August 5, 2026", startUtc: "2026-08-06T01:00:00Z" }
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
        "Country": data.country || "",
        "Street Address": data.streetAddress || "",
        "City": data.city || "",
        "State": data.state || "",
        "ZIP": data.zipCode || "",
        "Additional Info": data.additionalInfo || "",
        "Privacy Policy Agreed": data.privacyAgreed ? "Yes" : "No",
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
  let sheet = ss.getSheetByName("Registrations");
  if (!sheet) {
    sheet = ss.insertSheet("Registrations");
    sheet.appendRow(REG_HEADERS);
    sheet.getRange(1, 1, 1, REG_HEADERS.length).setFontWeight("bold");
    return sheet;
  }
  // Migrate: make sure every desired header exists; append any that are missing.
  const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  const missing = REG_HEADERS.filter(function(h) { return headers.indexOf(h) === -1; });
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
  const rows = workshop.sessions.map(function(s, i) {
    return '<tr><td style="padding:10px 0;' + (i ? 'border-top:1px solid ' + C_LINE + ';' : '') +
      'font-family:' + FONT_BODY + ';font-size:16px;color:' + C_TEXT + ';font-weight:500;">' + s.label + '</td></tr>';
  }).join('');

  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:' + C_SOFT + ';border:1px solid ' + C_LINE + ';border-radius:12px;margin:0 0 24px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('When') +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + rows + '</table>' +
        '<p style="margin:14px 0 0;font-family:' + FONT_BODY + ';font-size:15px;color:' + C_BODY + ';">' +
          '<strong style="color:' + C_TEXT + ';">Time:</strong> ' + workshop.timesText + '</p>' +
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
      (data.country ? '<p><strong>Country:</strong> ' + data.country + '</p>' : '') +
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
        '<li>Future Contact Opt-In: <strong>' + (data.futureContact ? 'Yes' : 'No') + '</strong></li>' +
      '</ul>' +
      '<hr style="border: 1px solid #eee;" />' +
      '<p style="color: #666; font-size: 12px;">Registered: ' + timestamp.toLocaleString() + '</p>' +
    '</div>';
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
// 2026-08-03T01:00:00Z = 6:00 PM PDT on Sunday, August 2, 2026 —
// exactly two days before Day 1 begins.
const BLAST_TIME_UTC = "2026-08-03T01:00:00Z";

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
// 2026-08-04T01:00:00Z = 6:00 PM PDT on Monday, August 3, 2026 —
// exactly 24 hours before Day 1 begins.
const ONE_DAY_REMINDER_TIME_UTC = "2026-08-04T01:00:00Z";

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
// 2026-08-05T00:00:00Z = 5:00 PM PDT on Tuesday, August 4, 2026 —
// exactly one hour before Day 1 begins.
const ONE_HOUR_REMINDER_TIME_UTC = "2026-08-05T00:00:00Z";

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
const PRE_SURVEY_URL = "https://forms.gle/T5hmD7NGRuoAb3Xo9";

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

// The pre-survey. Highlighted, because it was meant to go out before Day 1 and
// we need it answered as-of-before-the-workshop for the results to mean anything.
function surveyBlockHtml() {
  return '' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
      'style="background:#EFF6FF;border:2px solid ' + C_ACCENT + ';border-radius:12px;margin:0 0 20px;">' +
      '<tr><td style="padding:20px 22px;">' +
        sectionTitle('Quick pre-survey') +
        '<p style="margin:0 0 12px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_TEXT + ';font-weight:700;">' +
          'Just 2 multiple choice questions, and it only takes a minute.</p>' +
        '<p style="margin:0 0 16px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
          'We meant to send this out before Day 1, so please fill it in together with your child ' +
          '<strong style="color:' + C_TEXT + ';">based on how they felt before the workshop started</strong>. ' +
          'That way we can see where each student began, before any teaching at all.</p>' +
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
// PRE-SURVEY NUDGE — "please fill it in as of before Day 1"
// A short follow-up for everyone: the pre-survey plus the join link for
// today's Day 2 session.
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

  // Same rule as the recap: no attendance data here, so never assume the
  // family was at Day 1.
  const inner = '' +
    '<p style="margin:0 0 14px;">Dear ' + registrant.parentName + ',</p>' +
    '<p style="margin:0 0 20px;">A quick favour before today\'s Day 2 session of the ' +
      '<strong style="color:' + C_TEXT + ';">' + workshop.name + '</strong>. If you have not had a chance yet, ' +
      'please fill in our short pre-survey with ' + childList + '. It takes about a minute, and it makes a real ' +
      'difference to us. The join link for today is further down.</p>' +
    preSurveyNudgeBlockHtml() +
    '<p style="margin:0 0 20px;">Here is the link for today\'s session. It is the same link as yesterday, ' +
      'and it works for everyone, whether or not ' + childList + ' was able to join Day 1.</p>' +
    joinDetailsHtml(workshop) +
    '<p style="margin:0;">Thank you so much. We are excited to see you all today. If you have any questions or ' +
      'concerns, please do not hesitate to reply to this email or write to us at ' +
      '<a href="mailto:' + ADMIN_EMAIL + '" style="color:' + C_ACCENT + ';">' + ADMIN_EMAIL + '</a>.</p>';

  let subject = ORG_NAME + ": please fill in the quick pre-survey, plus today's join link";
  if (opts && opts.subjectPrefix) subject = opts.subjectPrefix + subject;

  const options = { htmlBody: emailShell("A quick pre-survey, and today's link", workshop.name, inner), name: ORG_NAME };
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
          'This was meant to reach you before we began, so please answer it ' +
          '<strong style="color:' + C_TEXT + ';">as if it were before yesterday\'s session</strong>, ' +
          'the way your child felt before any of the teaching started.</p>' +
        '<p style="margin:0 0 16px;font-family:' + FONT_BODY + ';font-size:15px;line-height:1.6;color:' + C_BODY + ';">' +
          'That is what lets us see where each student began, and how far they have come by the end.</p>' +
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
// UTILITIES
// ============================================================
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// GET handler — for testing that the script is deployed
function doGet() {
  return jsonOut({ status: "ok", message: "Almaden Voices Registration Script is running." });
}
