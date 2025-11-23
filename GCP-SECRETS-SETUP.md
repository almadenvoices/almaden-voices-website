# GCP Secret Manager Setup Guide

This guide explains how to set up GCP Secret Manager for securely storing your production secrets.

## Why Use GCP Secret Manager?

✅ **Secure** - Secrets are encrypted at rest and in transit
✅ **Centralized** - All secrets managed in one place
✅ **Auditable** - Track who accessed what and when
✅ **Version control** - Keep multiple versions of secrets
✅ **No .env files** - No risk of committing secrets to git

---

## Prerequisites

1. Google Cloud Project created
2. `gcloud` CLI installed and configured
3. Secret Manager API enabled

---

## Step 1: Enable Secret Manager API

```bash
gcloud services enable secretmanager.googleapis.com
```

---

## Step 2: Create Secrets in GCP

Run these commands to create each secret:

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# PayPal Secrets
echo -n "your_live_paypal_client_id" | gcloud secrets create PAYPAL_CLIENT_ID \
    --data-file=- \
    --project=$GCP_PROJECT_ID

echo -n "your_live_paypal_client_secret" | gcloud secrets create PAYPAL_CLIENT_SECRET \
    --data-file=- \
    --project=$GCP_PROJECT_ID

echo -n "live" | gcloud secrets create PAYPAL_ENV \
    --data-file=- \
    --project=$GCP_PROJECT_ID

# Email Secrets
echo -n "almadenvoices@gmail.com" | gcloud secrets create EMAIL_USER \
    --data-file=- \
    --project=$GCP_PROJECT_ID

echo -n "your_gmail_app_password" | gcloud secrets create EMAIL_PASS \
    --data-file=- \
    --project=$GCP_PROJECT_ID

echo -n "almadenvoices@gmail.com" | gcloud secrets create EMAIL_TO \
    --data-file=- \
    --project=$GCP_PROJECT_ID

# Application Secrets
echo -n "https://almadenvoices.com" | gcloud secrets create BASE_URL \
    --data-file=- \
    --project=$GCP_PROJECT_ID

# Generate a random secret for UNSUBSCRIBE_SECRET
echo -n $(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") | \
    gcloud secrets create UNSUBSCRIBE_SECRET \
    --data-file=- \
    --project=$GCP_PROJECT_ID
```

---

## Step 3: Grant Access to Cloud Run Service

```bash
# Get your Cloud Run service account
export SERVICE_ACCOUNT="your-service@your-project.iam.gserviceaccount.com"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
```

---

## Step 4: Update Secrets (When Needed)

To update a secret value:

```bash
echo -n "new_secret_value" | gcloud secrets versions add PAYPAL_CLIENT_ID \
    --data-file=- \
    --project=$GCP_PROJECT_ID
```

---

## Step 5: Deploy to Cloud Run

Update your `Dockerfile` to include environment variables:

```dockerfile
# Set environment variables for production
ENV NODE_ENV=production
ENV USE_GCP_SECRETS=true
ENV GCP_PROJECT_ID=your-project-id
```

Then deploy:

```bash
gcloud run deploy almaden-voices \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production,USE_GCP_SECRETS=true,GCP_PROJECT_ID=$GCP_PROJECT_ID"
```

---

## Testing Locally with GCP Secrets

To test locally using GCP secrets:

```bash
# Authenticate with GCP
gcloud auth application-default login

# Set environment variables
export NODE_ENV=production
export USE_GCP_SECRETS=true
export GCP_PROJECT_ID=your-project-id

# Run the server
npm run server:gcp
```

---

## Environment Variables Summary

### Development (.env.dev)
- Uses local `.env.dev` file
- Run with: `npm run dev`

### Production Local (.env.production)
- Uses local `.env.production` file
- Run with: `npm run server:prod`

### Production GCP (Secret Manager)
- Uses GCP Secret Manager
- Run with: `npm run server:gcp`
- Used automatically on Cloud Run

---

## Verifying Secrets

List all secrets:
```bash
gcloud secrets list --project=$GCP_PROJECT_ID
```

View a secret value (requires permissions):
```bash
gcloud secrets versions access latest --secret="PAYPAL_CLIENT_ID" --project=$GCP_PROJECT_ID
```

---

## Security Best Practices

✅ Never commit `.env`, `.env.dev`, or `.env.production` to git
✅ Use different secrets for development and production
✅ Rotate secrets regularly
✅ Use IAM to control who can access secrets
✅ Enable audit logs to track secret access
✅ Use least privilege - only grant necessary permissions

---

## Troubleshooting

### Error: "Secret not found"
- Ensure the secret exists: `gcloud secrets list`
- Check the secret name matches exactly

### Error: "Permission denied"
- Verify service account has `roles/secretmanager.secretAccessor`
- Check: `gcloud projects get-iam-policy $GCP_PROJECT_ID`

### Error: "Application Default Credentials not found"
- Run: `gcloud auth application-default login`

---

## Cost

GCP Secret Manager pricing (as of 2024):
- **$0.06** per 10,000 secret access operations
- **$0.40** per secret version per month (for active secrets)

For a typical application with 8 secrets:
- Storage: ~$3.20/month
- Access: Minimal (unless accessing thousands of times)

**Total: ~$3-5/month** (very affordable!)

---

## Migration Checklist

- [ ] Enable Secret Manager API
- [ ] Create all required secrets in GCP
- [ ] Grant Cloud Run service account access
- [ ] Update Dockerfile with env vars
- [ ] Test locally with `npm run server:gcp`
- [ ] Deploy to Cloud Run
- [ ] Verify secrets are loading correctly
- [ ] Delete `.env.production` from server (keep locally as backup)

---

## Support

For issues with GCP Secret Manager:
- [GCP Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Cloud Run Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables)