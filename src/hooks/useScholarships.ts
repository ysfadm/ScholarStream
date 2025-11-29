/**
 * Custom hook for managing scholarships data
 * Currently uses mock data - ready for blockchain integration
 */
import { useState, useEffect, useCallback } from "react";

export interface Milestone {
  id: number;
  title: string;
  description?: string;
  required_progress: number;
  reward_amount: number;
  proof_type: string;
  is_completed: boolean;
}

export interface Scholarship {
  id: number;
  donor: string;
  student: string;
  total_amount: number;
  released_amount: number;
  token_type: string;
  is_active: boolean;
  created_at?: number;
  milestones?: Milestone[];
}

interface UseScholarshipsResult {
  scholarships: Scholarship[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useScholarships = (
  userAddress: string | null,
  role: "student" | "donor" | "admin" | null
): UseScholarshipsResult => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScholarships = useCallback(async () => {
    if (!userAddress || !role) {
      setScholarships([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with real blockchain calls
      // For student: CONTRACTS.ESCROW.get_student_scholarships(userAddress)
      // For donor: CONTRACTS.ESCROW.get_donor_scholarships(userAddress)
      // For admin: CONTRACTS.ESCROW.get_all_scholarships()

      // Mock data for demo
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData: Scholarship[] = [];

      setScholarships(mockData);
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch scholarships"
      );
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  }, [userAddress, role]);

  useEffect(() => {
    fetchScholarships();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchScholarships, 30000);

    return () => clearInterval(interval);
  }, [fetchScholarships]);

  return {
    scholarships,
    loading,
    error,
    refetch: fetchScholarships,
  };
};
