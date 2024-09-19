# Project Plan: PlayStake

## Overview

PlayStake is a full-stack web application built with Next.js 14, TypeScript, TailwindCSS, and Firebase. It features user authentication, real-time leaderboards, form handling, and responsive design. The project adheres to best practices in code quality, accessibility, and performance optimization.

## Directory Structure

playstake/
├── .config/
│ └── nvm/
│ ├── CONTRIBUTING.md
│ ├── .github/
│ │ ├── workflows/
│ │ │ ├── toc.yml
│ │ │ ├── lint.yml
│ │ │ └── shellcheck.yml
│ │ ├── SECURITY.md
│ │ ├── PROJECT_CHARTER.md
│ │ └── ISSUE_TEMPLATE.md
│ ├── .editorconfig
│ └── CODE_OF_CONDUCT.md
├── nodejs/
│ └── README.md
├── node_v18.17.1-linux-x64/
│ └── README.md
├── src/
│ ├── app/
│ │ ├── dashboard/
│ │ │ └── page.tsx
│ │ ├── game/
│ │ │ └── [challengeId]/
│ │ │ └── page.tsx
│ │ └── page.tsx
│ ├── components/
│ │ ├── ui/
│ │ │ ├── progress.tsx
│ │ │ ├── button.tsx
│ │ │ ├── input.tsx
│ │ │ ├── avatar.tsx
│ │ │ ├── dropdown-menu.tsx
│ │ │ ├── scroll-area.tsx
│ │ │ ├── sheet.tsx
│ │ │ └── toggle-group.tsx
│ │ └── magicui/
│ │ └── box-reveal.tsx
│ ├── hooks/
│ │ ├── useAuth.ts
│ │ └── useFirestore.ts
│ ├── lib/
│ │ └── firebase.ts
│ ├── styles/
│ │ └── globals.css
│ └── ... (additional directories and files)
├── package.json
├── .replit
└── README.md


## Key Components and Functionality

### `src/app/dashboard/page.tsx`
- Implements the Dashboard page.
- Features leaderboards and detailed game statistics.
- Utilizes Firebase Firestore for real-time data.

### `src/app/game/[challengeId]/page.tsx`
- Dynamic route handling for individual game challenges.
- Displays challenge-specific details and user interactions.

### `src/components/ui/`
- **Progress**: Displays progress bars.
- **Button**: Reusable button component.
- **Input**: Styled input fields.
- **Avatar**: User avatar component.
- **DropdownMenu**: Dropdown navigation menus.
- **ScrollArea**: Custom scrollable areas.
- **Sheet**: Modal sheets for additional content.
- **ToggleGroup**: Toggle buttons for selecting options.

### `src/components/magicui/box-reveal.tsx`
- Animated box reveal component for visual effects.

### `src/hooks/`
- **useAuth.ts**: Handles user authentication logic.
- **useFirestore.ts**: Manages Firestore interactions.

### `src/lib/firebase.ts`
- Configures and initializes Firebase services.

## Technologies and Libraries

- **Next.js 14**: React framework for server-side rendering and static site generation.
- **TypeScript**: Adds static typing to JavaScript.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Firebase**: Backend services including Firestore for real-time databases.
- **Zustand**: State management library.
- **Shadcn UI & Radix UI**: Component libraries for UI elements.
- **Framer Motion**: Animation library for React.
- **React Hook Form**: Form handling library.
- **React Hot Toast**: Notification library.
- **Lucide React**: Icon library.

## Configuration Files

### `.config/nvm/.github/workflows/toc.yml`
- Workflow for updating the README table of contents.

### `.config/nvm/.github/workflows/lint.yml`
- Linting workflows using tools like ShellCheck.

### `package.json`
- Defines project dependencies, scripts, and engine versions.
- Key scripts include:
  - `dev`: Runs the development server.
  - `build`: Builds the application for production.
  - `start`: Starts the production server.
  - `lint`: Runs linting checks.

### `.replit`
- Configuration for Replit environment, including ports and deployment settings.

### `src/styles/globals.css`
- Global CSS imports for TailwindCSS.

## Scripts and Workflows

- **Development**: `npm run dev` or `yarn dev` starts the Next.js development server.
- **Build**: `npm run build` compiles the application for production.
- **Linting**: `npm run lint` checks code for styling and syntax issues.
- **GitHub Actions**:
  - **TOC Update**: Automatically updates the README table of contents on pushes.
  - **Linting**: Ensures code quality using ShellCheck and other linters.

## Testing

- **Unit Tests**: Implemented using Jest and React Testing Library.
- **Integration Tests**: Validate critical user flows.
- **Linting**: Ensures code adheres to defined standards.

## Deployment

- **Vercel**: Primary deployment platform for hosting the Next.js application.
- **Environment Variables**: Managed via `.env` files and Replit configurations.
- **Production Optimizations**:
  - Code splitting and dynamic imports.
  - Image optimization using Next.js features.
  - PurgeCSS integrated with TailwindCSS to remove unused styles.

## Security and Best Practices

- **Authentication**: Managed with Firebase and secure JWT handling.
- **Error Handling**: Comprehensive error boundaries and logging.
- **Accessibility**: Semantic HTML, ARIA attributes, and keyboard navigation support.
- **Performance**: Optimized through server-side rendering, caching, and minimal client-side state.

## Contribution Guidelines

Refer to `.config/nvm/CONTRIBUTING.md` for detailed guidelines on contributing to the project, including coding standards, pull request processes, and code of conduct.

## Documentation

Comprehensive documentation is maintained in the `README.md` and additional markdown files within the `.config/nvm/` directory, covering project setup, usage, and governance.

---