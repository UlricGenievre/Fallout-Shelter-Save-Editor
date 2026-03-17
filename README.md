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
- *Optional:* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (to run without local Node.js installation)

### Installation

1.  Clone the repository:
    ```sh
    git clone <repository-url>
    cd Fallout-Shelter-Save-Editor
    ```

2.  Install dependencies:
    ```sh
    # With Local Node.js
    npm install

    # Or with Docker
    cd .docker
    docker compose run --rm npm install
    ```

### Development

Start the development server with auto-reloading:
```sh
# With Local Node.js
npm run dev

# Or with Docker
cd .docker
docker compose up dev
```
The application will be available at `http://localhost:8080`.

### Production Build

Create an optimized production build:
```sh
# With Local Node.js
npm run build

# Or with Docker
cd .docker
docker compose run --rm npm run build
```
Preview the production build locally:
```sh
# With Local Node.js
npm run preview

# Or with Docker
cd .docker
docker compose run --rm --service-ports npm run preview
```

## Available Scripts

- `npm run dev`: Starts the Vite development server.
    ```sh
    # With Docker:
    cd .docker
    docker compose up dev
    ```
- `npm run build`: Builds the app for production.
    ```sh
    # With Docker:
    cd .docker
    docker compose run --rm npm run build
    ```
- `npm run lint`: Runs ESLint to check for code quality issues.
    ```sh
    # With Docker:
    cd .docker
    docker compose run --rm npm run lint
    ```
- `npm run test`: Runs unit tests with Vitest.
    ```sh
    # With Docker:
    cd .docker
    docker compose run --rm npm test
    ```
- `npm run test:watch`: Runs tests in watch mode.
    ```sh
    # With Docker:
    cd .docker
    docker compose run --rm npm run test:watch
    ```

All scripts can be run via Docker by prefixing them with:
```sh
cd .docker
docker compose run --rm npm <command>
```
For example: `docker compose run --rm npm run lint`

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
# With Local Node.js
npm run test

# Or with Docker
cd .docker
docker compose run --rm npm test
```

## Lovable

This project was initially generated or can be edited with [Lovable](https://lovable.dev/).

## License

TODO

---

*Disclaimer: This tool is not affiliated with Bethesda Game Studios. Always back up your save files before editing.*
