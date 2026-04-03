
Searched for "public_key"
Searched for "CREATE TABLE payment_gateway_configs"
Searched for "VITE_STRIPE_PUBLIC_KEY"
Searched for "VITE_PAYSTACK_PUBLIC_KEY"

That is a brilliant question! Let's break down how this works at an enterprise level.

Currently, the `VITE_STRIPE_PUBLIC_KEY` and `VITE_PAYSTACK_PUBLIC_KEY` live inside the `.env` file because they must be shipped to the frontend (the browser needs them to safely load the Stripe Elements or Paystack pop-ups during checkout). 

**Is a Public Key required in the Admin Configuration?**
Ideally, **YES**! 

If we only put the *Secret Key* in the Admin Config, then whenever an administrator wants to switch their Stripe or Paystack account (for example, moving from a test account to a live account), they can easily do so in the dashboard. **However**, the checkout would instantly break because the frontend would still be trying to use the old *Public Key* from the `.env` file! To fix it, the admin would have to modify the `.env` file and rebuild the app—which entirely defeats the purpose of having a dynamic admin dashboard.

**How we can make this Enterprise-Grade:**
To make the system truly dynamic, we can move the Public Key out of the `.env` file and into the Admin Configuration Database as well! Here is what we would do:
1. Add a **"Public / Publishable Key" field** right above the "Secret Key" in your `SettingsPage.tsx` Gateway Config cards.
2. Store the Public Key in the database next to the Secret Key.
3. Create a public API endpoint (`GET /api/config/gateways`) that the frontend fetches when a customer lands on the Checkout page.
4. The `CheckoutPage.tsx` uses this dynamic Public Key instead of looking at the `.env` file. 



# Dynamic Public Key Administration

This plan will migrate the handling of Stripe and Paystack Public Keys out of hardcoded `.env` files and into the database. This allows administrators to seamlessly change their payment environments (test vs live) purely via the Admin Settings dashboard without ever needing to touch code or rebuild the application.

## User Review Required

> [!IMPORTANT]
> Because the Public Key must be loaded instantly during checkout, I will refactor the internal state of `CheckoutPage.tsx` to initialize Stripe/Paystack dynamically based on the configuration fetched from the backend. 
> Please review the migration steps and let me know if this plan is good to proceed.

## Proposed Changes

### Database Migration
#### [NEW] `server/src/migrations/013_add_public_key_to_gateways.sql`
- Add an `ALTER TABLE payment_gateway_configs ADD COLUMN public_key TEXT NOT NULL DEFAULT '';` statement.

### Backend Changes

#### [MODIFY] `server/src/types/paymentGatewayConfig.types.ts`
- Add `public_key`, `has_public_key`, and `masked_public_key` to all Data Transfer Objects and interfaces.

#### [MODIFY] `server/src/models/paymentGatewayConfigModel.ts`
- Include `public_key` in the `update()` handler bindings.

#### [MODIFY] `server/src/controllers/admin/adminSettingsController.ts`
- Update `toSafeGateway` and the `updatePaymentGatewayConfig` handler to accept, mask, and output `public_key`.

#### [MODIFY] `server/src/controllers/public/paymentController.ts` 
*(or similar existing controller returning `getGatewayStatus`)*
- Rather than returning purely boolean values indicating availability, we will return the strict `public_key` strings for any enabled gateway.

### Frontend Changes

#### [MODIFY] `client/src/types/settings.types.ts`
- Define updating types to include `public_key` and `masked_public_key`.

#### [MODIFY] `client/src/api/payments.api.ts`
- Adjust the return type of `getGatewayStatus` to return an object mapping `{ stripe: { enabled: boolean, publicKey: string }, paystack: { enabled: boolean, publicKey: string } }`

#### [MODIFY] `client/src/pages/admin/SettingsPage.tsx`
- Add an input node explicitly for **Public Key** above the **Secret Key**. Provide masking via placeholder identically to secrets.

#### [MODIFY] `client/src/pages/public/CheckoutPage.tsx`
- Remove `.env`-based loading of Stripe. Load Stripe purely async `loadStripe(stripePublicKey)` once the backend dictates the gateway status.

#### [MODIFY] `client/src/utils/constants.ts`
- Remove `VITE_STRIPE_PUBLIC_KEY` and `VITE_PAYSTACK_PUBLIC_KEY` logic as it is superseded by the database. 

## Open Questions

None. This strictly standardizes the settings panel behavior.

## Verification Plan

### Automated Tests
- Restart backend docker container to run the migrations.

### Manual Verification
1. Open Admin Settings.
2. Edit Stripe & Paystack Public/Secret keys. They should be successfully obfuscated on save.
3. Add a product to the cart and view the checkout. Checkout will ping the gateway endpoint to safely retrieve the public configurations.
4. Verify Stripe Elements correctly mount without error.
