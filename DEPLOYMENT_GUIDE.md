# Workforce HRM & PMS - Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Cloud Deployment](#cloud-deployment)
8. [Environment Variables](#environment-variables)
9. [Security Configuration](#security-configuration)
10. [Monitoring & Maintenance](#monitoring--maintenance)

## 🚀 Prerequisites

### System Requirements
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Database**: PostgreSQL 13.x or higher
- **Git**: For version control
- **SSL Certificate**: For HTTPS (production)

### Software Dependencies
```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 8.x or higher

# Check PostgreSQL
psql --version  # Should be 13.x or higher
```

### Required Accounts
- **Database Provider**: Supabase, AWS RDS, or self-hosted PostgreSQL
- **Domain Name**: For production deployment
- **SSL Certificate**: From Let's Encrypt or commercial provider
- **Email Service**: For notifications (SendGrid, AWS SES, etc.)

## 🛠️ Environment Setup

### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd HRM-PMS

# Backend setup
cd backend
npm install
cp .env.example .env

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
```

### Production Environment Structure
```
/opt/workforce/
├── backend/              # Backend application
├── frontend/             # Frontend build files
├── nginx/                # Web server configuration
├── ssl/                  # SSL certificates
├── logs/                 # Application logs
└── scripts/              # Deployment scripts
```

## 🗄️ Database Configuration

### Supabase Setup (Recommended)
1. **Create Supabase Account**
   - Visit https://supabase.com
   - Create new organization
   - Create new project

2. **Configure Database**
   ```sql
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

3. **Run Database Migrations**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Seed Database**
   ```bash
   node prisma/seed-comprehensive.js
   ```

### Self-Hosted PostgreSQL
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE workforce;
CREATE USER workforce_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE workforce TO workforce_user;
\q
```

### Database Connection String
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

## 🔧 Backend Deployment

### Production Build
```bash
cd backend

# Install production dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

### Environment Configuration
```env
# production.env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-key"

# Email configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 configuration file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'workforce-backend',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true
  }]
}
EOF

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/workforce
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /opt/workforce/ssl/cert.pem;
    ssl_certificate_key /opt/workforce/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend static files
    location / {
        root /opt/workforce/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🎨 Frontend Deployment

### Production Build
```bash
cd frontend

# Install dependencies
npm ci

# Create production build
npm run build

# Test build locally
npm run preview
```

### Environment Configuration
```env
# .env.production
VITE_API_BASE_URL="https://yourdomain.com/api"
VITE_APP_NAME="Workforce HRM & PMS"
VITE_APP_VERSION="1.0.0"
```

### Build Optimization
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../frontend-dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173
  }
})
```

### Deploy to Production Directory
```bash
# Copy build files
sudo cp -r dist/* /opt/workforce/frontend/

# Set permissions
sudo chown -R www-data:www-data /opt/workforce/frontend
sudo chmod -R 755 /opt/workforce/frontend
```

## 🐳 Docker Deployment

### Multi-Stage Dockerfile
```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
RUN npx prisma generate

FROM node:18-alpine AS backend
WORKDIR /app
COPY --from=backend-builder /app .
EXPOSE 3001
CMD ["npm", "start"]

# Frontend Dockerfile
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine AS frontend
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      target: backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: .
      target: frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=workforce
      - POSTGRES_USER=workforce_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

## ☁️ Cloud Deployment

### AWS Deployment
```yaml
# docker-compose.aws.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      target: backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "3001:3001"
    restart: unless-stopped

  frontend:
    build:
      context: .
      target: frontend
    ports:
      - "80:80"
    restart: unless-stopped

networks:
  default:
    driver: bridge
```

### AWS ECS Deployment
```bash
# Create ECR repository
aws ecr create-repository --repository-name workforce-backend
aws ecr create-repository --repository-name workforce-frontend

# Build and push images
docker build -t workforce-backend .
docker tag workforce-backend:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/workforce-backend:latest
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/workforce-backend:latest

# Deploy to ECS
aws ecs create-cluster --cluster-name workforce
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster workforce --service-name workforce-backend --task-definition workforce-backend:1
```

### Vercel Frontend Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Configure environment variables
vercel env add VITE_API_BASE_URL production
vercel env add VITE_APP_NAME production
```

## 🔧 Environment Variables

### Backend Environment Variables
```env
# Core Configuration
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Supabase (if using)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"

# Logging
LOG_LEVEL="info"
LOG_FILE="./logs/app.log"
```

### Frontend Environment Variables
```env
# API Configuration
VITE_API_BASE_URL="https://yourdomain.com/api"

# Application
VITE_APP_NAME="Workforce HRM & PMS"
VITE_APP_VERSION="1.0.0"
VITE_APP_DESCRIPTION="Comprehensive HR and Project Management"

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE=true

# Third-party
VITE_GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"
VITE_SENTRY_DSN="https://your-sentry-dsn"
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# Configure UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3001  # Block direct backend access
```

### Security Headers
```nginx
# Add to Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Database Security
```sql
-- Create restricted database user
CREATE USER workforce_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE workforce TO workforce_app;
GRANT USAGE ON SCHEMA public TO workforce_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO workforce_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO workforce_app;
```

## 📊 Monitoring & Maintenance

### Application Monitoring
```bash
# Install monitoring tools
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Log Management
```bash
# Log rotation configuration
sudo nano /etc/logrotate.d/workforce

/opt/workforce/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload workforce-backend
    endscript
}
```

### Health Checks
```bash
# Create health check script
cat > /opt/workforce/scripts/health-check.sh << EOF
#!/bin/bash

# Check backend health
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "Backend is healthy"
else
    echo "Backend is down, restarting..."
    pm2 restart workforce-backend
fi

# Check database connection
if pg_isready -h localhost -p 5432 -U workforce_user > /dev/null 2>&1; then
    echo "Database is healthy"
else
    echo "Database is down"
fi
EOF

chmod +x /opt/workforce/scripts/health-check.sh

# Add to crontab
echo "*/5 * * * * /opt/workforce/scripts/health-check.sh" | sudo crontab -
```

### Backup Strategy
```bash
# Database backup script
cat > /opt/workforce/scripts/backup.sh << EOF
#!/bin/bash

DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/workforce/backups"
DB_NAME="workforce"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Database backup
pg_dump -h localhost -U workforce_user \$DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql

# Compress backup
gzip \$BACKUP_DIR/db_backup_\$DATE.sql

# Remove old backups (keep 30 days)
find \$BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: \$BACKUP_DIR/db_backup_\$DATE.sql.gz"
EOF

chmod +x /opt/workforce/scripts/backup.sh

# Schedule daily backups
echo "0 2 * * * /opt/workforce/scripts/backup.sh" | sudo crontab -
```

### Performance Monitoring
```bash
# Install monitoring tools
npm install -g clinic
npm install -g autocannon

# Performance testing
autocannon -c 100 -d 30 http://localhost:3001/api/health

# Node.js diagnostics
clinic doctor -- node src/index.js
```

## 🔄 Update Process

### Application Updates
```bash
# Create update script
cat > /opt/workforce/scripts/update.sh << EOF
#!/bin/bash

echo "Starting application update..."

# Backup current version
cp -r /opt/workforce/backend /opt/workforce/backup/backend_\$(date +%Y%m%d_%H%M%S)

# Pull latest code
cd /opt/workforce
git pull origin main

# Update backend
cd backend
npm ci --production
npx prisma migrate deploy
npx prisma generate

# Update frontend
cd ../frontend
npm ci
npm run build
sudo cp -r dist/* /opt/workforce/frontend/

# Restart services
pm2 restart workforce-backend
sudo nginx -s reload

echo "Update completed successfully!"
EOF

chmod +x /opt/workforce/scripts/update.sh
```

### Database Updates
```bash
# Run migrations
cd /opt/workforce/backend
npx prisma migrate deploy

# Update seed data if needed
node prisma/seed-comprehensive.js
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check logs
pm2 logs workforce-backend

# Check environment variables
pm2 env 0

# Restart service
pm2 restart workforce-backend
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U workforce_user -d workforce

# Check database status
sudo systemctl status postgresql

# Restart database
sudo systemctl restart postgresql
```

#### Frontend Not Loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** March 3, 2026  
**For Support**: Contact your DevOps team
