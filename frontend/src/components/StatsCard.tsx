import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: boolean;
}

const StatsCard = ({ title, value, icon: Icon, gradient }: StatsCardProps) => {
  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        gradient ? "gradient-hero border-primary/20" : "border-border/50"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
              {title}
            </p>
            <p className="text-4xl font-bold tracking-tight">{value}</p>
          </div>
          <div
            className={`${
              gradient ? "gradient-primary" : "bg-primary/10"
            } p-4 rounded-xl shadow-glow`}
          >
            <Icon
              className={`h-7 w-7 ${
                gradient ? "text-primary-foreground" : "text-primary"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
