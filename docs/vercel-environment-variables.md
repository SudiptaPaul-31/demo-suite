# Vercel Environment Variables Guide

## ⚠️ Important: .env Files Are NOT Uploaded to Vercel

**`.env` files are LOCAL ONLY and are never uploaded to Vercel or Git.**

This is by design for security - your `.env` files contain sensitive credentials that should never be committed to version control.

## How Environment Variables Work

### Local Development (`.env.local`)
- Used only on your local machine
- Loaded by Next.js automatically when running `npm run dev`
- Files like `.env`, `.env.local`, `.env.production.local` are in `.gitignore`
- **These files are NOT sent to Vercel**

### Vercel Production
- Environment variables must be set **manually in Vercel Dashboard**
- They are available during build time and runtime
- `NEXT_PUBLIC_*` variables are embedded in the client bundle at build time

## Setting Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and log in
2. Select your project: **stellar-nexus-experience**

### Step 2: Navigate to Environment Variables
1. Click on your project
2. Go to **Settings** (gear icon in top navigation)
3. Click **Environment Variables** in the left sidebar

### Step 3: Add Each Variable
For each Firebase variable, click **Add** and enter:

**Variable Name:** `NEXT_PUBLIC_FIREBASE_API_KEY`  
**Value:** (paste your actual API key from Firebase Console)  
**Environment:** Select **Production**, **Preview**, and **Development** (or select all)

Repeat for all these variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Step 4: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

## Getting Your Firebase Values

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. Click on your web app (or create one if needed)
6. You'll see the config object with all the values you need

## Verify Your Setup

### Check Local Environment Variables
```bash
npm run env:check
```

This will show you which variables are set locally.

### Check Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are listed
3. Make sure they're set for **Production** environment

## Common Issues

### ❌ "Firebase config missing" in production
**Cause:** Environment variables not set in Vercel  
**Fix:** Add all variables in Vercel Dashboard and redeploy

### ❌ Build fails with "Missing required Firebase configuration"
**Cause:** Variables not available during build  
**Fix:** Ensure variables are set in Vercel Project Settings (not just environment variables)

### ❌ Works locally but not in production
**Cause:** Local `.env.local` file exists but Vercel doesn't have the variables  
**Fix:** Copy values from `.env.local` to Vercel Dashboard

## Quick Reference

| Location | Purpose | When to Use |
|----------|---------|-------------|
| `.env.local` | Local development | Development on your machine |
| Vercel Dashboard | Production/Preview | Deployment to Vercel |
| `.env.example` | Template/documentation | Reference for what variables are needed |

## Security Notes

- ✅ **DO** commit `.env.example` (it has no real values)
- ✅ **DO** set variables in Vercel Dashboard
- ❌ **DON'T** commit `.env` or `.env.local` files
- ❌ **DON'T** share environment variables in chat/code reviews

## Need Help?

Run `npm run env:check` to see which variables are set locally and get guidance on what to set in Vercel.

