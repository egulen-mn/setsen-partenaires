# Partner Referral Program - Complete Demo Guide

## 🎯 Overview

The Partner Referral Program is now **fully functional** with end-to-end order tracking, commission calculation, and dashboards.

## 🚀 Quick Demo Flow

### 1. Scan QR Code (or Click Referral Link)

**Option A: QR Code**
- View QR code at: https://b2b.tengerly.com/admin/partners (after login)
- Or generate directly: https://b2b.tengerly.com/api/qr?code=HOTEL_DEMO

**Option B: Direct Link**
- https://b2b.tengerly.com/r/HOTEL_DEMO
- https://b2b.tengerly.com/r/COWORK_DEMO
- https://b2b.tengerly.com/r/OFFICE_DEMO
- https://b2b.tengerly.com/r/SPA_DEMO
- https://b2b.tengerly.com/r/RES_DEMO

### 2. Referral Tracking (URL-Based)

When a user clicks a referral link:
1. ✅ User is redirected to `/commander?ref=HOTEL_DEMO` (referral code in URL)
2. ✅ A green badge appears showing "Referral: HOTEL_DEMO"
3. ✅ Referral code stays in URL throughout the session
4. ✅ User can clear the referral by clicking the X button (removes URL parameter)
5. ✅ **More reliable** than cookies - works in all browsers and privacy modes

### 3. Place an Order

1. Go to https://b2b.tengerly.com/commander
2. Add items to cart (e.g., Menu Sakura €22.50)
3. Click "Passer la commande" (Checkout)
4. Fill in customer information:
   - Name
   - Phone
   - Email
5. Click "Confirmer la commande"
6. ✅ Order is created with partner attribution
7. ✅ Commission is automatically calculated and recorded

### 4. View Results

**Partner Dashboard** (Public - No login required)
- https://b2b.tengerly.com/partner/HOTEL_DEMO
- Shows:
  - ✅ Orders (30 days): 4 orders
  - ✅ Revenue Generated: €239.00
  - ✅ Pending Commission: €16.74 (7%)
  - ✅ Recent orders list (without customer personal data)
  - ✅ Referral link and QR code

**Admin Dashboard** (Login required)
- https://b2b.tengerly.com/admin/login
- Credentials: `admin` / `demo123`
- Shows:
  - ✅ Total orders overview (direct vs partner)
  - ✅ Revenue breakdown
  - ✅ Commission summary (pending/paid)
  - ✅ Top partners by performance

**Partner Management**
- https://b2b.tengerly.com/admin/partners
- ✅ Create/edit partners
- ✅ Set commission rates (5% or 7%)
- ✅ View partner metrics
- ✅ Copy referral links
- ✅ View QR codes

**Payout Management**
- https://b2b.tengerly.com/admin/payouts
- ✅ Create payouts for specific periods
- ✅ Mark payouts as paid
- ✅ Export for accounting

## 📊 Demo Data

### Partners (5 total)

| Code | Name | Category | Commission Rate | Orders | Revenue | Commission |
|------|------|----------|----------------|--------|---------|------------|
| HOTEL_DEMO | Grand Hotel Paris | Hotel | 7% | 4 | €239.00 | €16.74 |
| COWORK_DEMO | CoWork Central | Coworking | 5% | 2 | €137.50 | €6.88 |
| SPA_DEMO | Zen Spa & Wellness | Spa | 7% | 2 | €104.00 | €7.28 |
| OFFICE_DEMO | Tech Office Tower | Office | 5% | 0 | €0.00 | €0.00 |
| RES_DEMO | Luxury Residence | Residence | 5% | 0 | €0.00 | €0.00 |

### Sample Orders (10 total)

- 8 orders via partner referrals
- 2 direct orders (no referral)
- All orders are marked as COMPLETED
- Commission ledgers automatically created for partner orders

## 🔧 Technical Details

### Referral Attribution Logic

1. **URL Parameter**: Referral code stored in URL query parameter (`?ref=HOTEL_DEMO`)
2. **Persistent**: Stays in URL throughout the ordering session
3. **Order Creation**: Partner ID attached at checkout if valid referral exists in URL
4. **Commission Calculation**: 
   - Base: Food subtotal (excludes delivery, tips, discounts)
   - Rate: Partner's commission rate in basis points (500 = 5%, 700 = 7%)
   - Formula: `commission = foodSubtotal * (rateBps / 10000)`

### Commission Statuses

- **PENDING**: Commission earned but not yet paid
- **PAID**: Commission has been paid to partner
- **VOID**: Order was cancelled, commission voided

### Privacy Protection

Partner dashboards show:
- ✅ Order ID (shortened)
- ✅ Date/time
- ✅ Order value
- ✅ Commission amount
- ❌ Customer name (hidden)
- ❌ Customer phone (hidden)
- ❌ Customer email (hidden)
- ❌ Delivery address (hidden)

## 🎨 Internationalization

All interfaces support 4 languages:
- 🇫🇷 **French** (default)
- 🇬🇧 English
- 🇩🇪 German
- 🇨🇭 Swiss German

Language selector available on:
- Main website
- Order page
- Admin dashboard
- Partner dashboard

## 🧪 Testing Scenarios

### Scenario 1: New Partner Order
1. Visit https://b2b.tengerly.com/r/OFFICE_DEMO
2. Verify URL redirects to: https://b2b.tengerly.com/commander?ref=OFFICE_DEMO
3. Verify green badge shows "Referral: OFFICE_DEMO"
4. Add items to cart
5. Complete checkout
6. Check https://b2b.tengerly.com/partner/OFFICE_DEMO
7. ✅ Should show 1 new order

### Scenario 2: URL Parameter Persistence
1. Visit https://b2b.tengerly.com/r/HOTEL_DEMO
2. URL becomes: https://b2b.tengerly.com/commander?ref=HOTEL_DEMO
3. Badge shows "Referral: HOTEL_DEMO"
4. Browse menu (ref stays in URL)
5. Place order
6. ✅ Order attributed to HOTEL_DEMO

### Scenario 3: Direct Order (No Referral)
1. Go directly to https://b2b.tengerly.com/commander (no ?ref parameter)
2. No referral badge shown
3. Place order
4. ✅ Order marked as DIRECT (no partner attribution)

### Scenario 4: Commission Calculation
1. Place order via HOTEL_DEMO (7% rate)
2. Order total: €50.00 food
3. ✅ Commission: €3.50 (50 * 0.07)
4. Check admin dashboard
5. ✅ Pending commission increases by €3.50

### Scenario 5: Payout Process
1. Login to admin: https://b2b.tengerly.com/admin/login
2. Go to Payouts: https://b2b.tengerly.com/admin/payouts
3. Create payout for HOTEL_DEMO (previous month)
4. ✅ Shows total pending commission
5. Mark as paid
6. ✅ Ledger entries updated to PAID status
7. ✅ Partner dashboard shows increased "Total Paid"

## 📱 QR Code Usage

### For Partners
1. Generate QR code: https://b2b.tengerly.com/api/qr?code=PARTNER_CODE
2. Download/print QR code
3. Display in:
   - Hotel reception
   - Coworking space entrance
   - Office lobby
   - Spa waiting area
   - Residence common areas

### QR Code Specifications
- Format: PNG image
- Size: 300x300 pixels
- Colors: Red (#c8102e) on white
- Margin: 2 modules
- Encodes: Full referral URL (https://b2b.tengerly.com/r/PARTNER_CODE)

## 🔐 Admin Access

**Login Page**: https://b2b.tengerly.com/admin/login

**Credentials**:
- Username: `admin`
- Password: `demo123`

**Protected Routes**:
- `/admin` - Dashboard overview
- `/admin/partners` - Partner management
- `/admin/payouts` - Payout management
- `/api/admin/*` - Admin API endpoints
- `/api/partners` - Partner CRUD operations
- `/api/payouts` - Payout operations

**Session Management**:
- HTTP-only cookie: `admin_session`
- Auto-logout on session expiry
- Logout button in admin header

## 📈 Metrics & Analytics

### Admin Dashboard Metrics
- Total orders (30 days)
- Direct vs Partner orders
- Total revenue (30 days)
- Pending commission (all time)
- Paid commission (all time)
- Top partners by orders

### Partner Dashboard Metrics
- Orders (30 days)
- Revenue generated (30 days)
- Pending commission
- Total paid
- Recent orders (last 20)

## 🎉 Success Indicators

✅ **Referral Tracking**: Cookie/localStorage working, badge displays  
✅ **Order Attribution**: Partner ID correctly attached to orders  
✅ **Commission Calculation**: Accurate calculation based on food subtotal  
✅ **Commission Ledger**: Auto-created on order completion  
✅ **Admin Dashboard**: Real-time metrics and overview  
✅ **Partner Dashboard**: Privacy-safe order visibility  
✅ **QR Code Generation**: PNG images with correct URLs  
✅ **Payout Management**: Create and mark payouts as paid  
✅ **Internationalization**: 4 languages fully translated  
✅ **Checkout Flow**: Complete order submission with customer info  

## 🚀 Next Steps (Future Enhancements)

- [ ] Email notifications for partners on new orders
- [ ] Automated monthly payout reports
- [ ] Partner performance analytics (conversion rates)
- [ ] Custom commission rates per partner
- [ ] Partner login with secure authentication
- [ ] Export orders to CSV/Excel
- [ ] Integration with payment processors
- [ ] Mobile app for partners
- [ ] Real-time order notifications
- [ ] Multi-currency support

## 📞 Support

For questions or issues:
- Check the main README: `/srv/apps/b2b/PARTNER_REFERRAL_README.md`
- Review technical documentation: `/srv/apps/b2b/DEMO_COMPLETE.md`
- Contact: admin@tengerly.com

---

**Last Updated**: February 15, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
