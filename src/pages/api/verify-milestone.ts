import type { NextApiRequest, NextApiResponse } from "next";

type VerificationResult = {
  verified: boolean;
  message: string;
  score?: number;
  timestamp: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerificationResult>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      verified: false,
      message: "Method not allowed",
      timestamp: new Date().toISOString(),
    });
  }

  const { scholarshipId, milestoneId, proofData, studentAddress } = req.body;

  // Validate input
  if (!scholarshipId || !milestoneId || !proofData || !studentAddress) {
    return res.status(400).json({
      verified: false,
      message: "Missing required fields",
      timestamp: new Date().toISOString(),
    });
  }

  // Simulate network delay
  setTimeout(() => {
    // For hackathon demo: Just verify that proof data is provided and looks like a valid link/hash
    const isValidProof = validateProofData(proofData);

    res.status(200).json({
      verified: isValidProof.verified,
      message: isValidProof.message,
      score: isValidProof.score,
      timestamp: new Date().toISOString(),
    });
  }, 1000); // 1 second delay to simulate processing
}

function validateProofData(proofData: string): {
  verified: boolean;
  message: string;
  score?: number;
} {
  // Check if proof data is not empty
  if (!proofData || proofData.trim().length === 0) {
    return {
      verified: false,
      message: "Proof data is empty",
    };
  }

  // Check minimum length
  if (proofData.trim().length < 10) {
    return {
      verified: false,
      message: "Proof data is too short. Please provide a valid link or hash.",
    };
  }

  // Check if it looks like a URL
  const urlPattern = /^(https?:\/\/|ipfs:\/\/)/i;
  const isURL = urlPattern.test(proofData.trim());

  // Check if it looks like a hash (alphanumeric, 20+ chars)
  const hashPattern = /^[a-zA-Z0-9]{20,}$/;
  const isHash = hashPattern.test(proofData.trim());

  if (isURL) {
    return {
      verified: true,
      message: `✅ Proof verified! Link: ${proofData.substring(0, 50)}${
        proofData.length > 50 ? "..." : ""
      }`,
      score: 100,
    };
  } else if (isHash) {
    return {
      verified: true,
      message: `✅ Proof verified! Hash: ${proofData.substring(0, 20)}...`,
      score: 100,
    };
  } else {
    // Accept any non-empty text for hackathon demo
    return {
      verified: true,
      message: `✅ Proof submitted successfully! Data: ${proofData.substring(
        0,
        30
      )}${proofData.length > 30 ? "..." : ""}`,
      score: 100,
    };
  }
}
