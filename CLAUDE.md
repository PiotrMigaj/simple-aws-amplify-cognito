# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production (includes type checking)
npm run build

# Type check only
npm run type-check

# Lint and fix code style
npm run lint

# Format code with Prettier
npm run format
```

## Architecture Overview

This is a Vue 3 + TypeScript application using AWS Amplify for authentication with Amazon Cognito and a custom backend API. The project uses Vite as the build tool and Pinia for state management.

### Key Components

- **Authentication**: Custom login component (`CustomLogin.vue`) with sign-in only (no registration)
- **Configuration**: Cognito setup is in `src/amplify.js` with hardcoded user pool credentials
- **Main App**: `src/App.vue` contains the authenticated user interface with dashboard, user info, and tenant data
- **Backend Integration**: `src/services/api.ts` handles API calls to backend with Cognito authentication
- **Entry Point**: `src/main.ts` initializes Vue app, Pinia, and Vue Router (no Amplify UI components)

### Project Structure

```
src/
├── amplify.js              # AWS Amplify/Cognito configuration
├── App.vue                # Main app with custom auth flow and dashboard
├── main.ts                # Vue app initialization (no Amplify UI)
├── components/
│   └── CustomLogin.vue    # Custom login form (sign-in only)
├── services/
│   └── api.ts            # Backend API service with auth
├── types/
│   └── auth.ts           # TypeScript auth-related types
├── router/index.ts       # Vue Router setup (currently empty routes)
└── stores/counter.ts     # Pinia store example
```

### Authentication Flow

1. **Custom Login**: Beautiful gradient login form with username/password (sign-in only)
2. **Auto Token Fetch**: After login, automatically fetches tenant data from backend
3. **Dashboard**: Shows user info, token inspection, and tenant data in card layout
4. **Sign Out**: Clears all state and returns to login

### Backend Integration

- **Endpoint**: `https://4hfpkn6je0.execute-api.eu-central-1.amazonaws.com/Prod/tenant`
- **Authentication**: Uses Cognito **ID Token** (not access token) in Authorization header
- **Important**: AWS API Gateway Cognito Authorizer is configured to validate ID tokens
- **Headers**: `Authorization: <id_token>` (no "Bearer" prefix)
- **Response**: Returns tenant string that's displayed in dashboard

### AWS Amplify Integration

The app is configured for a specific Cognito User Pool (eu-central-1_42l28C0kv). Uses `fetchAuthSession()` to get both access and ID tokens, but **ID token is used for API calls** (access token returns 401).

### Development Notes

- Uses Vue 3 Composition API with `<script setup>` syntax
- TypeScript support with `vue-tsc` for type checking
- ESLint with Vue and TypeScript configurations
- Prettier for code formatting
- Node.js version requirement: ^20.19.0 || >=22.12.0
- Vite alias `@` points to `src/` directory