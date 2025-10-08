import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  status: string;
  color: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  status,
  color,
}: MetricCardProps) => {
  const isPositive = change > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
      <h3 className="text-sm text-muted-foreground mb-4">{title}</h3>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-5xl font-bold">{value}</span>
        <div
          className={`flex items-center gap-1 ${
            isPositive ? "text-success" : "text-destructive"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">{Math.abs(change)}%</span>
        </div>
      </div>

      <span className="text-xs text-muted-foreground">{status}</span>

      <div className="absolute bottom-0 right-0 w-32 h-20">
        <svg
          viewBox="0 0 100 50"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 Q25,30 50,25 T100,15"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.8"
          />
          <path
            d="M0,40 Q25,30 50,25 T100,15 L100,50 L0,50 Z"
            fill={`url(#gradient-${title})`}
            opacity="0.3"
          />
          <defs>
            <linearGradient
              id={`gradient-${title}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
