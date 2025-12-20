# Deployment Guide

This guide will walk you through deploying the ShadowText application. Because this is a dynamic Next.js application that uses server-side features for real-time chat, it cannot be deployed on a static hosting platform like GitHub Pages.

We recommend deploying to a platform that supports Node.js applications, such as [Render](https://render.com/) or [Vercel](https://vercel.com/). The following guide provides instructions for deploying with Render.

## Deploying on Render (Recommended)

### Step 1: Push to GitHub

1.  **Create a new repository on GitHub:**
    Go to [github.com/new](https://github.com/new) and create a new repository (e.g., `shadow-text`). Do **not** initialize it with a README, .gitignore, or license.

2.  **Initialize Git and connect to your GitHub repository:**
    In your local project directory, run the following commands, replacing `YOUR_USERNAME` and `YOUR_REPO_NAME` with your details.
    ```bash
    git init -b main
    git add -A
    git commit -m "Initial commit"
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

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
    -   **Build Command:** Render should auto-detect this. Ensure it is set to:
        ```bash
        npm install; npm run build
        ```
        *If you used `yarn` or `pnpm`, 
        set it to `yarn; yarn build` or `pnpm i; pnpm build` respectively.*
    -   **Start Command:** Render should auto-detect this. Ensure it is set to:
        ```bash
        npm start
        ```
        *Or `yarn start` / `pnpm start`.*

5.  **Create the Web Service:**
    -   Scroll down and click **"Create Web Service"**.
    -   Render will now pull your code from GitHub, build the project, and deploy it. You can monitor the progress in the logs.

6.  **Access your live application:**
    Once the deployment is complete, Render will provide you with a URL (e.g., `https://shadow-text-app.onrender.com`). Your ShadowText application is now live!
