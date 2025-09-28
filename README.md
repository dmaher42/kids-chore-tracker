# Kids Chore Tracker

A React app that gamifies chores with virtual pets, rewards, and mini games. This repo contains the front-end for the experience; it expects a Firebase project for persistence.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (ships with `npm`)
- A Firebase project with Firestore enabled

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Firebase app and Firestore

1. Go to the [Firebase console](https://console.firebase.google.com/), create a project, and add a **Web** app.
2. Enable **Firestore Database** in *Start in production mode*.
3. Copy the config that Firebase shows after creating the web app (values such as `apiKey`, `projectId`, etc.).

## 3. Configure environment variables

1. Copy the example environment file and fill it with the values from the Firebase console:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and replace the placeholder values with your Firebase app settings. CRA automatically loads `.env.local`, so no extra tooling is required.

## 4. Start the development server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000). When you launch it for the first time it will seed your Firestore project with demo data for three kids.

## 5. Optional: Deploying with Firebase Hosting

If you want to deploy on Firebase Hosting:

```bash
npm run deploy
```

This script runs `npm run build` followed by `firebase deploy`. Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`) or available via `npx firebase-tools`, and that you are logged into your Firebase project before running the command.

## Troubleshooting

- **Firebase error about missing configuration:** double-check that every value in `.env.local` is filled out. The app throws an explicit error during startup when it cannot find the config.
- **Permission errors in Firestore:** ensure that your Firestore rules allow read/write for authenticated users or adjust them for your testing setup.

Happy chore tracking!
