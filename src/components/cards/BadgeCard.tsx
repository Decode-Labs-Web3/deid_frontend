import { Bitcoin } from "lucide-react";

interface BadgeCardProps {
  title: string;
  description: string;
}

export const BadgeCard = ({ title, description }: BadgeCardProps) => {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary transition-all cursor-pointer group">
      <div
        className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform"
        style={{
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        <Bitcoin className="w-10 h-10 text-white" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold mb-1">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
