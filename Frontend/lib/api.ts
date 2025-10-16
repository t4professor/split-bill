import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  User,
  ApiError,
  Group,
  GroupMember,
  Expense,
  CreateGroupRequest,
  CreateGroupResponse,
  GetGroupsResponse,
  GetGroupByIdResponse,
  AddMemberRequest,
  AddMemberResponse,
  JoinGroupRequest,
  JoinGroupResponse,
  CreateExpenseRequest,
  CreateExpenseResponse,
  SettlementResponse,
} from "./types";

// API Configuration
const API_BASE_URL = "http://localhost:3001";

// Extended Error type for API errors
interface ApiErrorWithStatus extends Error {
  statusCode?: number;
  error?: string;
}

// Generic API request handler with JWT support
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: ApiError;

      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, create a generic error
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          error: response.statusText,
        };
      }

      // Create a more descriptive error message
      const errorMessage =
        errorData.message || getErrorMessage(response.status);
      const error = new Error(errorMessage) as ApiErrorWithStatus;
      error.statusCode = errorData.statusCode || response.status;
      error.error = errorData.error;

      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
}

// Auth API functions
export const authApi = {
  // Login user
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Register new user
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get user profile
  async getProfile(): Promise<User> {
    return apiRequest<User>("/user/profile", {
      method: "GET",
    });
  },

  // Update user profile
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    return apiRequest<UpdateProfileResponse>("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ message: string; path: string }> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Upload failed",
      }));
      throw new Error(errorData.message || "Avatar upload failed");
    }

    return response.json();
  },

  // Upload payment QR code
  async uploadPaymentQr(
    file: File
  ): Promise<{ message: string; path: string }> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/user/payment-qr`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Upload failed",
      }));
      throw new Error(errorData.message || "Payment QR upload failed");
    }

    return response.json();
  },

  // Remove avatar
  async removeAvatar(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/user/remove-avatar", {
      method: "PATCH",
    });
  },
};

// Group API functions
export const groupApi = {
  // Create a new group
  async createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
    return apiRequest<CreateGroupResponse>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get all groups for current user
  async getUserGroups(): Promise<{ groups: Group[] }> {
    return apiRequest<{ groups: Group[] }>("/groups", {
      method: "GET",
    });
  },

  // Get group details by ID
  async getGroupById(groupId: string): Promise<{ group: Group }> {
    return apiRequest<{ group: Group }>(`/groups/${groupId}`, {
      method: "GET",
    });
  },

  // Add a member to group
  async addMember(
    groupId: string,
    data: AddMemberRequest
  ): Promise<AddMemberResponse> {
    return apiRequest<AddMemberResponse>(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Join group using invite code (body)
  async joinGroupByCode(data: JoinGroupRequest): Promise<JoinGroupResponse> {
    return apiRequest<JoinGroupResponse>("/groups/join", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getGroupExpenses(groupId: string): Promise<GetGroupExpensesResponse> {
    return apiRequest<GetGroupExpensesResponse>(`/groups/${groupId}/expenses`, {
  // Join group using invite link (URL param)
  async joinGroupByLink(inviteCode: string): Promise<JoinGroupResponse> {
    return apiRequest<JoinGroupResponse>(`/groups/join/${inviteCode}`, {
      method: "GET",
    });
  },

  async getSettlement(groupId: string): Promise<SettlementResponse> {
    return apiRequest<SettlementResponse>(`/groups/${groupId}/settlement`, {
  // Get all expenses in a group
  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    return apiRequest<Expense[]>(`/groups/${groupId}/expenses`, {
      method: "GET",
    });
  },

  async addMember(groupId: string, userId: string): Promise<AddMemberResponse> {
    return apiRequest<AddMemberResponse>(`/groups/${groupId}/members`, {
  // Get settlement calculation for a group
  async getSettlement(groupId: string): Promise<SettlementResponse> {
    return apiRequest<SettlementResponse>(`/groups/${groupId}/settlement`, {
      method: "GET",
    });
  },
};

// Expense API functions
export const expenseApi = {
  // Create a new expense
  async createExpense(
    data: CreateExpenseRequest
  ): Promise<CreateExpenseResponse> {
    return apiRequest<CreateExpenseResponse>("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Expense API functions
export const expenseApi = {
  async createExpense(data: CreateExpenseRequest): Promise<CreateExpenseResponse> {
    return apiRequest<CreateExpenseResponse>("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Token management utilities
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

export const setAuthUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getAuthUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const removeAuthUser = () => {
  localStorage.removeItem("user");
};

// Helper function to get user-friendly error messages
function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
    case 401:
      return "Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy tài nguyên yêu cầu.";
    case 409:
      return "Email hoặc tên đăng nhập đã tồn tại.";
    case 422:
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.";
    case 429:
      return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
    case 500:
      return "Lỗi máy chủ. Vui lòng thử lại sau.";
    case 502:
      return "Máy chủ đang tạm thời không khả dụng.";
    case 503:
      return "Dịch vụ đang tạm thời không khả dụng.";
    default:
      return "Đã xảy ra lỗi. Vui lòng thử lại.";
  }
}

// Network error detection
export const isNetworkError = (error: Error): boolean => {
  return (
    error.message.includes("Network error") ||
    error.message.includes("fetch") ||
    error.message.includes("Failed to fetch")
  );
};

// Retry logic for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      const errorWithStatus = lastError as ApiErrorWithStatus;
      if (
        lastError instanceof Error &&
        errorWithStatus.statusCode &&
        errorWithStatus.statusCode < 500
      ) {
        throw lastError;
      }

      // Don't retry on the last attempt
      if (i === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  throw lastError!;
};

// Utility to get avatar URL
export const getAvatarUrl = (userId: string): string => {
  return `${API_BASE_URL}/user/${userId}/avatar`;
};

// Utility to get payment QR URL
export const getPaymentQrUrl = (userId: string): string => {
  return `${API_BASE_URL}/user/${userId}/payment-qr`;
};
