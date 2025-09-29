# Kids Chore Tracker

A React app that gamifies chores with virtual pets, rewards, and mini games. This repo contains the front-end for the experience; it expects a Firebase project for persistence.

The UI is built with [Material UI (MUI)](https://mui.com/) components only. Tailwind CSS has been removed from the toolchain, so styling lives in component-level `sx` props and layout primitives such as `Box`, `Stack`, and `Grid`. A custom MUI theme (defined in `src/index.js`) sets the primary color to `#7C4DFF`, the secondary color to `#FF7043`, and a rounded border radius for controls.

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

The app will open at [http://localhost:3000](http://localhost:3000). When you launch it for the first time it will seed your Firestore project with demo data for three kids. Because the UI relies entirely on MUI, you can customize colors, typography, or density globally by editing the theme in `src/index.js`.

## 5. Optional: Deploying with Firebase Hosting

If you want to deploy on Firebase Hosting:

```bash
npm run deploy
```

This script runs `npm run build` followed by `firebase deploy`. Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`) or available via `npx firebase-tools`, and that you are logged into your Firebase project before running the command. The build step outputs a production bundle that no longer references Tailwind, so you should see only standard Create React App logs in the terminal.

## Deploy

To prepare a production build locally, run `npm run build`. Deployments on GitHub Pages or Firebase Hosting should upload the contents of the generated `build/` directory so the static site serves the compiled Create React App bundle. Running the build is also a good smoke test that confirms the Tailwind toolchain has been removed and that MUI styles compile correctly.

## Troubleshooting

- **Firebase error about missing configuration:** double-check that every value in `.env.local` is filled out. The app throws an explicit error during startup when it cannot find the config.
- **Permission errors in Firestore:** ensure that your Firestore rules allow read/write for authenticated users or adjust them for your testing setup.

Happy chore tracking!
