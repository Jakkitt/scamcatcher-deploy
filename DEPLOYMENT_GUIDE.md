  # 🚀 Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Critical Security Items

- [ ] **Generate secure JWT_SECRET**

  ```bash
  # Run this script:
  .\generate-jwt-secret.cmd
  # Or manually:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Set NODE_ENV=production** in server/.env

- [ ] **Set MONGODB_URI** to production database

  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scamcatcher
  ```

- [ ] **Configure ALLOWED_ORIGINS** with your production domain

  ```
  ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  ```

- [ ] **Set COOKIE_DOMAIN** (if using subdomain)

  ```
  COOKIE_DOMAIN=.yourdomain.com
  ```

- [ ] **Enable TRUST_PROXY** (if behind reverse proxy/CDN)

  ```
  TRUST_PROXY=1
  ```

- [ ] **Configure SMTP** for email notifications

  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  MAIL_FROM="ScamCatcher <noreply@yourdomain.com>"
  SMTP_SECURE=false
  SMTP_DEV_MODE=false
  ```

- [ ] **Verify all .env files are in .gitignore**

---

## 🏗️ Deployment Options

### Option 1: Traditional VPS/Server (Recommended)

#### Prerequisites:

- Ubuntu 20.04+ or Windows Server
- Node.js 18+
- MongoDB (local or Atlas)
- Nginx (reverse proxy)
- PM2 (process manager)

#### Steps:

**1. Install Dependencies on Server**

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

**2. Clone/Upload Project**

```bash
# Upload via git or FTP
git clone <your-repo>
cd scamcatcher-checklist1
```

**3. Install & Build**

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Build frontend
npm run build
```

**4. Configure Environment**

```bash
# Copy and edit .env files
cp .env.example .env
cp server/.env.example server/.env

# Edit with your production values
nano server/.env
```

**5. Start with PM2**

```bash
cd server

# Start server with PM2
pm2 start src/index.js --name scamcatcher-api

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**6. Configure Nginx**

```nginx
# /etc/nginx/sites-available/scamcatcher
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (static files from dist)
    location / {
        root /path/to/scamcatcher-checklist1/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        alias /path/to/scamcatcher-checklist1/server/uploads/;
        add_header Access-Control-Allow-Origin *;
    }
}
```

**7. Enable HTTPS with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**8. Restart Services**

```bash
sudo systemctl restart nginx
pm2 restart scamcatcher-api
```

---

### Option 2: Render.com (Easy Deploy)

#### Frontend:

**1. Create New Static Site**

- Build Command: `npm run build`
- Publish Directory: `dist`
- Add Environment Variables (if needed):
  ```
  VITE_API_BASE_URL=https://your-backend.onrender.com/api
  ```

#### Backend:

**1. Create New Web Service**

- Build Command: `cd server && npm install`
- Start Command: `cd server && npm start`

**2. Add Environment Variables** (in Render Dashboard):

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<your-secure-secret>
ALLOWED_ORIGINS=https://your-frontend.onrender.com
TRUST_PROXY=1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="ScamCatcher <noreply@yourdomain.com>"
```

**3. Add Persistent Disk** (for uploads)

- Mount Path: `/opt/render/project/src/server/uploads`

---

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Vercel (Frontend):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_BASE_URL": "https://your-backend.railway.app/api"
  }
}
```

#### Railway (Backend):

1. Connect GitHub repo
2. Select `server` folder as root
3. Add environment variables
4. Deploy

---

## 🔒 Security Hardening (Production)

### 1. Rate Limiting (Already Implemented ✅)

```javascript
// server/src/middlewares/rateLimit.js
// Adjust limits based on your traffic:
export const authRateLimiter = baseLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5, // Reduce for production
});
```

### 2. Add Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. MongoDB Security

```javascript
// Create database user with limited permissions
use scamcatcher
db.createUser({
  user: "scamcatcher_app",
  pwd: "strong-password-here",
  roles: [
    { role: "readWrite", db: "scamcatcher" }
  ]
})
```

### 4. Regular Updates

```bash
# Create update script
#!/bin/bash
pm2 stop scamcatcher-api
git pull
npm install
cd server && npm install && cd ..
npm run build
pm2 restart scamcatcher-api
```

---

## 📊 Monitoring & Logging

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs scamcatcher-api

# Monitor
pm2 monit

# Web dashboard
pm2 plus
```

### 2. Setup Sentry (Error Tracking)

```bash
npm install @sentry/node

# In server/src/index.js:
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 Database Backup

### Automated MongoDB Backup Script

```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="scamcatcher"

mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" \
  --db=$DB_NAME \
  --archive=$BACKUP_DIR/scamcatcher_$DATE.gz \
  --gzip

# Keep only last 7 backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

**Setup cron job:**

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-mongodb.sh
```

---

## 🧪 Pre-Deployment Testing

### 1. Build Test

```bash
# Test frontend build
npm run build
# Check dist/ folder

# Test backend start
cd server
NODE_ENV=production npm start
```

### 2. Environment Variables Test

```bash
cd server
npm run check-env
```

### 3. Load Testing (Optional)

```bash
npm install -g Artillery

# Create artillery.yml:
config:
  target: "http://localhost:4010"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/api/health"

# Run test:
artillery run artillery.yml
```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression

```nginx
# In Nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_comp_level 6;
```

### 2. Add CDN (Cloudflare)

- Point DNS to Cloudflare
- Enable caching rules
- Enable minification
- Enable Brotli compression

### 3. Database Indexing (Already Done ✅)

```javascript
// Verify indexes:
db.reports.getIndexes();
db.users.getIndexes();
```

---

## 🆘 Troubleshooting

### Issue: Server won't start

```bash
# Check logs
pm2 logs scamcatcher-api --lines 100

# Check if port is in use
netstat -ano | findstr :4010  # Windows
lsof -i :4010                  # Linux

# Restart PM2
pm2 restart scamcatcher-api
```

### Issue: 502 Bad Gateway

```bash
# Check if backend is running
curl http://localhost:4010/api/health

# Check Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: MongoDB connection failed

```bash
# Test connection
mongosh "$MONGODB_URI"

# Check firewall
# MongoDB Atlas: Add IP to whitelist
```

---

## ✅ Post-Deployment Checklist

- [ ] Test login/register
- [ ] Test file upload
- [ ] Test email notifications
- [ ] Test password reset flow
- [ ] Test admin panel
- [ ] Check HTTPS certificate
- [ ] Monitor error logs for 24 hours
- [ ] Setup automated backups
- [ ] Setup monitoring alerts
- [ ] Document rollback procedure

---

## 🔙 Rollback Procedure

```bash
# 1. Stop current version
pm2 stop scamcatcher-api

# 2. Revert to previous version
git revert HEAD
# or
git checkout <previous-commit>

# 3. Rebuild
npm install
cd server && npm install && cd ..
npm run build

# 4. Restart
pm2 restart scamcatcher-api
```

---

## 📞 Support Contacts

- **Hosting Issues:** [Your hosting provider support]
- **Database Issues:** MongoDB Atlas Support
- **CDN Issues:** Cloudflare Support
- **Development Team:** [Your contact]

---

**Remember:**

- Always test in staging before production
- Keep backups
- Monitor logs after deployment
- Have rollback plan ready

🚀 **Good luck with your deployment!**
