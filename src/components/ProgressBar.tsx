/**
 * Reusable Progress Bar Component
 */

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  color?: "blue" | "green" | "purple" | "orange";
}

export const ProgressBar = ({
  current,
  total,
  label,
  showPercentage = true,
  color = "green",
}: ProgressBarProps) => {
  const percentage = Math.min((current / total) * 100, 100);

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xs text-gray-500">
            {current} / {total}
          </p>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
        >
          {showPercentage && percentage > 10 && (
            <span className="text-xs text-white font-semibold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
