import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface GlassCardProps extends React.ComponentProps<typeof Card> {
  variant?: "default" | "neon" | "ghost"
}

export function GlassCard({ className, variant = "default", ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        "bg-card/40 backdrop-blur-md border-white/10 shadow-xl",
        variant === "neon" && "border-primary/50 shadow-primary/20",
        variant === "ghost" && "bg-transparent border-transparent shadow-none",
        className
      )}
      {...props}
    />
  )
}

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
