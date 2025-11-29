import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getStoredWallet, disconnectWallet } from "@/utils/wallet";
import {
  updateProgress,
  getTotalProgress,
  getLastStudent,
} from "@/utils/contract";

export default function Main() {
  const router = useRouter();
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [studentAddress, setStudentAddress] = useState("");
  const [progress, setProgress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Contract state
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [lastStudent, setLastStudent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check wallet connection on mount
  useEffect(() => {
    const storedKey = getStoredWallet();
    if (!storedKey) {
      router.push("/");
      return;
    }
    setPublicKey(storedKey);
    loadContractData();
  }, [router]);

  // Load contract data
  const loadContractData = async () => {
    setIsLoading(true);
    try {
      const [total, last] = await Promise.all([
        getTotalProgress(),
        getLastStudent(),
      ]);
      setTotalProgress(total);
      setLastStudent(last);
    } catch (err) {
      console.error("Failed to load contract data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!studentAddress.trim()) {
      setError("Please enter a student wallet address");
      return;
    }

    const progressValue = parseInt(progress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      setError("Progress must be a number between 0 and 100");
      return;
    }

    if (!publicKey) {
      setError("Wallet not connected");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call contract to update progress
      const txHash = await updateProgress(
        studentAddress,
        progressValue,
        publicKey
      );

      console.log("Transaction hash:", txHash);
      setSuccess(
        `Progress updated successfully! TX: ${txHash.substring(0, 8)}...`
      );

      // Reload contract data
      await loadContractData();

      // Clear form
      setStudentAddress("");
      setProgress("");
    } catch (err: any) {
      console.error("Failed to update progress:", err);
      setError(err?.message || "Failed to update progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!publicKey) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ScholarStream
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Connected: {publicKey.substring(0, 8)}...
                {publicKey.substring(publicKey.length - 8)}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition duration-200"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Stats Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Contract Stats
          </h2>

          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-gray-600 font-medium">
                  Total Progress Recorded:
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {totalProgress}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">
                  Last Student Updated:
                </span>
                <span className="text-sm text-gray-700 font-mono">
                  {lastStudent
                    ? `${lastStudent.substring(0, 8)}...${lastStudent.substring(
                        lastStudent.length - 8
                      )}`
                    : "None"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Update Milestone Progress
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="studentAddress"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Student Wallet Address
              </label>
              <input
                type="text"
                id="studentAddress"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="progress"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Milestone Progress (0-100)
              </label>
              <input
                type="number"
                id="progress"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="25"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              {isSubmitting ? "Submitting..." : "Update Milestone"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
