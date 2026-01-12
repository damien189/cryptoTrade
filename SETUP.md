# Setup Guide for CryptoTrade Platform

This guide will help you get the trading platform up and running.

## Step 1: Run Database Scripts

The platform needs database tables to function. Run these scripts in order:

### Script 1: Initialize Database Schema
Run `scripts/001_init_schema.sql` - This creates:
- Users table with balance tracking
- Portfolios table for crypto holdings  
- Transactions table for trade history
- Withdrawals table for withdrawal requests
- Row Level Security (RLS) policies to protect user data

### Script 2: Create User Trigger
Run `scripts/002_create_user_trigger.sql` - This automatically creates a user profile whenever someone signs up via Supabase Auth.

## Step 2: Create Your First Admin Account

You need at least one admin account to manage the platform. Here's how:

### Option A: Create via Database (Recommended for first admin)

1. Sign up through the platform at `/auth/login` (you'll need to confirm your email)
2. After email confirmation, run this SQL query in your database:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

3. Log out and log back in - you'll now have access to `/admin`

### Option B: Use Admin Panel (After first admin exists)

Once you have one admin account:
1. Log in to `/admin`
2. Click "Create User" button
3. Fill in email, password, role (admin), and initial balance
4. The new admin account is ready to use

## Step 3: Test the Platform

### As Admin:
1. Go to `/admin`
2. Create a test user with initial balance (e.g., $10,000)
3. View platform statistics
4. Test withdrawal approval workflow

### As User:
1. Log in with the test account
2. Go to `/dashboard` to see portfolio overview
3. Navigate to `/dashboard/trade` to:
   - View real-time crypto charts
   - Buy some cryptocurrency (e.g., $100 of Bitcoin)
4. Return to `/dashboard` to see your portfolio
5. Go to `/dashboard/withdraw` to request a withdrawal
6. Log back in as admin to approve/reject the withdrawal

## Key Features to Test

### User Features
- ✅ Portfolio value calculation (automatic)
- ✅ Real-time crypto prices (updates every 60 seconds)
- ✅ Interactive charts with multiple timeframes (1D, 7D, 30D, 90D)
- ✅ Buy crypto with USD balance
- ✅ Sell crypto back to USD
- ✅ Transaction history tracking
- ✅ Withdrawal requests with status tracking

### Admin Features  
- ✅ User creation with custom roles and balances
- ✅ Platform statistics dashboard
- ✅ Withdrawal approval/rejection
- ✅ User management overview

## Understanding the Database

### User Balance Flow
```
Initial Balance: $10,000
↓
Buy $1,000 BTC → Balance: $9,000, Portfolio: 0.02 BTC
↓
Sell $500 BTC → Balance: $9,500, Portfolio: 0.01 BTC
↓
Request Withdrawal $1,000 → Status: Pending
↓
Admin Approves → Balance: $8,500 (deducted)
```

### Portfolio Calculation
The system automatically calculates:
- Average purchase price per crypto
- Current value based on live prices
- Total portfolio value across all holdings

## Security Notes

1. **Row Level Security (RLS)**: All tables have RLS enabled
   - Users can only see their own data
   - Admins need explicit queries to view other users

2. **Email Confirmation**: By default, Supabase requires email confirmation
   - Users must confirm email before accessing the platform
   - Disable in Supabase settings if testing locally

3. **Password Requirements**: Supabase enforces minimum password strength

4. **Session Management**: Handled automatically by middleware in `proxy.ts`

## Troubleshooting

### "User not found" after signup
- Check if the trigger `on_auth_user_created` fired successfully
- Verify the user exists in `auth.users` table
- Manually insert into `users` table if needed:
```sql
INSERT INTO users (id, email, role, balance)
VALUES ('user-uuid-from-auth-users', 'email@example.com', 'user', 0);
```

### Charts not loading
- Verify internet connection (needs CoinGecko API access)
- Check browser console for API errors
- CoinGecko free tier has rate limits (50 calls/minute)

### Trades failing
- Ensure user has sufficient balance (for buys)
- Ensure user owns the crypto (for sells)
- Check that crypto price API is responding

### Withdrawals not appearing
- Verify RLS policies allow the user to insert
- Check user is authenticated (session exists)
- Confirm the withdrawal was created in database

## API Rate Limits

CoinGecko Free Tier:
- 50 calls per minute
- Prices refresh every 60 seconds
- Charts refresh every 5 minutes
- Should be sufficient for normal usage

## Next Steps

After setup, consider:
1. Adding more cryptocurrencies to the trading options
2. Implementing email notifications for withdrawals
3. Adding deposit functionality
4. Creating transaction fees
5. Building reporting and analytics
6. Adding KYC verification for compliance

## Support

For issues with:
- **Database**: Check Supabase logs and RLS policies
- **Authentication**: Review Supabase Auth settings
- **API**: Monitor CoinGecko API status
- **Trading**: Check transaction logs in database
