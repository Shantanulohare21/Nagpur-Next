# ShoulderSim AI

ShoulderSim AI is a comprehensive platform for orthopedic simulation, AI-assisted surgical planning, and related tools.

## Architecture

This project is a monorepo built using `pnpm` workspaces. It consists of frontend web applications, a backend API server, and shared libraries.

### Workspaces

*   **`artifacts/shouldersim`**: The main frontend application for the simulator.
*   **`artifacts/shouldersim-ai`**: The AI-assisted frontend interface.
*   **`artifacts/mockup-sandbox`**: Sandbox environment for testing new UI mockups and concepts.
*   **`artifacts/api-server`**: The core backend Express API serving the frontends.
*   **`lib/api-client-react`**: React query hooks generated from the OpenAPI spec for interacting with the backend.
*   **`lib/api-spec`**: OpenAPI specifications and code generation configuration.
*   **`lib/api-zod`**: Shared Zod validation schemas.
*   **`lib/db`**: Database schema, migrations, and Drizzle ORM setup.
*   **`scripts`**: Utility scripts for development and deployment.

## Prerequisites

*   Node.js (v20+ recommended)
*   `pnpm` (v9+)

## Setup Instructions

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Environment Variables:**
    Copy `.env.example` to `.env` in the required workspaces (if applicable) and configure your database URLs and API keys.
4.  **Database Push:**
    If using Drizzle, push your schema to your development database:
    ```bash
    cd lib/db && pnpm run push
    ```

## Development Workflow

To start the entire stack in development mode:

```bash
pnpm run dev
```

This command will start the API server and all frontend Vite development servers in parallel.

### Typechecking

To run TypeScript typechecking across all workspaces:

```bash
pnpm run typecheck
```

### Building for Production

To build all workspaces for production:

```bash
pnpm run build
```

This will run `tsc` and Vite/esbuild for each respective package.

## Cross-Platform Compatibility

This repository has been designed to work across Windows, macOS, and Linux without the need for WSL or Git Bash on Windows. All scripts use standard Node.js equivalents for shell commands (like `cross-env`).
