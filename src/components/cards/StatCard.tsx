interface StatCardProps {
  title: string;
  value: number;
  total: number;
}

export const StatCard = ({ title, value, total }: StatCardProps) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground mb-2">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{value}</span>
      </div>
      <span className="text-xs text-muted-foreground mt-1">out of {total}</span>
    </div>
  );
};
