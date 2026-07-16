/**
 * Google Apps Script — Almaden Voices Registration Handler
 *
 * Receives form submissions via POST, writes each student row to a Google Sheet,
 * and sends confirmation + admin notification emails.
 *
 * For workshops listed in the WORKSHOPS config below, the parent confirmation
 * email includes the full schedule and the Webex join link, and the registrant
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

// Desired column order for the Registrations sheet. New columns are appended
// automatically to existing sheets, so this is safe to extend over time.
const REG_HEADERS = [
  "Timestamp",
  "Parent Name",
  "Email",
  "Phone",
  "Student First Name",
  "Student Last Name",
  "Grade",
  "Session",
  "Session ID",
  "Country",
  "Street Address",
  "City",
  "State",
  "ZIP",
  "Additional Info",
  "Privacy Policy Agreed",
  "Photo Consent",
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
    datesText: "Tuesday, July 21 & Thursday, July 23, 2026",
    timesText: "10:00–11:00 AM IST &middot; 12:30–1:30 PM Singapore &middot; 4:30–5:30 AM UTC",
    // Each session's start time in UTC (ISO 8601). 10:00 AM IST = 4:30 AM UTC.
    sessions: [
      { label: "Day 1 — Tuesday, July 21, 2026", startUtc: "2026-07-21T04:30:00Z" },
      { label: "Day 2 — Thursday, July 23, 2026", startUtc: "2026-07-23T04:30:00Z" }
    ],
    webex: {
      link: "https://anjikabansal-405.my.webex.com/meet/almadenvoices",
      meetingNumber: "2554 439 4487",
      phone: "+1-650-479-3208",
      globalCallIn: "https://anjikabansal-405.my.webex.com/anjikabansal-405.my/globalcallin.php?MTID=m634a191836d0f42e51b2660a35060125"
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
        "Grade": student.gradeLevel,
        "Session": data.sessionLabel || data.sessionType,
        "Session ID": data.sessionType || "",
        "Country": data.country || "",
        "Street Address": data.streetAddress || "",
        "City": data.city || "",
        "State": data.state || "",
        "ZIP": data.zipCode || "",
        "Additional Info": data.additionalInfo || "",
        "Privacy Policy Agreed": data.privacyAgreed ? "Yes" : "No",
        "Photo Consent": data.photoConsent ? "Yes" : "No",
        "Future Contact Opt-In": data.futureContact ? "Yes" : "No"
      });
    });

    // Shared email pieces
    const studentListHtml = students.map(function(st) {
      return "<li><strong>" + st.firstName + " " + st.lastName + "</strong>" +
        (st.gradeLevel ? " — " + gradeSuffix(st.gradeLevel) + " Grade" : "") + "</li>";
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
      { htmlBody: parentHtml, name: ORG_NAME }
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
function webexBlockHtml(workshop) {
  const w = workshop.webex;
  return '' +
    '<div style="background:#F0F6FF;border:1px solid #BFDBFE;border-radius:12px;padding:20px;margin:18px 0;">' +
      '<p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:15px;">How to Join (Webex)</p>' +
      '<a href="' + w.link + '" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:700;">Join the Workshop &rarr;</a>' +
      '<p style="margin:16px 0 6px;color:#374151;font-size:13px;">Or join manually:</p>' +
      '<ul style="color:#374151;font-size:13px;line-height:1.7;margin:0;padding-left:18px;">' +
        '<li>Link: <a href="' + w.link + '" style="color:#2563EB;">' + w.link + '</a></li>' +
        '<li>Meeting number: <strong>' + w.meetingNumber + '</strong></li>' +
        '<li>By phone: ' + w.phone + ' (access code: ' + w.meetingNumber + ')</li>' +
        '<li><a href="' + w.globalCallIn + '" style="color:#2563EB;">Global call-in numbers</a></li>' +
      '</ul>' +
    '</div>';
}

function scheduleBlockHtml(workshop) {
  const items = workshop.sessions.map(function(s) { return '<li>' + s.label + '</li>'; }).join('');
  return '' +
    '<p style="margin:0 0 6px;color:#111827;"><strong>When</strong></p>' +
    '<ul style="color:#374151;line-height:1.8;margin:0 0 10px;">' + items + '</ul>' +
    '<p style="color:#374151;margin:0 0 4px;"><strong>Time:</strong> ' + workshop.timesText + '</p>' +
    '<p style="color:#374151;margin:0 0 12px;"><strong>Where:</strong> Online via Webex (same link both days)</p>';
}

function buildWorkshopConfirmationHtml(data, workshop, students, studentListHtml, firstStudent) {
  const childPhrase = students.length === 1 ? firstStudent.firstName : "your children";
  return '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color:#2563EB;">You\'re Registered! 🎉</h2>' +
      '<p>Dear ' + data.parentName + ',</p>' +
      '<p>Thank you for registering ' + childPhrase + ' for our <strong>' + workshop.name + '</strong>! ' +
        (students.length === 1 ? 'Your spot is' : 'Your spots are') + ' confirmed. This is a free two-day online workshop where kids learn the fundamentals of public speaking — how to speak clearly and confidently, overcome nervousness, and present in front of others.</p>' +
      '<h3 style="color:#333;">Registered</h3>' +
      '<ul style="line-height:1.8;color:#333;">' + studentListHtml + '</ul>' +
      scheduleBlockHtml(workshop) +
      webexBlockHtml(workshop) +
      '<p style="color:#374151;">We\'ll email you a reminder before the workshop begins. The same Webex link works for both days — feel free to attend one or both.</p>' +
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
        '<li>Photo/Video Consent: <strong>' + (data.photoConsent ? 'Yes' : 'No') + '</strong></li>' +
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
      ". Here\'s your link so " + childList + " can hop on when it\'s time.";
  }

  const html = '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
      '<h2 style="color:#2563EB;">' + (type === "2day" ? "See you in 2 days! 👋" : "It\'s almost time! ⏰") + '</h2>' +
      '<p>Dear ' + registrant.parentName + ',</p>' +
      '<p>' + intro + '</p>' +
      scheduleBlockHtml(workshop) +
      webexBlockHtml(workshop) +
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
// Turn "1" → "1st", "2" → "2nd", etc.
function gradeSuffix(grade) {
  const n = parseInt(grade, 10);
  if (!n) return grade;
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return n + "th";
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// GET handler — for testing that the script is deployed
function doGet() {
  return jsonOut({ status: "ok", message: "Almaden Voices Registration Script is running." });
}
