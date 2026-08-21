/**
 * The deployed Google Apps Script web app that both the registration form and
 * the volunteer application form post to.
 *
 * The script (source in google-apps-script/RegistrationScript.js) writes each
 * submission to the Google Sheet and sends the confirmation emails. Its live
 * copy lives in the almadenvoices@gmail.com Google account.
 *
 * If the script is ever re-deployed and Google hands out a new /exec URL, this
 * is the only place in the site that needs changing.
 */
export const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxrbVWSjMpAB4Ru1mm_DSywPdfFS3KfMMA07Ie_e1VbXGeW_ILtNQ-vE8rQrIYubjFI/exec";
