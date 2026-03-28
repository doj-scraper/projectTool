# Code Editor PWA

## Project Overview

This project is a Progressive Web App (PWA) code editor designed for in-browser use. It offers a rich set of features including multi-file support with tab navigation, syntax highlighting for 14 languages, a responsive split-view editor, a simulated terminal, and sandboxed code execution (JavaScript and HTML preview). The application prioritizes offline capability and installability as a PWA.

**Key Technologies:**

*   **Framework:** Next.js 16.1.1 (Canary)
*   **Runtime:** React 19
*   **Styling:** Tailwind CSS 4 + shadcn/ui
*   **State Management:** Zustand 5 (with persist middleware for localStorage)
*   **Code Editor:** CodeMirror 6 (via `@uiw/react-codemirror`)
*   **Search:** Fuzzysort (for command palette)
*   **Language:** TypeScript 5 (strict mode enabled)

**Architecture Highlights:**

*   **Modular Components:** The application follows a component-based architecture with clear separation of concerns, particularly for editor-related functionalities (e.g., `code-editor.tsx`, `file-tabs.tsx`, `terminal.tsx`, `output-panel.tsx`).
*   **State Management:** Utilizes Zustand for efficient state management, with `editor-store.ts` handling core application state and persisting it to `localStorage`.
*   **PWA Features:** Includes a service worker (`public/sw.js`) for offline support and a web app manifest (`public/manifest.json`) for installability.
*   **Code Execution Sandboxing:** JavaScript code execution and HTML preview are performed within sandboxed iframes to ensure security and isolation from the main application context.
*   **Responsive Design:** Implemented with a mobile-first approach, featuring responsive layouts for different screen sizes (e.g., horizontal split on desktop, vertical on tablet, pane switcher on mobile).

## Building and Running

This project uses `bun` as its package manager.

### Install Dependencies

```bash
bun install
```

### Start Development Server

Starts the Next.js development server on port 3000. Output is logged to `dev.log`.

```bash
bun run dev
```

### Run Linting

```bash
bun run lint
```

### Build for Production

This command builds the Next.js application for production and prepares the static assets and public directory for standalone deployment.

```bash
bun run build
```

### Start Production Server

Starts the built Next.js application in production mode using `bun`. Output is logged to `server.log`.

```bash
NODE_ENV=production bun .next/standalone/server.js
```

## Development Conventions

*   **Language:** TypeScript is used throughout the project with strict mode enabled.
*   **Styling:** Tailwind CSS is used for styling, complemented by `shadcn/ui` for UI components.
*   **State Management:** Zustand is the preferred library for managing application state.
*   **Component Structure:** Components are organized logically within the `src/components/` directory, with editor-specific components under `src/components/editor/` and UI components under `src/components/ui/`.
*   **Code Formatting & Linting:** ESLint is configured for code quality and consistency.
*   **Auto-save:** All changes to files in the editor are automatically persisted to `localStorage` on every keystroke.
*   **Modular Architecture:** Emphasis on single-responsibility components and clear module boundaries.

## Known Issues and Future Enhancements

The project actively tracks known bugs and has a roadmap for future enhancements, as detailed in `DEBRIEF.md`. Some high-priority items include:

*   **Confirmation for Destructive Actions:** Implementing confirmation dialogs for actions like file deletion to prevent data loss.
*   **IndexedDB Migration:** Migrating from `localStorage` to `IndexedDB` to overcome the 5MB storage limit for files.
*   **Error Boundaries:** Implementing React error boundaries for more graceful error handling.
*   **Mobile Keyboard Issue:** Addressing the issue where the terminal input is covered by the on-screen keyboard on iOS devices.

A migration plan for React Native/Expo is also documented, aiming to transition the project to a mobile native environment.
