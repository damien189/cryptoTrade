"use client"

import { useEffect, useRef, memo } from "react"

interface TradingViewChartProps {
  symbol: string
  theme?: "light" | "dark"
  height?: number
}

function TradingViewChartComponent({ symbol, theme = "dark", height = 600 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ""

    // Create container for widget
    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"

    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container__widget"
    widgetDiv.style.height = "calc(100% - 32px)"
    widgetDiv.style.width = "100%"

    widgetContainer.appendChild(widgetDiv)
    containerRef.current.appendChild(widgetContainer)

    // TradingView symbol mapping
    const tvSymbol = getTradingViewSymbol(symbol)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      hide_volume: false,
      studies: [
        "STD;RSI",
        "STD;MACD"
      ],
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
    })

    widgetContainer.appendChild(script)

    return () => {
      // Safely remove the widget container
      if (containerRef.current && widgetContainer && widgetContainer.parentNode === containerRef.current) {
         try {
           containerRef.current.removeChild(widgetContainer)
         } catch (e) {
           // Ignore cleanup errors
         }
      }
      if (containerRef.current) {
          containerRef.current.innerHTML = ""
      }
    }
  }, [symbol, theme])

  return (
    <div 
      ref={containerRef} 
      style={{ height: `${height}px`, width: "100%" }}
      className="rounded-lg overflow-hidden border border-border"
    />
  )
}

function getTradingViewSymbol(symbol: string): string {
  // Map our symbols to TradingView format (exchange:pair)
  const symbolMap: Record<string, string> = {
    BTC: "BINANCE:BTCUSDT",
    ETH: "BINANCE:ETHUSDT",
    SOL: "BINANCE:SOLUSDT",
    ADA: "BINANCE:ADAUSDT",
    XRP: "BINANCE:XRPUSDT",
    DOGE: "BINANCE:DOGEUSDT",
    DOT: "BINANCE:DOTUSDT",
    MATIC: "BINANCE:MATICUSDT",
    AVAX: "BINANCE:AVAXUSDT",
    LINK: "BINANCE:LINKUSDT",
    // Stocks
    AAPL: "NASDAQ:AAPL",
    TSLA: "NASDAQ:TSLA",
    NVDA: "NASDAQ:NVDA",
    MSFT: "NASDAQ:MSFT",
    AMZN: "NASDAQ:AMZN",
    // Commodities
    XAU: "OANDA:XAUUSD", // Gold
    XAG: "OANDA:XAGUSD", // Silver
    WTI: "TVC:USOIL",    // Crude Oil
  }

  return symbolMap[symbol.toUpperCase()] || `BINANCE:${symbol.toUpperCase()}USDT`
}

export const TradingViewChart = memo(TradingViewChartComponent)
