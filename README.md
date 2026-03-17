# Fallout Shelter Save Editor

A web-based tool for editing Fallout Shelter save files (.sav). Decrypt, modify, and re-encrypt your vault data with ease.

## Features

- **Save Decryption/Encryption**: Support for AES-256-CBC encryption used by Fallout Shelter.
- **Resource Management**: Edit Caps, Nuka-Cola Quantum, Food, Water, and Power.
- **Dweller Editor**: Modify dweller stats (S.P.E.C.I.A.L.), health, level, and more.
- **Recipe Management**: Unlock and manage crafting recipes.
- **Raw JSON Editor**: Advanced editing via direct JSON manipulation.
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui for a modern, mobile-friendly interface.

## Tech Stack

- **Framework**: [React](https://reactjs.org/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (installed with Node.js)

### Installation

1.  Clone the repository:
    ```sh
    git clone <repository-url>
    cd Fallout-Shelter-Save-Editor
    ```

2.  Install dependencies:
    ```sh
    npm install
    ```

### Development

Start the development server with auto-reloading:
```sh
npm run dev
```
The application will be available at `http://localhost:8080` (or the port specified in the terminal).

### Production Build

Create an optimized production build:
```sh
npm run build
```
Preview the production build locally:
```sh
npm run preview
```

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run test`: Runs unit tests with Vitest.
- `npm run test:watch`: Runs tests in watch mode.

## Project Structure

```text
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components (including shadcn/ui)
│   ├── data/        # Static data and JSON files (e.g., items.json)
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions (crypto, game logic, etc.)
│   ├── pages/       # Page components (Index, NotFound)
│   ├── test/        # Test configuration and setup
│   ├── App.tsx      # Main application component
│   └── main.tsx     # Application entry point
├── package.json     # Project dependencies and scripts
└── vite.config.ts   # Vite configuration
```

## Environment Variables

Currently, this project does not require any specific environment variables for local development.

## Testing

Tests are written using Vitest and React Testing Library. To run the tests:
```sh
npm run test
```

## Lovable

This project was initially generated or can be edited with [Lovable](https://lovable.dev/).

## License

TODO

---

*Disclaimer: This tool is not affiliated with Bethesda Game Studios. Always back up your save files before editing.*
