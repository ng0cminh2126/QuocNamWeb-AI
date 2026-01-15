// Identity API types based on Vega Identity API Swagger v1

import type { ID } from './common';

// ==========================================
// User Profile
// ==========================================

export interface UserProfileResponse {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PagedUserProfileResponse {
  items: UserProfileResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateUserProfileRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

// ==========================================
// Auth
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfileResponse;
}

export interface RegisterCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

