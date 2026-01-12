# API Documentation

This document outlines the server actions and API routes available in the CryptoTrade platform.

## Authentication

All API calls require authentication via Supabase session. The middleware (`proxy.ts`) automatically handles session management.

## Server Actions

### Trade Actions (`app/actions/trade.ts`)

#### `executeTrade`
Executes a buy or sell trade for cryptocurrency.

**Parameters:**
```typescript
{
  userId: string      // User ID from Supabase auth
  type: "buy" | "sell"  // Trade type
  cryptoId: string    // Crypto ID (e.g., "bitcoin")
  symbol: string      // Crypto symbol (e.g., "BTC")
  amount: number      // USD amount to trade
}
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

**Behavior:**
- **Buy**: Deducts USD from balance, adds crypto to portfolio
- **Sell**: Deducts crypto from portfolio, adds USD to balance
- Creates transaction record
- Updates or creates portfolio entry
- Calculates average price for portfolio

**Example:**
```typescript
const result = await executeTrade({
  userId: user.id,
  type: "buy",
  cryptoId: "bitcoin",
  symbol: "BTC",
  amount: 1000
});
```

### Withdrawal Actions (`app/actions/withdrawal.ts`)

#### `requestWithdrawal`
Creates a withdrawal request with pending status.

**Parameters:**
```typescript
amount: number  // USD amount to withdraw
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

**Behavior:**
- Validates sufficient balance
- Creates withdrawal record with "pending" status
- Does NOT deduct balance (happens on approval)

**Example:**
```typescript
const result = await requestWithdrawal(500);
```

### Admin Actions (`app/actions/admin.ts`)

#### `createUser`
Creates a new user account (admin only).

**Parameters:**
```typescript
{
  email: string
  password: string
  role: string      // "user" or "admin"
  balance: number   // Initial balance in USD
}
```

**Returns:**
```typescript
{ success: true, user: User } | { error: string }
```

**Security:**
- Verifies admin role before execution
- Uses Supabase signUp with metadata

**Example:**
```typescript
const result = await createUser({
  email: "trader@example.com",
  password: "secure123",
  role: "user",
  balance: 10000
});
```

#### `approveWithdrawal`
Approves a pending withdrawal (admin only).

**Parameters:**
```typescript
withdrawalId: string
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

**Behavior:**
- Updates withdrawal status to "approved"
- Deducts amount from user balance
- Verifies admin role

**Example:**
```typescript
const result = await approveWithdrawal("withdrawal-uuid");
```

#### `rejectWithdrawal`
Rejects a pending withdrawal (admin only).

**Parameters:**
```typescript
withdrawalId: string
```

**Returns:**
```typescript
{ success: true } | { error: string }
```

**Behavior:**
- Updates withdrawal status to "rejected"
- Does NOT affect user balance

## Crypto API (`lib/crypto-api.ts`)

### `getCryptoPrices`
Fetches current prices for multiple cryptocurrencies.

**Parameters:**
```typescript
ids?: string[]  // Array of crypto IDs (default: ["bitcoin", "ethereum", ...])
```

**Returns:**
```typescript
CryptoPrice[] = {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}[]
```

**Caching:** 60 seconds

### `getCryptoChart`
Fetches historical price data for charts.

**Parameters:**
```typescript
id: string     // Crypto ID
days?: number  // Number of days (default: 7)
```

**Returns:**
```typescript
CryptoChartData = {
  prices: [timestamp, price][]
  market_caps: [timestamp, marketCap][]
  total_volumes: [timestamp, volume][]
}
```

**Caching:** 300 seconds (5 minutes)

### `getCryptoPrice`
Fetches single crypto current price (no cache).

**Parameters:**
```typescript
id: string  // Crypto ID
```

**Returns:**
```typescript
number  // Current price in USD
```

## Database Schema

### Users Table
```typescript
{
  id: string          // UUID, references auth.users
  email: string       // Unique
  role: string        // "user" or "admin"
  balance: Decimal    // USD balance
  created_at: Date
  updated_at: Date
}
```

### Portfolios Table
```typescript
{
  id: string
  user_id: string     // References users.id
  symbol: string      // Crypto symbol (BTC, ETH, etc.)
  amount: Decimal     // Crypto amount (8 decimals)
  average_price: Decimal  // Average purchase price
  created_at: Date
  updated_at: Date
}
```

**Unique Constraint:** (user_id, symbol)

### Transactions Table
```typescript
{
  id: string
  user_id: string
  type: string        // "buy" or "sell"
  symbol: string
  amount: Decimal     // Crypto amount
  price: Decimal      // Price at time of trade
  total: Decimal      // Total USD amount
  created_at: Date
}
```

### Withdrawals Table
```typescript
{
  id: string
  user_id: string
  amount: Decimal
  status: string      // "pending", "approved", "rejected"
  created_at: Date
  updated_at: Date
}
```

## Row Level Security Policies

All tables have RLS enabled:

- **Users**: Users can view/update own data only
- **Portfolios**: Users can CRUD own portfolios only
- **Transactions**: Users can view/insert own transactions
- **Withdrawals**: Users can view/insert own withdrawals

Admins must use service role or explicit queries to access other users' data.

## Error Handling

All server actions return consistent error format:
```typescript
{ error: string }
```

Common errors:
- "Unauthorized" - Not logged in or wrong role
- "Insufficient balance" - Not enough USD/crypto
- "User not found" - User doesn't exist in database
- "Failed to fetch crypto price" - CoinGecko API error

## Rate Limiting

CoinGecko API (Free Tier):
- 50 calls per minute
- Automatic caching reduces API calls
- Prices: 60s cache
- Charts: 300s cache
