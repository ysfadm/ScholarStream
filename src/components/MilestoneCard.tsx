/**
 * Milestone Card Component
 */

interface MilestoneCardProps {
  milestone: {
    id: number;
    title: string;
    description?: string;
    required_progress: number;
    reward_amount: number;
    is_completed: boolean;
    proof_data?: string;
  };
  tokenType?: string;
  onSubmitProof?: (milestoneId: number) => void;
  disabled?: boolean;
}

export const MilestoneCard = ({
  milestone,
  tokenType = "BRS",
  onSubmitProof,
  disabled = false,
}: MilestoneCardProps) => {
  const isCompleted = milestone.is_completed;

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isCompleted
          ? "bg-green-50 border-green-300"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
            {isCompleted && (
              <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-medium">
                ✓ Completed
              </span>
            )}
          </div>
          {milestone.description && (
            <p className="text-sm text-gray-600">{milestone.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">Reward</p>
          <p className="text-lg font-bold text-blue-600">
            {milestone.reward_amount} {tokenType}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Progress Required</p>
          <p className="text-sm font-semibold text-gray-700">
            {milestone.required_progress}%
          </p>
        </div>

        {!isCompleted && onSubmitProof && (
          <button
            onClick={() => onSubmitProof(milestone.id)}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Proof
          </button>
        )}
      </div>

      {isCompleted && milestone.proof_data && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-gray-500 mb-1">Proof Submitted</p>
          <p className="text-xs text-gray-600 font-mono truncate">
            {milestone.proof_data}
          </p>
        </div>
      )}
    </div>
  );
};
