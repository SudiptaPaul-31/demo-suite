# How to Connect GitHub Organization to Vercel

## The Problem
When you moved your repository to `stellar-nexus-experience` organization, Vercel can no longer see it because the GitHub organization isn't authorized in Vercel.

## Solution: Authorize Organization Access

### Step 1: Install/Update Vercel GitHub App for Organization

1. **Go to GitHub Organization Settings**
   - Navigate to: https://github.com/organizations/stellar-nexus-experience/settings/installations
   - Or: GitHub → stellar-nexus-experience → Settings → Third-party access

2. **Check if Vercel is Installed**
   - Look for "Vercel" in the list of installed apps
   - If you see it, click "Configure" 
   - If you DON'T see it, go to Step 3

3. **Install Vercel App** (if not installed)
   - Click "Add GitHub App" or "Install new app"
   - Search for "Vercel"
   - Click "Install"
   - Select "stellar-nexus-experience" organization
   - Choose repository access: **"All repositories"** OR **"Only select repositories"** (then select demo-suite)
   - Click "Install"

### Step 2: Grant Repository Access to Vercel

1. **In GitHub**, go to: https://github.com/organizations/stellar-nexus-experience/settings/installations
2. **Find Vercel** and click **"Configure"**
3. Under **"Repository access"**, select:
   - **"All repositories"** (recommended), OR
   - **"Only select repositories"** → Check "demo-suite"
4. **Scroll down** and click **"Save"**

### Step 3: Reconnect Vercel to GitHub

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Click your avatar** (top right) → **Settings**
3. Go to **"Git"** section
4. **Disconnect** GitHub (if connected to your personal account)
5. **Connect** GitHub again
6. **Authorize** access to organizations when prompted
7. Make sure **stellar-nexus-experience** organization is checked
8. Grant **read/write access** to repositories

### Step 4: Import/Reconnect Repository in Vercel

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. You should now see **"stellar-nexus-experience"** organization
4. Click on **stellar-nexus-experience**
5. Find **demo-suite** repository
6. Click **"Import"**

   **OR** if you're reconnecting existing project:
   
1. Go to your existing project: `stellar-nexus-experience`
2. Navigate to **Settings** → **Git**
3. Click **"Disconnect"** from old repository
4. Click **"Connect Git Repository"**
5. Select **stellar-nexus-experience/demo-suite**
6. Configure project settings (Framework, Build Command, etc.)
7. Click **"Deploy"**

### Step 5: Verify Webhook is Created

1. Go to: https://github.com/stellar-nexus-experience/demo-suite/settings/hooks
2. You should see a webhook from Vercel
3. Recent deliveries should show successful deliveries

## Troubleshooting

### "Organization not found" in Vercel
- You need to authorize organization access in GitHub
- Go back to Step 1 and make sure Vercel app is installed for the organization

### "Repository not found" in Vercel
- Make sure repository access is granted in GitHub Vercel app settings
- Try disconnecting and reconnecting GitHub in Vercel

### "Webhook not working"
- Delete the old webhook in GitHub
- In Vercel, disconnect and reconnect the repository
- This will recreate the webhook

### Still not working?
1. Check your Vercel plan (Pro required for private org repos)
2. Contact Vercel support
3. Check GitHub organization permissions

## Important Notes

- **Organization owner/admin access** is usually required to install GitHub apps
- **Vercel Pro** plan may be needed for private organization repositories
- After setup, ALL commits to main branch will auto-deploy

## Expected Result

✅ Organization appears in Vercel dashboard
✅ demo-suite repository is visible
✅ All commits trigger automatic deployments
✅ Webhook is successfully delivering in GitHub

