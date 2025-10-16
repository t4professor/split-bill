"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle, Users, ArrowLeft, Plus, Receipt } from "lucide-react";
import { groupApi, expenseApi, getAvatarUrl } from "@/lib/api";
import type { Group } from "@/lib/types";
import { Input } from "@/components/ui/input";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const groupIdParam = params?.id;
  const groupId = Array.isArray(groupIdParam)
    ? groupIdParam[0] ?? ""
    : groupIdParam ?? "";

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);

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
    } catch (err) {
      console.error("Failed to load group details:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin nhóm"
      );
    } finally {
      setIsLoading(false);
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
            <Button size="sm" onClick={() => alert("Thêm thành viên (coming soon)")}>
              <Users className="mr-2 h-4 w-4" />
              Thêm
            </Button>
          </CardHeader>
          <CardContent>
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
                    </div>
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

        {/* Settlement placeholder - will be implemented in next task */}
        <Card>
          <CardHeader>
            <CardTitle>Thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              Chức năng thanh toán sẽ được kết nối trong task tiếp theo
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
