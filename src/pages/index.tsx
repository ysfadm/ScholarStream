import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  connectWallet,
  checkWalletConnection,
  checkFreighterInstalled,
} from "@/utils/wallet";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "student" | "donor" | "admin" | null
  >(null);

  useEffect(() => {
    checkInstallation();
  }, []);

  const checkInstallation = async () => {
    const installed = await checkFreighterInstalled();
    setFreighterInstalled(installed);
  };

  const handleConnect = async (role: "student" | "donor" | "admin") => {
    setLoading(true);
    try {
      // Store role in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userRole", role);
      }
      // Route based on selected role (wallet already connected)
      router.push(`/${role}/dashboard`);
    } catch (error) {
      console.error("Navigation error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!freighterInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ScholarStream
          </h1>
          <p className="text-gray-600 mb-6">
            You must have Freighter Wallet installed to use this app.
          </p>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Download Freighter Wallet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          ScholarStream
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Blockchain-Based Scholarship Management System
        </p>

        {!selectedRole ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
              Welcome to ScholarStream
            </h2>

            {!walletConnected ? (
              <div className="text-center">
                <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="text-4xl mb-3">🔐</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your Freighter wallet to access ScholarStream
                  </p>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const success = await connectWallet();
                        if (success) {
                          setWalletConnected(true);
                        } else {
                          alert("Wallet connection failed. Please try again.");
                        }
                      } catch (error) {
                        console.error("Connection error:", error);
                        alert("An error occurred while connecting.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">🔗</span>
                        <span>Connect Freighter Wallet</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Don't have Freighter?{" "}
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    Install it here
                  </a>
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-sm text-green-800 flex items-center justify-center gap-2">
                    <span>✅</span>
                    <span className="font-semibold">Wallet Connected</span>
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-700 mb-4">
                  Select Your Role
                </h3>

                <button
                  onClick={() => setSelectedRole("student")}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🎓</span>
                  <span>Continue as Student</span>
                </button>

                <button
                  onClick={() => setSelectedRole("donor")}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">💝</span>
                  <span>Continue as Donor</span>
                </button>

                <button
                  onClick={() => setSelectedRole("admin")}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🛡️</span>
                  <span>Continue as Admin (Authorized Only)</span>
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  🔒 Admin access requires wallet verification
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">
                {selectedRole === "student"
                  ? "🎓"
                  : selectedRole === "donor"
                  ? "💝"
                  : "⚙️"}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedRole === "student"
                  ? "Student Dashboard"
                  : selectedRole === "donor"
                  ? "Donor Dashboard"
                  : "Admin Dashboard"}
              </h2>
              <p className="text-gray-600">
                {selectedRole === "student"
                  ? "View your scholarships and track milestone progress"
                  : selectedRole === "donor"
                  ? "Create scholarships and support students"
                  : "View platform statistics and manage the system"}
              </p>
            </div>

            <button
              onClick={() => handleConnect(selectedRole)}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? "Opening Dashboard..." : "Continue to Dashboard"}
            </button>

            <button
              onClick={() => setSelectedRole(null)}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              ← Go Back
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
          <p>Running on Stellar Testnet</p>
          <p className="text-xs">
            Contract IDs: Token, Escrow & Milestone System
          </p>
        </div>
      </div>
    </div>
  );
}
