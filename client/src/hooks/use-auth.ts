import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

// Mock user - always authenticated for development
const mockUser: User = {
  id: "dev-user-123",
  email: "dev@example.com",
  firstName: "Dev",
  lastName: "User",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

export function useAuth() {
  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    logout: () => {},
    isLoggingOut: false,
  };
}
