import {
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RiskBadgeProps {
  completionRate: number; // 0 to 100
  activityLevel: "High" | "Medium" | "Low";
  availability: number; // Hours per week
}

export const RiskBadge = ({
  completionRate,
  activityLevel,
  availability,
}: RiskBadgeProps) => {
  // --- 1. CALCULATE SCORE (Simple Algorithm) ---
  let score = 0;

  // Weight: Completion Rate (50%)
  score += completionRate * 0.5;

  // Weight: Activity Level (30%)
  if (activityLevel === "High") score += 30;
  else if (activityLevel === "Medium") score += 15;
  else score += 5;

  // Weight: Availability (20%)
  if (availability > 20) score += 20; // Full time-ish
  else if (availability > 10) score += 15;
  else if (availability > 5) score += 5;
  else score += 0;

  // --- 2. DETERMINE LEVEL ---
  let level: "High Commitment" | "Medium Commitment" | "High Dropout Risk";
  let colorClass = "";
  let Icon = HelpCircle;

  if (score >= 80) {
    level = "High Commitment";
    colorClass =
      "bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/25";
    Icon = CheckCircle;
  } else if (score >= 50) {
    level = "Medium Commitment";
    colorClass =
      "bg-yellow-500/15 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/25";
    Icon = MinusCircle;
  } else {
    level = "High Dropout Risk";
    colorClass =
      "bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/25";
    Icon = AlertTriangle;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`gap-1.5 py-1 px-3 ${colorClass} cursor-help`}
          >
            <Icon className="w-3.5 h-3.5" />
            {level}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-popover text-popover-foreground border-border text-xs p-3 space-y-1">
          <p className="font-bold">Risk Analysis:</p>
          <p>
            • Completion Rate:{" "}
            <span className="text-muted-foreground">{completionRate}%</span>
          </p>
          <p>
            • Recent Activity:{" "}
            <span className="text-muted-foreground">{activityLevel}</span>
          </p>
          <p>
            • Availability:{" "}
            <span className="text-muted-foreground">{availability} hrs/wk</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
