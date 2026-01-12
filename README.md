# CryptoTrade - Professional Trading Platform

A comprehensive cryptocurrency trading platform built with Next.js, Supabase, and Prisma. Features real-time charts, secure transactions, admin controls, and portfolio management.

## Features

### User Features
- **Real-time Crypto Charts**: Live price data from CoinGecko API with interactive charts
- **Portfolio Management**: Track your crypto holdings with automatic value calculations
- **Buy/Sell Trading**: Execute trades with current market prices
- **Withdrawal System**: Request withdrawals with status tracking (pending/approved/rejected)
- **Transaction History**: View all your past trades
- **Secure Authentication**: Email/password authentication with Supabase

### Admin Features
- **User Management**: Create new user accounts with custom roles and initial balances
- **Withdrawal Approval**: Review and approve/reject withdrawal requests
- **Platform Analytics**: View total users, balances, and pending withdrawals
- **User Overview**: Monitor all user accounts and their balances

## Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **API**: CoinGecko (free tier)

## Getting Started

### Prerequisites

1. Supabase account and project
2. Environment variables configured in Vercel

### Database Setup

The platform includes SQL scripts that will create all necessary tables:

1. Run `scripts/001_init_schema.sql` to create tables and RLS policies
2. Run `scripts/002_create_user_trigger.sql` to set up auto-profile creation

These scripts create:
- `users` table with balance tracking
- `portfolios` table for crypto holdings
- `transactions` table for trade history
- `withdrawals` table for withdrawal requests
- Row Level Security (RLS) policies for data protection

### Creating an Admin Account

To create your first admin account, you need to sign up and then manually update the role in the database:

```sql
-- After signing up, update your account to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or use the admin panel once you have one admin account to create additional admins.

### Environment Variables

All required environment variables are automatically configured through the Supabase integration:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- And more...

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for trades, withdrawals, admin
│   ├── admin/            # Admin dashboard
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard and trading
│   └── page.tsx          # Landing page
├── components/           # React components
├── lib/
│   ├── supabase/         # Supabase client setup
│   ├── crypto-api.ts     # CoinGecko API integration
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── scripts/              # SQL initialization scripts
└── proxy.ts              # Middleware for auth
```

## Key Routes

- `/` - Landing page
- `/auth/login` - User login
- `/dashboard` - User dashboard with portfolio overview
- `/dashboard/trade` - Trading interface with charts
- `/dashboard/withdraw` - Withdrawal requests
- `/admin` - Admin panel (admin role required)

## Security Features

- **Row Level Security (RLS)**: All database tables are protected with RLS policies
- **Role-based Access**: Separate user and admin routes with middleware protection
- **Session Management**: Secure session handling via Supabase
- **Input Validation**: Server-side validation for all transactions

## API Integration

The platform uses the CoinGecko API (free tier) for:
- Real-time crypto prices
- Historical price data for charts
- Market data (24h change, market cap, volume)

Supported cryptocurrencies:
- Bitcoin (BTC)
- Ethereum (ETH)
- Solana (SOL)
- Cardano (ADA)
- Ripple (XRP)

## User Workflow

1. User signs up and receives email confirmation
2. After confirmation, they can log in
3. Admin creates user account with initial balance (or users start with $0)
4. Users can buy crypto using their USD balance
5. Portfolio automatically tracks holdings and current value
6. Users can sell crypto back to USD
7. Users can request withdrawals (status: pending)
8. Admin reviews and approves/rejects withdrawals
9. On approval, balance is deducted

## Admin Workflow

1. Log in with admin credentials
2. View platform statistics (total users, balances, pending withdrawals)
3. Create new user accounts with custom balances and roles
4. Review pending withdrawal requests
5. Approve or reject withdrawals
6. Monitor user accounts and activity

## Development Notes

- The platform uses Prisma for type-safe database access
- All monetary values use Decimal types for precision
- Crypto amounts stored with 8 decimal places
- USD amounts stored with 2 decimal places
- Real-time data refreshes every 60 seconds (crypto prices) and 5 minutes (charts)

## Future Enhancements

Consider adding:
- Email notifications for withdrawal status
- More cryptocurrencies
- Advanced charting features (indicators, multiple timeframes)
- Deposit functionality
- Two-factor authentication
- KYC verification
- Trading fees system
- Referral program

## License

Built with v0.app
```

```json file="" isHidden
