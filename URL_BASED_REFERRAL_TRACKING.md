# URL-Based Referral Tracking Implementation

## 🎯 Overview

The Partner Referral Program now uses **URL-based tracking** instead of cookies/localStorage for more reliable and transparent referral attribution.

## ✅ Why URL-Based Tracking is Better

### Previous Approach (Cookies/localStorage)
❌ Can be cleared by users  
❌ Blocked by privacy settings  
❌ Lost during incognito/private browsing  
❌ Not visible to users  
❌ Can expire unexpectedly  
❌ Doesn't work across devices  

### New Approach (URL Parameters)
✅ **Persistent**: Stays in URL throughout the session  
✅ **Transparent**: Users can see the referral code  
✅ **Shareable**: Users can copy/share the URL with ref intact  
✅ **Reliable**: Works in all browsers and privacy modes  
✅ **Debuggable**: Easy to test and verify  
✅ **Cross-device**: Can be sent via SMS/email  

## 🔧 How It Works

### 1. QR Code / Referral Link
```
User scans QR code or clicks link:
https://b2b.tengerly.com/r/HOTEL_DEMO
```

### 2. Redirect with URL Parameter
```
Automatically redirects to:
https://b2b.tengerly.com/commander?ref=HOTEL_DEMO
```

### 3. Referral Badge Display
- Green badge appears at top-right showing "Referral: HOTEL_DEMO"
- Badge reads from URL parameter (`?ref=HOTEL_DEMO`)
- User can click X to remove referral (removes URL parameter)

### 4. Order Placement
- User browses menu, adds items to cart
- Clicks checkout button
- Referral code is read from URL parameter
- Passed to API in request body

### 5. Order Attribution
- API receives referral code in request body
- Looks up partner by code
- Attaches `partnerId` to order
- Creates commission ledger automatically

## 📝 Implementation Details

### Files Modified

#### 1. `/app/r/[code]/page.tsx`
```typescript
// Before: Set cookie/localStorage
setReferralCode(p.code);
router.push('/commander');

// After: Redirect with URL parameter
router.push(`/commander?ref=${p.code}`);
```

#### 2. `/app/components/ReferralBadge.tsx`
```typescript
// Before: Read from localStorage
const refCode = getReferralCode();

// After: Read from URL
const searchParams = useSearchParams();
const refCode = searchParams.get('ref');
```

#### 3. `/app/components/CheckoutModal.tsx`
```typescript
// Before: Read from cookie
const referralCode = getReferralCode();

// After: Read from URL
const searchParams = useSearchParams();
const referralCode = searchParams.get('ref');

// Pass in request body
body: JSON.stringify({
  ...orderData,
  referralCode: referralCode || undefined
})
```

#### 4. `/app/api/orders/route.ts`
```typescript
// Before: Parse from cookies
const cookieHeader = request.headers.get('cookie');
const referralCode = getReferralCodeFromCookies(cookieHeader);

// After: Read from request body
const body = await request.json();
// body.referralCode is already included
const order = createOrder(body);
```

## 🧪 Testing

### Test 1: QR Code Scan
```bash
# Visit QR code URL
https://b2b.tengerly.com/r/HOTEL_DEMO

# Should redirect to:
https://b2b.tengerly.com/commander?ref=HOTEL_DEMO

# Verify:
✅ URL contains ?ref=HOTEL_DEMO
✅ Green badge shows "Referral: HOTEL_DEMO"
```

### Test 2: Direct Link
```bash
# Visit commander page with ref parameter
https://b2b.tengerly.com/commander?ref=COWORK_DEMO

# Verify:
✅ URL contains ?ref=COWORK_DEMO
✅ Green badge shows "Referral: COWORK_DEMO"
```

### Test 3: Order Placement
```bash
1. Visit: https://b2b.tengerly.com/commander?ref=HOTEL_DEMO
2. Add items to cart
3. Click checkout
4. Fill customer info
5. Submit order

# Verify in database:
cat /srv/apps/b2b/data/db.json | jq '.orders[-1]'

# Should show:
{
  "partnerId": "...",
  "partnerCodeSnapshot": "HOTEL_DEMO",
  "referralSource": "PARTNER_QR"
}
```

### Test 4: Clear Referral
```bash
1. Visit: https://b2b.tengerly.com/commander?ref=HOTEL_DEMO
2. Click X on green badge
3. Verify:
   ✅ URL becomes: https://b2b.tengerly.com/commander
   ✅ Badge disappears
```

### Test 5: URL Sharing
```bash
# User can share URL with referral intact
https://b2b.tengerly.com/commander?ref=HOTEL_DEMO

# Anyone who clicks this link will have the referral applied
# Works via:
- SMS
- Email
- WhatsApp
- Social media
- QR code
```

## 🔒 Security Considerations

### Validation
- Partner code is validated server-side before attribution
- Invalid codes are ignored (order created as DIRECT)
- Only active partners can receive referrals

### Tampering Prevention
```typescript
// In lib/db/orders.ts
if (referralCode) {
  const partner = getPartnerByCode(referralCode);
  if (partner && partner.isActive) {
    // Valid partner - apply referral
  } else {
    // Invalid/inactive - ignore referral
  }
}
```

### Privacy
- Referral code is visible in URL (by design)
- No sensitive customer data in URL
- Partner dashboards hide customer personal info

## 📊 Advantages for Different Stakeholders

### For Partners
✅ Can share referral links directly (not just QR codes)  
✅ Links work in emails, SMS, social media  
✅ Can track which channel works best  
✅ No technical knowledge required  

### For Customers
✅ Can see which partner referred them  
✅ Can remove referral if desired  
✅ No hidden tracking  
✅ Works on any device/browser  

### For Restaurant (Admin)
✅ Easy to debug referral issues  
✅ Can test by simply adding ?ref=CODE to URL  
✅ No cookie/localStorage troubleshooting  
✅ Reliable attribution  

### For Developers
✅ Simple implementation  
✅ Easy to test  
✅ No cookie parsing complexity  
✅ Works with SSR/SSG  
✅ No hydration issues  

## 🎯 Use Cases

### 1. Hotel Reception
```
Staff: "Scan this QR code to order sushi to your room"
URL: https://b2b.tengerly.com/r/HOTEL_DEMO
Result: Order attributed to hotel
```

### 2. Coworking Space Newsletter
```
Email: "Order lunch with 5% off using this link"
URL: https://b2b.tengerly.com/commander?ref=COWORK_DEMO
Result: Order attributed to coworking space
```

### 3. Office Manager
```
Slack: "Team lunch today! Order here: [link]"
URL: https://b2b.tengerly.com/commander?ref=OFFICE_DEMO
Result: All orders attributed to office
```

### 4. Social Media
```
Instagram post: "Order via link in bio"
URL: https://b2b.tengerly.com/r/SPA_DEMO
Result: Orders attributed to spa
```

## 🔄 Migration Notes

### Backward Compatibility
- Old cookie/localStorage code removed
- No migration needed (fresh start with URL approach)
- Existing orders in database unaffected

### Future Enhancements
- Add UTM parameters for campaign tracking
- Track referral source (QR vs link vs social)
- Add expiry to referral links (optional)
- Generate unique short links per partner

## 📈 Analytics Possibilities

With URL-based tracking, you can now:

1. **Track Channels**: See if QR codes or links perform better
2. **A/B Testing**: Test different landing pages with same ref code
3. **Campaign Tracking**: Add campaign IDs to URLs
4. **Conversion Funnels**: Track from click to order completion
5. **Share Analytics**: See how many times links are shared

Example enhanced URL:
```
https://b2b.tengerly.com/commander?ref=HOTEL_DEMO&source=qr&campaign=summer2026
```

## 🎉 Summary

The URL-based referral tracking system is:
- ✅ **More Reliable**: No cookie/localStorage issues
- ✅ **More Transparent**: Users can see the referral
- ✅ **More Flexible**: Works across devices and channels
- ✅ **Easier to Debug**: Just look at the URL
- ✅ **Better UX**: Users can control their referral status

This is a **production-ready** solution that solves the reliability issues of cookie/localStorage-based tracking while providing better transparency and user control.

---

**Last Updated**: February 15, 2026  
**Version**: 2.0.0 (URL-based)  
**Status**: ✅ Production Ready
