import type { Profile } from "@shared/schema";

// Mock profile - always return facilitator profile
const mockProfile: Profile = {
  id: 1,
  userId: "dev-user-123",
  role: "facilitator",
  specialization: null,
  location: "Rural Clinic",
  isApproved: true
};

export function useProfile() {
  return {
    data: mockProfile,
    isLoading: false,
    error: null
  };
}

export function useCreateProfile() {
  return {
    mutate: () => {},
    isPending: false
  };
}
