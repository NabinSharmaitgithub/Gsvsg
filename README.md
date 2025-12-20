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

## Deployment

For detailed instructions on how to deploy this application, please see the [deployment guide](./deployment.md).




