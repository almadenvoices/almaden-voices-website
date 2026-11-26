#!/bin/bash
# ============================================================
#  STOP PAYING FOR OLD DEPLOYS
#
#  Every ./deploy.sh builds a fresh container image and uploads a copy of the
#  source. Google keeps all of them forever and bills for the storage. Before
#  the .gcloudignore fixes in Aug/Sep 2026, each one carried ~300MB of .git and
#  ~255MB of camera originals, so the pile is large. That pile, not the website
#  itself, is most of the bill.
#
#      ./scripts/gcp-cost-cleanup.sh            # look only, change nothing
#      ./scripts/gcp-cost-cleanup.sh --apply    # set the cleanup rules
#
#  --apply does two things, both reversible (you can remove the rules later):
#    1. Artifact Registry: keep the 5 newest images, delete the rest once
#       they are over 7 days old. Google runs this in the background; space
#       frees up within about a day.
#    2. Deploy-upload buckets (run-sources-*, *_cloudbuild): delete uploaded
#       source copies after 7 days. The site's data bucket is never touched.
#
#  Old Secret Manager versions are billed too, but destroying one can't be
#  undone, so this script only PRINTS those commands for you to check and run.
# ============================================================

set -u

PROJECT="almaden-voices-486006"
REGION="us-west1"
SERVICE="almaden-voices"
DATA_BUCKET="almaden-voices-data"   # registrations etc. Never modified here.
APPLY=false
[ "${1:-}" = "--apply" ] && APPLY=true

export PATH="/opt/homebrew/share/google-cloud-sdk/bin:/opt/homebrew/bin:$PATH"
command -v gcloud >/dev/null 2>&1 || { echo "PROBLEM: gcloud isn't on the PATH."; exit 1; }
gcloud auth print-access-token >/dev/null 2>&1 || { echo "PROBLEM: run 'gcloud auth login' first."; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

$APPLY && echo "MODE: APPLY (rules will be set)" || echo "MODE: LOOK ONLY (nothing will change; add --apply to set the rules)"
echo

# ---------- 1. Cloud Run settings (should be scale to zero) ----------
echo "== Cloud Run: $SERVICE =="
gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" \
    --format='table[box](spec.template.metadata.annotations."autoscaling.knative.dev/minScale":label=MIN_INSTANCES,spec.template.metadata.annotations."autoscaling.knative.dev/maxScale":label=MAX_INSTANCES,spec.template.metadata.annotations."run.googleapis.com/cpu-throttling":label=CPU_THROTTLING,spec.template.spec.containers[0].resources.limits.memory:label=MEMORY)'
echo "MIN_INSTANCES should be blank or 0. If it's 1+, you pay for an always-on server."
echo

# ---------- 2. Artifact Registry ----------
echo "== Artifact Registry repositories (sizeBytes = what you're billed on) =="
gcloud artifacts repositories list --project "$PROJECT" \
    --format='table(name.basename():label=REPO,format,name.segment(3):label=LOCATION,sizeBytes.size(units_out=G):label=SIZE_GB)'
echo

cat > "$TMP/ar-policy.json" <<'JSON'
[
  {
    "name": "keep-5-newest",
    "action": {"type": "Keep"},
    "mostRecentVersions": {"keepCount": 5}
  },
  {
    "name": "delete-older-than-7-days",
    "action": {"type": "Delete"},
    "condition": {"tagState": "any", "olderThan": "7d"}
  }
]
JSON

for REPO_PATH in $(gcloud artifacts repositories list --project "$PROJECT" --format='value(name)'); do
    REPO="$(basename "$REPO_PATH")"
    LOC="$(echo "$REPO_PATH" | cut -d/ -f4)"
    COUNT="$(gcloud artifacts docker images list "$LOC-docker.pkg.dev/$PROJECT/$REPO" --include-tags --format='value(version)' 2>/dev/null | wc -l | tr -d ' ')"
    echo "  $REPO ($LOC): $COUNT image versions"
    if $APPLY; then
        gcloud artifacts repositories set-cleanup-policies "$REPO" \
            --project "$PROJECT" --location "$LOC" \
            --policy "$TMP/ar-policy.json" --no-dry-run --quiet \
            && echo "  -> cleanup rule set: keep 5 newest, delete the rest after 7 days"
    fi
done
echo

# ---------- 3. Buckets ----------
echo "== Cloud Storage buckets =="
cat > "$TMP/lifecycle.json" <<'JSON'
{"rule": [{"action": {"type": "Delete"}, "condition": {"age": 7}}]}
JSON

for B in $(gcloud storage buckets list --project "$PROJECT" --format='value(name)'); do
    SIZE="$(gcloud storage du -s "gs://$B" 2>/dev/null | awk '{printf "%.2f GB", $1/1024/1024/1024}')"
    case "$B" in
        "$DATA_BUCKET")
            echo "  $B: $SIZE  (site data, left alone)";;
        run-sources-*|*_cloudbuild)
            echo "  $B: $SIZE  (old deploy uploads)"
            if $APPLY; then
                gcloud storage buckets update "gs://$B" --lifecycle-file="$TMP/lifecycle.json" --quiet \
                    && echo "  -> rule set: delete uploads older than 7 days"
            fi;;
        *)
            echo "  $B: $SIZE  (unknown, left alone)";;
    esac
done
echo

# ---------- 4. Secret Manager (print only) ----------
echo "== Secret Manager: versions you're paying for =="
echo "Each ENABLED or DISABLED version costs \$0.06/month per replica region"
echo "(first 6 free). Only 'latest' is used by the site."
echo
for S in $(gcloud secrets list --project "$PROJECT" --format='value(name)'); do
    REPL="$(gcloud secrets describe "$S" --project "$PROJECT" --format='value(replication.userManaged.replicas.location.list())')"
    [ -n "$REPL" ] && REPL="user-managed: $REPL" || REPL="automatic"
    VERSIONS="$(gcloud secrets versions list "$S" --project "$PROJECT" --filter='state!=DESTROYED' --format='value(name)' --sort-by=~createTime)"
    N="$(echo "$VERSIONS" | grep -c . )"
    echo "  $S: $N live versions ($REPL)"
    echo "$VERSIONS" | tail -n +2 | while read -r V; do
        [ -n "$V" ] && echo "      gcloud secrets versions destroy $V --secret=$S --project=$PROJECT"
    done
done
echo
echo "Lines starting with 'gcloud secrets versions destroy' are old versions."
echo "Destroying one CAN'T be undone. Check the site works on 'latest' first, then"
echo "copy and run the ones you want gone."
