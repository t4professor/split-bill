// Shared user models
export interface User {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarPath?: string | null;
  paymentQrPath?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Authentication request DTOs
export interface LoginRequest {
  userNameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Auth responses returned by backend
export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// Profile APIs
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  userName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

// API error envelope
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// Auth context contracts
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userNameOrEmail: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
}
