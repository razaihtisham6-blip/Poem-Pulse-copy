# Getting Started with Create React App

Poem-Pulse (Local Only)
=================================

Poem-Pulse analyzes your writing locally. The app never uploads your text: it reads your file in the browser and sends the text only to a local backend on your computer, which talks to a local LLM via Ollama.

What you get
------------
- Local-only processing (no cloud, no LAN exposure)
- Simple flow: Upload → Loading → Results → Exit → Thank You
- If Ollama is not running, you’ll see a friendly error on the Loading screen

Requirements
------------
- Node.js 18+ and npm
- Windows 10/11 (project tested here; macOS/Linux works similarly)
- Ollama installed locally (for real analysis results)

Install Ollama (once)
---------------------
1) Download and install from `https://ollama.com`
2) Pull a model (example):
   - `ollama pull llama3:8b`
3) Verify it’s ready:
   - `ollama list` (should show the model)
   - Ollama serves at `http://127.0.0.1:11434`

Project Setup (once)
--------------------
In a terminal at the project root:
- `npm install`

Run the App (local-only)
------------------------
Start backend and frontend together:
- `npm run dev`

Then open:
- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:3001` (bound to localhost only)

Notes:
- If the Create React App dev server also shows a LAN URL, just use `http://localhost:3000`. The backend is strictly local-only; it is not exposed on your network.
- You can run them separately if you prefer:
  - `npm run start:api` (backend)
  - `npm start` (frontend)

How to Use
----------
1) Open `http://localhost:3000`
2) Upload a `.txt`, `.doc`, or `.docx` file
3) Click Next → Loading screen appears
   - If Ollama is running: your text is analyzed and you’ll be taken to the Results page
   - If Ollama is NOT running: you’ll see an error message telling you to start Ollama
4) Click Next from the Results page → Exit page
5) Click Exit → Thank You page (auto-closes after 5 seconds)

Troubleshooting
---------------
- “Ollama is not running. Please start Ollama and try again.”
  - Make sure the Ollama app is running
  - Ensure you pulled a model (e.g., `ollama pull llama3:8b`)
  - Test from a terminal: `curl http://127.0.0.1:11434/api/tags`

- Port in use (3000 or 3001)
  - Close other apps using those ports, or let CRA choose another port when prompted

- Only want localhost (no LAN)?
  - We already bind the backend to `127.0.0.1`
  - For the frontend, use `http://localhost:3000` even if a LAN URL is displayed

Configuration
-------------
- Model selection: edit `server.js` (default is `llama3:8b`)
- Local API proxy: defined in `package.json` → `"proxy": "http://127.0.0.1:3001"`
- Scripts (package.json):
  - `npm run dev` → starts frontend and backend together
  - `npm run start:api` → starts backend only
  - `npm start` → starts frontend only

Privacy
-------
- Your file is read in the browser (locally)
- The text is sent to the local backend at `http://127.0.0.1:3001`
- The backend calls your local Ollama at `http://127.0.0.1:11434`
- No internet or network exposure is required for analysis

FAQ
---
**Do I need Ollama?**
Yes, to get real analysis results. Without it, the app will run, but the Loading screen will show an error and results won’t be produced.

**Which model should I use?**
Start with `llama3:8b` for a good balance. On lower-spec machines, pick a smaller model (e.g., `mistral:7b`, `phi3`).

**Can I change the timeout?**
The app no longer uses a fixed timer; it waits for Ollama or shows an error if unreachable.

License
-------
See `LICENSE` in this repository.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
