#!/bin/bash
# ============================================================
#  PUT THE SITE LIVE
#
#  Run it by typing this into Claude Code, including the "!":
#
#      ! ./deploy.sh
#
#  Or in a normal Terminal window, from this folder:
#
#      ./deploy.sh
#
#  It takes about 5 minutes. Wait for it to say DEPLOYED.
#  Then hard-refresh the site with Cmd+Shift+R.
# ============================================================

set -u

PROJECT="almaden-voices-486006"
REGION="us-west1"
SERVICE="almaden-voices"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"

export PATH="/opt/homebrew/share/google-cloud-sdk/bin:/opt/homebrew/bin:$PATH"

if ! command -v gcloud >/dev/null 2>&1; then
    echo "PROBLEM: can't find the gcloud command."
    echo "Tell Claude: \"gcloud isn't on the PATH\"."
    exit 1
fi

# An expired login is the usual reason a deploy dies, and gcloud has been known
# to report it without a non-zero exit code — so check before starting.
if ! gcloud auth print-access-token >/dev/null 2>&1; then
    echo "PROBLEM: your Google login has expired."
    echo
    echo "Run this first, sign in in the browser window it opens, then run ./deploy.sh again:"
    echo
    echo "    ! gcloud auth login"
    exit 1
fi

echo "Deploying to $SERVICE ($REGION). This takes about 5 minutes..."
echo

LOG="$(mktemp)"
gcloud run deploy "$SERVICE" \
    --source "$SOURCE_DIR" \
    --platform managed \
    --region "$REGION" \
    --project "$PROJECT" \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production,USE_GCP_SECRETS=true,GCP_PROJECT_ID=$PROJECT" \
    2>&1 | tee "$LOG"

# Reaching "serving 100 percent of traffic" is the only trustworthy sign it
# worked; checking the exit code alone has let a failed deploy look like a
# success. gcloud colourises the number, so match only the plain-text tail of
# that sentence — anything spanning the "100" would miss on the escape codes.
if grep -qaE "percent of traffic|has been deployed" "$LOG"; then
    echo
    echo "============================================"
    echo " DEPLOYED — the site is live."
    echo " Now hard-refresh the site: Cmd+Shift+R"
    echo "============================================"
    grep -o "revision \[[^]]*\]" "$LOG" | tail -1
    rm -f "$LOG"
    exit 0
fi

echo
echo "============================================"
echo " NOT DEPLOYED — the site was NOT updated."
echo "============================================"
echo "Scroll up for the reason, or copy the last few lines to Claude."
rm -f "$LOG"
exit 1
