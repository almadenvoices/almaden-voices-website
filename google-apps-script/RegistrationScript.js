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
  "intl-workshop-jul-2026": {
    name: "Free International Public Speaking Workshop for Kids",
    datesText: "Saturday, July 25 & Sunday, July 26, 2026",
    timesText: "9:30–10:30 AM IST &middot; 12:00–1:00 PM Singapore",
    // Each session's start time in UTC (ISO 8601). 12:00 PM Singapore = 4:00 AM UTC.
    sessions: [
      { label: "Day 1: Saturday, July 25, 2026", startUtc: "2026-07-25T04:00:00Z" },
      { label: "Day 2: Sunday, July 26, 2026", startUtc: "2026-07-26T04:00:00Z" }
    ],
    webex: {
      link: "https://anjikabansal-405.my.webex.com/anjikabansal-405.my/j.php?MTID=maff8bd4cb8821f446277ff56ca42f32a",
      meetingNumber: "2552 590 1918",
      password: "freeworkshop",
      passwordNumeric: "37339675",
      phone: "+1-650-479-3208",
      phoneTapToJoin: "+1-650-479-3208,,25525901918#37339675#",
      videoDial: "25525901918@webex.com",
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
// ============================================================
function scheduleBlockHtml(workshop) {
  const items = workshop.sessions.map(function(s) { return '<li>' + s.label + '</li>'; }).join('');
  return '' +
    '<p style="margin:0 0 6px;color:#111827;"><strong>When</strong></p>' +
    '<ul style="color:#374151;line-height:1.8;margin:0 0 10px;">' + items + '</ul>' +
    '<p style="color:#374151;margin:0 0 4px;"><strong>Time:</strong> ' + workshop.timesText + '</p>' +
    '<p style="color:#374151;margin:0 0 12px;"><strong>Where:</strong> Online (same join link for both days)</p>';
}

// Full Webex join instructions — used in the join-link email and in reminders.
function joinDetailsHtml(workshop) {
  const w = workshop.webex;
  if (!w) return '';
  return '' +
    '<div style="background:#F3F4F6;border-radius:8px;padding:16px;margin:0 0 16px;">' +
      '<p style="margin:0 0 10px;color:#111827;"><strong>Join the workshop</strong></p>' +
      '<p style="margin:0 0 14px;">' +
        '<a href="' + w.link + '" style="background:#2563EB;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;font-weight:bold;">Join the meeting</a>' +
      '</p>' +
      '<p style="margin:0 0 14px;color:#6B7280;font-size:12px;word-break:break-all;">' +
        'Or paste this into your browser:<br/><a href="' + w.link + '" style="color:#2563EB;">' + w.link + '</a></p>' +
      '<p style="margin:0 0 4px;color:#374151;"><strong>Join by meeting number</strong></p>' +
      '<p style="margin:0 0 14px;color:#374151;line-height:1.7;">' +
        'Meeting number (access code): <strong>' + w.meetingNumber + '</strong><br/>' +
        'Meeting password: <strong>' + w.password + '</strong> (' + w.passwordNumeric + ' when dialing from a phone or video system)</p>' +
      '<p style="margin:0 0 4px;color:#374151;"><strong>Tap to join from a mobile device (attendees only)</strong></p>' +
      '<p style="margin:0 0 14px;color:#374151;line-height:1.7;">' +
        '<a href="tel:' + w.phoneTapToJoin.replace(/[^0-9+,#]/g, '') + '" style="color:#2563EB;">' + w.phoneTapToJoin + '</a> United States Toll<br/>' +
        '<span style="color:#6B7280;font-size:12px;">Some mobile devices may ask attendees to enter a numeric password.</span></p>' +
      '<p style="margin:0 0 4px;color:#374151;"><strong>Join by phone</strong></p>' +
      '<p style="margin:0 0 14px;color:#374151;">' + w.phone + ' United States Toll</p>' +
      '<p style="margin:0 0 4px;color:#374151;"><strong>Join from a video system or application</strong></p>' +
      '<p style="margin:0 0 14px;color:#374151;line-height:1.7;">' +
        'Dial <strong>' + w.videoDial + '</strong><br/>' +
        'You can also dial ' + w.videoIp + ' and enter your meeting number.</p>' +
      '<p style="margin:0;color:#6B7280;font-size:12px;">Need help? Go to ' +
        '<a href="https://help.webex.com" style="color:#2563EB;">help.webex.com</a></p>' +
    '</div>';
}

function buildJoinLinkHtml(registrant, workshop) {
  const childList = registrant.studentNames.length
    ? registrant.studentNames.join(" and ")
    : "your child";
  return '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color:#2563EB;">Your join link is here! &#127908;</h2>' +
      '<p>Dear ' + registrant.parentName + ',</p>' +
      '<p>The <strong>' + workshop.name + '</strong> starts soon, and here is everything ' + childList +
        ' needs to join. The <strong>same link works for both days</strong> &mdash; we suggest saving this email.</p>' +
      scheduleBlockHtml(workshop) +
      joinDetailsHtml(workshop) +
      '<p style="color:#374151;">Please join a few minutes early so we can start on time. Attending both days is highly recommended for the best learning experience.</p>' +
      '<p>Questions? Just reply to this email or contact us at ' +
        '<a href="mailto:' + ADMIN_EMAIL + '" style="color:#2563EB;">' + ADMIN_EMAIL + '</a>.</p>' +
      '<hr style="border:1px solid #eee;" />' +
      '<p style="color:#666;">Best regards,<br/>' + ORG_NAME + ' Team<br/>' +
        '<a href="https://almadenvoices.org" style="color:#2563EB;">almadenvoices.org</a></p>' +
    '</div>';
}

function buildWorkshopConfirmationHtml(data, workshop, students, studentListHtml, firstStudent) {
  const childPhrase = students.length === 1 ? firstStudent.firstName : "your children";
  return '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color:#2563EB;">You\'re Registered! &#127881;</h2>' +
      '<p>Dear ' + data.parentName + ',</p>' +
      '<p>Thank you for registering ' + childPhrase + ' for our <strong>' + workshop.name + '</strong>! ' +
        (students.length === 1 ? 'Your spot is' : 'Your spots are') + ' confirmed. This is a <strong>free</strong> two-day online workshop where kids learn the fundamentals of public speaking: how to speak clearly and confidently, overcome nervousness, and present in front of others.</p>' +
      '<h3 style="color:#333;">Registered</h3>' +
      '<ul style="line-height:1.8;color:#333;">' + studentListHtml + '</ul>' +
      scheduleBlockHtml(workshop) +
      '<p style="color:#374151;">This is a two-day workshop (1 hour each day). Students are welcome to attend one or both sessions, but attending both is highly recommended for the best learning experience.</p>' +
      joinDetailsHtml(workshop) +
      '<p style="color:#374151;">We\'ll also send you a reminder before the workshop so you\'re all set.</p>' +
      '<p>If you have any questions, just reply to this email or contact us at ' +
        '<a href="mailto:' + ADMIN_EMAIL + '" style="color:#2563EB;">' + ADMIN_EMAIL + '</a>.</p>' +
      '<hr style="border:1px solid #eee;" />' +
      '<p style="color:#666;">Best regards,<br/>' + ORG_NAME + ' Team<br/>' +
        '<a href="https://almadenvoices.org" style="color:#2563EB;">almadenvoices.org</a></p>' +
    '</div>';
}

function buildGenericConfirmationHtml(data, students, studentListHtml, firstStudent) {
  return '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color: #2563EB;">Registration Confirmed!</h2>' +
      '<p>Dear ' + data.parentName + ',</p>' +
      '<p>Thank you for registering ' + (students.length === 1 ? firstStudent.firstName : 'your children') +
        ' for our <strong>' + (data.sessionLabel || 'upcoming session') + '</strong>! ' +
        (students.length === 1 ? 'Your spot is' : 'Your spots are') + ' confirmed.</p>' +
      '<h3 style="color: #333;">Registration Details</h3>' +
      '<ul style="line-height: 1.8; color: #333;">' + studentListHtml + '</ul>' +
      '<p style="color: #333;"><strong>Program:</strong> ' + (data.sessionLabel || '') + '</p>' +
      '<p>We\'ll follow up with schedule details and location information closer to the session date.</p>' +
      '<p>If you have any questions, feel free to reply to this email or contact us at ' +
        '<a href="mailto:' + ADMIN_EMAIL + '" style="color: #2563EB;">' + ADMIN_EMAIL + '</a>.</p>' +
      '<hr style="border: 1px solid #eee;" />' +
      '<p style="color: #666;">Best regards,<br/>' + ORG_NAME + ' Team<br/>' +
        '<a href="https://almadenvoices.org" style="color: #2563EB;">almadenvoices.org</a></p>' +
    '</div>';
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
        if (alreadySent[email + "|" + key]) return;
        sendReminderEmail(email, registrants[email], workshop, null, "2day");
        recordSent(logSheet, email, workshopId, key);
        alreadySent[email + "|" + key] = true;
      });
    }

    // Reminder 2 — shortly before EACH session day (from 2h before up to start time)
    workshop.sessions.forEach(function(session) {
      const start = Date.parse(session.startUtc);
      if (now >= start - 2 * HOUR && now <= start) {
        emails.forEach(function(email) {
          const key = "dayof-" + session.startUtc;
          if (alreadySent[email + "|" + key]) return;
          sendReminderEmail(email, registrants[email], workshop, session, "dayof");
          recordSent(logSheet, email, workshopId, key);
          alreadySent[email + "|" + key] = true;
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
  const registrant = { parentName: "Test Kid", studentNames: ["Test Kid"] };

  GmailApp.sendEmail(TEST_EMAIL,
    "[TEST] Your join link: " + workshop.name,
    "See the HTML version of this email for the join link and workshop details.",
    { htmlBody: buildJoinLinkHtml(registrant, workshop), name: ORG_NAME });

  Logger.log("Test join-link email sent to " + TEST_EMAIL);
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
      if (alreadySent[email + "|" + JOIN_LINK_KEY]) { skipped++; return; }

      GmailApp.sendEmail(email,
        "Your join link: " + workshop.name,
        "See the HTML version of this email for the join link and workshop details.",
        { htmlBody: buildJoinLinkHtml(registrants[email], workshop), name: ORG_NAME });

      recordSent(logSheet, email, workshopId, JOIN_LINK_KEY);
      alreadySent[email + "|" + JOIN_LINK_KEY] = true;
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

function sendReminderEmail(email, registrant, workshop, session, type) {
  const childList = registrant.studentNames.length
    ? registrant.studentNames.join(" and ")
    : "your child";

  let subject, intro;
  if (type === "2day") {
    subject = "In 2 days: " + workshop.name;
    intro = "This is a friendly reminder that <strong>" + workshop.name + "</strong> begins in <strong>2 days</strong>. " +
      "We can\'t wait to see " + childList + " there!";
  } else {
    subject = "Starting soon: your public speaking workshop is today";
    intro = "Your workshop session starts in about <strong>1–2 hours</strong>" +
      (session ? " (<strong>" + session.label + "</strong>)" : "") +
      ". Here is the join link again so " + childList + " can hop on when it\'s time.";
  }

  const html = '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color:#2563EB;">' + (type === "2day" ? "See you in 2 days! &#128075;" : "It\'s almost time! &#9200;") + '</h2>' +
      '<p>Dear ' + registrant.parentName + ',</p>' +
      '<p>' + intro + '</p>' +
      scheduleBlockHtml(workshop) +
      joinDetailsHtml(workshop) +
      '<p style="color:#374151;">Questions? Just reply to this email.</p>' +
      '<hr style="border:1px solid #eee;" />' +
      '<p style="color:#666;">Best regards,<br/>' + ORG_NAME + ' Team<br/>' +
        '<a href="https://almadenvoices.org" style="color:#2563EB;">almadenvoices.org</a></p>' +
    '</div>';

  GmailApp.sendEmail(email, subject, "See the HTML version of this email for your workshop details and join link.",
    { htmlBody: html, name: ORG_NAME });
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

function getSentSet(logSheet) {
  const set = {};
  if (logSheet.getLastRow() < 2) return set;
  const values = logSheet.getRange(2, 1, logSheet.getLastRow() - 1, 3).getValues();
  values.forEach(function(row) {
    set[String(row[0]).trim() + "|" + String(row[2]).trim()] = true;
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
