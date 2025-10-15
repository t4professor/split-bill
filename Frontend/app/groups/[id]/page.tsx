"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { GROUP_DETAIL_STORAGE_KEY, GROUPS_STORAGE_KEY } from "@/lib/constants";
import {
  seedGroupDetails,
  type SeedExpense,
  type SeedGroupDetail,
} from "@/lib/seedData";
import { buildInvitePath, resolveInviteLink } from "@/lib/utils";
import { MemberSelector } from "@/components/ui/MemberSelector";
import { Plus, Receipt } from "lucide-react";
type Expense = SeedExpense;
type GroupDetail = SeedGroupDetail;
type GroupMember = GroupDetail["members"][number];

type GroupSummary = {
  id: string;
  name: string;
  description?: string;
  members: number;
  totalBill: number;
  inviteCode?: string;
  inviteLink?: string;
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
};

type NewExpenseState = {
  description: string;
  amount: string;
  payerId: string;
  participantIds: string[];
  createdBy: string;
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
  const [newExpense, setNewExpense] = useState<NewExpenseState>({
    description: "",
    amount: "",
    payerId: "",
    participantIds: [],
    createdBy: "",
  });
  const [newMemberName, setNewMemberName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const members = useMemo(() => groupDetail?.members ?? [], [groupDetail]);
  const expenses = useMemo(() => groupDetail?.expenses ?? [], [groupDetail]);

  const memberIds = useMemo(() => members.map((member) => member.id), [members]);
  const memberMap = useMemo(() => {
    const map = new Map<string, GroupMember>();
    members.forEach((member) => {
      map.set(member.id, member);
    });
    return map;
  }, [members]);

  const getMemberName = useCallback(
    (id: string): string => memberMap.get(id)?.name ?? "",
    [memberMap]
  );

  const normalizeExpenseState = useCallback(
    (
      state: NewExpenseState,
      options: { keepCreatorFallback?: boolean } = {}
    ): NewExpenseState => {
      const keepCreatorFallback = options.keepCreatorFallback ?? false;

      if (memberIds.length === 0) {
        const trimmedCreator = state.createdBy.trim();
        const desiredCreator = keepCreatorFallback ? trimmedCreator : "";

        if (
          state.payerId === "" &&
          state.participantIds.length === 0 &&
          state.createdBy === desiredCreator
        ) {
          return state;
        }

        return {
          ...state,
          payerId: "",
          participantIds: [],
          createdBy: desiredCreator,
        };
      }

      const resolvedParticipants = state.participantIds.filter((id) =>
        memberMap.has(id)
      );
      const baseParticipantIds =
        resolvedParticipants.length > 0 ? resolvedParticipants : memberIds;

      const fallbackPayerId = baseParticipantIds[0] ?? memberIds[0] ?? "";
      const payerId = baseParticipantIds.includes(state.payerId)
        ? state.payerId
        : fallbackPayerId;

      const normalizedParticipantIds = (() => {
        if (!payerId) {
          const seen = new Set<string>();
          return baseParticipantIds.filter((id) => {
            if (seen.has(id)) {
              return false;
            }
            seen.add(id);
            return true;
          });
        }

        const reordered = [
          payerId,
          ...baseParticipantIds.filter((id) => id !== payerId),
        ];
        const seen = new Set<string>();
        return reordered.filter((id) => {
          if (seen.has(id)) {
            return false;
          }
          seen.add(id);
          return true;
        });
      })();

      const payerName = getMemberName(payerId);

      if (
        payerId === state.payerId &&
        arraysEqual(normalizedParticipantIds, state.participantIds) &&
        payerName === state.createdBy
      ) {
        return state;
      }

      return {
        ...state,
        payerId,
        participantIds: normalizedParticipantIds,
        createdBy: payerName,
      };
    },
    [getMemberName, memberIds, memberMap]
  );

  useEffect(() => {
    setNewExpense((previous) => normalizeExpenseState(previous));
  }, [normalizeExpenseState]);

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
      const normalizedId = detail.id || summary?.id || groupId;
      const inviteCode = detail.inviteCode ?? summary?.inviteCode;
      const fallbackLink = inviteCode
        ? buildInvitePath(normalizedId, inviteCode)
        : undefined;

      const normalized: GroupDetail = {
        id: normalizedId,
        name: summary?.name ?? detail.name,
        description: summary?.description ?? detail.description,
        inviteCode,
        inviteLink:
          detail.inviteLink ?? summary?.inviteLink ?? fallbackLink,
        members: detail.members ?? [],
        expenses: detail.expenses ?? [],
      };

      commitDetail(normalized);
    } else {
      setGroupDetail(null);
      if (summary) {
        setGroupSummary(summary);
      } else {
        setGroupSummary(null);
      }
      setSettlements([]);
    }

    setIsLoading(false);
  }, [groupId]);

  const commitDetail = (detail: GroupDetail): void => {
    const recalculated = recalculateGroupDetail(detail);
    setGroupDetail(recalculated.detail);
    setSettlements(recalculated.settlements);
    persistGroupDetail(recalculated.detail);
    syncGroupSummary(recalculated.detail, setGroupSummary);
  };

  const createDetailSkeleton = (): GroupDetail => ({
    id: groupId,
    name: groupSummary?.name ?? `Nhóm ${groupId}`,
    description: groupSummary?.description,
    inviteCode: groupSummary?.inviteCode,
    inviteLink:
      groupSummary?.inviteLink ??
      (groupSummary?.inviteCode ? buildInvitePath(groupId, groupSummary.inviteCode) : undefined),
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

    commitDetail(nextDetail);
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

    commitDetail(nextDetail);
  };

  const handleAddExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupId) {
      return;
    }

    const payer = memberMap.get(newExpense.payerId);
    if (!payer) {
      return;
    }

    const validParticipantIds = newExpense.participantIds.filter((id) =>
      memberMap.has(id)
    );
    const participantIds =
      validParticipantIds.length > 0 ? validParticipantIds : memberIds;

    if (participantIds.length === 0) {
      return;
    }

    const safeAmount = toNonNegativeInteger(newExpense.amount);

    const baseDetail = groupDetail ?? createDetailSkeleton();
    const expense: Expense = {
      id: crypto.randomUUID(),
      description: newExpense.description.trim(),
      amount: safeAmount,
      paidBy: payer.name,
      paidById: payer.id,
      date: new Date().toISOString(),
      participantIds,
      createdBy: payer.name,
    };

    const nextDetail: GroupDetail = {
      ...baseDetail,
      expenses: [...baseDetail.expenses, expense],
    };

    commitDetail(nextDetail);
    setNewExpense((previous) =>
      normalizeExpenseState({
        ...previous,
        description: "",
        amount: "",
        payerId: payer.id,
        participantIds,
        createdBy: payer.name,
      })
    );
  };

  const {
    shareLink,
    copyStatus,
    copyInviteLink,
    inviteCode: detailInviteCode,
  } = useInviteShare(groupDetail);
  const displayInviteCode = detailInviteCode ?? groupSummary?.inviteCode;

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
          {shareLink ? (
            <ShareInviteCard
              link={shareLink}
              inviteCode={displayInviteCode}
              status={copyStatus}
              onCopy={copyInviteLink}
            />
          ) : null}
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
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
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
                            Được trả{" "}
                            {Math.abs(member.owes).toLocaleString("vi-VN")}đ
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

          <Card>
            <CardHeader>
              <CardTitle>Cân bằng khoản nợ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {settlements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Mọi người đã cân bằng, không có khoản nợ nào.
                </p>
              ) : (
                settlements.map((settlement, index) => (
                  <div
                    key={`${settlement.from}-${settlement.to}-${index}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {settlement.from} cần trả {settlement.to}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sau khi chia theo các khoản chi liên quan
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-destructive">
                      {settlement.amount.toLocaleString("vi-VN")}đ
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
                  <MemberSelector
                    members={members}
                    value={newExpense.payerId}
                    onChange={(value) => {
                      if (typeof value !== "string") {
                        return;
                      }

                      setNewExpense((previous) =>
                        normalizeExpenseState({
                          ...previous,
                          payerId: value,
                          participantIds: previous.participantIds.includes(value)
                            ? previous.participantIds
                            : [...previous.participantIds, value],
                        })
                      );
                    }}
                    placeholder={
                      members.length === 0
                        ? "Thêm thành viên để ghi nhận chi tiêu"
                        : "Chọn người chi"
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số tiền</label>

                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(event) =>
                      setNewExpense((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="Ex. 500000"
                    className="text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Mô tả</label>

                  <Input
                    type="text"
                    value={newExpense.description}
                    onChange={(event) =>
                      setNewExpense((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Mục đích của chi tiêu này"
                    required
                    className="text-sm"
                  />
                  <div className="pt-4">
                    <MemberSelector
                      members={members.filter((member) => member.id !== newExpense.payerId)}
                      value={newExpense.participantIds.filter(
                        (id) => id !== newExpense.payerId
                      )}
                      onChange={(value) => {
                        if (!Array.isArray(value)) {
                          return;
                        }

                        setNewExpense((previous) =>
                          normalizeExpenseState({
                            ...previous,
                            participantIds: [...value, previous.payerId].filter(Boolean),
                          })
                        );
                      }}
                      label="Thành viên của chi tiêu này"
                      placeholder={
                        members.length === 0
                          ? "Chưa có thành viên"
                          : "Chọn thành viên"
                      }
                      multiple
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Người tạo sẽ tự động là người chi:{" "}
                  {getMemberName(newExpense.payerId) || "Chưa xác định"}
                </p>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={members.length === 0}
                >
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

type ShareStatus = "idle" | "success" | "error";

function useInviteShare(detail: GroupDetail | null) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const timeoutRef = useRef<number | null>(null);

  const shareLink = useMemo(() => {
    if (!detail) {
      return "";
    }

    if (detail.inviteLink) {
      return resolveInviteLink(detail.inviteLink);
    }

    if (detail.inviteCode) {
      return resolveInviteLink(buildInvitePath(detail.id, detail.inviteCode));
    }

    return "";
  }, [detail]);

  const scheduleReset = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
      timeoutRef.current = null;
    }, 2000);
  }, []);

  const copyInviteLink = useCallback(async () => {
    if (!shareLink) {
      setStatus("error");
      scheduleReset();
      return;
    }

    try {
      if (
        typeof navigator === "undefined" ||
        !("clipboard" in navigator) ||
        !navigator.clipboard
      ) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(shareLink);
      setStatus("success");
    } catch (error) {
      console.error("Failed to copy invite link", error);
      setStatus("error");
    } finally {
      scheduleReset();
    }
  }, [shareLink, scheduleReset]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") {
        return;
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    shareLink,
    copyStatus: status,
    copyInviteLink,
    inviteCode: detail?.inviteCode,
  };
}

type ShareInviteCardProps = {
  link: string;
  inviteCode?: string | null;
  status: ShareStatus;
  onCopy: () => void;
};

const ShareInviteCard = memo(function ShareInviteCard({
  link,
  inviteCode,
  status,
  onCopy,
}: ShareInviteCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chia sẻ nhóm</CardTitle>
        <CardDescription>
          Gửi link này cho người khác để tham gia nhóm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            readOnly
            value={link}
            className="font-mono text-sm"
            aria-label="Link mời nhóm"
          />
          <Button
            type="button"
            size="sm"
            onClick={onCopy}
            className="w-full sm:w-auto"
          >
            Sao chép link
          </Button>
        </div>
        <div className="mt-3 space-y-1">
          {status === "success" ? (
            <p className="text-sm text-emerald-600">Đã sao chép link mời.</p>
          ) : null}
          {status === "error" ? (
            <p className="text-sm text-destructive">
              Không thể sao chép tự động, vui lòng copy thủ công.
            </p>
          ) : null}
          {inviteCode ? (
            <p className="text-xs text-muted-foreground">Mã mời: {inviteCode}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
});

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

  window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(summaries));
  notifyDataChanged();
}

function toNonNegativeInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
}

function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

function arraysEqual(first: string[], second: string[]): boolean {
  if (first.length !== second.length) {
    return false;
  }

  const sortedFirst = [...first].sort();
  const sortedSecond = [...second].sort();

  return sortedFirst.every((value, index) => value === sortedSecond[index]);
}

function recalculateGroupDetail(detail: GroupDetail): {
  detail: GroupDetail;
  settlements: Settlement[];
} {
  const members = detail.members ?? [];
  const expenses = detail.expenses ?? [];

  const memberById = new Map<string, SeedGroupDetail["members"][number]>();
  const memberIdByName = new Map<string, string>();
  members.forEach((member) => {
    memberById.set(member.id, member);
    memberIdByName.set(member.name, member.id);
  });

  if (members.length === 0) {
    return {
      detail: {
        ...detail,
        members: members.map((member) => ({
          ...member,
          spent: 0,
          owes: 0,
        })),
      },
      settlements: [],
    };
  }
  const memberIds = new Set(members.map((member) => member.id));
  const defaultParticipantIds = members.map((member) => member.id);

  const normalizedExpenses = expenses.map((expense) => {
    const rawParticipants: string[] = Array.isArray(expense.participantIds)
      ? expense.participantIds
      : defaultParticipantIds;
    const filteredParticipants = rawParticipants.filter((id) =>
      memberIds.has(id)
    );
    const participants =
      filteredParticipants.length > 0 ? filteredParticipants : defaultParticipantIds;

    const hasValidPaidById =
      typeof expense.paidById === "string" && memberIds.has(expense.paidById);
    const resolvedPayerId = hasValidPaidById
      ? expense.paidById
  : memberIdByName.get(expense.paidBy) ?? (participants[0] ?? "");

    const resolvedPayerName = resolvedPayerId
      ? memberById.get(resolvedPayerId)?.name ?? expense.paidBy
      : expense.paidBy;

    const createdBy = resolvedPayerName ?? "";

    return {
      ...expense,
      paidBy: resolvedPayerName ?? "",
      paidById: resolvedPayerId || undefined,
      participantIds: participants,
      createdBy,
    };
  });

  const shareByMember = new Map<string, number>();
  const spentByMember = new Map<string, number>();

  normalizedExpenses.forEach((expense) => {
    const participants = expense.participantIds ?? defaultParticipantIds;
    if (participants.length === 0) {
      return;
    }

    const share = expense.amount / participants.length;
    participants.forEach((memberId) => {
      if (!memberIds.has(memberId)) {
        return;
      }
      shareByMember.set(
        memberId,
        (shareByMember.get(memberId) ?? 0) + share
      );
    });

    const hasValidPaidById =
      typeof expense.paidById === "string" && memberIds.has(expense.paidById);
    const payerId = hasValidPaidById
      ? expense.paidById
      : memberIdByName.get(expense.paidBy);

    if (payerId) {
      spentByMember.set(
        payerId,
        (spentByMember.get(payerId) ?? 0) + expense.amount
      );
    }
  });

  const updatedMembers = members.map((member) => {
    const spent = spentByMember.get(member.id) ?? 0;
    const share = shareByMember.get(member.id) ?? 0;
    const owes = Math.round(share - spent);
    return {
      ...member,
      spent,
      owes,
    };
  });

  const totalOwes = updatedMembers.reduce((sum, member) => sum + member.owes, 0);
  if (totalOwes !== 0) {
    const adjustIndex = updatedMembers.findIndex((member) => member.owes !== 0);
    const targetIndex = adjustIndex === -1 ? 0 : adjustIndex;
    updatedMembers[targetIndex] = {
      ...updatedMembers[targetIndex],
      owes: updatedMembers[targetIndex].owes - totalOwes,
    };
  }

  const settlements = buildSettlements(updatedMembers);

  return {
    detail: {
      ...detail,
      members: updatedMembers,
      expenses: normalizedExpenses,
    },
    settlements,
  };
}

function buildSettlements(members: SeedGroupDetail["members"]): Settlement[] {
  const debtors = members
    .filter((member) => member.owes > 0)
    .map((member) => ({ name: member.name, amount: member.owes }));
  const creditors = members
    .filter((member) => member.owes < 0)
    .map((member) => ({ name: member.name, amount: Math.abs(member.owes) }));

  const settlements: Settlement[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0) {
      debtorIndex += 1;
    }

    if (creditor.amount <= 0) {
      creditorIndex += 1;
    }
  }

  return settlements;
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
    inviteCode: detail.inviteCode,
    inviteLink: detail.inviteLink ??
      (detail.inviteCode ? buildInvitePath(detail.id, detail.inviteCode) : undefined),
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
