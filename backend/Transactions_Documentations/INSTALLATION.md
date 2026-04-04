# Installation Guide - Daily Transaction Report Feature

## Required Dependencies

This feature requires two additional npm packages:

### 1. **pdfkit** (PDF Generation)
```bash
npm install pdfkit
```
**Version:** Latest  
**Purpose:** Generate professional PDF reports  
**Size:** ~5MB with dependencies

### 2. **node-cron** (Task Scheduling)
```bash
npm install node-cron
```
**Version:** Latest  
**Purpose:** Schedule automated daily report generation  
**Size:** ~50KB

## Installation Steps

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install pdfkit node-cron
```

### Step 3: Verify Installation
Check that packages are added to `package.json`:
```bash
npm list pdfkit node-cron
```

Expected output:
```
├── node-cron@x.x.x
└── pdfkit@x.x.x
```

### Step 4: Restart Server
```bash
npm start
```

You should see in console:
```
✓ Daily Report Cron Scheduler initialized successfully
✓ Schedule: Every day at 8:00 PM IST (Asia/Kolkata timezone)
Server is running at 3000
```

## Complete Backend Dependencies

Your complete `package.json` should look like:

```json
{
  "name": "decathlon-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "cookie-parser": "^1.4.6",
    "mongoose": "^7.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "nodemailer": "^6.9.0",
    "morgan": "^1.10.0",
    "pdfkit": "^0.13.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

## Environment Variables Required

Create a `.env` file in the backend directory with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/decathlon

# JWT
JWT_SECRET=your_super_secret_key_here

# Email Configuration (Gmail)
SENDER_EMAIL=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Frontend
FRONTEND_URI=http://localhost:3000
```

### Getting Gmail App Password

1. Go to myaccount.google.com
2. Select Security in the left panel
3. Enable 2-Step Verification (if not enabled)
4. Go back to Security → App passwords
5. Select "Mail" and "Windows Computer" (or your device)
6. Copy the 16-character password
7. Paste into EMAIL_PASSWORD in .env

## Troubleshooting Installation

### Issue: `Cannot find module 'pdfkit'`

**Solution:**
```bash
npm install pdfkit --save
npm install
```

### Issue: `Cannot find module 'node-cron'`

**Solution:**
```bash
npm install node-cron --save
npm install
```

### Issue: Dependencies not installed after npm install

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Cannot find path './temp'

**Solution:**  
The temp folder is created automatically on first report generation. If issues persist:
```bash
# Create manually
mkdir -p backend/temp
```

## Verification Checklist

After installation, verify:

- [ ] `npm list pdfkit` shows installed version
- [ ] `npm list node-cron` shows installed version
- [ ] `.env` file has SENDER_EMAIL and EMAIL_PASSWORD
- [ ] MongoDB connection is working
- [ ] Server starts without errors
- [ ] Console shows cron scheduler initialization message
- [ ] `backend/temp` folder is created after first run

## File Size Reference

Installed packages will add approximately:
- pdfkit: ~5-10 MB
- node-cron: ~0.5 MB
- **Total additional size: ~5-10 MB**

This is acceptable for production deployments.

## Platform-Specific Notes

### Windows
- Path separator is `\`, code uses `/` (works fine)
- Ensure temp folder has write permissions
- Use PowerShell or Command Prompt for commands

### macOS/Linux
- Standard Unix permissions apply
- Ensure write access to `backend/temp` folder
- Use bash or zsh for commands

## NPM Scripts

Add to your `package.json` for convenience:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "report:generate": "node -e \"import('./services/cronScheduler.js').then(m => m.generateAndSendDailyReports())\""
  }
}
```

Then run manual reports with:
```bash
npm run report:generate
```

## Checking Installation

Run this command to verify everything is installed:

```bash
node -e "console.log('pdfkit:', require.resolve('pdfkit')); console.log('node-cron:', require.resolve('node-cron'));"
```

Expected output:
```
pdfkit: /path/to/node_modules/pdfkit/index.js
node-cron: /path/to/node_modules/node-cron/src/index.js
```

## Next Steps After Installation

1. ✓ Install dependencies
2. ✓ Configure .env variables
3. ✓ Start server
4. ✓ Test cron initialization
5. ✓ Test email sending (via API endpoint)
6. ✓ Verify PDF generation
7. ✓ Monitor first automated run

Refer to `DAILY_REPORT_SETUP.md` for full documentation and usage guide.

---

**Installation completed successfully!** 
