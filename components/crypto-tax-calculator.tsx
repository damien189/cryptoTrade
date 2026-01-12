"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, Scale, AlertTriangle, CheckCircle, Info, FileText, Gavel } from "lucide-react"

interface TaxRegime {
  country: string
  flag: string
  taxRate: number
  holdingPeriodDiscount: boolean
  holdingPeriodMonths: number
  discountRate: number
  exemptionThreshold: number
  description: string
  legalFramework: string
  keyPoints: string[]
  warnings: string[]
}

const TAX_REGIMES: Record<string, TaxRegime> = {
  france: {
    country: "France",
    flag: "🇫🇷",
    taxRate: 30,
    holdingPeriodDiscount: false,
    holdingPeriodMonths: 0,
    discountRate: 0,
    exemptionThreshold: 305,
    description: "La France applique le Prélèvement Forfaitaire Unique (PFU) ou 'Flat Tax' de 30% sur les plus-values de cession d'actifs numériques. Ce régime fiscal simplifié combine l'impôt sur le revenu (12,8%) et les prélèvements sociaux (17,2%).",
    legalFramework: "Article 150 VH bis du Code Général des Impôts (CGI) - Régime fiscal des actifs numériques",
    keyPoints: [
      "Flat Tax de 30% (PFU) sur les plus-values réalisées",
      "Option possible pour le barème progressif de l'IR",
      "Exonération si cessions annuelles < 305€",
      "Déclaration obligatoire des comptes détenus à l'étranger (formulaire 3916-bis)",
      "Les échanges crypto-crypto ne sont pas imposables",
      "Calcul selon la méthode du Prix Moyen Pondéré d'Acquisition (PMPA)"
    ],
    warnings: [
      "Amende de 750€ par compte non déclaré à l'étranger",
      "Majoration de 80% en cas de non-déclaration de plus-values",
      "Obligation de traçabilité complète des transactions"
    ]
  },
  spain: {
    country: "Espagne",
    flag: "🇪🇸",
    taxRate: 23,
    holdingPeriodDiscount: false,
    holdingPeriodMonths: 0,
    discountRate: 0,
    exemptionThreshold: 0,
    description: "L'Espagne applique un barème progressif sur les plus-values de cryptomonnaies, allant de 19% à 28% selon le montant des gains. Les cryptomonnaies sont considérées comme des actifs patrimoniaux soumis à l'impôt sur les plus-values du capital.",
    legalFramework: "Ley del Impuesto sobre la Renta de las Personas Físicas (IRPF) - Ganancias patrimoniales",
    keyPoints: [
      "19% jusqu'à 6 000€ de plus-values",
      "21% de 6 000€ à 50 000€",
      "23% de 50 000€ à 200 000€",
      "27% de 200 000€ à 300 000€",
      "28% au-delà de 300 000€",
      "Modèle 100 pour la déclaration annuelle",
      "Modèle 721 pour les avoirs > 50 000€ à l'étranger"
    ],
    warnings: [
      "Déclaration Modelo 721 obligatoire pour avoirs crypto > 50 000€",
      "Amendes pouvant atteindre 150% du montant non déclaré",
      "L'Agencia Tributaria renforce les contrôles depuis 2024"
    ]
  },
  belgium: {
    country: "Belgique",
    flag: "🇧🇪",
    taxRate: 33,
    holdingPeriodDiscount: true,
    holdingPeriodMonths: 12,
    discountRate: 100,
    exemptionThreshold: 0,
    description: "La Belgique distingue la gestion normale du patrimoine privé (exonérée) des activités spéculatives (imposées à 33%). La qualification dépend de la fréquence des transactions, du montant investi et des connaissances du contribuable.",
    legalFramework: "Code des Impôts sur les Revenus 1992 (CIR 92) - Article 90, 1° (revenus divers)",
    keyPoints: [
      "Gestion normale du patrimoine = 0% d'impôt",
      "Activité spéculative = 33% + taxe communale",
      "Activité professionnelle = barème progressif jusqu'à 50%",
      "Critères d'appréciation: fréquence, montant, effet de levier",
      "Pas de définition légale précise de la 'spéculation'",
      "Le HODL long terme généralement considéré comme gestion normale"
    ],
    warnings: [
      "Zone grise juridique importante",
      "Risque de requalification en revenus professionnels",
      "Conseil: documenter votre stratégie d'investissement",
      "L'administration fiscale belge intensifie les contrôles"
    ]
  },
  germany: {
    country: "Allemagne",
    flag: "🇩🇪",
    taxRate: 45,
    holdingPeriodDiscount: true,
    holdingPeriodMonths: 12,
    discountRate: 100,
    exemptionThreshold: 600,
    description: "L'Allemagne offre un régime attractif pour les investisseurs long terme: les plus-values sur cryptomonnaies détenues plus d'un an sont totalement exonérées. Pour les détentions < 1 an, les gains sont soumis au barème progressif de l'impôt sur le revenu.",
    legalFramework: "Einkommensteuergesetz (EStG) § 23 - Private Veräußerungsgeschäfte",
    keyPoints: [
      "Exonération totale après 1 an de détention",
      "Barème progressif de 0% à 45% + Solidaritätszuschlag (5,5%)",
      "Franchise annuelle de 600€ sur les plus-values < 1 an",
      "Les échanges crypto-crypto sont des événements imposables",
      "Méthode FIFO (First In, First Out) obligatoire",
      "Déclaration dans l'Anlage SO de la déclaration de revenus"
    ],
    warnings: [
      "Le staking peut prolonger la période de détention à 10 ans",
      "Les airdrops et forks sont imposables à réception",
      "Les mining rewards sont imposés comme revenus professionnels",
      "Documentation précise indispensable (Finanzamt très rigoureux)"
    ]
  }
}

export function CryptoTaxCalculator() {
  const [country, setCountry] = useState("france")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [saleAmount, setSaleAmount] = useState("")
  const [holdingMonths, setHoldingMonths] = useState("")

  const regime = TAX_REGIMES[country]
  
  const calculateTax = () => {
    const purchase = parseFloat(purchaseAmount) || 0
    const sale = parseFloat(saleAmount) || 0
    const months = parseInt(holdingMonths) || 0
    
    const gain = sale - purchase
    if (gain <= 0) return { gain: 0, tax: 0, netGain: 0, effectiveRate: 0 }

    // Check exemption threshold
    if (regime.exemptionThreshold > 0 && gain <= regime.exemptionThreshold) {
      return { gain, tax: 0, netGain: gain, effectiveRate: 0 }
    }

    // Check holding period discount
    if (regime.holdingPeriodDiscount && months >= regime.holdingPeriodMonths) {
      const discount = regime.discountRate / 100
      const taxableGain = gain * (1 - discount)
      const tax = taxableGain * (regime.taxRate / 100)
      return { gain, tax, netGain: gain - tax, effectiveRate: (tax / gain) * 100 }
    }

    // Standard tax calculation
    let taxRate = regime.taxRate
    
    // Spain progressive rates
    if (country === "spain") {
      if (gain <= 6000) taxRate = 19
      else if (gain <= 50000) taxRate = 21
      else if (gain <= 200000) taxRate = 23
      else if (gain <= 300000) taxRate = 27
      else taxRate = 28
    }
    
    const tax = gain * (taxRate / 100)
    return { gain, tax, netGain: gain - tax, effectiveRate: taxRate }
  }

  const result = calculateTax()

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Simulateur Fiscal Crypto Européen
        </CardTitle>
        <CardDescription>
          Estimation fiscale indicative selon la juridiction sélectionnée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Juridiction Fiscale
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TAX_REGIMES).map(([key, regime]) => (
                <SelectItem key={key} value={key}>
                  {regime.flag} {regime.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tax Regime Info */}
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculateur</TabsTrigger>
            <TabsTrigger value="regulation">Réglementation</TabsTrigger>
            <TabsTrigger value="warnings">Alertes</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Prix d'Acquisition (€)</Label>
                <Input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="10 000"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Prix de Cession (€)</Label>
                <Input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  placeholder="15 000"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Durée de Détention (mois)</Label>
                <Input
                  type="number"
                  value={holdingMonths}
                  onChange={(e) => setHoldingMonths(e.target.value)}
                  placeholder="12"
                  className="bg-background"
                />
              </div>
            </div>

            {/* Results */}
            <div className="grid gap-4 md:grid-cols-4 pt-4">
              <div className="p-4 rounded-lg bg-muted/30 border text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Plus-Value Brute</p>
                <p className="text-2xl font-bold mt-1">€{result.gain.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Impôt Estimé</p>
                <p className="text-2xl font-bold text-red-600 mt-1">€{result.tax.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Plus-Value Nette</p>
                <p className="text-2xl font-bold text-green-600 mt-1">€{result.netGain.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Taux Effectif</p>
                <p className="text-2xl font-bold text-primary mt-1">{result.effectiveRate.toFixed(1)}%</p>
              </div>
            </div>

            {regime.exemptionThreshold > 0 && result.tax === 0 && result.gain > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Exonération appliquée : plus-value inférieure au seuil de {regime.exemptionThreshold}€
                </p>
              </div>
            )}

            {regime.holdingPeriodDiscount && parseInt(holdingMonths) >= regime.holdingPeriodMonths && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Abattement pour durée de détention : {regime.discountRate}% après {regime.holdingPeriodMonths} mois
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="regulation" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Cadre Juridique</span>
                </div>
                <p className="text-sm text-muted-foreground">{regime.legalFramework}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Description du Régime</span>
                </div>
                <p className="text-sm text-muted-foreground">{regime.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Points Clés</span>
                </div>
                <ul className="space-y-2">
                  {regime.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4 pt-4">
            <div className="space-y-3">
              {regime.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{warning}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Avertissement Légal</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ce simulateur fournit une estimation indicative à des fins éducatives uniquement. 
                Les calculs ne constituent pas un conseil fiscal ou juridique. Consultez un 
                professionnel agréé (expert-comptable, avocat fiscaliste) pour votre situation personnelle.
                Les réglementations évoluent régulièrement.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
