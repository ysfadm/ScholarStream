/**
 * Transaction Status Display Component
 */

interface TransactionStatusProps {
  status: "idle" | "pending" | "success" | "error";
  hash?: string;
  error?: string;
  onRetry?: () => void;
  network?: "testnet" | "public";
}

export const TransactionStatus = ({
  status,
  hash,
  error,
  onRetry,
  network = "testnet",
}: TransactionStatusProps) => {
  if (status === "idle") return null;

  if (status === "pending") {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        <div className="flex-1">
          <p className="text-blue-800 font-semibold">Transaction Pending</p>
          <p className="text-blue-600 text-sm">
            Please wait while the transaction is processed...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success" && hash) {
    const explorerUrl = `https://stellar.expert/explorer/${network}/tx/${hash}`;

    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div className="flex-1">
            <p className="text-green-800 font-semibold mb-1">
              Transaction Successful!
            </p>
            <p className="text-green-700 text-sm mb-2">
              Your transaction has been confirmed on the blockchain.
            </p>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium underline"
            >
              View on Stellar Expert
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div className="flex-1">
            <p className="text-red-800 font-semibold mb-1">
              Transaction Failed
            </p>
            <p className="text-red-700 text-sm mb-3">
              {error || "An unexpected error occurred. Please try again."}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                Retry Transaction
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
