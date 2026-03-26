# Partner Referral Program - Quick Start Guide

## 🚀 5-Minute Demo

### 1. Test Referral Link
```
Visit: https://b2b.tengerly.com/r/HOTEL_DEMO

✅ Redirects to: https://b2b.tengerly.com/commander?ref=HOTEL_DEMO
✅ Green badge shows: "Referral: HOTEL_DEMO"
```

### 2. Place Test Order
```
1. Add "Menu Sakura" to cart (€22.50)
2. Click "Passer la commande"
3. Fill form:
   - Name: Test Customer
   - Phone: +33 1 23 45 67 89
   - Email: test@example.com
4. Click "Confirmer la commande"
5. ✅ Order created with HOTEL_DEMO attribution
```

### 3. View Partner Dashboard
```
Visit: https://b2b.tengerly.com/partner/HOTEL_DEMO

✅ See order count, revenue, commission
✅ View recent orders (no customer PII)
```

### 4. View Admin Dashboard
```
Visit: https://b2b.tengerly.com/admin/login
Login: admin / [see .env]

✅ See overview metrics
✅ Manage partners
✅ Create payouts
```

## 📱 QR Code Test

### Generate QR Code
```
Visit: https://b2b.tengerly.com/api/qr?code=HOTEL_DEMO

✅ PNG image with referral URL encoded
✅ Scan with phone to test mobile flow
```

## 🔗 All Referral Links

```
HOTEL_DEMO:   https://b2b.tengerly.com/r/HOTEL_DEMO
COWORK_DEMO:  https://b2b.tengerly.com/r/COWORK_DEMO
OFFICE_DEMO:  https://b2b.tengerly.com/r/OFFICE_DEMO
SPA_DEMO:     https://b2b.tengerly.com/r/SPA_DEMO
RES_DEMO:     https://b2b.tengerly.com/r/RES_DEMO
```

## 🎯 Key Features

### URL-Based Tracking
- ✅ Referral code in URL: `?ref=HOTEL_DEMO`
- ✅ Works in all browsers
- ✅ Survives link sharing
- ✅ No cookie/localStorage issues

### Commission Calculation
- ✅ Based on food subtotal only
- ✅ Excludes delivery, tips, discounts
- ✅ Rates: 5% or 7% per partner
- ✅ Auto-calculated on order completion

### Privacy Protection
- ✅ Partner dashboards hide customer names
- ✅ No phone numbers shown
- ✅ No email addresses shown
- ✅ Only order values and commissions

### Internationalization
- ✅ French (default)
- ✅ English
- ✅ German
- ✅ Swiss German

## 🛠️ Common Tasks

### Create New Partner
```
1. Login to admin
2. Go to Partners page
3. Click "Nouveau partenaire"
4. Fill form:
   - Name: Partner Name
   - Code: PARTNER_CODE (unique)
   - Category: Select type
   - Commission: 5% or 7%
5. Click "Créer le partenaire"
```

### Generate Partner QR Code
```
1. Login to admin
2. Go to Partners page
3. Find partner
4. Click "Voir le QR"
5. Right-click → Save image
```

### Create Payout
```
1. Login to admin
2. Go to Payouts page
3. Click "Créer un paiement"
4. Select partner
5. Select date range
6. Click "Créer le paiement"
7. Mark as paid when complete
```

### Check Order Attribution
```
# Via database
cat /srv/apps/b2b/data/db.json | jq '.orders[-1]'

# Via API
curl https://b2b.tengerly.com/api/partner/HOTEL_DEMO | jq

# Via admin dashboard
Login → View overview → See recent orders
```

## 🐛 Troubleshooting

### Referral Not Working
```
✅ Check URL has ?ref=CODE parameter
✅ Verify partner code is correct
✅ Ensure partner is active
✅ Check green badge is showing
```

### Order Not Attributed
```
✅ Check referral code was in URL at checkout
✅ Verify partner exists and is active
✅ Check order in database for partnerId field
✅ Review API logs for errors
```

### Commission Not Calculated
```
✅ Verify order status is COMPLETED
✅ Check commission ledger was created
✅ Ensure partner has valid commission rate
✅ Verify food subtotal is correct
```

### Admin Can't Login
```
✅ Username: admin
✅ Password: [see .env]
✅ Clear browser cache
✅ Try incognito mode
```

## 📊 Database Queries

### Count Orders by Partner
```bash
cat /srv/apps/b2b/data/db.json | jq '.orders | group_by(.partnerCodeSnapshot) | map({partner: .[0].partnerCodeSnapshot, count: length})'
```

### Calculate Total Commissions
```bash
cat /srv/apps/b2b/data/db.json | jq '.commissionLedgers | map(.commissionAmount) | add'
```

### List Pending Payouts
```bash
cat /srv/apps/b2b/data/db.json | jq '.payouts | map(select(.status == "PENDING"))'
```

### Recent Orders
```bash
cat /srv/apps/b2b/data/db.json | jq '.orders | sort_by(.createdAt) | reverse | .[0:5]'
```

## 🔄 Deployment

### Build & Restart
```bash
cd /srv/apps/b2b
npm run build
pm2 restart b2b
```

### Check Status
```bash
pm2 status
pm2 logs b2b --lines 50
```

### Seed Demo Data
```bash
cd /srv/apps/b2b
npm run seed
```

## 📚 Documentation

1. **QUICK_START.md** (this file) - Get started in 5 minutes
2. **REFERRAL_DEMO_GUIDE.md** - Complete demo walkthrough
3. **URL_BASED_REFERRAL_TRACKING.md** - Technical details
4. **REFERRAL_TRACKING_COMPARISON.md** - Cookie vs URL
5. **IMPLEMENTATION_SUMMARY.md** - Full project summary

## 🎯 Success Checklist

- [ ] Tested referral link redirect
- [ ] Placed test order with referral
- [ ] Verified commission calculation
- [ ] Checked partner dashboard
- [ ] Logged into admin dashboard
- [ ] Generated QR code
- [ ] Tested in different browsers
- [ ] Tested on mobile device
- [ ] Verified language switching
- [ ] Reviewed all documentation

## 🆘 Need Help?

1. Check documentation files above
2. Review database: `/srv/apps/b2b/data/db.json`
3. Check logs: `pm2 logs b2b`
4. Test API endpoints with curl
5. Verify URL has correct ?ref parameter

---

**Quick Links:**
- Demo Site: https://b2b.tengerly.com
- Admin Login: https://b2b.tengerly.com/admin/login
- Test Referral: https://b2b.tengerly.com/r/HOTEL_DEMO
- Partner Dashboard: https://b2b.tengerly.com/partner/HOTEL_DEMO

**Credentials:** admin / [see .env]

**Status:** ✅ Production Ready
