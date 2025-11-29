// Admin wallet addresses - only these addresses can access admin dashboard
export const ADMIN_ADDRESSES = [
  // Add your admin wallet addresses here
  // To get your address: Open Freighter Wallet → Click wallet name → Copy Address
  // Then paste it below (it starts with 'G')
  "GDCFA2S2KRRQLAN7JTD5S4A7KJMNKDRJED4UWKEIUP6HRSSBPFLMQEQK", // Your admin address
  // Add more admin addresses as needed
];

// Check if an address is an admin
export const isAdmin = (address: string): boolean => {
  // Log for debugging - helps you find your wallet address
  console.log("🔐 Admin check for address:", address);
  console.log("📋 Admin whitelist:", ADMIN_ADDRESSES);

  const isAdminUser = ADMIN_ADDRESSES.some(
    (adminAddr) => adminAddr.toLowerCase() === address.toLowerCase()
  );

  console.log("✅ Is admin?", isAdminUser);

  return isAdminUser;
};

// Role types
export type UserRole = "student" | "donor" | "admin";

// Get user role from localStorage or determine based on address
export const getUserRole = (address: string): UserRole => {
  if (typeof window === "undefined") return "student";

  // Check if admin
  if (isAdmin(address)) {
    return "admin";
  }

  // Check stored role preference
  const storedRole = localStorage.getItem("userRole");
  if (storedRole === "student" || storedRole === "donor") {
    return storedRole;
  }

  // Default to student
  return "student";
};

// Verify access to a specific role
export const verifyRoleAccess = (
  userAddress: string,
  requiredRole: UserRole
): boolean => {
  if (requiredRole === "admin") {
    return isAdmin(userAddress);
  }

  // Students and donors can access their own dashboards
  return true;
};
