import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPublicKey, disconnectWallet } from "@/utils/wallet";
import { CONTRACTS } from "@/config/contracts";
import {
  isConnected,
  requestAccess,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";
import {
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
  Horizon,
} from "@stellar/stellar-sdk";

interface Milestone {
  id: number;
  title: string;
  description?: string;
  required_progress: number;
  reward_amount: number;
  proof_type: string;
  is_completed: boolean;
  proof_data?: string | null;
  proof_status?: "not_submitted" | "pending" | "approved" | "rejected";
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string;
}

interface Scholarship {
  id: number;
  donor: string;
  student: string;
  total_amount: number;
  released_amount: number;
  token_type: string;
  milestones: Milestone[];
  is_active: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [address, setAddress] = useState<string>("");
  const [brsBalance, setBrsBalance] = useState<number>(0);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScholarship, setSelectedScholarship] = useState<number | null>(
    null
  );
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(
    null
  );
  const [proofData, setProofData] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const pubKey = await getPublicKey();
    if (!pubKey) {
      router.push("/");
      return;
    }
    setAddress(pubKey);
    await loadStudentData(pubKey);
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

  const loadStudentData = async (studentAddress: string) => {
    try {
      // TODO: Replace with real blockchain call to CONTRACTS.ESCROW.get_student_scholarships
      setBrsBalance(150);

      // Load all scholarships from localStorage across all donors
      const allScholarships: Scholarship[] = [];

      console.log("Loading scholarships for student:", studentAddress);

      // Iterate through all localStorage keys to find scholarship data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("scholarships_")) {
          try {
            const donorScholarships = JSON.parse(
              localStorage.getItem(key) || "[]"
            );
            console.log(
              `Found ${donorScholarships.length} scholarships from ${key}`
            );

            // Convert donor scholarship format to student scholarship format
            donorScholarships.forEach((donorScholarship: any) => {
              console.log(
                "Checking scholarship student:",
                donorScholarship.student,
                "vs",
                studentAddress
              );
              // Case-insensitive and trimmed comparison
              const scholarshipStudent = (
                donorScholarship.student || ""
              ).trim();
              const currentStudent = (studentAddress || "").trim();

              if (scholarshipStudent === currentStudent) {
                console.log(
                  "✅ Match found! Adding scholarship:",
                  donorScholarship
                );
                // Use actual milestones from donor scholarship
                const actualMilestones = (
                  donorScholarship.milestones || []
                ).map((m: any) => ({
                  id: m.id,
                  title: m.title,
                  description: `${m.proofType} proof required`,
                  required_progress: m.requiredProgress,
                  reward_amount: m.rewardAmount,
                  proof_type: m.proofType,
                  is_completed: m.isCompleted || false,
                  proof_data: m.proofData || null,
                  proof_status: m.proofStatus || "not_submitted",
                  submitted_at: m.submittedAt || null,
                  approved_at: m.approvedAt || null,
                  rejected_at: m.rejectedAt || null,
                  rejection_reason: m.rejectionReason || null,
                }));

                allScholarships.push({
                  id: donorScholarship.id,
                  donor: key.replace("scholarships_", ""),
                  student: studentAddress,
                  total_amount: donorScholarship.totalAmount,
                  released_amount: donorScholarship.releasedAmount,
                  token_type: donorScholarship.tokenType,
                  is_active: donorScholarship.isActive,
                  milestones: actualMilestones,
                });
              }
            });
          } catch (e) {
            console.error("Error parsing localStorage key:", key, e);
          }
        }
      }

      console.log("Total scholarships found:", allScholarships.length);

      // Debug: Show all student addresses found
      if (allScholarships.length === 0) {
        console.warn("⚠️ No scholarships found for student:", studentAddress);
        console.log("📋 Checking all localStorage scholarship data...");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("scholarships_")) {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            console.log(
              `Key: ${key}, Scholarships:`,
              data.map((s: any) => ({
                id: s.id,
                student: s.student,
                isActive: s.isActive,
              }))
            );
          }
        }
      }

      setScholarships(allScholarships);
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async (scholarshipId: number, milestoneId: number) => {
    // Find current scholarship and milestone
    const scholarship = scholarships.find((s) => s.id === scholarshipId);
    const milestone = scholarship?.milestones.find((m) => m.id === milestoneId);

    // Prevent duplicate submission while pending
    if (milestone?.proof_status === "pending") {
      alert(
        "Kanıt zaten gönderildi ve onay bekliyor. Lütfen bağışçının yanıtını bekleyin."
      );
      return;
    }

    // Prevent submission if already approved
    if (milestone?.proof_status === "approved" || milestone?.is_completed) {
      alert("Bu aşama için kanıt zaten onaylandı.");
      return;
    }

    if (!proofData.trim()) {
      alert("Please enter proof data");
      return;
    }

    try {
      // Find the scholarship and milestone
      const scholarship = scholarships.find((s) => s.id === scholarshipId);
      const milestone = scholarship?.milestones.find(
        (m) => m.id === milestoneId
      );

      if (!scholarship || !milestone) {
        alert("Scholarship or milestone not found");
        return;
      }

      // Check if already pending
      if (milestone.proof_status === "pending") {
        alert(
          "⚠️ Already Submitted\n\nYou have already submitted proof for this milestone.\n\nYour submission is currently awaiting donor approval.\n\nPlease wait for the donor to review your proof."
        );
        setSelectedMilestone(null);
        setSelectedScholarship(null);
        setProofData("");
        return;
      }

      console.log(
        "Submitting proof for scholarship:",
        scholarshipId,
        "milestone:",
        milestoneId
      );

      // Update localStorage with proof submission (status: pending)
      const donorKey = `scholarships_${scholarship.donor}`;
      const donorScholarships = JSON.parse(
        localStorage.getItem(donorKey) || "[]"
      );

      const updatedDonorScholarships = donorScholarships.map((s: any) => {
        if (s.id === scholarshipId) {
          return {
            ...s,
            milestones: s.milestones.map((m: any) => {
              if (m.id === milestoneId) {
                return {
                  ...m,
                  proofData: proofData,
                  proofStatus: "pending",
                  submittedAt: new Date().toISOString(),
                };
              }
              return m;
            }),
          };
        }
        return s;
      });

      localStorage.setItem(donorKey, JSON.stringify(updatedDonorScholarships));

      alert(
        `✅ Proof submitted successfully!\n\nYour proof is now pending approval from the donor.\n\nYou will receive payment once the donor reviews and approves your submission.`
      );

      setSelectedMilestone(null);
      setSelectedScholarship(null);
      setProofData("");
      await loadStudentData(address);
    } catch (error) {
      console.error("Error submitting proof:", error);
      alert("An error occurred: " + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => switchRole("student")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold"
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                🛡️ Admin
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <div className="text-sm">
                <div className="text-gray-500">Wallet</div>
                <div className="font-mono font-semibold text-purple-600">
                  {address.slice(0, 4)}...{address.slice(-4)}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Active Scholarships
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {scholarships.filter((s) => s.is_active).length}
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">BRS Token Balance</p>
                <p className="text-3xl font-bold text-green-600">
                  {brsBalance}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">💎</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Total Funds Received
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {scholarships.reduce((sum, s) => sum + s.released_amount, 0)}{" "}
                  XLM
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scholarships List */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            My Scholarships
          </h2>

          {scholarships.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <span className="text-6xl mb-4 block">📚</span>
              <p className="text-xl text-gray-600">No scholarships yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Scholarships will appear here once donors create them for you
              </p>
            </div>
          ) : (
            <>
              {/* Pending Approvals Section */}
              {scholarships.some((s) =>
                s.milestones.some((m) => m.proof_status === "pending")
              ) && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <span>⏳</span>
                    Pending Donor Approvals
                  </h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    You have submitted proofs that are awaiting donor review.
                    You cannot resubmit until the donor approves or rejects your
                    submission.
                  </p>
                  <div className="space-y-3">
                    {scholarships.map((scholarship) =>
                      scholarship.milestones
                        .filter((m) => m.proof_status === "pending")
                        .map((milestone) => (
                          <div
                            key={`${scholarship.id}-${milestone.id}`}
                            className="bg-white rounded-lg p-4 border border-yellow-200"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  Scholarship #{scholarship.id} -{" "}
                                  {milestone.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Submitted:{" "}
                                  {milestone.submitted_at
                                    ? new Date(
                                        milestone.submitted_at
                                      ).toLocaleString()
                                    : "Recently"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-purple-600">
                                  {milestone.reward_amount}{" "}
                                  {scholarship.token_type}
                                </p>
                                <p className="text-xs text-yellow-700 flex items-center gap-1">
                                  <span>⏳</span>
                                  Awaiting Review
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* All Scholarships */}
              {scholarships.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="bg-white rounded-2xl shadow-xl p-6"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Scholarship #{scholarship.id}
                      </h3>
                      <p className="text-gray-500">
                        Donor: {scholarship.donor.slice(0, 8)}...
                        {scholarship.donor.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {scholarship.total_amount} {scholarship.token_type}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        {scholarship.released_amount} Released
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-semibold">
                        {
                          scholarship.milestones.filter((m) => m.is_completed)
                            .length
                        }{" "}
                        / {scholarship.milestones.length} Milestones
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (scholarship.milestones.filter(
                              (m) => m.is_completed
                            ).length /
                              scholarship.milestones.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Milestones</h4>
                    {scholarship.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`border-2 rounded-xl p-4 ${
                          milestone.is_completed
                            ? "border-green-300 bg-green-50"
                            : milestone.proof_status === "pending"
                            ? "border-yellow-300 bg-yellow-50"
                            : milestone.proof_status === "rejected"
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">
                                {milestone.is_completed
                                  ? "✅"
                                  : milestone.proof_status === "pending"
                                  ? "⏳"
                                  : milestone.proof_status === "rejected"
                                  ? "❌"
                                  : "📝"}
                              </span>
                              <h5 className="font-semibold text-gray-800">
                                {milestone.title}
                              </h5>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Progress Required: {milestone.required_progress}%
                            </p>
                            <p className="text-sm text-gray-500">
                              Proof Type: {milestone.proof_type}
                            </p>

                            {/* Status Messages */}
                            {milestone.proof_status === "pending" && (
                              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                                <p className="font-semibold">
                                  ⏳ Pending Donor Approval
                                </p>
                                <p className="text-xs mt-1">
                                  Your proof has been submitted and is awaiting
                                  review by the donor.
                                </p>
                              </div>
                            )}

                            {milestone.proof_status === "rejected" &&
                              milestone.rejection_reason && (
                                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                                  <p className="font-semibold">
                                    ❌ Proof Rejected
                                  </p>
                                  <p className="text-xs mt-1">
                                    Reason: {milestone.rejection_reason}
                                  </p>
                                  <p className="text-xs mt-1">
                                    You can resubmit with corrections.
                                  </p>
                                </div>
                              )}

                            {milestone.is_completed && (
                              <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                                <p className="font-semibold">
                                  ✅ Milestone Completed
                                </p>
                                <p className="text-xs mt-1">
                                  Payment of {milestone.reward_amount}{" "}
                                  {scholarship.token_type} has been sent!
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600">
                              {milestone.reward_amount} {scholarship.token_type}
                            </p>
                            {!milestone.is_completed && (
                              <>
                                {milestone.proof_status === "pending" ? (
                                  <button
                                    disabled
                                    className="mt-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm flex items-center gap-2"
                                  >
                                    <span>⏳</span>
                                    <span>Awaiting Approval</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedScholarship(scholarship.id);
                                      setSelectedMilestone(milestone.id);
                                    }}
                                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                                  >
                                    {milestone.proof_status === "rejected"
                                      ? "Resubmit Proof"
                                      : "Submit Proof"}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Proof Submission Form */}
                        {selectedScholarship === scholarship.id &&
                          selectedMilestone === milestone.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Proof Data (e.g., transcript hash, project URL)
                              </label>
                              <p className="text-xs text-gray-500 mb-2">
                                💡 Example links to test:
                                <br />
                                <span className="text-blue-600">
                                  https://github.com/yourusername/project
                                </span>
                                <br />
                                <span className="text-blue-600">
                                  https://drive.google.com/file/d/1234567890/view
                                </span>
                                <br />
                                <span className="text-blue-600">
                                  ipfs://QmXxxx... (IPFS hash)
                                </span>
                              </p>
                              <input
                                type="text"
                                value={proofData}
                                onChange={(e) => setProofData(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                                placeholder="https://github.com/student/final-project"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    submitProof(scholarship.id, milestone.id)
                                  }
                                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                  Submit for Verification
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedMilestone(null);
                                    setSelectedScholarship(null);
                                    setProofData("");
                                  }}
                                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
