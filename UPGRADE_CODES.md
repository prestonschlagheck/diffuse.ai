# Upgrade Code System

## Overview
Users now need to enter a verification code when upgrading to paid plans. This prevents unauthorized plan changes and provides a gating mechanism for premium features.

## Upgrade Codes

### Individual Plans (Subscription Page)
- **Free**: No code required
- **Pro**: `diffusepro` (only when upgrading from Free)
- **Pro Max**: `diffusepromax` (only when upgrading from Free or Pro)
- **Downgrades**: No code required (e.g., Pro Max → Pro or Pro → Free)

### Enterprise Plans (Organization Page)
- **Enterprise Pro**: No code required
- **Enterprise Pro Max**: `entpromax`

## How It Works

### For Individual Plans (`/dashboard/subscription`)
1. User clicks "Upgrade" or "Downgrade" button on a plan
2. **If upgrading** (moving to a higher tier):
   - A modal appears asking for an upgrade code
   - User enters the code (case-insensitive)
   - If valid, the subscription is upgraded
   - If invalid, an error message is shown
3. **If downgrading** (moving to a lower tier):
   - No code required
   - Subscription changes immediately

### For Enterprise Plans (`/dashboard/organization`)
1. User fills out organization creation form
2. User selects a plan (Enterprise Pro or Enterprise Pro Max)
3. **For Enterprise Pro**: No code required, organization is created immediately
4. **For Enterprise Pro Max**: 
   - Modal appears asking for upgrade code
   - User enters code `entpromax` (case-insensitive)
   - If valid, organization is created with the selected plan
   - If invalid, an error message is shown

## Implementation Details

### Files Modified
1. **`components/dashboard/UpgradeCodeModal.tsx`** (NEW)
   - Reusable modal component for code verification
   - Handles input validation and error display
   - Shows loading states during verification

2. **`app/dashboard/subscription/page.tsx`**
   - Added upgrade code verification for individual plans
   - Codes stored in `UPGRADE_CODES` constant
   - Modal triggered when upgrading to Pro or Pro Max

3. **`app/dashboard/organization/page.tsx`**
   - Added upgrade code verification for enterprise plans
   - Codes stored in `ENTERPRISE_CODES` constant
   - Modal triggered when creating org with Pro Max plan

### Code Structure

```typescript
// Upgrade codes are defined as constants
const UPGRADE_CODES: Record<SubscriptionTier, string> = {
  free: '',
  pro: 'diffusepro',
  pro_max: 'diffusepromax',
}

// Tier hierarchy for upgrade/downgrade detection
const getTierValue = (tier: SubscriptionTier): number => {
  const tierValues: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    pro_max: 2,
  }
  return tierValues[tier] || 0
}

// Only require code for upgrades
if (newTierValue > currentTierValue) {
  // Show modal for code verification
}

// Verification is case-insensitive
if (code.toLowerCase() !== expectedCode.toLowerCase()) {
  return false
}
```

## User Experience

### Success Flow
1. User clicks upgrade button
2. Modal appears with clean, focused UI
3. User enters code
4. Code is verified (case-insensitive)
5. Modal closes automatically
6. Success message appears
7. Plan is updated

### Error Flow
1. User clicks upgrade button
2. Modal appears
3. User enters incorrect code
4. Error message displays: "Invalid upgrade code. Please check and try again."
5. User can try again or cancel
6. Modal stays open until valid code or cancel

## Security Notes
- Codes are case-insensitive for better UX
- Codes are stored in frontend (not sensitive since they're meant to be shared)
- Verification happens before database update
- Failed attempts don't trigger any database changes

## Testing

### Test Individual Plans
1. Go to `/dashboard/subscription`
2. Try upgrading to Pro with code: `diffusepro`
3. Try upgrading to Pro Max with code: `diffusepromax`
4. Try invalid codes to see error handling

### Test Enterprise Plans
1. Go to `/dashboard/organization`
2. Click "Create" organization
3. Select "Enterprise Pro" - should create without code
4. Select "Enterprise Pro Max" - should ask for code `entpromax`

## Future Enhancements
- Add code expiration dates
- Track code usage/redemptions
- Generate unique codes per user
- Add admin panel to manage codes
- Send codes via email
- Add rate limiting for failed attempts
