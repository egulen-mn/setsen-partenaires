# B2B Tengerly Deployment Summary

## Deployment Configuration

### Domain Setup

#### b2b.tengerly.com (Port 3014)
- **Purpose**: B2B landing page and admin dashboard
- **Location**: `/srv/apps/b2b`
- **Routes**:
  - `/` - B2B solution landing page
  - `/admin` - Admin dashboard overview
  - `/admin/partners` - Partner management
  - `/admin/orders` - Order management
  - `/admin/payouts` - Commission payouts
#### demo.tengerly.com (Port 3019)
- **Purpose**: Demo restaurant website with referral tracking
- **Location**: `/srv/apps/demo`
- **Routes**:
  - `/` - Restaurant homepage (Sakura Sushi demo)
  - `/commander` - Order page
  - `/reserver` - Reservation page
  - `/guide` - Referral program guide
  - `/partner/[code]` - Partner dashboard
  - `/r/[code]` - Referral tracking redirect

### PM2 Process Management

```bash
# View all processes
pm2 list

# View logs
pm2 logs b2b
pm2 logs demo

# Restart apps
pm2 restart b2b
pm2 restart demo

# Save PM2 configuration
pm2 save
```

### Port Configuration

- **b2b.tengerly.com**: Port 3014
- **demo.tengerly.com**: Port 3019

### Cloudflare Configuration

Both subdomains are configured in Cloudflare with:
- DNS A records pointing to server IP
- Proxy enabled (orange cloud)
- SSL/TLS encryption mode: Full (strict)

### Database

Both applications share the same file-based JSON database located at:
- `/srv/apps/b2b/lib/db/data/`

**Important**: The demo app uses a copy of the database structure, but has its own data files.

### Key Features

1. **Referral Tracking**: URL-based referral tracking via `?ref=CODE` parameter
2. **Order Status Management**: Multi-step order workflow (On Hold → Confirmed → Delivered)
3. **Commission System**: Automatic commission calculation and payout management
4. **QR Code Generation**: Dynamic QR codes for partner referral links
5. **Multi-language Support**: French (default) and English
6. **Mobile Responsive**: All pages optimized for mobile devices
7. **Custom Modals**: Modern UI with custom confirmation and alert modals
8. **Google Analytics**: Integrated tracking (G-6PP31PQMVR)

### Admin Access

- **URL**: https://b2b.tengerly.com/admin/login
- **Username**: `admin`
- **Password**: `[see .env]`

### Contact Information

- **Mobile/WhatsApp**: 06 22 15 52 34
- **Email**: hello@tengerly.com

### Deployment Date

February 23, 2026

### Notes

- The middleware on b2b.tengerly.com handles redirects from old `/demo` URLs to the new subdomain
- Both apps use Next.js 16.1.6 with Turbopack
- All currency displays use Euro (€) symbol
- Commission rates are configurable per partner
