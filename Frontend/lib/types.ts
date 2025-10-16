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

// Group models
export interface Group {
  id: string;
  name: string;
  description?: string | null;
  inviteCode: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  members?: GroupMember[];
  expenses?: Expense[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user?: User;
  joinedAt: string;
}

// Expense models
export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidById: string;
  paidBy?: User;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

// Group API request DTOs
export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface AddMemberRequest {
  userId: string;
}

export interface JoinGroupRequest {
  inviteCode: string;
}

// Expense API request DTOs
export interface CreateExpenseRequest {
  description: string;
  amount: number;
  groupId: string;
}

// Settlement response DTOs
export interface MemberBalance {
  userId: string;
  userName: string;
  totalPaid: number;
  fairShare: number;
  balance: number;
}

export interface Transaction {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export interface SettlementResponse {
  totalExpenses: number;
  memberCount: number;
  fairSharePerPerson: number;
  balances: MemberBalance[];
  transactions: Transaction[];
}

// Group API response DTOs
export interface CreateGroupResponse {
  message: string;
  group: Group;
}

export interface JoinGroupResponse {
  message: string;
  group: Group;
}

export interface AddMemberResponse {
  message: string;
  member: GroupMember;
}

// Expense API response DTOs
export interface CreateExpenseResponse {
  message: string;
  expense: Expense;
}
