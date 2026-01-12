
export interface ArticleSection {
  title: string
  content: string
}

export interface AssetArticle {
  title: string
  subtitle: string
  author: string
  publishDate: string
  heroImage?: string
  sections: ArticleSection[]
  tags: string[]
}

export function generateAssetArticle(assetName: string, symbol: string, currentPrice: number, change24h: number): AssetArticle {
  const isPositive = change24h >= 0
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  
  // Dynamic template based on asset type and performance
  const title = `Pourquoi ${assetName} (${symbol}) est l'opportunité d'investissement du moment`
  
  return {
    title,
    subtitle: `Analyse complète : Les indicateurs techniques et fondamentaux signalent une tendance haussière majeure pour ${assetName}.`,
    author: "Équipe d'Analystes CryptoTrade",
    publishDate: date,
    sections: [
      {
        title: "Le contexte actuel du marché",
        content: `${assetName} a montré une résilience exceptionnelle au cours des dernières semaines. Avec un prix actuel de $${currentPrice.toLocaleString()}, l'actif se positionne à un niveau clé. Les analystes observent une accumulation massive de la part des investisseurs institutionnels, ce qui précède souvent une rupture de prix significative vers le haut.`
      },
      {
        title: "Analyse Technique : Signaux d'Achat",
        content: `D'un point de vue technique, ${symbol} forme une configuration classique de "tasse avec anse" sur le graphique journalier. Le RSI (Relative Strength Index) est en zone neutre-haussière, suggérant qu'il y a encore beaucoup de place pour la croissance avant d'atteindre des conditions de surachat. La moyenne mobile à 50 jours a récemment croisé la moyenne mobile à 200 jours (Golden Cross), un signal d'achat à long terme très puissant.`
      },
      {
        title: "Adoption et Fondamentaux",
        content: `Au-delà des graphiques, les fondamentaux de ${assetName} n'ont jamais été aussi solides. L'adoption du réseau continue de croître, et de nouveaux partenariats stratégiques renforcent sa position de leader sur le marché. Dans un contexte macroéconomique incertain, ${assetName} joue de plus en plus son rôle de valeur refuge et de diversification de portefeuille indispensable.`
      },
      {
        title: "Conclusion : Faut-il investir maintenant ?",
        content: `En conclusion, tous les feux sont au vert pour ${assetName}. La combinaison d'une structure technique haussière, d'une adoption croissante et d'un intérêt institutionnel fort en fait l'un des meilleurs ratios risque/récompense du marché actuel. Nos modèles prédictifs anticipent une performance supérieure à celle du marché global dans les semaines à venir.`
      }
    ],
    tags: ["Investissement", "Analyse Technique", symbol, "Tendance Haussière", "Crypto"]
  }
}
