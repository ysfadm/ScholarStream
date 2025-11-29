/*
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

interface CreateScholarshipForm {
  studentAddress: string;
  totalAmount: string;
  tokenType: "XLM" | "BRS";
  milestones: MilestoneForm[];
}

interface MilestoneForm {
  title: string;
  requiredProgress: number;
  rewardAmount: string;
  proofType: string;
}

export default function DonorDashboard() {
  const router = useRouter();
  const [address, setAddress] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myScholarships, setMyScholarships] = useState<any[]>([]);

  const [form, setForm] = useState<CreateScholarshipForm>({
    studentAddress: "",
    totalAmount: "",
    tokenType: "XLM",
    milestones: [
      {
        title: "",
        requiredProgress: 25,
        rewardAmount: "",
        proofType: "transcript",
      },
    ],
  });

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
    await loadDonorData(pubKey);
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

  const loadDonorData = async (donorAddress: string) => {
    try {
      // TODO: Replace with real blockchain call to CONTRACTS.ESCROW.get_donor_scholarships

      // Load from localStorage
      const storageKey = `scholarships_${donorAddress}`;
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        setMyScholarships(JSON.parse(saved));
      } else {
        // Do not auto-seed mock data; keep empty until user creates one
        setMyScholarships([]);
        // Ensure we don't recreate defaults on next load
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Error loading donor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => {
    if (form.milestones.length >= 10) {
      alert("You can add a maximum of 10 milestones");
      return;
    }
    setForm({
      ...form,
      milestones: [
        ...form.milestones,
        {
          title: "",
          requiredProgress: (form.milestones.length + 1) * 25,
          rewardAmount: "",
          proofType: "transcript",
        },
      ],
    });
  };

  const removeMilestone = (index: number) => {
    if (form.milestones.length <= 1) {
      alert("At least one milestone is required");
      return;
    }
    setForm({
      ...form,
      milestones: form.milestones.filter((_, i) => i !== index),
    });
  };

  const updateMilestone = (
    index: number,
    field: keyof MilestoneForm,
    value: any
  ) => {
    const newMilestones = [...form.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setForm({ ...form, milestones: newMilestones });
  };

  const createScholarship = async () => {
    // Validation
    if (!form.studentAddress.trim()) {
      alert("Please enter student address");
      return;
    }
    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) {
      alert("Please enter a valid total amount");
      return;
    }

    const totalMilestoneAmount = form.milestones.reduce(
      (sum, m) => sum + parseFloat(m.rewardAmount || "0"),
      0
    );
    if (totalMilestoneAmount !== parseFloat(form.totalAmount)) {
      alert(
        `Sum of milestone amounts (${totalMilestoneAmount}) must equal total scholarship amount (${form.totalAmount})`
      );
      return;
    }

    for (let i = 0; i < form.milestones.length; i++) {
      const m = form.milestones[i];
      if (
        !m.title.trim() ||
        !m.rewardAmount ||
        parseFloat(m.rewardAmount) <= 0
      ) {
        alert(`Milestone ${i + 1}: Please fill in all fields`);
        return;
      }
    }

    try {
      // TODO: Call CONTRACTS.ESCROW.create_scholarship on blockchain
      console.log("Creating scholarship:", form);
*/
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getPublicKey, disconnectWallet } from "@/utils/wallet";
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

// Types
type TokenType = "XLM" | "BRS";

type ProofStatus = "not_submitted" | "pending" | "approved" | "rejected";

interface MilestoneForm {
  title: string;
  requiredProgress: number;
  rewardAmount: string; // entered as string in form; parsed to number
  proofType: string;
}

interface Milestone {
  id: number;
  title: string;
  requiredProgress: number;
  rewardAmount: number;
  proofType: string;
  proofStatus: ProofStatus;
  proofData?: string | null;
  isCompleted: boolean;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
}

interface Scholarship {
  id: number;
  donor: string;
  student: string;
  totalAmount: number;
  depositedAmount: number;
  releasedAmount: number;
  tokenType: TokenType;
  isActive: boolean;
  isLocked?: boolean;
  milestonesCompleted: number;
  totalMilestones: number;
  createdAt: string;
  milestones: Milestone[];
}

interface CreateScholarshipForm {
  studentAddress: string;
  totalAmount: string;
  tokenType: TokenType;
  milestones: MilestoneForm[];
}

export default function DonorDashboard() {
  const router = useRouter();
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [myScholarships, setMyScholarships] = useState<Scholarship[]>([]);

  const [form, setForm] = useState<CreateScholarshipForm>({
    studentAddress: "",
    totalAmount: "",
    tokenType: "XLM",
    milestones: [
      {
        title: "",
        requiredProgress: 25,
        rewardAmount: "",
        proofType: "transcript",
      },
    ],
  });

  // Helpers
  const storageKey = useMemo(
    () => (address ? `scholarships_${address}` : ""),
    [address]
  );

  const loadScholarships = () => {
    if (typeof window === "undefined" || !storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setMyScholarships([]);
      return;
    }
    try {
      const parsed: Scholarship[] = JSON.parse(saved);
      setMyScholarships(Array.isArray(parsed) ? parsed : []);
    } catch {
      setMyScholarships([]);
    }
  };

  const saveScholarships = (items: Scholarship[]) => {
    if (typeof window === "undefined" || !storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(items));
    setMyScholarships(items);
  };

  // Lifecycle: require wallet connection
  useEffect(() => {
    (async () => {
      const pubKey = await getPublicKey();
      if (!pubKey) {
        router.push("/");
        return;
      }
      setAddress(pubKey);
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (!loading && address) {
      loadScholarships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, address]);

  const switchRole = (role: "student" | "donor" | "admin") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", role);
    }
    router.push(`/${role}/dashboard`);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/");
  };

  // Create Scholarship
  const addMilestone = () => {
    if (form.milestones.length >= 10) {
      alert("You can add a maximum of 10 milestones");
      return;
    }
    setForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: "",
          requiredProgress: Math.min((prev.milestones.length + 1) * 25, 100),
          rewardAmount: "",
          proofType: "transcript",
        },
      ],
    }));
  };

  const removeMilestone = (index: number) => {
    if (form.milestones.length <= 1) {
      alert("At least one milestone is required");
      return;
    }
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (
    index: number,
    field: keyof MilestoneForm,
    value: any
  ) => {
    setForm((prev) => {
      const next = [...prev.milestones];
      next[index] = { ...next[index], [field]: value } as MilestoneForm;
      return { ...prev, milestones: next };
    });
  };

  const createScholarship = () => {
    const student = form.studentAddress.trim();
    const totalAmountNum = parseFloat(form.totalAmount || "0");

    if (!student) {
      alert("Please enter student address");
      return;
    }
    if (!form.totalAmount || totalAmountNum <= 0) {
      alert("Please enter a valid total amount");
      return;
    }

    // Validate milestones
    for (let i = 0; i < form.milestones.length; i++) {
      const m = form.milestones[i];
      const rewardNum = parseFloat(m.rewardAmount || "0");
      if (!m.title.trim() || rewardNum <= 0) {
        alert(`Milestone ${i + 1}: Please fill in all fields`);
        return;
      }
    }

    const totalMilestoneAmount = form.milestones.reduce(
      (sum, m) => sum + parseFloat(m.rewardAmount || "0"),
      0
    );
    if (Math.abs(totalMilestoneAmount - totalAmountNum) > 1e-9) {
      alert(
        `Sum of milestone amounts (${totalMilestoneAmount}) must equal total scholarship amount (${form.totalAmount})`
      );
      return;
    }

    const newScholarship: Scholarship = {
      id: (myScholarships[0]?.id || 0) + 1, // simple ID scheme: newest first
      donor: address,
      student,
      totalAmount: totalAmountNum,
      depositedAmount: 0,
      releasedAmount: 0,
      tokenType: form.tokenType,
      isActive: true,
      isLocked: false,
      milestonesCompleted: 0,
      totalMilestones: form.milestones.length,
      createdAt: new Date().toISOString().split("T")[0],
      milestones: form.milestones.map((m, idx) => ({
        id: idx + 1,
        title: m.title,
        requiredProgress: m.requiredProgress,
        rewardAmount: parseFloat(m.rewardAmount),
        proofType: m.proofType,
        proofStatus: "not_submitted",
        proofData: null,
        isCompleted: false,
        submittedAt: null,
        approvedAt: null,
        rejectedAt: null,
        rejectionReason: null,
      })),
    };

    const updated = [newScholarship, ...myScholarships];
    saveScholarships(updated);
    alert("Scholarship created successfully! You now need to deposit funds.");

    setShowCreateForm(false);
    setForm({
      studentAddress: "",
      totalAmount: "",
      tokenType: "XLM",
      milestones: [
        {
          title: "",
          requiredProgress: 25,
          rewardAmount: "",
          proofType: "transcript",
        },
      ],
    });
  };

  // Freighter helpers
  const ensureFreighter = async () => {
    const connected = await isConnected();
    if (!connected) {
      alert(
        "Freighter wallet not found. Please install the Freighter extension."
      );
      return null;
    }
    const userAddress = await requestAccess();
    if (!userAddress) {
      alert("Failed to get wallet address. Please allow access in Freighter.");
      return null;
    }
    await getNetwork(); // surfaced in console if needed
    return userAddress;
  };

  const signDemoPayment = async (
    sourceAddress: string,
    destination: string,
    memoText: string
  ) => {
    try {
      const server = new Horizon.Server("https://horizon-testnet.stellar.org");
      const account = await server.loadAccount(sourceAddress);
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination,
            asset: Asset.native(),
            amount: "0.0000001",
          })
        )
        .addMemo(Memo.text(memoText))
        .setTimeout(300)
        .build();

      const signedXdr = await signTransaction(tx.toXDR(), {
        networkPassphrase: Networks.TESTNET,
      });
      console.log("Transaction signed (demo):", signedXdr);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("User declined")) {
        alert("Transaction cancelled by user");
        return false;
      }
      console.warn("Continuing demo flow despite transaction error:", msg);
      return true; // allow demo to proceed
    }
  };

  // Deposit funds (demo)
  const depositFunds = async (scholarshipId: number, amount: number) => {
    const s = myScholarships.find((x) => x.id === scholarshipId);
    if (!s) {
      alert("Scholarship not found");
      return;
    }

    saveScholarships(
      myScholarships.map((x) =>
        x.id === scholarshipId ? { ...x, isLocked: true } : x
      )
    );

    const userAddr = await ensureFreighter();
    if (!userAddr) {
      saveScholarships(
        myScholarships.map((x) =>
          x.id === scholarshipId ? { ...x, isLocked: false } : x
        )
      );
      return;
    }

    const ok = window.confirm(
      `Confirm deposit of ${amount} ${s.tokenType}?\n\nThis will open Freighter for transaction signing.`
    );
    if (!ok) {
      saveScholarships(
        myScholarships.map((x) =>
          x.id === scholarshipId ? { ...x, isLocked: false } : x
        )
      );
      alert("Transaction cancelled");
      return;
    }

    await signDemoPayment(
      userAddr,
      s.student,
      `Deposit S#${scholarshipId} ${amount} ${s.tokenType}`
    );

    const updated = myScholarships.map((x) =>
      x.id === scholarshipId
        ? {
            ...x,
            depositedAmount: (x.depositedAmount || 0) + amount,
            isLocked: false,
          }
        : x
    );
    saveScholarships(updated);
    alert(`${amount} ${s.tokenType} deposited successfully!`);
  };

  // Refund (demo)
  const refundScholarship = async (scholarshipId: number) => {
    const s = myScholarships.find((x) => x.id === scholarshipId);
    if (!s) {
      alert("Scholarship not found");
      return;
    }
    const refundAmount = (s.depositedAmount || 0) - s.releasedAmount;
    if (refundAmount <= 0) {
      alert("No funds available to refund");
      return;
    }

    saveScholarships(
      myScholarships.map((x) =>
        x.id === scholarshipId ? { ...x, isLocked: true } : x
      )
    );

    const userAddr = await ensureFreighter();
    if (!userAddr) {
      saveScholarships(
        myScholarships.map((x) =>
          x.id === scholarshipId ? { ...x, isLocked: false } : x
        )
      );
      return;
    }

    const ok = window.confirm(
      `Confirm refund of ${refundAmount} ${s.tokenType}?\n\nThis will lock the scholarship permanently and open Freighter for transaction signing.`
    );
    if (!ok) {
      saveScholarships(
        myScholarships.map((x) =>
          x.id === scholarshipId ? { ...x, isLocked: false } : x
        )
      );
      alert("Transaction cancelled");
      return;
    }

    await signDemoPayment(
      userAddr,
      userAddr,
      `Refund S#${scholarshipId} ${refundAmount} ${s.tokenType}`
    );

    const updated = myScholarships.map((x) =>
      x.id === scholarshipId
        ? {
            ...x,
            isActive: false,
            depositedAmount: s.releasedAmount,
            isLocked: false,
          }
        : x
    );
    saveScholarships(updated);
    alert(
      `${refundAmount} ${s.tokenType} refunded successfully!\nScholarship is now locked.`
    );
  };

  // Approve / Reject proof (demo)
  const approveProof = async (
    scholarshipId: number,
    milestoneId: number,
    studentAddress: string
  ) => {
    const s = myScholarships.find((x) => x.id === scholarshipId);
    if (!s) {
      alert("Scholarship not found");
      return;
    }
    const m = s.milestones.find((y) => y.id === milestoneId);
    if (!m) {
      alert("Milestone not found");
      return;
    }

    const userAddr = await ensureFreighter();
    if (!userAddr) return;

    const ok = window.confirm(
      `Approve milestone and send payment?\n\nStudent: ${studentAddress}\nAmount: ${m.rewardAmount} ${s.tokenType}\n\nThis will open Freighter for transaction signing.`
    );
    if (!ok) return;

    await signDemoPayment(
      userAddr,
      studentAddress.trim(),
      `Scholarship #${scholarshipId} M${milestoneId} Approved`
    );

    const updated = myScholarships.map((x) => {
      if (x.id !== scholarshipId) return x;
      return {
        ...x,
        milestonesCompleted: x.milestonesCompleted + 1,
        releasedAmount: x.releasedAmount + m.rewardAmount,
        milestones: x.milestones.map((mm) =>
          mm.id === milestoneId
            ? ({
                ...mm,
                proofStatus: "approved" as ProofStatus,
                isCompleted: true,
                approvedAt: new Date().toISOString(),
              } as Milestone)
            : mm
        ),
      };
    });

    saveScholarships(updated);
    alert(
      `✅ Milestone approved!\n\nPayment of ${m.rewardAmount} ${s.tokenType} has been recorded.`
    );
  };

  const rejectProof = (scholarshipId: number, milestoneId: number) => {
    const reason = prompt(
      "Please provide a reason for rejection (will be sent to student):"
    );
    if (!reason || !reason.trim()) return;

    const updated = myScholarships.map((x) => {
      if (x.id !== scholarshipId) return x;
      return {
        ...x,
        milestones: x.milestones.map((mm) =>
          mm.id === milestoneId
            ? ({
                ...mm,
                proofStatus: "rejected" as ProofStatus,
                proofData: null,
                rejectionReason: reason.trim(),
                rejectedAt: new Date().toISOString(),
              } as Milestone)
            : mm
        ),
      };
    });

    saveScholarships(updated);
    alert("Proof rejected. Student can resubmit with corrections.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const hasPendingProofs = myScholarships.some((s) =>
    s.milestones?.some((m) => m.proofStatus === "pending")
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-500 p-6">
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
              >
                💝 Donor
              </button>
              <button
                onClick={() => switchRole("admin")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
              <h1 className="text-3xl font-bold text-gray-800">
                Donor Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {address.slice(0, 8)}...{address.slice(-8)}
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              {showCreateForm ? "Cancel" : "+ Create New Scholarship"}
            </button>
          </div>
        </div>

        {/* Create Scholarship Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Scholarship
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Stellar Address
                </label>
                <input
                  type="text"
                  value={form.studentAddress}
                  onChange={(e) =>
                    setForm({ ...form, studentAddress: e.target.value })
                  }
                  placeholder="G..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Scholarship Amount
                  </label>
                  <input
                    type="number"
                    value={form.totalAmount}
                    onChange={(e) =>
                      setForm({ ...form, totalAmount: e.target.value })
                    }
                    placeholder="5000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token Type
                  </label>
                  <select
                    value={form.tokenType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tokenType: e.target.value as TokenType,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="XLM">XLM</option>
                    <option value="BRS">BRS Token</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Milestones ({form.milestones.length}/10)
                  </label>
                  <button
                    onClick={addMilestone}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    + Add Milestone
                  </button>
                </div>

                <div className="space-y-3">
                  {form.milestones.map((m, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-700">
                          Milestone {index + 1}
                        </h4>
                        {form.milestones.length > 1 && (
                          <button
                            onClick={() => removeMilestone(index)}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) =>
                              updateMilestone(index, "title", e.target.value)
                            }
                            placeholder="Milestone title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={m.requiredProgress}
                            onChange={(e) =>
                              updateMilestone(
                                index,
                                "requiredProgress",
                                parseInt(e.target.value)
                              )
                            }
                            placeholder="Progress %"
                            min={0}
                            max={100}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={m.rewardAmount}
                            onChange={(e) =>
                              updateMilestone(
                                index,
                                "rewardAmount",
                                e.target.value
                              )
                            }
                            placeholder="Reward amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={m.proofType}
                            onChange={(e) =>
                              updateMilestone(
                                index,
                                "proofType",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="transcript">Transcript</option>
                            <option value="project">Project</option>
                            <option value="exam">Exam Result</option>
                            <option value="attendance">Attendance</option>
                            <option value="diploma">Diploma</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={createScholarship}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Create Scholarship
              </button>
            </div>
          </div>
        )}

        {/* My Scholarships */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            My Created Scholarships
          </h2>

          {myScholarships.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              You haven't created any scholarships yet. Click the button above
              to get started.
            </p>
          ) : (
            <>
              {/* Pending Proofs */}
              {hasPendingProofs && (
                <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <span>⏳</span> Pending Proof Reviews
                  </h3>
                  <div className="space-y-3">
                    {myScholarships.map((sch) =>
                      sch.milestones
                        .filter((m) => m.proofStatus === "pending")
                        .map((m) => (
                          <div
                            key={`${sch.id}-${m.id}`}
                            className="bg-white rounded-lg p-4 border border-yellow-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  Scholarship #{sch.id} - {m.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Student: {sch.student.slice(0, 10)}...
                                  {sch.student.slice(-6)}
                                </p>
                                {m.submittedAt && (
                                  <p className="text-sm text-gray-500">
                                    Submitted:{" "}
                                    {new Date(m.submittedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {m.rewardAmount} {sch.tokenType}
                                </div>
                              </div>
                            </div>
                            {m.proofData && (
                              <div className="bg-gray-50 rounded p-3 mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Submitted Proof:
                                </p>
                                <p className="text-sm text-gray-800 break-all">
                                  {m.proofData}
                                </p>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  approveProof(sch.id, m.id, sch.student)
                                }
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                              >
                                ✅ Approve & Send Payment
                              </button>
                              <button
                                onClick={() => rejectProof(sch.id, m.id)}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* Scholarships List */}
              <div className="space-y-4">
                {myScholarships.map((sch) => (
                  <div
                    key={sch.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          Scholarship #{sch.id}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Student: {sch.student.slice(0, 8)}...
                          {sch.student.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Created: {sch.createdAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {sch.totalAmount} {sch.tokenType}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Deposited: {sch.depositedAmount || 0} {sch.tokenType}
                        </div>
                        <div className="text-sm text-gray-600">
                          Paid: {sch.releasedAmount} {sch.tokenType}
                        </div>
                      </div>
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Funding Progress</span>
                        <span>
                          {sch.depositedAmount || 0} / {sch.totalAmount}{" "}
                          {sch.tokenType}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              ((sch.depositedAmount || 0) / sch.totalAmount) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Milestone Progress</span>
                        <span>
                          {sch.milestonesCompleted} / {sch.totalMilestones}{" "}
                          Milestones
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (sch.milestonesCompleted / sch.totalMilestones) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {(sch.depositedAmount || 0) < sch.totalAmount && (
                        <button
                          onClick={() =>
                            depositFunds(
                              sch.id,
                              sch.totalAmount - sch.releasedAmount
                            )
                          }
                          disabled={!!sch.isLocked}
                          className={`w-full py-2 rounded-lg transition text-sm ${
                            sch.isLocked
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {sch.isLocked
                            ? "Processing..."
                            : `Deposit Funds (${
                                sch.totalAmount - sch.releasedAmount
                              } ${sch.tokenType})`}
                        </button>
                      )}

                      {sch.isActive &&
                        (sch.depositedAmount || 0) > sch.releasedAmount && (
                          <button
                            onClick={() => refundScholarship(sch.id)}
                            disabled={!!sch.isLocked}
                            className={`w-full py-2 rounded-lg transition text-sm ${
                              sch.isLocked
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            {sch.isLocked
                              ? "Processing..."
                              : `Refund Scholarship (${
                                  (sch.depositedAmount || 0) -
                                  sch.releasedAmount
                                } ${sch.tokenType})`}
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
