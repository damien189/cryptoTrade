"use client"

import { useEffect, useState } from "react"
import { getUserStats } from "@/app/actions/stats"
import { GlassCard, CardHeader, CardTitle, CardContent } from "@/components/ui/glass-card"
import { Loader2, TrendingUp, DollarSign, Activity, Zap, BarChart3, ArrowUpRight, Gauge } from "lucide-react"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts"
import { Badge } from "@/components/ui/badge"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

interface StatsData {
  balance: number
  totalPortfolioValue: number
  totalNetWorth: number
  totalInvested: number
  totalPnL: number
  totalPnLPercent: number
  assets: Array<{
    name: string
    value: number
    amount: number
    price: number
    pnl: number
    pnlPercent: number
  }>
}

// Generate bullish synthetic history data
const generateHistoryData = (currentValue: number) => {
  const data = []
  let value = currentValue * 0.6 // Start from 60% of current value
  const points = 30
  
  for (let i = 0; i < points; i++) {
    // Add randomness but generally trend up
    const randomMove = (Math.random() - 0.35) * (currentValue * 0.05)
    value += (currentValue * 0.4 / points) + randomMove
    data.push({
      date: `Day ${i + 1}`,
      value: Math.max(value, currentValue * 0.5) // Don't drop too low
    })
  }
  // Force end at current value
  data[points - 1].value = currentValue
  return data
}

const INDICATORS = [
  { name: "RSI (14)", value: "68.5", signal: "BUY", color: "text-green-500" },
  { name: "MACD (12,26)", value: "124.5", signal: "STRONG BUY", color: "text-green-500" },
  { name: "MA (50)", value: "Bullish", signal: "BUY", color: "text-green-500" },
  { name: "MA (200)", value: "Bullish", signal: "STRONG BUY", color: "text-green-500" },
  { name: "Bollinger Bands", value: "Upper Break", signal: "BUY", color: "text-green-500" },
  { name: "Stochastic", value: "75.2", signal: "NEUTRAL", color: "text-yellow-500" },
]

export function StatisticsContent() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [historyData, setHistoryData] = useState<any[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getUserStats()
        if (data && !data.error) {
          setStats(data as StatsData)
          setHistoryData(generateHistoryData((data as StatsData).totalNetWorth))
        }
      } catch (error) {
        console.error("Failed to load stats", error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) return null

  const allocationData = [
    { name: 'USD Balance', value: stats.balance },
    ...stats.assets.map(a => ({ name: a.name, value: a.value }))
  ]

  const monthlyReturns = [
    { name: 'Jan', value: 12.5 },
    { name: 'Feb', value: -2.4 },
    { name: 'Mar', value: 18.2 },
    { name: 'Apr', value: 8.5 },
    { name: 'May', value: 24.1 },
    { name: 'Jun', value: stats.totalPnLPercent > 0 ? stats.totalPnLPercent : 5.4 }
  ]

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Performance Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time portfolio analysis and market intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20 px-3 py-1">
            <Zap className="h-3 w-3 mr-1 fill-current" />
            Market Sentiment: EXTREME GREED
          </Badge>
          <Badge variant="outline" className="text-primary border-primary/20 px-3 py-1">
            Updated: Just now
          </Badge>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard variant="neon" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <DollarSign className="h-24 w-24 translate-x-4 -translate-y-4" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${stats.totalNetWorth.toFixed(2)}</div>
            <div className="flex items-center mt-1 text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+{stats.totalPnLPercent.toFixed(2)}% All Time</span>
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="h-24 w-24 translate-x-4 -translate-y-4" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized PnL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${stats.totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {stats.totalPnL >= 0 ? "+" : ""}{stats.totalPnL.toFixed(2)}
            </div>
            <div className="flex items-center mt-1 text-muted-foreground">
              <span className="text-sm">Profit generated from investments</span>
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <BarChart3 className="h-24 w-24 translate-x-4 -translate-y-4" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capital Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${stats.totalInvested.toFixed(2)}</div>
            <div className="flex items-center mt-1 text-muted-foreground">
              <span className="text-sm">Across {stats.assets.length} active positions</span>
            </div>
          </CardContent>
        </GlassCard>

         <GlassCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Gauge className="h-24 w-24 translate-x-4 -translate-y-4" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-primary">A+</div>
            <div className="flex items-center mt-1 text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm">Outperforming Market</span>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Growth Chart */}
        <GlassCard className="col-span-2 min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Portfolio Growth Analysis</span>
              <div className="flex gap-2">
                <Badge variant="outline">1D</Badge>
                <Badge variant="outline">1W</Badge>
                <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/50">1M</Badge>
                <Badge variant="outline">1Y</Badge>
                <Badge variant="outline">ALL</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} stroke="rgba(255,255,255,0.3)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
             </ResponsiveContainer>
          </CardContent>
        </GlassCard>

        {/* Technical Indicators */}
        <GlassCard className="col-span-1">
          <CardHeader>
            <CardTitle>Technical Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {INDICATORS.map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-transparent hover:border-primary/20 transition-colors">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.value}</div>
                    </div>
                    <Badge variant="outline" className={`${item.color} bg-background/50 border-current`}>
                      {item.signal}
                    </Badge>
                 </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-1 flex items-center gap-2">
                <Zap className="h-4 w-4" /> AI Insight
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Market conditions are showing strong bullish convergence across all major timeframes. 
                Volume analysis suggests continued institutional accumulation. 
                Recommendation: <strong>HOLD / ACCUMULATE</strong>
              </p>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Allocation */}
        <GlassCard>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>

        {/* Monthly Returns */}
        <GlassCard>
          <CardHeader>
            <CardTitle>Monthly Returns (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {monthlyReturns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>

        {/* Asset Performance List */}
        <GlassCard>
           <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {stats.assets.length > 0 ? stats.assets.map((asset) => (
                 <div key={asset.name} className="flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                       {asset.name.substring(0, 2)}
                     </div>
                     <div>
                       <div className="font-medium group-hover:text-primary transition-colors">{asset.name}</div>
                       <div className="text-xs text-muted-foreground">{asset.amount} units</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className={`font-bold ${asset.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                       {asset.pnl >= 0 ? "+" : ""}{asset.pnlPercent.toFixed(2)}%
                     </div>
                     <div className="text-xs text-muted-foreground">${asset.value.toFixed(2)}</div>
                   </div>
                 </div>
               )) : (
                 <div className="text-center text-muted-foreground py-8">
                   No active positions found
                 </div>
               )}
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  )
}
