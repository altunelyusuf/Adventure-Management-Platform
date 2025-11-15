# Adventure Management Platform - Frontend

A React-based web application for the Adventure Management Platform, providing a comprehensive interface for quest management, social features, gamification, and more.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - Global state management
- **React Query** - Server state management and caching
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Leaflet** - Interactive maps
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## Features

### Authentication
- User login and registration
- JWT-based authentication
- Protected routes
- Automatic token refresh

### Quest Management
- Browse and search quests
- Create custom quests with interactive map
- View quest details with checkpoints
- Filter by difficulty level

### Gamification
- XP tracking and leveling system
- Achievement unlocking
- Leaderboards
- Progress tracking

### Social Features
- Activity feed (global and friends)
- Like and comment on activities
- Friends management
- Real-time updates

### Notifications
- In-app notifications
- Notification preferences
- Mark as read functionality
- Priority-based notifications

### Subscriptions
- Multiple tier plans (Basic, Standard, Premium)
- Stripe integration for payments
- Subscription management
- Payment history

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend services running (see main README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
VITE_API_URL=http://localhost:3000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   └── layout/       # Layout components (Header, Sidebar)
│   ├── pages/            # Page components
│   │   ├── auth/         # Login, Register
│   │   ├── dashboard/    # Dashboard
│   │   ├── quests/       # Quest pages
│   │   ├── profile/      # User profile
│   │   ├── social/       # Social feed
│   │   ├── notifications/# Notifications
│   │   └── subscriptions/# Subscription management
│   ├── services/         # API services
│   ├── store/            # Redux store
│   │   └── slices/       # Redux slices
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env.example          # Environment variables template
├── index.html            # HTML entry point
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Key Pages

- **Dashboard** - User overview with stats, recent quests, and achievements
- **Quests** - Browse, search, and filter available quests
- **Quest Detail** - View quest information with interactive map
- **Create Quest** - Design custom quests with checkpoint placement
- **Profile** - User profile with XP, level, and achievements
- **Social** - Activity feed and friends management
- **Notifications** - Notification center
- **Subscriptions** - Plan selection and payment management

## State Management

### Redux Store
- **auth** - Authentication state (user, token, login status)
- **quests** - Quest management state
- **user** - User XP, achievements, notifications

### React Query
- Server state caching for API calls
- Automatic refetching and invalidation
- Optimistic updates

## Styling

The application uses Tailwind CSS with custom utility classes:

- `.btn` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.card` - Card container
- `.input` - Form input styles

Custom color palette:
- Primary colors: Blue-based palette (primary-50 to primary-900)

## API Integration

All API calls are centralized in `src/services/api.ts`:

- **authAPI** - Authentication endpoints
- **questAPI** - Quest management
- **gamificationAPI** - XP and achievements
- **socialAPI** - Social features
- **notificationAPI** - Notifications
- **paymentAPI** - Subscriptions and payments

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | - |
| `VITE_MAPBOX_TOKEN` | Mapbox access token | - |

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add proper type definitions
4. Keep components small and focused
5. Use React hooks for state management
6. Follow component naming conventions

## License

This project is part of the Adventure Management Platform.
