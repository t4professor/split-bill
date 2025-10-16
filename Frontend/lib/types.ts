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

// Group APIs
export interface JoinGroupRequest {
  inviteCode: string;
}

export interface JoinGroupResponse {
  message: string;
  group: {
    id: string;
    name: string;
    description?: string;
    creatorId: string;
    inviteCode: string;
  };
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

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  joinedAt: string;
  user: {
    id: string;
    userName: string;
    email: string;
    avatarPath?: string;
  };
}
export interface Group {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    userName: string;
    email: string;
  };
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface CreateGroupResponse {
  message: string;
  group: Group;
}

export interface GetGroupsResponse {
  groups: Group[];
}

export interface GetGroupByIdResponse {
  group: Group;
}
