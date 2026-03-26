# Partner Referral Program - Complete Documentation

## Overview

The Partner Referral Program allows Sakura Sushi to create business partnerships with hotels, coworking spaces, offices, and other businesses. Partners can refer customers and earn commissions on orders.

## Features

### ✅ For Restaurant (Admin)
- Create and manage business partners
- Set custom commission rates (3%, 5%, 7%, 10%)
- Track partner performance (orders, revenue, commissions)
- Generate QR codes and referral links
- Create and manage payouts
- Export payout data for accounting
- View analytics dashboard

### ✅ For Partners
- Unique referral link and QR code
- Privacy-safe dashboard (no customer PII)
- Real-time metrics (orders, revenue, commissions)
- View recent orders and commission status
- Track pending and paid commissions

### ✅ For Customers
- Seamless referral attribution via links or QR codes
- 30-day cookie persistence
- Visual referral badge indicator
- No impact on ordering experience

## Quick Start

### 1. Seed Demo Data

```bash
npm run seed
```

This creates:
- 5 demo partners (HOTEL_DEMO, COWORK_DEMO, OFFICE_DEMO, SPA_DEMO, RES_DEMO)
- 5 sample orders (4 with partner attribution, 1 direct)
- Commission ledger entries

### 2. Access Admin Dashboard

**URL**: `https://b2b.tengerly.com/admin?key=demo123`

**Admin Key**: `demo123` (set in `.env.local`)

**Pages**:
- `/admin?key=demo123` - Overview dashboard
- `/admin/partners?key=demo123` - Manage partners
- `/admin/payouts?key=demo123` - Create and manage payouts

### 3. Test Referral Flow

**Step 1**: Visit referral link
```
https://b2b.tengerly.com/r/HOTEL_DEMO
```

**Step 2**: You'll be redirected to `/commander` with:
- Cookie set (30-day expiry)
- localStorage backup
- Green referral badge visible (top-right)

**Step 3**: Place an order
- Order will be automatically attributed to HOTEL_DEMO
- Commission calculated based on food subtotal
- Commission ledger entry created

**Step 4**: Check partner dashboard
```
https://b2b.tengerly.com/partner/HOTEL_DEMO
```

## Architecture

### Data Models

#### Partner
```typescript
{
  id: string;
  name: string;
  code: string; // unique, e.g., HOTEL_DEMO
  category: HOTEL | COWORKING | OFFICE | SPA | RESIDENCE | OTHER;
  commissionRateBps: number; // 500 = 5%, 700 = 7%
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Order (with referral fields)
```typescript
{
  id: string;
  status: PENDING | COMPLETED | CANCELLED;
  items: [...];
  
  // Referral attribution
  partnerId?: string;
  partnerCodeSnapshot?: string;
  referralSource: DIRECT | PARTNER_QR;
  
  // Financial breakdown
  foodSubtotal: number;
  discountTotal: number;
  deliveryFee: number;
  tip: number;
  totalAmount: number;
  
  createdAt: string;
  updatedAt: string;
}
```

#### CommissionLedger
```typescript
{
  id: string;
  partnerId: string;
  orderId: string; // unique
  baseAmount: number; // foodSubtotal
  rateBps: number;
  commissionAmount: number;
  status: PENDING | PAID | VOID;
  earnedAt: string;
  payoutId?: string;
  createdAt: string;
}
```

#### Payout
```typescript
{
  id: string;
  partnerId: string;
  periodStart: string;
  periodEnd: string;
  totalCommission: number;
  status: PENDING | PAID;
  paidAt?: string;
  createdAt: string;
}
```

### Referral Attribution Logic

1. **User visits referral link**: `/r/PARTNER_CODE`
2. **Code stored**: Cookie + localStorage (30-day expiry)
3. **Last ref wins**: New referral overwrites existing
4. **Order creation**: Referral code attached from cookie
5. **Partner lookup**: Active partner found by code
6. **Attribution**: Order linked to partner
7. **Commission**: Auto-calculated on order completion

### Commission Calculation

```
Example Order:
- Food Subtotal: €50.00
- Discount: -€5.00
- Delivery Fee: €3.00
- Tip: €2.00
- Total: €50.00

Partner Commission (7% rate):
- Base Amount: €50.00 (food subtotal only)
- Rate: 700 BPS (7%)
- Commission: €50.00 × 0.07 = €3.50
```

**Important**: Commission is calculated on `foodSubtotal` only, excluding:
- Discounts
- Delivery fees
- Tips

## API Endpoints

### Public APIs

#### Get Partner Data
```
GET /api/partner/[code]
Response: { partner, metrics, recentOrders }
```

#### Generate QR Code
```
GET /api/qr?code=PARTNER_CODE
Response: PNG image
```

#### Create Order
```
POST /api/orders
Body: { items, customerName, ... }
Headers: Cookie with referral code
Response: Order with partner attribution
```

### Admin APIs (require ?key=demo123)

#### List Partners
```
GET /api/partners?key=demo123
Response: Partner[] with metrics
```

#### Create Partner
```
POST /api/partners?key=demo123
Body: { name, code, category, commissionRateBps, isActive }
```

#### Update Partner
```
PATCH /api/partners?key=demo123
Body: { id, ...updates }
```

#### Get Admin Overview
```
GET /api/admin/overview?key=demo123
Response: { overview, topPartners }
```

#### List Payouts
```
GET /api/payouts?key=demo123
Response: Payout[]
```

#### Create Payout
```
POST /api/payouts?key=demo123
Body: { partnerId, periodStart, periodEnd }
```

#### Mark Payout as Paid
```
PATCH /api/payouts?key=demo123
Body: { id }
```

## File Structure

```
/srv/apps/b2b/
├── lib/
│   ├── db/
│   │   ├── types.ts              # Data models
│   │   ├── storage.ts            # File-based DB
│   │   ├── partners.ts           # Partner CRUD
│   │   ├── orders.ts             # Order operations
│   │   ├── commissions.ts        # Commission & payout logic
│   │   └── analytics.ts          # Metrics & reporting
│   ├── referral.ts               # Referral tracking utilities
│   └── admin-auth.ts             # Simple admin authentication
├── app/
│   ├── api/
│   │   ├── qr/route.ts           # QR code generation
│   │   ├── partners/route.ts     # Partner management
│   │   ├── orders/route.ts       # Order creation
│   │   ├── payouts/route.ts      # Payout management
│   │   ├── partner/[code]/route.ts # Partner data
│   │   └── admin/overview/route.ts # Admin metrics
│   ├── admin/
│   │   ├── page.tsx              # Admin overview
│   │   ├── partners/page.tsx     # Partner management
│   │   └── payouts/page.tsx      # Payout management
│   ├── partner/[code]/page.tsx   # Partner dashboard
│   ├── r/[code]/page.tsx         # Referral redirect
│   └── components/
│       └── ReferralBadge.tsx     # Referral indicator
├── scripts/
│   └── seed.ts                   # Database seeding
├── data/
│   └── db.json                   # JSON database (auto-created)
└── .env.local                    # Environment variables
```

## Testing Guide

### Test 1: Referral Attribution

1. Clear cookies/localStorage
2. Visit: `https://b2b.tengerly.com/r/HOTEL_DEMO`
3. Verify:
   - Redirected to `/commander`
   - Green "Referral: HOTEL_DEMO" badge appears (top-right)
4. Place an order
5. Check admin dashboard to see order attributed to partner

### Test 2: Partner Dashboard

1. Visit: `https://b2b.tengerly.com/partner/HOTEL_DEMO`
2. Verify:
   - Partner name and metrics displayed
   - Referral link and QR code available
   - Recent orders shown (no customer PII)
   - Commission amounts visible

### Test 3: Admin - Create Partner

1. Visit: `https://b2b.tengerly.com/admin/partners?key=demo123`
2. Click "New Partner"
3. Fill form:
   - Name: "Test Hotel"
   - Code: "TEST_HOTEL"
   - Category: HOTEL
   - Commission: 7%
   - Active: Yes
4. Submit
5. Verify partner appears in list with referral link

### Test 4: Admin - Create Payout

1. Visit: `https://b2b.tengerly.com/admin/payouts?key=demo123`
2. Click "Create Payout"
3. Select partner and date range
4. Submit
5. Verify payout created with correct total
6. Click "Mark Paid"
7. Verify status changes and ledgers updated

### Test 5: Multiple Referrals (Last Ref Wins)

1. Visit: `https://b2b.tengerly.com/r/HOTEL_DEMO`
2. Badge shows "HOTEL_DEMO"
3. Visit: `https://b2b.tengerly.com/r/SPA_DEMO`
4. Badge now shows "SPA_DEMO" (overwrites previous)
5. Place order - should be attributed to SPA_DEMO

## Demo Partners

| Name | Code | Category | Commission | Referral Link |
|------|------|----------|------------|---------------|
| Grand Hotel Paris | HOTEL_DEMO | HOTEL | 7% | `/r/HOTEL_DEMO` |
| CoWork Central | COWORK_DEMO | COWORKING | 5% | `/r/COWORK_DEMO` |
| Tech Office Tower | OFFICE_DEMO | OFFICE | 5% | `/r/OFFICE_DEMO` |
| Zen Spa & Wellness | SPA_DEMO | SPA | 7% | `/r/SPA_DEMO` |
| Luxury Residence | RES_DEMO | RESIDENCE | 5% | `/r/RES_DEMO` |

## Admin Access

**Admin Dashboard**: `https://b2b.tengerly.com/admin?key=demo123`

**Default Admin Key**: `demo123`

To change the admin key, update `.env.local`:
```
DEMO_ADMIN_KEY=your_secure_key_here
```

## Commission Rates

Available rates:
- **3%** (300 BPS)
- **5%** (500 BPS) - Default for offices/coworking
- **7%** (700 BPS) - Default for hotels/spas
- **10%** (1000 BPS)

BPS = Basis Points (1 BPS = 0.01%)

## Privacy & Security

### Partner Dashboard Privacy
- ✅ NO customer names displayed
- ✅ NO phone numbers displayed
- ✅ NO email addresses displayed
- ✅ NO delivery addresses displayed
- ✅ Only shows: order ID (short), date, amount, commission

### Admin Authentication
- Simple query parameter protection (`?key=demo123`)
- For production: Replace with proper authentication (NextAuth, Clerk, etc.)

### Data Storage
- MVP: JSON file (`data/db.json`)
- Production: Migrate to Prisma + PostgreSQL

## Troubleshooting

### Referral badge not showing
- Check browser console for errors
- Verify cookie is set: DevTools > Application > Cookies
- Check localStorage: `sakura_ref_code`

### Partner not found
- Verify partner code is correct (case-insensitive)
- Check partner is active: Admin > Partners
- Run seed script if database is empty

### Commission not calculated
- Verify order has `partnerId` set
- Check order status is `COMPLETED`
- Verify commission ledger created: Check `data/db.json`

### Admin access denied
- Verify URL includes `?key=demo123`
- Check `.env.local` has `DEMO_ADMIN_KEY`
- Restart server after changing `.env.local`

## Production Deployment Checklist

- [ ] Replace JSON storage with Prisma + PostgreSQL
- [ ] Implement proper admin authentication
- [ ] Add email notifications for payouts
- [ ] Add partner onboarding flow
- [ ] Implement payout approval workflow
- [ ] Add detailed analytics and reporting
- [ ] Add partner API webhooks
- [ ] Implement fraud detection
- [ ] Add rate limiting to APIs
- [ ] Set up monitoring and alerts

## Support

For questions or issues:
- Check `data/db.json` for data inspection
- Review browser console for client-side errors
- Check server logs for API errors
- Re-run seed script to reset demo data: `npm run seed`

## Next Steps

1. Test all referral flows
2. Customize commission rates per partner
3. Create real partner accounts
4. Print QR codes for partner locations
5. Monitor performance and optimize

---

**Built with**: Next.js 16, TypeScript, React 19, Tailwind CSS 4
**Demo Site**: https://b2b.tengerly.com
**Admin Access**: https://b2b.tengerly.com/admin?key=demo123
