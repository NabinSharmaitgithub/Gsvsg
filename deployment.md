# Deployment Guide

This guide will walk you through deploying the ShadowText application. Because this is a dynamic Next.js application that uses server-side features for real-time chat, it cannot be deployed on a static hosting platform like GitHub Pages.

We recommend deploying to a platform that supports Node.js applications, such as [Vercel](https://vercel.com/) (recommended) or [Render](https://render.com/).

## Deploying on Vercel (Recommended)

Vercel is the creator of Next.js and provides a seamless, zero-configuration deployment experience.

### Step 1: Push to GitHub

If you haven't already, make sure your project is pushed to a GitHub repository.

1.  **Create a new repository on GitHub:**
    Go to [github.com/new](https://github.com/new) and create a new repository (e.g., `shadow-text`).

2.  **Initialize Git and connect to your GitHub repository:**
    In your local project directory, run the following commands, replacing `YOUR_USERNAME` and `YOUR_REPO_NAME` with your details.
    ```bash
    git init -b main
    git add -A
    git commit -m "Initial commit"
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

### Step 2: Deploy on Vercel

1.  **Sign up or log in to Vercel:**
    Go to [vercel.com/signup](https://vercel.com/signup) and sign up with your GitHub account.

2.  **Import your project:**
    -   After signing in, you'll be redirected to your dashboard. Click the **"Add New..."** button and select **"Project"**.
    -   The "Import Git Repository" screen will appear. Find your GitHub repository (`shadow-text`) and click the **"Import"** button next to it.

3.  **Configure the project:**
    -   Vercel will automatically detect that you're using Next.js and configure the build settings for you. You don't need to change anything here.

4.  **Add Environment Variables:**
    -   This is the most important step for connecting to Firebase. Expand the **"Environment Variables"** section.
    -   You will need to add the configuration keys from your `src/firebase/config.ts` file as environment variables. **Crucially, each key must be prefixed with `NEXT_PUBLIC_`** for Next.js to expose it to the browser.

    -   Add the following variables one by one:
        -   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
        -   `NEXT_PUBLIC_FIREBASE_APP_ID`
        -   `NEXT_PUBLIC_FIREBASE_API_KEY`
        -   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
        -   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

    -   Copy the corresponding value for each key from your `firebaseConfig` object and paste it into the value field on Vercel.

5.  **Deploy:**
    -   Click the **"Deploy"** button.
    -   Vercel will now build your project and deploy it. You can watch the build logs in real-time.

6.  **Authorize the Domain in Firebase:**
    -   Once the deployment is complete, Vercel will give you your live URL (e.g., `https://shadow-text-alpha.vercel.app`).
    -   Go to the [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Settings** -> **Authorized domains**.
    -   Click **"Add domain"** and add your new Vercel URL. This is required for Google Sign-In to work on your live site.

Your application is now live on Vercel!

## Deploying on Render (Alternative)

### Step 1: Push to GitHub

(Follow the same GitHub instructions as in the Vercel guide above).

### Step 2: Deploy on Render

1.  **Sign up or log in to Render:**
    Go to [dashboard.render.com](https://dashboard.render.com/).

2.  **Create a new "Web Service":**
    -   Click the **"New +"** button and select **"Web Service"**.
    -   Choose **"Build and deploy from a Git repository"** and click **"Next"**.

3.  **Connect your GitHub account:**
    -   If you haven't already, connect your GitHub account to Render.
    -   Select your newly created repository (`shadow-text`) from the list and click **"Connect"**.

4.  **Configure the Web Service:**
    -   **Name:** Give your service a unique name (e.g., `shadow-text-app`). This will be part of your URL.
    -   **Root Directory:** Leave this blank.
    -   **Environment:** Select `Node`.
    -   **Region:** Choose a region closest to your users.
    -   **Branch:** `main` (or your default branch).
    -   **Build Command:** `npm install; npm run build`
    -   **Start Command:** `npm start`
    -   **Note**: You will also need to add your Firebase config as Environment Variables on Render, just like in the Vercel guide.

5.  **Create the Web Service:**
    -   Scroll down and click **"Create Web Service"**.
    -   Render will now deploy your project. Once it's live, remember to add the Render URL to your **Authorized domains** in the Firebase console.
