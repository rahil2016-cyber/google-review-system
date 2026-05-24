# Deployment Guide

## 1) Firebase Setup (Firestore + Functions)

1. Install Firebase CLI globally:
   - `npm install -g firebase-tools`
2. Login and set your project:
   - `firebase login`
   - `firebase use --add`
3. Update `.firebaserc` with your actual Firebase project id.
4. Set Firebase Functions secrets (for email alerts and admin API key):
   - `firebase functions:secrets:set MAIL_HOST`
   - `firebase functions:secrets:set MAIL_PORT`
   - `firebase functions:secrets:set MAIL_USER`
   - `firebase functions:secrets:set MAIL_PASS`
   - `firebase functions:secrets:set ALERT_TO_EMAIL`
   - `firebase functions:secrets:set ADMIN_KEY`
5. Install dependencies and deploy backend:
   - `cd functions`
   - `npm install`
   - `npm run deploy`

## 2) Frontend Environment Variables (Vercel + local)

Create `.env.local` from `.env.example` and set:

- `NEXT_PUBLIC_FUNCTIONS_BASE_URL`  
  Example: `https://us-central1-your-project-id.cloudfunctions.net`
- `NEXT_PUBLIC_APP_URL`  
  Example: `https://sarovar-royalee-review-funnel.vercel.app`
- `NEXT_PUBLIC_ADMIN_USER`
- `NEXT_PUBLIC_ADMIN_PASSWORD`
- `NEXT_PUBLIC_ADMIN_KEY` (same value as Firebase `ADMIN_KEY` secret)

## 3) Deploy Next.js to Vercel

1. Push code to GitHub.
2. Import repository into Vercel.
3. Set the same environment variables in Vercel Project Settings.
4. Deploy.

## 4) Firestore Collections Used

- `feedback`  
  Stores low-rating feedback entries with:
  `rating, name, phone, email, reason, comments, timestamp`
- `analytics/ratings` document  
  Stores counters for rating click events (`1` to `5` keys)

## 5) QR Code Usage

The landing page includes:

- QR to the **Google review page** on positive rating screen
- QR to the **deployed funnel URL** (`NEXT_PUBLIC_APP_URL`) for table-top usage

Example usage:
1. Deploy app to Vercel.
2. Set `NEXT_PUBLIC_APP_URL` to that deployed URL.
3. Print QR shown in landing page and place on menu/table tent cards.
