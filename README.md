# Bilal Mohamed — Portfolio

Professional portfolio for Bilal Mohamed, a fourth-year Railway Technology student at 6th of October Technological University in Qalyub, Egypt. The page presents his railway and industrial experience, education, technical skills, personal photographs, and web projects.

The site is built with HTML, CSS and JavaScript. Personal photographs and five project preview images are stored in `assets/`. Selecting a project displays its matching preview; an external link is shown only for projects with a supplied live URL. The request form in the footer sends submissions through a Node.js serverless function and Gmail SMTP.

## Deploy to Vercel

1. Push the project to a GitHub repository, making sure local `.env` files are not staged.
2. Import that repository into Vercel and use the **Other** framework preset. The included `vercel.json` configures the project root as the output directory; no build command is required.
3. In **Project → Settings → Environment Variables**, add these server-side variables for Production (and Preview if needed):
   - `GMAIL_USER`: the Gmail account used to send notifications.
   - `GMAIL_APP_PASSWORD`: its Google App Password.
   - `REQUEST_TO_EMAIL`: the inbox that should receive requests.
4. Redeploy after adding or changing environment variables.

The `/api/request` Node.js function is deployed with the static portfolio. Do not open `/api/request` directly in a browser: it accepts `POST` requests from the form, so a direct `GET` returns `405 Method Not Allowed`. For local development, run `npm install` and `npm run serve`.

`.gitignore` and `.vercelignore` exclude local environment files and credentials from Git and Vercel uploads. Configure secrets in Vercel's Environment Variables instead of committing them. Only add a real `.env.local` on your own machine if local email testing is needed.

## Request form email setup

1. Enable **2-Step Verification** on the Google account that will send the email.
2. Create an **App Password** in the Google Account security settings. Use it only for this website; do not use your normal Gmail password.
3. Copy `.env.example` to `.env.local` for local development and set:
   - `GMAIL_USER`: the Gmail account used to send the notification.
   - `GMAIL_APP_PASSWORD`: the 16-character Google App Password (spaces are accepted).
   - `REQUEST_TO_EMAIL`: the inbox that receives requests. It can be the same Gmail account.
4. Install dependencies with `npm install`, then run `npm run serve` and open the local URL shown in the terminal. This starts Vercel's local server so both the page and `/api/request` work together. Do not use the VS Code Live Server extension to test the request form; it serves static files and does not run the API function.
5. For Vercel deployment, configure the variables in the Vercel project settings above and redeploy.

The App Password is a secret. Never add it to frontend code or commit any `.env` file; `.gitignore` and `.vercelignore` exclude environment files, and `.env.example` contains placeholders only. Gmail may apply sending limits or flag automated messages. The function sends over Gmail SMTP on port 465.
