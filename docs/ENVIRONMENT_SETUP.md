# Environment Setup Guide

This guide explains how to configure environment variables for the Adventure Management Platform.

## Quick Start

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values

3. Never commit `.env` files to version control

## Environment Files

### Development
- `.env` - Main environment file (not tracked by git)
- `.env.example` - Template file (tracked by git)
- `.env.development` - Development-specific overrides

### Production
- Environment variables should be set via your deployment platform
- For Docker: Use `--env-file` flag
- For Kubernetes: Use ConfigMaps and Secrets
- For serverless: Use platform environment variables

## Critical Variables

### JWT_SECRET
- **Required:** Yes
- **Description:** Secret key for JWT token signing
- **Requirements:** Minimum 32 characters, random string
- **Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### SESSION_SECRET
- **Required:** Yes
- **Description:** Secret key for session encryption
- **Requirements:** Minimum 32 characters, random string
- **Generate:** Same as JWT_SECRET

### Database Passwords
- **Required:** Yes for production
- **Description:** PostgreSQL, MongoDB, Redis passwords
- **Requirements:** Strong passwords (12+ characters)
- **Generate:**
```bash
openssl rand -base64 24
```

## Service-Specific Configuration

### Auth Service
```env
AUTH_SERVICE_PORT=3001
AUTH_DATABASE_URL=postgresql://postgres:password@localhost:5432/adventure_auth
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=10
```

### Media Service
```env
MEDIA_SERVICE_PORT=3009
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Payment Service
```env
PAYMENT_SERVICE_PORT=3008
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
```

### Notification Service
```env
NOTIFICATION_SERVICE_PORT=3007
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Database Configuration

### PostgreSQL
Multiple databases are created automatically:
- `adventure_auth` - Authentication & users
- `adventure_quests` - Quests & checkpoints
- `adventure_profiles` - User profiles
- `adventure_gamification` - XP, achievements, leaderboards
- `adventure_social` - Social features
- `adventure_admin` - Admin operations

Connection URL format:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### MongoDB
Used for geospatial data:
```env
MONGODB_URL=mongodb://admin:password@localhost:27017/adventure_geospatial?authSource=admin
```

### Redis
Used for caching and sessions:
```env
REDIS_URL=redis://localhost:6379
```

## AWS Configuration

### S3 for Media Storage
1. Create an S3 bucket
2. Configure CORS policy
3. Create IAM user with S3 access
4. Set environment variables:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=adventure-platform-media
```

## Email Configuration

### Gmail Setup
1. Enable 2FA on your Google account
2. Generate an App Password
3. Configure environment:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### SendGrid (Alternative)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## Payment Gateway Configuration

### Stripe
1. Create Stripe account
2. Get API keys from Dashboard
3. Set up webhook endpoint
4. Configure environment:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Test mode keys start with `sk_test_` and `pk_test_`
Production keys start with `sk_live_` and `pk_live_`

## Security Best Practices

### Production Checklist
- [ ] Change all default passwords
- [ ] Use strong random secrets (32+ characters)
- [ ] Enable HTTPS/TLS for all services
- [ ] Restrict CORS_ORIGIN to your domains
- [ ] Use environment-specific database credentials
- [ ] Enable database SSL connections
- [ ] Rotate secrets regularly
- [ ] Use secrets management service (AWS Secrets Manager, HashiCorp Vault)
- [ ] Never log sensitive environment variables
- [ ] Use `.env.production` file or platform environment variables

### .gitignore
Ensure these patterns are in `.gitignore`:
```
.env
.env.local
.env.*.local
.env.production
```

## Docker Configuration

### Using .env with Docker Compose
```bash
docker-compose --env-file .env up
```

### Environment in docker-compose.yml
```yaml
services:
  auth-service:
    environment:
      - NODE_ENV=${NODE_ENV}
      - DATABASE_URL=${AUTH_DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
```

## Kubernetes Configuration

### Create ConfigMap
```bash
kubectl create configmap app-config \
  --from-env-file=.env \
  --namespace=adventure-platform
```

### Create Secrets
```bash
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=db-password=$POSTGRES_PASSWORD \
  --namespace=adventure-platform
```

### Use in Deployment
```yaml
env:
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: app-secrets
        key: jwt-secret
```

## Validation

### Check Environment Variables
```bash
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET ? 'JWT_SECRET is set' : 'JWT_SECRET is missing')"
```

### Test Database Connection
```bash
psql $AUTH_DATABASE_URL -c "SELECT version();"
```

### Test Redis Connection
```bash
redis-cli -u $REDIS_URL ping
```

## Troubleshooting

### Database Connection Failed
- Check DATABASE_URL format
- Verify database exists
- Check host/port accessibility
- Verify credentials

### Redis Connection Failed
- Check REDIS_URL format
- Verify Redis is running
- Check firewall rules

### Email Sending Failed
- Verify SMTP credentials
- Check if using App Password (for Gmail)
- Test with telnet: `telnet smtp.gmail.com 587`

### S3 Upload Failed
- Verify AWS credentials
- Check bucket permissions
- Verify bucket region matches AWS_REGION

## Migration

### From Development to Production
1. Create new `.env.production` file
2. Update all secrets and passwords
3. Change database URLs to production instances
4. Update CORS_ORIGIN to production domains
5. Set NODE_ENV=production
6. Disable debug features

### Environment Variables Checklist
```bash
# Check all required variables are set
required_vars=("JWT_SECRET" "DATABASE_URL" "REDIS_URL")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var is not set"
  fi
done
```

## Support

For questions or issues with environment configuration:
- Check documentation: `/docs`
- Review example file: `.env.example`
- Contact DevOps team

