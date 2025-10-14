"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  GROUP_DETAIL_STORAGE_KEY,
  GROUPS_STORAGE_KEY,
} from "@/lib/constants";
import {
  seedGroupDetails,
  type SeedExpense,
  type SeedGroupDetail,
} from "@/lib/seedData";
import { Plus, Receipt } from "lucide-react";
type Expense = SeedExpense;
type GroupDetail = SeedGroupDetail;

type GroupSummary = {
  id: string;
  name: string;
  description?: string;
  members: number;
  totalBill: number;
};

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const groupIdParam = params?.id;
  const groupId = Array.isArray(groupIdParam)
    ? groupIdParam[0] ?? ""
    : groupIdParam ?? "";

  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [groupSummary, setGroupSummary] = useState<GroupSummary | null>(null);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
  });
  const [newMemberName, setNewMemberName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const members = groupDetail?.members ?? [];
  const expenses = groupDetail?.expenses ?? [];

  useEffect(() => {
    if (!groupId) {
      setGroupDetail(null);
      setGroupSummary(null);
      setIsLoading(false);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    setIsLoading(true);

    const summaries = readGroupSummaries();
    const summary = summaries.find((item) => item.id === groupId);
    const storedDetails = readGroupDetails();

    let detail = storedDetails[groupId] ?? seedGroupDetails[groupId] ?? null;

    if (!detail && summary) {
      detail = {
        id: summary.id,
        name: summary.name,
        description: summary.description,
        members: [],
        expenses: [],
      };
    }

    if (detail) {
      const normalized: GroupDetail = {
        id: detail.id || summary?.id || groupId,
        name: summary?.name ?? detail.name,
        description: summary?.description ?? detail.description,
        members: detail.members ?? [],
        expenses: detail.expenses ?? [],
      };

      setGroupDetail(normalized);
      persistGroupDetail(normalized);
      syncGroupSummary(normalized, setGroupSummary);
    } else {
      setGroupDetail(null);
      if (summary) {
        setGroupSummary(summary);
      } else {
        setGroupSummary(null);
      }
    }

    setIsLoading(false);
  }, [groupId]);

  const createDetailSkeleton = (): GroupDetail => ({
    id: groupId,
    name: groupSummary?.name ?? `Nhóm ${groupId}`,
    description: groupSummary?.description,
    members: [],
    expenses: [],
  });

  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupId || !newMemberName.trim()) {
      return;
    }

    const baseDetail = groupDetail ?? createDetailSkeleton();
    const nextDetail: GroupDetail = {
      ...baseDetail,
      members: [
        ...baseDetail.members,
        {
          id: crypto.randomUUID(),
          name: newMemberName.trim(),
          spent: 0,
          owes: 0,
        },
      ],
    };

    setGroupDetail(nextDetail);
    persistGroupDetail(nextDetail);
    syncGroupSummary(nextDetail, setGroupSummary);
    setNewMemberName("");
  };

  const handleRemoveMember = (memberId: string) => {
    if (!groupDetail || !groupId) {
      return;
    }

    const nextDetail: GroupDetail = {
      ...groupDetail,
      members: groupDetail.members.filter((member) => member.id !== memberId),
    };

    setGroupDetail(nextDetail);
    persistGroupDetail(nextDetail);
    syncGroupSummary(nextDetail, setGroupSummary);
  };

  const handleAddExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupId) {
      return;
    }

    const amountValue = parseInt(newExpense.amount, 10);
    const safeAmount = Number.isNaN(amountValue) ? 0 : Math.max(amountValue, 0);

    const baseDetail = groupDetail ?? createDetailSkeleton();
    const nextDetail: GroupDetail = {
      ...baseDetail,
      expenses: [
        ...baseDetail.expenses,
        {
          id: crypto.randomUUID(),
          description: newExpense.description.trim(),
          amount: safeAmount,
          paidBy: newExpense.paidBy.trim(),
          date: new Date().toISOString(),
        },
      ],
    };

    setGroupDetail(nextDetail);
    persistGroupDetail(nextDetail);
    syncGroupSummary(nextDetail, setGroupSummary);
    setNewExpense({ description: "", amount: "", paidBy: "" });
  };

  const title = groupDetail
    ? groupDetail.name
    : groupSummary
    ? groupSummary.name
    : "Nhóm không tồn tại";

  return (
    <MainLayout
      title={title}
      showBack
      onBackClick={() => router.back()}
      rightAction={
        groupDetail ? (
          <Button
            size="sm"
            onClick={() => {
              const element = document.getElementById("add-expense-form");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Chi phí
          </Button>
        ) : null
      }
    >
      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Đang tải thông tin nhóm...
          </CardContent>
        </Card>
      ) : !groupDetail ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Không tìm thấy nhóm. Vui lòng kiểm tra lại liên kết.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Thành viên ({members.length})</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMember((current) => !current)}
                aria-label={
                  showAddMember
                    ? "Đóng biểu mẫu thêm thành viên"
                    : "Thêm thành viên"
                }
              >
                {showAddMember ? "Đóng" : "Thêm"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddMember && (
                <form
                  className="flex items-center justify-between gap-3"
                  onSubmit={handleAddMember}
                >
                  <Input
                    placeholder="Tên thành viên"
                    value={newMemberName}
                    onChange={(event) => setNewMemberName(event.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    aria-label="Xác nhận thêm thành viên"
                  >
                    Thêm
                  </Button>
                </form>
              )}

              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có thành viên nào trong nhóm.
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Đã chi: {member.spent.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {member.owes > 0 ? (
                          <p className="text-sm text-destructive">
                            Nợ {member.owes.toLocaleString("vi-VN")}đ
                          </p>
                        ) : member.owes < 0 ? (
                          <p className="text-sm text-green-600">
                            Được trả {Math.abs(member.owes).toLocaleString(
                              "vi-VN"
                            )}đ
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Đã cân
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label={`Xóa ${member.name}`}
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <span className="text-xl leading-none">-</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi phí gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.length === 0 ? (
                <div className="py-8 text-center">
                  <Receipt className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Chưa có chi phí nào</p>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-start justify-between border-b pb-3 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.paidBy} thanh toán
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {expense.amount.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card id="add-expense-form">
            <CardHeader>
              <CardTitle>Thêm chi tiêu</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Người chi</label>
                  <input
                    type="text"
                    value={newExpense.paidBy}
                    onChange={(event) =>
                      setNewExpense({
                        ...newExpense,
                        paidBy: event.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số tiền</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(event) =>
                      setNewExpense({ ...newExpense, amount: event.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Mô tả</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(event) =>
                      setNewExpense({
                        ...newExpense,
                        description: event.target.value,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Lưu chi tiêu
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}

function readGroupDetails(): Record<string, GroupDetail> {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem(GROUP_DETAIL_STORAGE_KEY);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as Record<string, GroupDetail>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Failed to parse stored group details", error);
    return {};
  }
}

function persistGroupDetail(detail: GroupDetail): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = readGroupDetails();
    const normalized: GroupDetail = {
      ...detail,
      members: detail.members ?? [],
      expenses: detail.expenses ?? [],
    };
    current[normalized.id] = normalized;
    window.localStorage.setItem(
      GROUP_DETAIL_STORAGE_KEY,
      JSON.stringify(current)
    );
    notifyDataChanged();
  } catch (error) {
    console.error("Failed to persist group detail", error);
  }
}

function readGroupSummaries(): GroupSummary[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(GROUPS_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as GroupSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored groups", error);
    return [];
  }
}

function writeGroupSummaries(summaries: GroupSummary[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    GROUPS_STORAGE_KEY,
    JSON.stringify(summaries)
  );
  notifyDataChanged();
}

function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function syncGroupSummary(
  detail: GroupDetail,
  setGroupSummaryState: (summary: GroupSummary) => void
): void {
  const summary: GroupSummary = {
    id: detail.id,
    name: detail.name,
    description: detail.description,
    members: detail.members.length,
    totalBill: calculateTotal(detail.expenses),
  };

  setGroupSummaryState(summary);

  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = readGroupSummaries();
    const index = stored.findIndex((item) => item.id === summary.id);
    if (index === -1) {
      stored.unshift(summary);
    } else {
      stored[index] = { ...stored[index], ...summary };
    }
    writeGroupSummaries(stored);
  } catch (error) {
    console.error("Failed to sync group summary", error);
  }
}

function notifyDataChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("sb:data-changed"));
}
