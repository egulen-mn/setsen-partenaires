# A-Bento - Safe Build & Deployment Guide

## ⚠️ IMPORTANT: Read This Before Building!

The most common issue is **port conflicts** when PM2 tries to restart while the old process is still running.

---

## 🛡️ SAFE BUILD PROCEDURE

### Method 1: Stop → Build → Start (RECOMMENDED)

```bash
# 1. Navigate to app directory
cd /srv/apps/b2b

# 2. Stop the app first
pm2 stop b2b

# 3. Build the application
npm run build

# 4. Start the app
pm2 start b2b

# 5. Check status
pm2 status b2b
```

### Method 2: Delete → Build → Start (If Method 1 Fails)

```bash
# 1. Navigate to app directory
cd /srv/apps/b2b

# 2. Delete the PM2 process completely
pm2 delete b2b

# 3. Build the application
npm run build

# 4. Start fresh from ecosystem config
pm2 start ecosystem.config.js

# 5. Save PM2 configuration
pm2 save

# 6. Check status
pm2 status
```

---

## ❌ WHAT NOT TO DO

### DON'T: Use `pm2 restart` during build
```bash
# ❌ BAD - This causes port conflicts!
npm run build && pm2 restart b2b
```

**Why?** PM2 restart tries to start the new process before the old one fully stops, causing "EADDRINUSE" errors.

### DON'T: Build while app is running
```bash
# ❌ BAD - Can cause file lock issues
npm run build  # (while PM2 is running)
```

---

## 🔧 TROUBLESHOOTING

### Problem: "EADDRINUSE: address already in use :::3014"

**Root Cause:** Orphaned Next.js processes from previous PM2 crashes.

**Solution:**
```bash
# Step 1: Find what's using the port
printf '%s\n' 'iA3fIHvXsv2EtoZxuvJq' | sudo -S ss -tulpn | grep :3014

# Step 2: Kill the orphaned process (replace PID with actual PID from step 1)
printf '%s\n' 'iA3fIHvXsv2EtoZxuvJq' | sudo -S kill -9 <PID>

# Step 3: Start the app
pm2 delete b2b
pm2 start ecosystem.config.js
pm2 save
```

**Quick Fix (if you don't want to find PID):**
```bash
# Option 1: Stop and restart
pm2 stop b2b
sleep 2
pm2 start b2b

# Option 2: Delete and recreate
pm2 delete b2b
pm2 start ecosystem.config.js
pm2 save
```

### Problem: "Permission denied" during build

**Solution:**
```bash
# Fix .next directory permissions
sudo chown -R deploy:b2b_ftp /srv/apps/b2b/.next
sudo chmod -R 775 /srv/apps/b2b/.next

# Try build again
npm run build
```

### Problem: Build succeeds but app won't start

**Solution:**
```bash
# Check logs for errors
pm2 logs b2b --lines 50

# Verify port is free
lsof -i :3014

# If port is occupied, kill the process
pm2 delete b2b
pm2 start ecosystem.config.js
```

---

## 📋 COMPLETE WORKFLOW

### For Code Changes:

```bash
# Step 1: Navigate to directory
cd /srv/apps/b2b

# Step 2: Stop the application
pm2 stop b2b

# Step 3: Make your code changes
# (edit files in /app/ directory)

# Step 4: Build
npm run build

# Step 5: Check for build errors
# If build failed, fix errors and repeat step 4

# Step 6: Start the application
pm2 start b2b

# Step 7: Verify it's running
pm2 status b2b
pm2 logs b2b --lines 20

# Step 8: Test the website
curl -I https://b2b.tengerly.com
```

### For Image Uploads Only:

```bash
# No rebuild needed!
# Just upload images via FTP to /public/images/
# Images are immediately available at:
# https://b2b.tengerly.com/images/your-image.jpg
```

---

## 🚀 QUICK COMMANDS

### Check Status
```bash
pm2 status b2b
```

### View Logs (Real-time)
```bash
pm2 logs b2b
```

### View Last 50 Log Lines
```bash
pm2 logs b2b --lines 50 --nostream
```

### Safe Restart (After Build)
```bash
pm2 stop b2b
sleep 2
pm2 start b2b
```

### Nuclear Option (Complete Reset)
```bash
pm2 delete b2b
cd /srv/apps/b2b
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## 📝 CHECKLIST BEFORE BUILDING

- [ ] Navigate to `/srv/apps/b2b`
- [ ] Stop PM2 process: `pm2 stop b2b`
- [ ] Wait 2 seconds for port to free
- [ ] Run build: `npm run build`
- [ ] Check for errors in build output
- [ ] Start PM2: `pm2 start b2b`
- [ ] Verify status: `pm2 status b2b`
- [ ] Check logs: `pm2 logs b2b --lines 20`
- [ ] Test URL: `curl -I https://b2b.tengerly.com`

---

## 🎯 GOLDEN RULE

**ALWAYS stop before building, NEVER restart during build!**

```bash
# ✅ CORRECT
pm2 stop b2b
npm run build
pm2 start b2b

# ❌ WRONG
npm run build && pm2 restart b2b
```

---

## 📞 NEED HELP?

If you're stuck:
1. Check logs: `pm2 logs b2b --lines 50`
2. Check if port is free: `lsof -i :3014`
3. Try the "Nuclear Option" above
4. Check file permissions: `ls -la /srv/apps/b2b/.next`

---

**Last Updated:** February 13, 2026
