# Referral Tracking: Cookie/localStorage vs URL-Based

## Quick Comparison

| Feature | Cookie/localStorage | URL-Based | Winner |
|---------|-------------------|-----------|---------|
| **Reliability** | ❌ Can be cleared/blocked | ✅ Always present in URL | **URL** |
| **Privacy Mode** | ❌ Often blocked | ✅ Works everywhere | **URL** |
| **Transparency** | ❌ Hidden from user | ✅ Visible in URL | **URL** |
| **Shareability** | ❌ Lost when sharing | ✅ Preserved in shared links | **URL** |
| **Cross-device** | ❌ Device-specific | ✅ Works on any device | **URL** |
| **Debugging** | ❌ Need dev tools | ✅ Just look at URL | **URL** |
| **Expiry** | ❌ Can expire unexpectedly | ✅ Persists in session | **URL** |
| **User Control** | ❌ Hard to clear | ✅ Easy to remove (click X) | **URL** |

## Real-World Scenarios

### Scenario 1: Safari Private Browsing
```
Cookie/localStorage: ❌ FAILS - Cookies blocked
URL-Based:          ✅ WORKS - URL parameter preserved
```

### Scenario 2: User Shares Link via WhatsApp
```
Cookie/localStorage: ❌ FAILS - Referral lost
URL-Based:          ✅ WORKS - Referral included in shared URL
```

### Scenario 3: User Clears Browser Data
```
Cookie/localStorage: ❌ FAILS - Data cleared
URL-Based:          ✅ WORKS - URL unaffected
```

### Scenario 4: User Switches Devices
```
Cookie/localStorage: ❌ FAILS - Different device
URL-Based:          ✅ WORKS - Can send URL to self
```

### Scenario 5: Browser Extensions Block Cookies
```
Cookie/localStorage: ❌ FAILS - Blocked by extension
URL-Based:          ✅ WORKS - URL always works
```

## Technical Implementation

### Cookie/localStorage Approach (OLD)
```typescript
// Set referral
setReferralCode(code) {
  // Set cookie
  document.cookie = `sakura_ref=${JSON.stringify({code, timestamp: Date.now()})}; max-age=2592000`;
  // Set localStorage
  localStorage.setItem('sakura_ref', JSON.stringify({code, timestamp: Date.now()}));
}

// Get referral
getReferralCode() {
  // Try localStorage first
  const stored = localStorage.getItem('sakura_ref');
  if (stored) {
    const data = JSON.parse(stored);
    if (Date.now() - data.timestamp < 30 * 24 * 60 * 60 * 1000) {
      return data.code;
    }
  }
  // Fallback to cookie parsing...
  return null;
}

// Issues:
// - Complex cookie parsing
// - Expiry management
// - Sync between cookie and localStorage
// - Privacy mode failures
```

### URL-Based Approach (NEW)
```typescript
// Redirect with referral
router.push(`/commander?ref=${code}`);

// Get referral
const searchParams = useSearchParams();
const referralCode = searchParams.get('ref');

// Benefits:
// - Simple and clean
// - No expiry management
// - No storage needed
// - Always works
```

## User Experience

### Cookie/localStorage (OLD)
```
1. User scans QR code
2. Cookie set (invisible to user)
3. User browses menu
4. User places order
5. ❓ Did referral work? User can't tell
```

### URL-Based (NEW)
```
1. User scans QR code
2. URL shows ?ref=HOTEL_DEMO (visible)
3. Green badge confirms "Referral: HOTEL_DEMO"
4. User browses menu (ref stays in URL)
5. User places order
6. ✅ User knows referral is active
```

## Partner Benefits

### Cookie/localStorage (OLD)
```
Partner: "Scan this QR code"
Customer: *scans, cookies blocked*
Result: ❌ No referral attribution
Partner: ❓ Why am I not getting commissions?
```

### URL-Based (NEW)
```
Partner: "Use this link: b2b.tengerly.com/r/HOTEL_DEMO"
Customer: *clicks, sees ref in URL*
Result: ✅ Referral works reliably
Partner: ✅ Gets commission as expected
```

## Marketing Use Cases

### Email Campaign
```
Cookie/localStorage: ❌ Link doesn't preserve referral
URL-Based:          ✅ Link includes ?ref=CODE
```

### Social Media
```
Cookie/localStorage: ❌ Can't track which post worked
URL-Based:          ✅ Can add ?ref=CODE&source=instagram
```

### SMS Marketing
```
Cookie/localStorage: ❌ SMS link loses referral
URL-Based:          ✅ SMS link preserves referral
```

### QR Code on Flyer
```
Cookie/localStorage: ❌ Works, but user can't verify
URL-Based:          ✅ Works + user sees confirmation
```

## Analytics & Tracking

### Cookie/localStorage (OLD)
```
- Can't track link shares
- Can't see referral source
- Hard to debug issues
- No visibility into funnel
```

### URL-Based (NEW)
```
- Track link shares (URL analytics)
- Add source parameter (?source=email)
- Easy debugging (just check URL)
- Full funnel visibility
```

## Security

### Cookie/localStorage (OLD)
```
Risks:
- Cookie theft
- XSS attacks on localStorage
- CSRF if not properly protected
```

### URL-Based (NEW)
```
Risks:
- URL tampering (mitigated by server-side validation)
- Referral code visible (not sensitive data)

Benefits:
- No cookie security concerns
- No localStorage XSS risk
- Server validates all codes
```

## Migration Path

### From Cookie/localStorage to URL-Based
```
1. Remove cookie/localStorage code ✅
2. Update redirect to use URL parameter ✅
3. Update badge to read from URL ✅
4. Update checkout to read from URL ✅
5. Update API to accept code in body ✅
6. Test all scenarios ✅
7. Deploy ✅
```

No data migration needed - fresh start with better approach!

## Conclusion

**URL-based tracking is superior in every way:**

✅ **More Reliable**: Works in all browsers and privacy modes  
✅ **More Transparent**: Users can see and control referral  
✅ **More Flexible**: Works across devices and channels  
✅ **Easier to Debug**: Just look at the URL  
✅ **Better for Marketing**: Links are shareable with ref intact  
✅ **Simpler Code**: Less complexity, fewer edge cases  

**Recommendation**: ✅ **Use URL-based tracking for production**

---

**Decision**: URL-based tracking implemented  
**Date**: February 15, 2026  
**Status**: ✅ Production Ready
