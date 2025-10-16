import { Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { University } from "@/lib/types"

interface UniversityBadgeProps {
  university: University
  showDomain?: boolean
}

export function UniversityBadge({ university, showDomain = false }: UniversityBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1.5 px-2 py-1">
      <Building2 className="h-3 w-3" />
      <span className="font-medium">{university.shortName}</span>
      {showDomain && <span className="text-muted-foreground">({university.domain})</span>}
    </Badge>
  )
}
