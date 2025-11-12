# Frontend Deployment Guide

This guide explains how to deploy the Next.js frontend to your cloud server.

## 🚀 Automated Deployment (CI/CD)

The frontend is automatically deployed via GitHub Actions when you push to the `main` branch.

### Workflow Steps

1. **Test** - Runs linting and builds the application
2. **Deploy** - SSH to server, pulls latest code, installs dependencies, builds, and restarts PM2
3. **Notify** - Sends Discord notifications on success/failure

### Required GitHub Secrets

Make sure these secrets are configured in your GitHub repository:

- `INSTANCE_IP` - Your GCP VM IP address
- `INSTANCE_USER` - SSH username (e.g., `ubuntu`, `deploy`)
- `SSH_PRIVATE_KEY` - Private SSH key for server access
- `DISCORD_WEBHOOK_URL` - Discord webhook URL for notifications

## 🖥️ Server Setup

### Prerequisites

1. **Node.js 20+** installed on server
2. **PM2** installed globally: `npm install -g pm2`
3. **Git** installed
4. **Nginx** configured to proxy port 3000 to `app.de-id.xyz`

### Initial Server Setup

```bash
# 1. Clone repository
cd ~
git clone <your-repo-url> deid_frontend
cd deid_frontend

# 2. Install dependencies
npm ci

# 3. Build application
npm run build

# 4. Update ecosystem.config.js with your username
# Edit ecosystem.config.js and replace USERNAME with your actual username

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable PM2 to start on server reboot
```

### Nginx Configuration

Your nginx should be configured to proxy requests to `localhost:3000`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.de-id.xyz;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.de-id.xyz;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Manual Deployment

If you need to deploy manually:

```bash
# SSH to server
ssh user@your-server-ip

# Navigate to project
cd ~/deid_frontend

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Restart PM2
pm2 restart deid-frontend

# Check status
pm2 status
pm2 logs deid-frontend
```

## 📊 PM2 Management

### Useful PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs deid-frontend

# Restart application
pm2 restart deid-frontend

# Stop application
pm2 stop deid-frontend

# Delete application
pm2 delete deid-frontend

# Monitor resources
pm2 monit

# Save current process list
pm2 save
```

## 🌍 Environment Variables

Make sure to set environment variables on your server:

```bash
# Create .env.local file
cd ~/deid_frontend
nano .env.local
```

Required variables:

```env
# Backend API
NEXT_PUBLIC_DEID_AUTH_BACKEND=https://api.de-id.xyz

# Facebook OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_secret

# IPFS Gateway
NEXT_PUBLIC_IPFS_GATEWAY_URL=http://35.247.142.76:8080/ipfs

# Smart Contract
NEXT_PUBLIC_PROXY_ADDRESS=0x76050bee51946D027B5548d97C6166e08e5a2B1C

# Node Environment
NODE_ENV=development
```

**Note**: For `npm run dev`, you can use `NODE_ENV=development`. For production, use `npm run start` with `NODE_ENV=production`.

## 🐛 Troubleshooting

### Application not starting

```bash
# Check PM2 logs
pm2 logs deid-frontend --lines 50

# Check if port 3000 is in use
lsof -i :3000

# Check Node.js version
node --version  # Should be 20+

# Check if dependencies are installed
ls node_modules
```

### Build fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Nginx not proxying correctly

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### PM2 process keeps restarting

```bash
# Check error logs
pm2 logs deid-frontend --err

# Check memory usage
pm2 monit

# Increase memory limit in ecosystem.config.js
max_memory_restart: '2G'
```

## 🔄 Switching to Production Mode

If you want to use production mode instead of dev mode:

1. **Update ecosystem.config.js**:
   ```javascript
   script: 'npm',
   args: 'run start',
   env: {
     NODE_ENV: 'production',
   }
   ```

2. **Restart PM2**:
   ```bash
   pm2 restart deid-frontend
   ```

## 📝 Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] Nginx is configured and running
- [ ] SSL certificates are valid
- [ ] PM2 is installed and configured
- [ ] GitHub secrets are configured
- [ ] Server has Node.js 20+ installed
- [ ] Port 3000 is not blocked by firewall

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use HTTPS** - Nginx should handle SSL termination
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Monitor logs** - Check PM2 logs for errors
5. **Backup before major updates** - Git is your backup

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

---

**Last Updated**: October 2024
