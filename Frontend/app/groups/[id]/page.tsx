"use client";

import { useCallback, useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, RefreshCw, Users, Receipt } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useAuth } from "@/contexts/AuthContext";
import { groupApi, expenseApi } from "@/lib/api";
import type {
  Expense,
  Group,
  SettlementResponse,
} from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getInitials = (value?: string | null): string => {
  if (!value) return "?";
  return value.trim().slice(0, 2).toUpperCase();
};
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle, Users, ArrowLeft, Plus, Receipt, ArrowRight } from "lucide-react";
import { groupApi, expenseApi, getAvatarUrl } from "@/lib/api";
import type { Group, SettlementResponse } from "@/lib/types";
import { Input } from "@/components/ui/input";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { isAuthenticated } = useAuth();

  const groupId = Array.isArray(params?.id) ? params.id[0] ?? "" : params?.id ?? "";

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlement, setSettlement] = useState<SettlementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);

  const loadData = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!groupId || !isAuthenticated) {
        setGroup(null);
        setExpenses([]);
        setSettlement(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (mode === "refresh") {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        // Load group details
        const groupResponse = await groupApi.getGroupById(groupId);
        setGroup(groupResponse.group);

        const warnings: string[] = [];

        // Load expenses
        try {
          const expensesResponse = await groupApi.getGroupExpenses(groupId);
          setExpenses(expensesResponse.expenses);
        } catch (expensesError) {
          console.error("Failed to load group expenses", expensesError);
          setExpenses([]);
          warnings.push("Không thể tải danh sách chi tiêu.");
        }

        // Load settlement
        try {
          const settlementResponse = await groupApi.getSettlement(groupId);
          setSettlement(settlementResponse);
        } catch (settlementError) {
          console.error("Failed to load settlement", settlementError);
          setSettlement(null);
          warnings.push("Không thể tải dữ liệu cân bằng khoản nợ.");
        }

        if (warnings.length > 0) {
          setError(warnings.join(" "));
        }
      } catch (detailError) {
        console.error("Failed to load group", detailError);
        const message =
          detailError instanceof Error
            ? detailError.message
            : "Không thể tải thông tin nhóm.";
        setGroup(null);
        setExpenses([]);
        setSettlement(null);
        setError(message);
      } finally {
        if (mode === "refresh") {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [groupId, isAuthenticated]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData("refresh");
  };

  const handleCreateExpense = async () => {
    if (!groupId || !newExpenseDescription.trim() || !newExpenseAmount) {
      return;
    }

    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setIsCreatingExpense(true);
    try {
      await expenseApi.createExpense({
        description: newExpenseDescription.trim(),
        amount: amount,
        groupId: groupId,
      });

      // Reset form
      setNewExpenseDescription("");
      setNewExpenseAmount("");
      setShowExpenseForm(false);

      // Reload data
      await loadData("refresh");
    } catch (error) {
      console.error("Failed to create expense", error);
      const message =
        error instanceof Error ? error.message : "Không thể tạo chi tiêu.";
      alert(message);
    } finally {
      setIsCreatingExpense(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);

  // Settlement state
  const [settlement, setSettlement] = useState<SettlementResponse | null>(null);
  const [isLoadingSettlement, setIsLoadingSettlement] = useState(false);

  // Add member state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Load group details from API
  useEffect(() => {
    if (!groupId) {
      setError("ID nhóm không hợp lệ");
      setIsLoading(false);
      return;
    }

    const loadGroupDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await groupApi.getGroupById(groupId);
        setGroup(response.group);
      } catch (err) {
        console.error("Failed to load group details:", err);
        setError(
          err instanceof Error ? err.message : "Không thể tải thông tin nhóm"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupDetails();
  }, [groupId]);

  const handleCreateExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!expenseDescription.trim() || !expenseAmount || isCreatingExpense) {
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Số tiền không hợp lệ");
      return;
    }

    try {
      setIsCreatingExpense(true);
      setError(null);
      await expenseApi.createExpense({
        description: expenseDescription.trim(),
        amount: amount,
        groupId: groupId,
      });

      // Reset form
      setExpenseDescription("");
      setExpenseAmount("");
      setShowExpenseForm(false);

      // Reload group to get updated expenses
      await loadGroupDetails();
    } catch (err) {
      console.error("Failed to create expense:", err);
      setError(err instanceof Error ? err.message : "Không thể tạo chi tiêu");
    } finally {
      setIsCreatingExpense(false);
    }
  };

  const loadGroupDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await groupApi.getGroupById(groupId);
      setGroup(response.group);

      // Also load settlement if there are expenses
      if (response.group.expenses && response.group.expenses.length > 0) {
        await loadSettlement();
      } else {
        setSettlement(null);
      }
    } catch (err) {
      console.error("Failed to load group details:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin nhóm"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettlement = async () => {
    try {
      setIsLoadingSettlement(true);
      const data = await groupApi.getSettlement(groupId);
      setSettlement(data);
    } catch (err) {
      console.error("Failed to load settlement:", err);
      // Don't set error here, just log it
    } finally {
      setIsLoadingSettlement(false);
    }
  };

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberUserId.trim() || isAddingMember) {
      return;
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout
        title="Chi tiết nhóm"
        showBack
        onBackClick={() => router.back()}
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              Vui lòng đăng nhập để xem thông tin nhóm.
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  const isBusy = isLoading || isRefreshing;
  const pageTitle = group?.name ?? "Chi tiết nhóm";

  return (
    <MainLayout
      title={pageTitle}
      showBack
      onBackClick={() => router.back()}
      rightAction={
        groupId ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isBusy}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tải lại
              </>
            )}
    try {
      setIsAddingMember(true);
      setError(null);
      await groupApi.addMember(groupId, {
        userId: memberUserId.trim(),
      });

      // Reset form
      setMemberUserId("");
      setShowAddMemberForm(false);

      // Reload group to show new member
      await loadGroupDetails();
    } catch (err) {
      console.error("Failed to add member:", err);
      setError(err instanceof Error ? err.message : "Không thể thêm thành viên");
    } finally {
      setIsAddingMember(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Đang tải...">
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Đang tải thông tin nhóm...</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (error || !group) {
    return (
      <MainLayout
        title="Lỗi"
        leftAction={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/groups")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      >
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <p className="text-destructive font-semibold">
                  {error || "Không tìm thấy nhóm"}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/groups")}
                >
                  Quay lại danh sách nhóm
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={group.name}
      leftAction={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/groups")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang tải dữ liệu nhóm...
        </div>
      ) : !group ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Không tìm thấy nhóm. Vui lòng kiểm tra lại liên kết.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {error && <ErrorAlert error={error} className="mb-2" />}

          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhóm</CardTitle>
              {group.description && (
                <CardDescription>{group.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Mã mời</p>
                <p className="font-medium font-mono tracking-wider">
                  {group.inviteCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Người tạo</p>
                <p className="font-medium">{group.createdBy.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {group.createdBy.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">{formatDateTime(group.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cập nhật</p>
                <p className="font-medium">{formatDateTime(group.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>Thành viên ({group.members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Users className="mb-3 h-10 w-10" />
                  Chưa có thành viên nào.
                </div>
              ) : (
                group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(member.user.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tham gia: {formatDateTime(member.joinedAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Chi tiêu ({expenses.length})</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                disabled={isBusy}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm chi tiêu
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Expense Form */}
              {showExpenseForm && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <div>
                    <Label htmlFor="description">Mô tả chi tiêu</Label>
                    <Input
                      id="description"
                      placeholder="Ví dụ: Ăn trưa, Xem phim..."
                      value={newExpenseDescription}
                      onChange={(e) => setNewExpenseDescription(e.target.value)}
                      disabled={isCreatingExpense}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Số tiền (VNĐ)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      disabled={isCreatingExpense}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowExpenseForm(false);
                        setNewExpenseDescription("");
                        setNewExpenseAmount("");
                      }}
                      disabled={isCreatingExpense}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateExpense}
                      disabled={
                        isCreatingExpense ||
                        !newExpenseDescription.trim() ||
                        !newExpenseAmount
                      }
                    >
                      {isCreatingExpense ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        "Tạo chi tiêu"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Receipt className="mb-3 h-10 w-10" />
                  Chưa có chi tiêu nào trong nhóm này.
      <div className="space-y-4">
        {/* Group Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhóm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Mô tả:
                </span>
                <p className="text-sm mt-1">{group.description}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Mã mời:
              </span>
              <p className="text-lg font-mono font-semibold mt-1">
                {group.inviteCode}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Người tạo:
              </span>
              <p className="text-sm mt-1">
                {group.createdBy?.userName || "Không rõ"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Thành viên ({group.members?.length || 0})</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setShowAddMemberForm(!showAddMemberForm);
                if (showAddMemberForm) {
                  setMemberUserId("");
                  setError(null);
                }
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              {showAddMemberForm ? "Đóng" : "Thêm"}
            </Button>
          </CardHeader>
          <CardContent>
            {showAddMemberForm && (
              <form onSubmit={handleAddMember} className="space-y-3 mb-4 p-3 border rounded-md">
                <div className="space-y-1">
                  <label className="text-sm font-medium">User ID của thành viên</label>
                  <Input
                    required
                    value={memberUserId}
                    onChange={(e) => setMemberUserId(e.target.value)}
                    placeholder="Nhập UUID của user (ví dụ: 123e4567-e89b-12d3-a456-426614174000)"
                    disabled={isAddingMember}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lưu ý: Hiện tại cần nhập UUID của user. Trong tương lai sẽ có chức năng tìm kiếm user theo email/username.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isAddingMember}>
                  {isAddingMember ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm thành viên
                    </>
                  )}
                </Button>
              </form>
            )}

            {!group.members || group.members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có thành viên nào
              </p>
            ) : (
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(expense.createdAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Thanh toán: {expense.paidBy.userName} (
                        {expense.paidBy.email})
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Settlement */}
          <Card>
            <CardHeader>
              <CardTitle>Cân bằng khoản nợ</CardTitle>
              {settlement && (
                <CardDescription>
                  Tổng chi tiêu: {formatCurrency(settlement.totalExpenses)} •{" "}
                  {settlement.memberCount} thành viên • Mỗi người:{" "}
                  {formatCurrency(settlement.fairSharePerPerson)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!settlement ? (
                <p className="text-sm text-muted-foreground">
                  Không thể tính toán cân bằng khoản nợ vào lúc này.
                </p>
              ) : settlement.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Mọi người đã cân bằng, không có khoản nợ nào.
                </p>
              ) : (
                <>
                  {settlement.transactions.map((transaction, index) => (
                    <div
                      key={`${transaction.fromUserId}-${transaction.toUserId}-${index}`}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {transaction.fromUserName} trả {transaction.toUserName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Số tiền sau khi chia đều cho các thành viên
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-destructive">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}

                  {/* Balance Details */}
                  {settlement.balances.length > 0 && (
                    <div className="mt-4 rounded-lg bg-muted/40 p-4">
                      <p className="mb-3 text-sm font-semibold">
                        Chi tiết từng thành viên
                    <Avatar>
                      {member.user?.avatarPath && (
                        <AvatarImage
                          src={getAvatarUrl(member.userId)}
                          alt={member.user?.userName}
                        />
                      )}
                      <AvatarFallback>
                        {member.user?.userName?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {member.user?.userName || "Không rõ"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user?.email || ""}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {settlement.balances.map((balance) => (
                          <div key={balance.userId} className="text-sm">
                            <p className="font-medium">{balance.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              Đã chi: {formatCurrency(balance.totalPaid)} • Phần
                              chia: {formatCurrency(balance.fairShare)}
                            </p>
                            <p
                              className={
                                balance.balance > 0
                                  ? "text-xs font-medium text-green-600"
                                  : balance.balance < 0
                                  ? "text-xs font-medium text-destructive"
                                  : "text-xs text-muted-foreground"
                              }
                            >
                              {balance.balance > 0
                                ? `Được nhận: ${formatCurrency(balance.balance)}`
                                : balance.balance < 0
                                ? `Cần trả: ${formatCurrency(-balance.balance)}`
                                : "Đã cân bằng"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
                    {member.userId === group.createdById && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Chủ nhóm
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chi tiêu</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setShowExpenseForm(!showExpenseForm);
                if (showExpenseForm) {
                  setExpenseDescription("");
                  setExpenseAmount("");
                  setError(null);
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {showExpenseForm ? "Đóng" : "Thêm"}
            </Button>
          </CardHeader>
          <CardContent>
            {showExpenseForm && (
              <form onSubmit={handleCreateExpense} className="space-y-3 mb-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Input
                    required
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="Ví dụ: Ăn trưa tại nhà hàng ABC"
                    disabled={isCreatingExpense}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Số tiền (VND)</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="500000"
                    disabled={isCreatingExpense}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreatingExpense}>
                  {isCreatingExpense ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo chi tiêu
                    </>
                  )}
                </Button>
              </form>
            )}

            {!group?.expenses || group.expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có chi tiêu nào
              </p>
            ) : (
              <div className="space-y-2">
                {group.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Người trả: {expense.paidBy?.userName || "Không rõ"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      {expense.amount.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settlement Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSettlement ? (
              <div className="text-center py-4">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Đang tính toán...</p>
              </div>
            ) : !settlement || settlement.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {!group?.expenses || group.expenses.length === 0
                  ? "Chưa có chi tiêu nào để thanh toán"
                  : "Mọi người đã cân bằng, không cần thanh toán"}
              </p>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-md">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Tổng chi</p>
                    <p className="text-sm font-semibold">
                      {settlement.totalExpenses.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Thành viên</p>
                    <p className="text-sm font-semibold">{settlement.memberCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Mỗi người</p>
                    <p className="text-sm font-semibold">
                      {settlement.fairSharePerPerson.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Giao dịch cần thực hiện:</p>
                  {settlement.transactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md border bg-card"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium">
                          {transaction.fromUserName}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {transaction.toUserName}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {transaction.amount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Balances */}
                {settlement.balances && settlement.balances.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm font-medium">Chi tiết số dư:</p>
                    <div className="space-y-1">
                      {settlement.balances.map((balance) => (
                        <div
                          key={balance.userId}
                          className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent"
                        >
                          <span>{balance.userName}</span>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Đã trả: {balance.totalPaid.toLocaleString("vi-VN")}đ
                            </p>
                            <p
                              className={`font-medium ${
                                balance.balance > 0
                                  ? "text-green-600"
                                  : balance.balance < 0
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {balance.balance > 0
                                ? `+${balance.balance.toLocaleString("vi-VN")}đ`
                                : balance.balance < 0
                                ? `${balance.balance.toLocaleString("vi-VN")}đ`
                                : "Cân bằng"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
