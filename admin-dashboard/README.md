# Admin Dashboard

React-based administration interface for the Adventure Management Platform.

## Features

- **User Management**: View, search, ban/unban users
- **Quest Moderation**: Approve/reject pending quests
- **Analytics Dashboard**: System stats, charts, KPIs
- **Activity Logs**: Real-time monitoring of platform activity
- **Secure Authentication**: Admin-only access with JWT

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router v6
- Recharts (data visualization)
- Axios (HTTP client)
- React Hot Toast (notifications)

## Prerequisites

- Node.js 18+
- npm or yarn
- API Gateway running on port 3000
- Admin Service running on port 3011

## Installation

```bash
npm install
```

## Configuration

### Development
Create `.env.development` or use the existing one:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/admin
VITE_GATEWAY_URL=http://localhost:3000
```

### Production
Set environment variables via your deployment platform or create `.env.production`:

```bash
VITE_API_BASE_URL=https://api.adventure-platform.com/api/admin
VITE_GATEWAY_URL=https://api.adventure-platform.com
```

## Development

Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3012`

## Building

Build for production:

```bash
npm run build
```

Output will be in `dist/` directory.

## Docker

Build image:

```bash
docker build -t admin-dashboard .
```

Run container:

```bash
docker run -p 3012:80 \
  -e VITE_API_BASE_URL=http://api-gateway:3000/api/admin \
  admin-dashboard
```

## Default Credentials

For development/testing (after running seed scripts):

- **Email**: `admin@adventure-platform.com`
- **Password**: `password123`

⚠️ **Change these in production!**

## Pages

### Dashboard (`/dashboard`)
- System statistics (users, quests, revenue, participations)
- User growth chart
- Revenue chart
- Quest difficulty distribution
- Key metrics

### Users (`/users`)
- User list with search and filters
- Ban/unban functionality
- User statistics
- Role filtering

### Quests (`/quests`)
- Quest moderation queue
- Approve/reject quests
- Filter by status
- Quest details panel

### Activity (`/activity`)
- Real-time activity feed
- Auto-refresh (10s interval)
- Filter by action/entity type
- Export to CSV

## API Integration

The dashboard communicates with the API Gateway which routes requests to the Admin Service.

### API Endpoints Used

```
GET  /api/admin/users              - Get users list
POST /api/admin/users/:id/ban      - Ban user
POST /api/admin/users/:id/unban    - Unban user
GET  /api/admin/quests             - Get quests
POST /api/admin/quests/:id/approve - Approve quest
POST /api/admin/quests/:id/reject  - Reject quest
GET  /api/admin/stats              - Get system stats
GET  /api/admin/activity-logs      - Get activity logs
```

## Authentication Flow

1. User enters credentials on `/login`
2. POST to `/api/admin/auth/login`
3. Receive JWT token
4. Store token in localStorage
5. Include token in all subsequent requests (Authorization header)
6. Auto-logout on 401 response

## Protected Routes

All routes except `/login` require authentication. The app checks for a valid token in localStorage and redirects to `/login` if not found.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Admin API base URL | `http://localhost:3000/api/admin` |
| `VITE_GATEWAY_URL` | API Gateway URL | `http://localhost:3000` |
| `VITE_NODE_ENV` | Environment | `development` |
| `VITE_ENABLE_DEVTOOLS` | Enable dev tools | `true` |

## Troubleshooting

### Cannot connect to API
- Ensure API Gateway is running on port 3000
- Check `VITE_API_BASE_URL` environment variable
- Check browser console for CORS errors

### Login fails
- Verify admin user exists in database
- Check credentials
- Ensure JWT_SECRET matches between frontend and backend

### Charts not displaying
- Check that Recharts is installed
- Verify API returns correct data format
- Check browser console for errors

## Development Tips

### Hot Module Replacement
Vite provides instant HMR. Changes to `.tsx` files will reflect immediately.

### TypeScript Errors
Run type checking:
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Production Deployment

### Option 1: Static Hosting (Netlify, Vercel)
```bash
npm run build
# Deploy dist/ directory
```

### Option 2: Docker
```bash
docker build -t admin-dashboard .
docker run -p 80:80 admin-dashboard
```

### Option 3: Nginx
```bash
npm run build
cp -r dist/* /var/www/html/admin
```

## Security Notes

- ⚠️ Admin dashboard should be behind VPN or IP whitelist in production
- ⚠️ Use HTTPS in production
- ⚠️ Rotate admin credentials regularly
- ⚠️ Enable MFA for admin accounts (future enhancement)
- ⚠️ Log all admin actions (already implemented)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Proprietary - Adventure Management Platform
