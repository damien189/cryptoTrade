// Crypto price API - Works offline with mock data when CoinGecko unavailable
export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
  type?: 'crypto' | 'stock' | 'commodity'
}

export interface CryptoChartData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

const COINGECKO_API = "https://api.coingecko.com/api/v3"

// Comprehensive mock data for all supported cryptocurrencies
const MOCK_PRICES: Record<string, CryptoPrice> = {
  "bitcoin": { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 95420, price_change_percentage_24h: 2.34, market_cap: 1876000000000, total_volume: 48500000000, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", type: 'crypto' },
  "ethereum": { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3456, price_change_percentage_24h: 1.87, market_cap: 415000000000, total_volume: 21500000000, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", type: 'crypto' },
  "solana": { id: "solana", symbol: "sol", name: "Solana", current_price: 187.5, price_change_percentage_24h: 3.42, market_cap: 86000000000, total_volume: 5800000000, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png", type: 'crypto' },
  "cardano": { id: "cardano", symbol: "ada", name: "Cardano", current_price: 0.98, price_change_percentage_24h: -0.65, market_cap: 34500000000, total_volume: 890000000, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png", type: 'crypto' },
  "ripple": { id: "ripple", symbol: "xrp", name: "XRP", current_price: 2.28, price_change_percentage_24h: 4.21, market_cap: 125000000000, total_volume: 13500000000, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", type: 'crypto' },
  "dogecoin": { id: "dogecoin", symbol: "doge", name: "Dogecoin", current_price: 0.324, price_change_percentage_24h: 1.15, market_cap: 47500000000, total_volume: 2800000000, image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png", type: 'crypto' },
  "polkadot": { id: "polkadot", symbol: "dot", name: "Polkadot", current_price: 7.65, price_change_percentage_24h: -1.23, market_cap: 10500000000, total_volume: 450000000, image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png", type: 'crypto' },
  "avalanche-2": { id: "avalanche-2", symbol: "avax", name: "Avalanche", current_price: 41.2, price_change_percentage_24h: 2.78, market_cap: 16800000000, total_volume: 890000000, image: "https://assets.coingecko.com/coins/images/12559/large/avalanche.png", type: 'crypto' },
}

const MOCK_STOCKS: Record<string, CryptoPrice> = {
  // Tech Giants
  "aapl": { id: "aapl", symbol: "AAPL", name: "Apple Inc.", current_price: 245.30, price_change_percentage_24h: 1.25, market_cap: 3300000000000, total_volume: 50000000, image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", type: 'stock' },
  "tsla": { id: "tsla", symbol: "TSLA", name: "Tesla Inc.", current_price: 412.50, price_change_percentage_24h: -2.10, market_cap: 850000000000, total_volume: 120000000, image: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png", type: 'stock' },
  "nvda": { id: "nvda", symbol: "NVDA", name: "NVIDIA Corp.", current_price: 1150.20, price_change_percentage_24h: 4.50, market_cap: 3100000000000, total_volume: 45000000, image: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg", type: 'stock' },
  "msft": { id: "msft", symbol: "MSFT", name: "Microsoft", current_price: 450.10, price_change_percentage_24h: 0.80, market_cap: 3200000000000, total_volume: 30000000, image: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", type: 'stock' },
  "amzn": { id: "amzn", symbol: "AMZN", name: "Amazon", current_price: 195.40, price_change_percentage_24h: 1.10, market_cap: 1900000000000, total_volume: 40000000, image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", type: 'stock' },
  "googl": { id: "googl", symbol: "GOOGL", name: "Alphabet Inc.", current_price: 185.60, price_change_percentage_24h: 0.95, market_cap: 2100000000000, total_volume: 25000000, image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", type: 'stock' },
  "meta": { id: "meta", symbol: "META", name: "Meta Platforms", current_price: 520.30, price_change_percentage_24h: 2.30, market_cap: 1200000000000, total_volume: 20000000, image: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", type: 'stock' },
  
  // Consumer & Retail
  "ko": { id: "ko", symbol: "KO", name: "Coca-Cola", current_price: 62.50, price_change_percentage_24h: 0.15, market_cap: 270000000000, total_volume: 12000000, image: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg", type: 'stock' },
  "pep": { id: "pep", symbol: "PEP", name: "PepsiCo", current_price: 168.40, price_change_percentage_24h: -0.20, market_cap: 230000000000, total_volume: 5000000, image: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Pepsi_logo_2014.svg", type: 'stock' },
  "nke": { id: "nke", symbol: "NKE", name: "Nike", current_price: 92.30, price_change_percentage_24h: 1.50, market_cap: 140000000000, total_volume: 8000000, image: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", type: 'stock' },
  "mcd": { id: "mcd", symbol: "MCD", name: "McDonald's", current_price: 275.80, price_change_percentage_24h: 0.40, market_cap: 200000000000, total_volume: 3000000, image: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg", type: 'stock' },
  "sbux": { id: "sbux", symbol: "SBUX", name: "Starbucks", current_price: 85.20, price_change_percentage_24h: -0.50, market_cap: 95000000000, total_volume: 6000000, image: "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg", type: 'stock' },

  // Finance
  "jpm": { id: "jpm", symbol: "JPM", name: "JPMorgan Chase", current_price: 205.10, price_change_percentage_24h: 1.10, market_cap: 600000000000, total_volume: 10000000, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/JPMorgan_Chase_Logo_2008.svg/1200px-JPMorgan_Chase_Logo_2008.svg.png", type: 'stock' },
  "bac": { id: "bac", symbol: "BAC", name: "Bank of America", current_price: 38.50, price_change_percentage_24h: 0.80, market_cap: 300000000000, total_volume: 40000000, image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Bank_of_America_logo.svg", type: 'stock' },
  "v": { id: "v", symbol: "V", name: "Visa", current_price: 285.60, price_change_percentage_24h: 0.60, market_cap: 580000000000, total_volume: 5000000, image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg", type: 'stock' },

  // Entertainment
  "nflx": { id: "nflx", symbol: "NFLX", name: "Netflix", current_price: 650.40, price_change_percentage_24h: 2.10, market_cap: 280000000000, total_volume: 4000000, image: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", type: 'stock' },
  "dis": { id: "dis", symbol: "DIS", name: "Disney", current_price: 115.20, price_change_percentage_24h: 0.90, market_cap: 210000000000, total_volume: 8000000, image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Disney_wordmark.svg", type: 'stock' },
  
  // Pharma
  "pfe": { id: "pfe", symbol: "PFE", name: "Pfizer", current_price: 28.50, price_change_percentage_24h: -0.30, market_cap: 160000000000, total_volume: 25000000, image: "https://upload.wikimedia.org/wikipedia/commons/5/57/Pfizer_%282021%29.svg", type: 'stock' },
  "jnj": { id: "jnj", symbol: "JNJ", name: "Johnson & Johnson", current_price: 155.40, price_change_percentage_24h: 0.20, market_cap: 370000000000, total_volume: 6000000, image: "https://upload.wikimedia.org/wikipedia/commons/b/be/J%26J_logo.svg", type: 'stock' },
}

const MOCK_COMMODITIES: Record<string, CryptoPrice> = {
  "gold": { id: "gold", symbol: "XAU", name: "Or (Gold)", current_price: 2450.50, price_change_percentage_24h: 0.45, market_cap: 13000000000000, total_volume: 15000000000, image: "https://cdn-icons-png.flaticon.com/512/11516/11516584.png", type: 'commodity' },
  "silver": { id: "silver", symbol: "XAG", name: "Argent (Silver)", current_price: 32.40, price_change_percentage_24h: 1.20, market_cap: 1500000000000, total_volume: 5000000000, image: "https://cdn-icons-png.flaticon.com/512/11516/11516599.png", type: 'commodity' },
  "oil": { id: "oil", symbol: "WTI", name: "Pétrole (Crude Oil)", current_price: 78.50, price_change_percentage_24h: -1.50, market_cap: 2000000000000, total_volume: 8000000000, image: "https://cdn-icons-png.flaticon.com/512/2103/2103623.png", type: 'commodity' },
  "gas": { id: "gas", symbol: "NG", name: "Gaz Naturel", current_price: 2.85, price_change_percentage_24h: 3.40, market_cap: 500000000000, total_volume: 2000000000, image: "https://cdn-icons-png.flaticon.com/512/3313/3313460.png", type: 'commodity' },
  "copper": { id: "copper", symbol: "HG", name: "Cuivre (Copper)", current_price: 4.50, price_change_percentage_24h: 0.80, market_cap: 800000000000, total_volume: 3000000000, image: "https://cdn-icons-png.flaticon.com/512/721/721096.png", type: 'commodity' },
  "platinum": { id: "platinum", symbol: "PL", name: "Platine", current_price: 980.00, price_change_percentage_24h: 0.20, market_cap: 250000000000, total_volume: 1000000000, image: "https://cdn-icons-png.flaticon.com/512/3891/3891278.png", type: 'commodity' },
  "palladium": { id: "palladium", symbol: "PA", name: "Palladium", current_price: 950.00, price_change_percentage_24h: -1.20, market_cap: 18000000000, total_volume: 500000000, image: "https://cdn-icons-png.flaticon.com/512/2821/2821030.png", type: 'commodity' },
}

// Merge all for lookup
const ALL_MOCK_ASSETS = { ...MOCK_PRICES, ...MOCK_STOCKS, ...MOCK_COMMODITIES }

// Generate realistic chart data
function generateMockChartData(basePrice: number, isPositive: boolean, days: number = 7): CryptoChartData {
  const now = Date.now()
  const prices: [number, number][] = []
  const pointsPerDay = 24
  const totalPoints = days * pointsPerDay
  
  let price = basePrice * (isPositive ? 0.92 : 1.08)
  const trend = isPositive ? 0.003 : -0.002
  
  for (let i = totalPoints; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000 // hourly data
    const volatility = (Math.random() - 0.5) * (basePrice * 0.015)
    price = price + volatility + (basePrice * trend)
    price = Math.max(price, basePrice * 0.7) // floor
    price = Math.min(price, basePrice * 1.3) // ceiling
    prices.push([timestamp, price])
  }
  
  return { prices, market_caps: [], total_volumes: [] }
}


function getMockPrices(ids: string[]): CryptoPrice[] {
  return ids
    .map(id => ALL_MOCK_ASSETS[id])
    .filter((p): p is CryptoPrice => p !== undefined)
}

// Flag to track if we should use mock data (after first API failure)
let useMockData = false

export async function getTopCryptos(limit = 50): Promise<CryptoPrice[]> {
    if (useMockData) {
        return Object.values(MOCK_PRICES)
    }

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const response = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
            {
                next: { revalidate: 60 },
                signal: controller.signal
            }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
            console.log("[CryptoAPI] API unavailable, using mock data")
            useMockData = true
            return Object.values(MOCK_PRICES)
        }

        const data = await response.json()
        return data.map((item: any) => ({ ...item, type: 'crypto' }))
    } catch {
        console.log("[CryptoAPI] API error, switching to mock data")
        useMockData = true
        return Object.values(MOCK_PRICES)
    }
}

export async function getAllMarketAssets(): Promise<CryptoPrice[]> {
  // Always return mock data for stocks and commodities combined with crypto
  const stocks = Object.values(MOCK_STOCKS)
  const commodities = Object.values(MOCK_COMMODITIES)
  
  // Try to get live crypto data (TOP 50), fall back to mock
  let cryptos: CryptoPrice[] = []
  try {
    cryptos = await getTopCryptos(50)
  } catch {
    cryptos = Object.values(MOCK_PRICES)
  }

  return [...cryptos, ...stocks, ...commodities]
}

export async function getCryptoPrices(
  ids: string[] = ["bitcoin", "ethereum", "solana", "cardano", "ripple"],
): Promise<CryptoPrice[]> {
  // Return mock data immediately if API has failed before
  if (useMockData) {
    return getMockPrices(ids)
  }

  try {
    // If any requested ID is a stock or commodity, use mock data for EVERYTHING for consistency
    // or just filter them out. But simply using mock data if non-crypto is easier.
    const hasNonCrypto = ids.some(id => MOCK_STOCKS[id] || MOCK_COMMODITIES[id])
    if (hasNonCrypto) {
         return getMockPrices(ids)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids.join(",")}&order=market_cap_desc&sparkline=false`,
      { 
        next: { revalidate: 60 },
        signal: controller.signal 
      },
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log("[CryptoAPI] API unavailable, using mock data")
      useMockData = true
      return getMockPrices(ids)
    }

    const data = await response.json()
    // Add type 'crypto' to the response
    return data.map((item: any) => ({ ...item, type: 'crypto' }))
  } catch {
    console.log("[CryptoAPI] API error, switching to mock data")
    useMockData = true
    return getMockPrices(ids)
  }
}

export async function getCryptoChart(id: string, days = 7): Promise<CryptoChartData> {
  const mockPrice = ALL_MOCK_ASSETS[id]
  const basePrice = mockPrice?.current_price || 1000
  const isPositive = mockPrice ? mockPrice.price_change_percentage_24h >= 0 : true

  // For non-crypto, always use mock chart
  if (MOCK_STOCKS[id] || MOCK_COMMODITIES[id]) {
      return generateMockChartData(basePrice, isPositive, days)
  }

  // Return mock data immediately if API has failed before
  if (useMockData) {
    return generateMockChartData(basePrice, isPositive, days)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `${COINGECKO_API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      { 
        next: { revalidate: 300 },
        signal: controller.signal
      },
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      useMockData = true
      return generateMockChartData(basePrice, isPositive, days)
    }

    return await response.json()
  } catch {
    useMockData = true
    return generateMockChartData(basePrice, isPositive, days)
  }
}

export async function getCryptoPrice(id: string): Promise<number> {
  const mockPrice = ALL_MOCK_ASSETS[id]?.current_price || 0
  
  if (MOCK_STOCKS[id] || MOCK_COMMODITIES[id]) {
    return mockPrice
  }

  // Return mock data immediately if API has failed before
  if (useMockData) {
    return mockPrice
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${id}&vs_currencies=usd`,
      { 
        cache: "no-store",
        signal: controller.signal
      },
    )
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      useMockData = true
      return mockPrice
    }

    const data = await response.json()
    return data[id]?.usd || mockPrice
  } catch {
    useMockData = true
    return mockPrice
  }
}



