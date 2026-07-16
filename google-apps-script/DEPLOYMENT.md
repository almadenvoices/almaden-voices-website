# Google Apps Script Deployment — Registration Form

Follow these steps to deploy the Google Apps Script that receives registration form submissions, writes them to a Google Sheet, and sends confirmation/notification emails.

---

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) (logged in as **almadenvoices@gmail.com**)
2. Click **+ Blank spreadsheet**
3. Name it: **Almaden Voices Registrations**
4. You don't need to add any headers — the script creates them automatically on the first submission

---

## Step 2: Open Apps Script

1. In your new Google Sheet, go to **Extensions > Apps Script**
2. This opens the Apps Script editor in a new tab
3. You'll see a default file called `Code.gs` — **delete everything** in it

---

## Step 3: Paste the Script

1. Open the file `RegistrationScript.js` from this folder
2. Copy the **entire contents** of that file
3. Paste it into the `Code.gs` file in the Apps Script editor
4. Click the **Save** icon (or Ctrl+S / Cmd+S)
5. Name the project: **Almaden Voices Registration**

---

## Step 4: Deploy as Web App

1. Click the blue **Deploy** button (top right) > **New deployment**
2. Click the **gear icon** next to "Select type" > choose **Web app**
3. Fill in:
   - **Description:** `Registration form handler`
   - **Execute as:** `Me (almadenvoices@gmail.com)`
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. Click **Authorize access** when prompted
6. Choose your **almadenvoices@gmail.com** account
7. If you see "Google hasn't verified this app":
   - Click **Advanced** (bottom left)
   - Click **Go to Almaden Voices Registration (unsafe)**
   - Click **Allow**
8. You'll see a **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
9. **Copy this URL** — you need it for the next step

---

## Step 5: Add the URL to Your Website

1. Open the file: `client/src/Pages/Register/RegisterPage.js`
2. Find this line near the top (around line 70):
   ```javascript
   const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
   ```
3. Replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you copied
4. Save the file

---

## Step 6: Test It

1. Run the website locally (`npm run dev`)
2. Go to the registration page and submit a test registration
3. Check:
   - The Google Sheet should have a new row with the registration data
   - The parent email should receive a confirmation
   - almadenvoices@gmail.com should receive a notification
4. If the Google Sheet has data but no emails, check:
   - Gmail sending limits (Apps Script can send ~100 emails/day on free accounts)
   - The script logs: In Apps Script editor > **Executions** tab

---

## Step 7: Deploy the Website

After confirming everything works locally, deploy to production:

```bash
gcloud run deploy almaden-voices \
  --source . \
  --platform managed \
  --region us-west1 \
  --project almaden-voices-486006 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,USE_GCP_SECRETS=true,GCP_PROJECT_ID=almaden-voices-486006"
```

---

## Updating the Script Later

If you need to update the script after deployment:

1. Go to [Apps Script](https://script.google.com) and open your project
2. Make your changes in `Code.gs`
3. Click **Deploy > Manage deployments**
4. Click the **pencil icon** on your deployment
5. Change **Version** to **New version**
6. Click **Deploy**
7. The URL stays the same — no changes needed in your website code

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Form submits but no row in sheet | Check the Apps Script URL is correct and the deployment is set to "Anyone" |
| "CORS error" in browser console | This is normal for Apps Script — the form uses `no-cors` mode, submissions still work |
| No emails sent | Check Apps Script Executions tab for errors; verify Gmail isn't rate-limited |
| "Authorization required" | Re-deploy and re-authorize the script |
| Sheet has headers but no data | Check the browser Network tab for the POST request and its response |

---

## What Gets Logged in the Sheet

Each row contains:

| Column | Description |
|--------|-------------|
| Timestamp | When the form was submitted |
| Confirmation # | Unique confirmation number (e.g., AV-M3X7K-AB1C) |
| Parent Name | Parent/guardian full name |
| Email | Parent email address |
| Phone | Phone number |
| Student First Name | Student's first name |
| Student Last Name | Student's last name |
| Grade | Grade level (1-6) |
| Session | Selected session ID |
| Additional Info | Any notes from the parent |
| Privacy Policy Agreed | Yes/No |
| Photo Consent | Yes/No |
| Future Contact Opt-In | Yes/No |

If multiple students are registered at once, each gets their own row with the same confirmation number.
