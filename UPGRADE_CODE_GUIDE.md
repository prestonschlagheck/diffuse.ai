# Upgrade Code User Guide

## Quick Reference

### 📋 All Upgrade Codes

| Plan Type | Plan Name | Code Required | Upgrade Code |
|-----------|-----------|---------------|--------------|
| Individual | Free | ❌ No | - |
| Individual | Pro | ✅ Yes (when upgrading) | `diffusepro` |
| Individual | Pro Max | ✅ Yes (when upgrading) | `diffusepromax` |
| Enterprise | Enterprise Pro | ❌ No | - |
| Enterprise | Enterprise Pro Max | ✅ Yes | `entpromax` |

**Note**: Downgrades never require a code. Only upgrades to higher tiers need verification.

---

## How to Upgrade

### Individual Plans

#### Step 1: Navigate to Subscription Page
- Go to **Dashboard** → **Subscription** (`/dashboard/subscription`)

#### Step 2: Choose Your Plan
- View the three individual plans: Free, Pro, Pro Max
- Click the **"Upgrade"** or **"Downgrade"** button on your desired plan

#### Step 3: Enter Upgrade Code (if upgrading)
- **If upgrading to a higher tier**:
  - A modal will appear asking for your upgrade code
  - Enter the code for your chosen plan:
    - **Pro**: Type `diffusepro`
    - **Pro Max**: Type `diffusepromax`
  - Codes are case-insensitive (DIFFUSEPRO works too!)
- **If downgrading to a lower tier**:
  - No code needed! Your plan changes immediately

#### Step 4: Upgrade/Downgrade Complete
- **For upgrades**: Click **"Upgrade"** button in the modal
- If the code is correct, you'll see a success message
- Your plan will be updated immediately
- The modal will close automatically

#### What if I enter the wrong code?
- You'll see an error: "Invalid upgrade code. Please check and try again."
- Simply re-enter the correct code
- Or click "Cancel" to close the modal

---

### Enterprise Plans (Organizations)

#### Step 1: Navigate to Organizations Page
- Go to **Dashboard** → **Organizations** (`/dashboard/organization`)

#### Step 2: Create New Organization
- Click the **"Create"** button
- Fill in your organization details:
  - Organization Name (required)
  - Description (optional)

#### Step 3: Select Plan
- Choose between two enterprise plans:
  - **Enterprise Pro** (50 projects, $100/mo)
  - **Enterprise Pro Max** (Unlimited projects, $500/mo)

#### Step 4: Code Verification (if needed)
- **Enterprise Pro**: No code needed! Organization creates immediately
- **Enterprise Pro Max**: Modal appears asking for upgrade code
  - Enter: `entpromax`
  - Click "Verify & Upgrade"

#### Step 5: Organization Created
- Success! Your organization is created
- You'll receive an invite code to share with team members
- You're automatically added as an admin

---

## Common Questions

### Q: Are the codes case-sensitive?
**A:** No! You can type `DIFFUSEPRO`, `DiffusePro`, or `diffusepro` - all work!

### Q: What if I don't have a code?
**A:** Contact your administrator or sales team to receive your upgrade code.

### Q: Can I downgrade without a code?
**A:** Yes! All downgrades (moving to a lower tier) never require a code. For example:
- Pro Max → Pro (no code)
- Pro Max → Free (no code)
- Pro → Free (no code)

### Q: Do codes expire?
**A:** Currently, codes do not expire. They work indefinitely.

### Q: Can I share my code with others?
**A:** These codes are meant to be distributed to authorized users. Check with your organization's policy.

### Q: What happens if I enter the wrong code multiple times?
**A:** You can try as many times as needed. There's no lockout period.

---

## Troubleshooting

### Modal won't close after entering code
- Make sure you clicked "Verify & Upgrade" not just "Cancel"
- Check that you entered the correct code
- Look for error messages in red text

### "Invalid upgrade code" error
- Double-check you're using the correct code for your plan
- Remove any extra spaces before/after the code
- Try typing it in lowercase

### Code works but plan didn't update
- Check for error messages at the top of the page
- Refresh the page to see if the update applied
- Check your browser console for errors

### Still having issues?
- Refresh the page and try again
- Clear your browser cache
- Contact support with details about the error

---

## For Administrators

### Distributing Codes
Share these codes with users who should have access to paid plans:
- Email the code directly
- Include in onboarding documentation
- Share during sales calls
- Add to internal wiki/knowledge base

### Changing Codes
To change upgrade codes, edit these files:
- Individual plans: `app/dashboard/subscription/page.tsx` (UPGRADE_CODES constant)
- Enterprise plans: `app/dashboard/organization/page.tsx` (ENTERPRISE_CODES constant)

### Monitoring Usage
Currently, code usage is not tracked. Consider adding analytics to monitor:
- How many times each code is used
- Failed verification attempts
- Which users are upgrading

---

## Technical Details

### Implementation
- Codes are verified client-side before database update
- Verification is case-insensitive
- No rate limiting (unlimited attempts)
- Modal component is reusable across different pages

### Security
- Codes are not encrypted (they're meant to be shared)
- No server-side validation (client-side only)
- Failed attempts don't trigger any database operations
- Successful verification immediately updates the database

---

**Last Updated**: January 30, 2026
**Version**: 1.0
