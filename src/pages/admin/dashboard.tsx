import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPublicKey, disconnectWallet } from "@/utils/wallet";
import { isAdmin, verifyRoleAccess } from "@/config/auth";

interface PlatformStats {
  totalScholarships: number;
  activeScholarships: number;
  totalFundsDistributed: number;
  totalStudents: number;
  totalDonors: number;
  averageCompletion: number;
}

interface ScholarshipItem {
  id: number;
  donor: string;
  student: string;
  totalAmount: number;
  releasedAmount: number;
  tokenType: string;
  milestonesCompleted: number;
  totalMilestones: number;
  isActive: boolean;
}

interface LeaderboardItem {
  address: string;
  completedMilestones: number;
  totalEarned: number;
  completionRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({
    totalScholarships: 0,
    activeScholarships: 0,
    totalFundsDistributed: 0,
    totalStudents: 0,
    totalDonors: 0,
    averageCompletion: 0,
  });
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "scholarships" | "leaderboard"
  >("overview");

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const pubKey = await getPublicKey();
    if (!pubKey) {
      router.push("/");
      return;
    }

    // Verify admin access
    if (!isAdmin(pubKey)) {
      alert(
        "⚠️ Access Denied\n\nYou do not have admin privileges.\n\nOnly whitelisted addresses can access the admin dashboard."
      );
      router.push("/");
      return;
    }

    // Show verification success
    setAddress(pubKey);
    setIsVerified(true);

    // Small delay to show verification message
    setTimeout(async () => {
      await loadAdminData();
    }, 1500);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/");
  };

  const switchRole = (role: "student" | "donor" | "admin") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", role);
    }
    router.push(`/${role}/dashboard`);
  };

  const loadAdminData = async () => {
    try {
      // Load all scholarships from localStorage across all donors
      const allScholarships: ScholarshipItem[] = [];
      const uniqueStudents = new Set<string>();
      const uniqueDonors = new Set<string>();
      let totalFundsDistributed = 0;

      // Iterate through all localStorage keys to find scholarship data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("scholarships_")) {
          try {
            const donorAddress = key.replace("scholarships_", "");
            const donorScholarships = JSON.parse(
              localStorage.getItem(key) || "[]"
            );

            uniqueDonors.add(donorAddress);

            donorScholarships.forEach((s: any) => {
              uniqueStudents.add(s.student);
              totalFundsDistributed += s.releasedAmount || 0;

              allScholarships.push({
                id: s.id,
                donor: donorAddress,
                student: s.student,
                totalAmount: s.totalAmount,
                releasedAmount: s.releasedAmount,
                tokenType: s.tokenType,
                milestonesCompleted: s.milestonesCompleted || 0,
                totalMilestones: s.totalMilestones || 4,
                isActive: s.isActive !== false,
              });
            });
          } catch (e) {
            console.error("Error parsing localStorage key:", key, e);
          }
        }
      }

      // Calculate average completion rate
      const averageCompletion =
        allScholarships.length > 0
          ? allScholarships.reduce(
              (sum, s) =>
                sum + (s.milestonesCompleted / s.totalMilestones) * 100,
              0
            ) / allScholarships.length
          : 0;

      // Update stats
      setStats({
        totalScholarships: allScholarships.length,
        activeScholarships: allScholarships.filter((s) => s.isActive).length,
        totalFundsDistributed,
        totalStudents: uniqueStudents.size,
        totalDonors: uniqueDonors.size,
        averageCompletion: Math.round(averageCompletion * 10) / 10,
      });

      // Set scholarships sorted by most recent
      setScholarships(allScholarships.sort((a, b) => b.id - a.id));

      // Build leaderboard - group by student
      const studentStats = new Map<
        string,
        { milestones: number; earned: number; total: number }
      >();

      allScholarships.forEach((s) => {
        const current = studentStats.get(s.student) || {
          milestones: 0,
          earned: 0,
          total: 0,
        };
        studentStats.set(s.student, {
          milestones: current.milestones + s.milestonesCompleted,
          earned: current.earned + s.releasedAmount,
          total: current.total + s.totalMilestones,
        });
      });

      const leaderboardData: LeaderboardItem[] = Array.from(
        studentStats.entries()
      ).map(([address, stats]) => ({
        address,
        completedMilestones: stats.milestones,
        totalEarned: stats.earned,
        completionRate:
          stats.total > 0
            ? Math.round((stats.milestones / stats.total) * 100)
            : 0,
      }));

      // Sort by total earned
      setLeaderboard(
        leaderboardData.sort((a, b) => b.totalEarned - a.totalEarned)
      );
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    const confirmed = window.confirm(
      "⚠️ DANGER: Clear All Data?\n\n" +
        "This will permanently delete:\n" +
        "• All scholarships from all donors\n" +
        "• All student data\n" +
        "• All milestone proofs\n\n" +
        "This action CANNOT be undone!\n\n" +
        "Are you absolutely sure?"
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "🚨 FINAL WARNING!\n\n" +
        "This is your last chance to cancel.\n\n" +
        "Click OK to permanently delete all platform data."
    );

    if (!doubleConfirm) return;

    try {
      // NUCLEAR OPTION: Clear ALL localStorage
      const beforeCount = localStorage.length;

      // Log what's being deleted
      console.log("=== CLEARING ALL LOCALSTORAGE ===");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          console.log(`Deleting: ${key}`);
        }
      }

      // Clear everything
      localStorage.clear();

      console.log(`=== CLEARED ${beforeCount} items ===`);

      // Reset stats
      setStats({
        totalScholarships: 0,
        activeScholarships: 0,
        totalFundsDistributed: 0,
        totalStudents: 0,
        totalDonors: 0,
        averageCompletion: 0,
      });
      setScholarships([]);
      setLeaderboard([]);

      alert(
        "✅ All Data Cleared\n\n" +
          `${beforeCount} localStorage items deleted.\n\n` +
          "All dashboards have been reset.\n" +
          "Check browser console for details."
      );

      // Reload admin data to confirm everything is cleared
      setTimeout(() => {
        loadAdminData();
      }, 500);
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("An error occurred while clearing data.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
        {!isVerified ? (
          <div className="text-white text-2xl">Verifying admin access...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center">
            <div className="mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Admin Access Verified
              </h2>
              <p className="text-gray-600 mb-4">
                You are authorized as an admin
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Wallet Address:</p>
                <p className="text-sm font-mono text-blue-800 break-all">
                  {address}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <span className="text-2xl">🛡️</span>
                <span className="font-semibold">Loading dashboard...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => switchRole("student")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                🎓 Student
              </button>
              <button
                onClick={() => switchRole("donor")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                💝 Donor
              </button>
              <button
                onClick={() => switchRole("admin")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
              >
                ⚙️ Admin
              </button>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <span>🛡️</span>
                  Authorized Admin
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Platform Statistics and Management
              </p>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {address.slice(0, 12)}...{address.slice(-8)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadAdminData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <span>🔄</span>
                Refresh Data
              </button>
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <span>🗑️</span>
                Clear All Data
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-600">Admin</div>
                <div className="text-sm font-mono">
                  {address.slice(0, 8)}...{address.slice(-8)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("scholarships")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === "scholarships"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🎓 All Scholarships
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === "leaderboard"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">
                  Total Scholarships
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalScholarships}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {stats.activeScholarships} active
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">
                  Total Distributed
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.totalFundsDistributed.toLocaleString()} XLM
                </div>
                <div className="text-sm text-gray-600 mt-1">Platform-wide</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">
                  Average Completion
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.averageCompletion}%
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Milestone-based
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Total Students</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {stats.totalStudents}
                </div>
                <div className="text-sm text-gray-600 mt-1">Registered</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Total Donors</div>
                <div className="text-3xl font-bold text-teal-600">
                  {stats.totalDonors}
                </div>
                <div className="text-sm text-gray-600 mt-1">Active</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">
                  Platform Status
                </div>
                <div className="text-2xl font-bold text-green-600">
                  🟢 Running
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  All systems normal
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Recent Activities
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      Milestone completed
                    </div>
                    <div className="text-sm text-gray-600">
                      GSTD...ABC - Scholarship #1 - 1000 XLM paid
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">2 hours ago</div>
                </div>

                <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      New scholarship created
                    </div>
                    <div className="text-sm text-gray-600">
                      By GDON...XYZ - 5000 XLM
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">5 hours ago</div>
                </div>

                <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      Funds deposited
                    </div>
                    <div className="text-sm text-gray-600">
                      Scholarship #3 - 4000 BRS Token
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scholarships Tab */}
        {activeTab === "scholarships" && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              All Scholarships
            </h2>
            <div className="space-y-4">
              {scholarships.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">
                          Scholarship #{scholarship.id}
                        </h3>
                        {scholarship.isActive ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p>
                          Donor: {scholarship.donor.slice(0, 8)}...
                          {scholarship.donor.slice(-8)}
                        </p>
                        <p>
                          Student: {scholarship.student.slice(0, 8)}...
                          {scholarship.student.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {scholarship.totalAmount} {scholarship.tokenType}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Paid: {scholarship.releasedAmount}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>
                        {scholarship.milestonesCompleted} /{" "}
                        {scholarship.totalMilestones} Milestone
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                        style={{
                          width: `${
                            (scholarship.milestonesCompleted /
                              scholarship.totalMilestones) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Student Leaderboard
            </h2>
            <div className="space-y-4">
              {leaderboard.map((student, index) => (
                <div
                  key={student.address}
                  className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition"
                >
                  <div className="text-3xl font-bold text-gray-300">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">
                      {student.address.slice(0, 8)}...
                      {student.address.slice(-8)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {student.completedMilestones} Milestones Completed
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {student.totalEarned.toLocaleString()} XLM
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.completionRate}% success rate
                    </div>
                  </div>
                  {index === 0 && <div className="text-4xl">🥇</div>}
                  {index === 1 && <div className="text-4xl">🥈</div>}
                  {index === 2 && <div className="text-4xl">🥉</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
