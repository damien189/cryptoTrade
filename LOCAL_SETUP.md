# Running CryptoTrade Locally

This guide will help you run the trading platform on your local machine.

## Prerequisites

Before you start, make sure you have:
- Node.js 18+ installed
- A Supabase account (free tier works)
- Git (to clone or download the project)

## Step 1: Download the Project

From v0.app:
1. Click the three dots (⋯) in the top right of the code block
2. Select "Download ZIP"
3. Extract the ZIP file to your desired location
4. Open the folder in your code editor (VS Code, etc.)

Or use the shadcn CLI:
```bash
npx shadcn@latest init
```

## Step 2: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Supabase, Recharts, and more.

## Step 3: Set Up Environment Variables

Create a `.env.local` file in the root of your project with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (Supabase Postgres)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
```

### Where to Find These Values:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
   - Copy `Project URL` → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → Use as `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Settings** → **Database**
   - Scroll to **Connection string**
   - Copy the connection strings and paste them into the corresponding variables

## Step 4: Initialize the Database

You need to run the SQL scripts to create the database tables:

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Open `scripts/001_init_schema.sql` from your project
5. Copy and paste the entire content into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`
7. Repeat for `scripts/002_create_user_trigger.sql`

This creates:
- Users table
- Portfolios table  
- Transactions table
- Withdrawals table
- Security policies (RLS)
- Auto-profile creation trigger

## Step 5: Generate Prisma Client

After the database is set up, generate the Prisma client:

```bash
npx prisma generate
```

This creates the TypeScript types for your database schema.

## Step 6: Start the Development Server

Now you're ready to run the app:

```bash
npm run dev
```

The app will start at: **http://localhost:3000**

## Step 7: Create Your First Admin Account

### Option A: Sign Up Through the UI (Recommended)

1. Open http://localhost:3000 in your browser
2. Click "Get Started" or go to `/auth/sign-up`
3. Enter your email and password (min 6 characters)
4. You'll see a success message about email confirmation

### Option B: Skip Email Confirmation (For Local Testing)

If you want to skip email confirmation during development:

1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. **Disable** "Enable email confirmations"
4. Save changes
5. Now you can sign up and log in immediately without confirming email

### Make Yourself an Admin

After signing up, you need to set your role to admin:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query (replace with your email):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

3. Log out and log back in
4. You'll now be redirected to `/admin` instead of `/dashboard`

## Step 8: Test the Platform

### As Admin (at `/admin`):
1. View platform statistics
2. Click "Create User" to add a test user:
   - Email: `test@example.com`
   - Password: `password123`
   - Role: `user`
   - Balance: `10000` (gives them $10,000 USD)
3. The user account is ready to use!

### As User (at `/dashboard`):
1. Log out and sign in with the test account
2. You'll see your dashboard with $10,000 balance
3. Go to **Trade** to buy cryptocurrency
4. Try buying $100 of Bitcoin
5. Return to dashboard to see your portfolio
6. Go to **Withdraw** to request a withdrawal
7. Log back in as admin to approve/reject it

## Common Issues & Solutions

### "Database connection failed"
- Check that your `POSTGRES_URL` is correct in `.env.local`
- Make sure your Supabase project is active
- Verify you ran both SQL scripts

### "User not found after sign up"
- Check if the trigger ran: Go to Supabase → **Database** → **users** table
- If the user exists in `auth.users` but not in `users` table, the trigger failed
- Manually insert: 
```sql
INSERT INTO users (id, email, role, balance)
SELECT id, email, 'user', 0
FROM auth.users
WHERE email = 'your-email@example.com';
```

### "Cannot find module 'prisma'"
- Run `npm install` again
- Run `npx prisma generate`

### Charts not loading
- Check your internet connection (needs CoinGecko API)
- CoinGecko free tier rate limit: 50 calls/minute
- Wait a few seconds and refresh

### "Access denied" or redirected to login
- Clear your browser cookies
- Log out and log in again
- Check that middleware is working by looking at terminal logs

## Project URLs

- **Landing Page**: http://localhost:3000
- **Sign Up**: http://localhost:3000/auth/sign-up
- **Login**: http://localhost:3000/auth/login
- **User Dashboard**: http://localhost:3000/dashboard
- **Trading**: http://localhost:3000/dashboard/trade
- **Withdrawals**: http://localhost:3000/dashboard/withdraw
- **Admin Panel**: http://localhost:3000/admin

## Development Tips

### Viewing Database Data

Use Prisma Studio to view/edit database data:

```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

### Checking Logs

Watch your terminal for:
- `[v0]` debug logs (if any)
- API errors from CoinGecko
- Supabase auth events
- Server action responses

### Hot Reload

Next.js automatically reloads when you save files. If it doesn't:
1. Stop the server (`Ctrl+C`)
2. Run `npm run dev` again

### Resetting the Database

If you need to start fresh:

```sql
-- Delete all data
TRUNCATE users, portfolios, transactions, withdrawals CASCADE;

-- Or drop and recreate tables
DROP TABLE IF EXISTS withdrawals, transactions, portfolios, users CASCADE;
-- Then run the init scripts again
```

## Next Steps

Once everything is working:
1. Create more test users with different balances
2. Test buying and selling different cryptocurrencies
3. Test the withdrawal approval workflow
4. Explore the real-time chart features
5. Check the responsive design on mobile

## Need Help?

- Check `SETUP.md` for detailed feature documentation
- Check `API_DOCUMENTATION.md` for API reference
- Review the Supabase logs in your dashboard
- Check browser console for frontend errors

Happy trading!
