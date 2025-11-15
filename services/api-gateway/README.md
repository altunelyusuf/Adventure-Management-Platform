# API Gateway

Central API Gateway for the Adventure Management Platform microservices architecture.

## Features

- **Request Routing**: Routes requests to 11 microservices
- **Authentication**: JWT-based authentication with token validation
- **Rate Limiting**: Protects against abuse with configurable limits
- **CORS**: Cross-origin resource sharing support
- **Security**: Helmet.js security headers
- **Logging**: Winston logger with correlation IDs
- **Error Handling**: Centralized error handling
- **Health Checks**: /health and /metrics endpoints
- **Compression**: Response compression

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t api-gateway .
docker run -p 3000:3000 --env-file .env api-gateway
```

## Service Routes

| Service | Path | Target Port |
|---------|------|-------------|
| Auth | `/api/auth` | 3001 |
| Quests | `/api/quests` | 3002 |
| Profiles | `/api/profiles` | 3003 |
| Gamification | `/api/gamification` | 3004 |
| Social | `/api/social` | 3005 |
| Geospatial | `/api/geospatial` | 3006 |
| Notifications | `/api/notifications` | 3007 |
| Payments | `/api/payments` | 3008 |
| Media | `/api/media` | 3009 |
| Analytics | `/api/analytics` | 3010 |
| Admin | `/api/admin` | 3011 |

## Rate Limits

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Upload endpoints: 50 requests per hour

## Public Routes (No Auth Required)

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `GET /api/quests/public`
- `GET /health`
- `GET /metrics`

## Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "uptime": 12345.67,
  "service": "api-gateway"
}
```

## Metrics

Prometheus-compatible metrics available at `/metrics`.
