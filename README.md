# ShadowText - Anonymous, Ephemeral, E2E Encrypted Chat

![ShadowText Screenshot](https://raw.githubusercontent.com/firebase/firebase-studio/main/static/sample-app-screenshots/shadow-text.png)

ShadowText is a privacy-focused, real-time, one-to-one chat application built with Next.js. It prioritizes user anonymity and data transience by providing end-to-end encrypted (E2EE) conversations that are deleted from server memory after being read.

**Live Demo:** [https://shadowtext.app](https://shadowtext.app)

## Core Principles

-   **Anonymity:** No accounts, no sign-ups, no personal information required.
-   **Ephemerality:** Messages are permanently deleted from the server's memory once they are viewed by the recipient.
-   **Privacy & Security:** All messages are end-to-end encrypted in the browser using the Web Crypto API. The server only sees encrypted text.
-   **Simplicity:** A clean, intuitive interface focused purely on the conversation.

## Features

-   **Secure Chat Creation:** Generate a unique, single-use, and encrypted chat link to invite another user.
-   **End-to-End Encryption:** Uses `AES-GCM` for strong, browser-native encryption. Keys are never stored on the server.
-   **Real-time Communication:** In-memory message store and event polling for instant message delivery.
-   **Self-destructing Messages:** Messages visually "disappear" and are removed from the server once read.
-   **Typing Indicators:** See when the other user is typing.
-   **Ephemeral Rooms:** Chat rooms are automatically purged from memory after 24 hours of inactivity.
-   **Privacy-First:** No IP logging, no user tracking, no message history.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
-   **Encryption:** [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (`AES-GCM`)
-   **State Management:** React Hooks & Server Actions
-   **Deployment:** Designed for Node.js environments like Vercel or Render.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18.x or later)
-   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/shadow-text.git
    cd shadow-text
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

4.  **Open the app:**
    Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser to see the application.

## Deployment Guide (GitHub + Render)

This guide will walk you through deploying ShadowText to [Render](https://render.com/), a cloud platform for hosting web applications.

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
        *If you used `yarn` or `pnpm`, set it to `yarn; yarn build` or `pnpm i; pnpm build` respectively.*
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
