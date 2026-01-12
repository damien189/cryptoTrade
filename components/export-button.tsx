"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"

interface ExportButtonProps {
  variant?: "default" | "outline" | "ghost"
}

export function ExportButton({ variant = "outline" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true)
    try {
      if (format === "csv") {
        // Download CSV directly
        const response = await fetch("/api/export?format=csv")
        if (!response.ok) throw new Error("Export failed")
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        // Get JSON and generate PDF
        const response = await fetch("/api/export?format=json")
        if (!response.ok) throw new Error("Export failed")
        
        const data = await response.json()
        generatePDF(data)
      }
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const generatePDF = (data: any) => {
    // Create a printable HTML document
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .summary-card h3 { margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; }
            .summary-card p { margin: 0; font-size: 24px; font-weight: bold; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: 600; }
            .buy { color: #dc2626; }
            .sell { color: #16a34a; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Transaction Report</h1>
            <p><strong>Account:</strong> ${data.user.email}</p>
            <p><strong>Generated:</strong> ${new Date(data.generatedAt).toLocaleString()}</p>
            <p><strong>Current Balance:</strong> $${data.user.currentBalance?.toFixed(2) || "0.00"}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Transactions</h3>
              <p>${data.summary.totalTransactions}</p>
            </div>
            <div class="summary-card">
              <h3>Buy Volume</h3>
              <p class="negative">-$${data.summary.totalBuyVolume.toFixed(2)}</p>
            </div>
            <div class="summary-card">
              <h3>Sell Volume</h3>
              <p class="positive">+$${data.summary.totalSellVolume.toFixed(2)}</p>
            </div>
            <div class="summary-card">
              <h3>Net Flow</h3>
              <p class="${data.summary.netFlow >= 0 ? "positive" : "negative"}">
                ${data.summary.netFlow >= 0 ? "+" : ""}$${data.summary.netFlow.toFixed(2)}
              </p>
            </div>
          </div>

          <h2>Transaction History</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.transactions.map((t: any) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td class="${t.type}">${t.type.toUpperCase()}</td>
                  <td>${t.symbol}</td>
                  <td>${t.amount.toFixed(8)}</td>
                  <td>$${t.price.toFixed(2)}</td>
                  <td class="${t.type}">
                    ${t.type === "buy" ? "-" : "+"}$${t.total.toFixed(2)}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>CryptoTrade • Financial Report • ${new Date().getFullYear()}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
