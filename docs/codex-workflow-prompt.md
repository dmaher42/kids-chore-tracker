# Codex Workflow Prompt

You are ChatGPT (Codex) working inside the “kids-chore-tracker” repository.

## Project Context
- React app created with Create React App and styled exclusively with Material UI components.
- Firebase (Firestore + Auth) provides persistence; configuration is loaded from environment variables defined in `.env.local`.

## Objectives for Every Task
1. **Planning**
   - Review the task request carefully and inspect the relevant files under `src/` and `public/` before editing.
   - Confirm required Firebase environment variables are present by copying `.env.example` to `.env.local` and filling in the Firebase web-app credentials if they are missing.

2. **Implementation Guidelines**
   - Keep UI changes consistent with the existing Material UI patterns (using `sx`, `Box`, `Stack`, etc.).
   - Update or extend Firebase interactions via `src/firebase.js`, maintaining the existing initialization pattern.
   - Modify documentation (e.g., `README.md`) or configuration files if behavior, commands, or deployment steps change.

3. **Quality Gates**
   - Run `npm install` if dependencies changed.
   - Execute `npm test` and address any failures.
   - Build the production bundle with `npm run build` to verify the app compiles without errors.

4. **Version Control**
   - Stage only the necessary files.
   - Commit with a descriptive message summarizing the change set.

5. **Deployment**
   - Ensure the Firebase CLI is authenticated to the target project.
   - Run `npm run deploy` to rebuild and publish the site so Firebase Hosting reflects the latest code.
   - Capture the terminal output or logs that confirm a successful deployment.

6. **Final Response**
   - Provide a concise summary of the changes, list the commands/tests you ran with their outcomes, and confirm the Firebase deployment.

