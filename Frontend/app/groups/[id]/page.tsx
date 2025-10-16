"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  RefreshCw,
  Users,
  Receipt,
  Plus,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useAuth } from "@/contexts/AuthContext";
import { groupApi, expenseApi, getAvatarUrl } from "@/lib/api";
import type { Expense, Group, SettlementResponse } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const { isAuthenticated } = useAuth();

  const groupId = Array.isArray(params?.id)
    ? params.id[0] ?? ""
    : params?.id ?? "";

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlement, setSettlement] = useState<SettlementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);

  // Add member state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

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
          // Ensure we always have an array
          setExpenses(Array.isArray(expensesResponse) ? expensesResponse : []);
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
    }
  };

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberUserId.trim() || isAddingMember) {
      return;
    }

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
      await loadData("refresh");
    } catch (err) {
      console.error("Failed to add member:", err);
      setError(
        err instanceof Error ? err.message : "Không thể thêm thành viên"
      );
    } finally {
      setIsAddingMember(false);
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

  if (error && !group) {
    return (
      <MainLayout
        title="Lỗi"
        showBack
        onBackClick={() => router.push("/groups")}
      >
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <p className="text-destructive font-semibold">
                  {error || "Không tìm thấy nhóm"}
                </p>
                <Button className="mt-4" onClick={() => router.push("/groups")}>
                  Quay lại danh sách nhóm
                </Button>
              </div>
            </div>
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
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {error && <ErrorAlert error={error} className="mb-2" />}

        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhóm</CardTitle>
            {group?.description && (
              <CardDescription>{group.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Mã mời</p>
              <p className="font-medium font-mono tracking-wider">
                {group?.inviteCode}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Người tạo</p>
              <p className="font-medium">{group?.createdBy?.userName}</p>
              <p className="text-xs text-muted-foreground">
                {group?.createdBy?.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ngày tạo</p>
              <p className="font-medium">
                {group?.createdAt && formatDateTime(group.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cập nhật</p>
              <p className="font-medium">
                {group?.updatedAt && formatDateTime(group.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Thành viên ({group?.members?.length || 0})</CardTitle>
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
          <CardContent className="space-y-4">
            {showAddMemberForm && (
              <form
                onSubmit={handleAddMember}
                className="space-y-3 mb-4 p-3 border rounded-md"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    User ID của thành viên
                  </label>
                  <Input
                    required
                    value={memberUserId}
                    onChange={(e) => setMemberUserId(e.target.value)}
                    placeholder="Nhập UUID của user (ví dụ: 123e4567-e89b-12d3-a456-426614174000)"
                    disabled={isAddingMember}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lưu ý: Hiện tại cần nhập UUID của user. Trong tương lai sẽ
                    có chức năng tìm kiếm user theo email/username.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isAddingMember}
                >
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

            {!group?.members || group.members.length === 0 ? (
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
                      {member.user?.avatarPath && (
                        <AvatarImage
                          src={getAvatarUrl(member.userId)}
                          alt={member.user?.userName}
                        />
                      )}
                      <AvatarFallback>
                        {getInitials(member.user?.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Tham gia: {formatDateTime(member.joinedAt)}
                    </p>
                    {member.userId === group.createdById && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Chủ nhóm
                      </span>
                    )}
                  </div>
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

            {!expenses || expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                <Receipt className="mb-3 h-10 w-10" />
                Chưa có chi tiêu nào trong nhóm này.
              </div>
            ) : (
              Array.isArray(expenses) &&
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(expense.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Thanh toán: {expense.paidBy?.userName} (
                      {expense.paidBy?.email})
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
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium">
                        {transaction.fromUserName}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {transaction.toUserName}
                      </span>
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
    </MainLayout>
  );
}
