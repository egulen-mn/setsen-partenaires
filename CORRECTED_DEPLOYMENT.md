# Corrected B2B Tengerly Deployment

## Domain Configuration (CORRECTED)

### demo.tengerly.com (Port 3019)
**ONLY Sakura Sushi Restaurant Demo**
- `/` - Restaurant homepage
- `/commander` - Order page
- `/reserver` - Reservation page
- **NO partner pages, NO guide, NO admin**

### b2b.tengerly.com (Port 3014)
**B2B Landing + Admin + Partner Pages**
- `/` - B2B solution landing page
- `/guide` - Referral program guide
- `/admin` - Admin dashboard
- `/admin/partners` - Partner management
- `/admin/orders` - Order management
- `/admin/payouts` - Commission payouts
- `/partner/[code]` - Partner dashboard
- `/r/[code]` - Referral tracking

## What Was Fixed

1. ✅ Created nginx configuration for demo.tengerly.com → port 3019
2. ✅ Removed partner/guide/r pages from demo app
3. ✅ Updated demo app metadata to "A-Sushi"
4. ✅ Demo app now ONLY serves restaurant pages
5. ✅ All partner/admin functionality stays on b2b.tengerly.com

## Nginx Configuration

Created: `/etc/nginx/sites-available/demo.tengerly.com.conf`
- Proxies to localhost:3019
- SSL configured with Cloudflare certificates
- Enabled and reloaded

## Verification

```bash
# Check nginx config
sudo nginx -t

# Check ports
ss -tlnp | grep -E ":(3014|3019)"

# Check PM2 status
pm2 list

# View logs
pm2 logs demo
pm2 logs b2b
```

## URLs

- **B2B Landing**: https://b2b.tengerly.com
- **Partner Guide**: https://b2b.tengerly.com/guide
- **Admin Dashboard**: https://b2b.tengerly.com/admin
- **Partner Dashboard**: https://b2b.tengerly.com/partner/[code]

