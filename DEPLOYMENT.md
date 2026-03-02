# Deployment Guide - Lady X Concert Ticket Booking System

## 📋 Pre-Deployment Checklist

- ✅ Git repository initialized
- ✅ All files committed
- ✅ .gitignore configured
- ✅ vercel.json created
- ✅ README.md updated

## 🚀 Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository name: `concert-ticket-booking`
4. Description: `Professional ticket booking system for Lady X concert at Hong Kong Coliseum`
5. Keep it **Public** (or Private if you prefer)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/Marsze03/concert-ticket-booking.git

# Push your code
git push -u origin main
```

Run these commands in PowerShell from your project directory:

```powershell
cd C:\Users\HP\lady-x-booking
git remote add origin https://github.com/Marsze03/concert-ticket-booking.git
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel Website (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. Click **"Add New..."** → **"Project"**
6. Find and import `concert-ticket-booking`
7. Vercel will auto-detect the configuration from `vercel.json`
8. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### Step 4: Configure Deployment Settings (Optional)

In Vercel dashboard:
1. Go to your project settings
2. **Environment Variables** (if needed in future):
   - Add any sensitive configuration
   - Example: `DATABASE_URL`, `API_KEY`, etc.
3. **Domains**: Add custom domain if you have one

## 🌐 Expected URLs

After deployment:
- **Production URL**: `https://concert-ticket-booking.vercel.app`
- **GitHub Repo**: `https://github.com/Marsze03/concert-ticket-booking`

## 📝 Important Notes

### Current Limitations
- ⚠️ **Data persistence**: JSON files won't persist on Vercel serverless (seats.json will reset)
- ⚠️ **Email**: Email notifications not configured (only displays confirmation)

### For Production Use
To make this production-ready, you would need:

1. **Database**: Replace JSON files with a real database
   - MongoDB Atlas (free tier)
   - PostgreSQL (Supabase/Neon free tier)
   - MySQL (PlanetScale free tier)

2. **Email Service**: Add email delivery
   - SendGrid (100 emails/day free)
   - Mailgun (5,000 emails/month free trial)
   - Resend (3,000 emails/month free)

3. **Payment Gateway**: Integrate real payment processing
   - Stripe
   - PayPal
   - Square

## 🔧 Troubleshooting

### Build Fails
- Check `vercel.json` configuration
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard

### API Routes Not Working
- Ensure `vercel.json` routes are correct
- Check backend/server.js has correct export for serverless
- Verify CORS settings if needed

### Environment Variables
If you need to add environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables for Production, Preview, and Development
3. Redeploy the project

## 📱 Testing the Live Site

Once deployed, test:
1. ✅ Landing page loads
2. ✅ Performance selection works
3. ✅ Seating plan displays correctly
4. ✅ Booking flow completes
5. ✅ Print confirmation works

## 🔄 Future Updates

To update your deployed site:

```bash
# Make changes to your code
# Stage and commit
git add .
git commit -m "Your update message"

# Push to GitHub
git push origin main
```

Vercel will automatically detect the push and deploy the new version!

## 🆘 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Guides**: https://guides.github.com
- **React + Vite Guide**: https://vitejs.dev/guide

---

**Repository**: https://github.com/Marsze03/concert-ticket-booking  
**Deployed by**: Marsze03  
**Contact**: hkstoicism03@gmail.com
