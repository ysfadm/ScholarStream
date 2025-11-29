/**
 * Reusable Stat Card Component for Dashboards
 */

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    positive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "teal" | "indigo";
}

export const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  change,
  color = "blue",
}: StatCardProps) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    teal: "text-teal-600",
    indigo: "text-indigo-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {change && (
          <span
            className={`text-sm font-semibold flex items-center gap-1 ${
              change.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change.positive ? "↑" : "↓"} {Math.abs(change.value)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
};
