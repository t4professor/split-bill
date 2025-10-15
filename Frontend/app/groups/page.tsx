"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";
import {
  GROUP_DETAIL_STORAGE_KEY,
  GROUPS_STORAGE_KEY,
} from "@/lib/constants";
import {
  seedGroupDetails,
  seedGroups,
  type SeedGroupDetail,
} from "@/lib/seedData";
import { useAuth } from "@/contexts/AuthContext";
import { buildInvitePath, generateInviteCode, parseInviteInput } from "@/lib/utils";

type Group = {
  id: string;
  name: string;
  description?: string;
  totalBill: number;
  members: number;
  inviteCode?: string;
  inviteLink?: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(() => seedGroups.map((group) => ensureInviteFields(group)));
  const [initialized, setInitialized] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [showJoiner, setShowJoiner] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedGroups = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    if (storedGroups) {
      try {
        const parsed = JSON.parse(storedGroups) as Group[];
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((group) => ensureInviteFields(group));
          setGroups(normalized);
          setInitialized(true);
          ensureSeededGroupDetails();
          return;
        }
      } catch (error) {
        console.error("Failed to parse stored groups", error);
      }
    }

    const seeded = seedGroups.map((group) => ensureInviteFields(group));
    setGroups(seeded);
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(seeded));
    notifyDataChanged();
    ensureSeededGroupDetails();
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !initialized) {
      return;
    }

    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    notifyDataChanged();
  }, [groups, initialized]);

  const resetCreator = () => {
    setGroupName("");
    setDescription("");
  };

  const resetJoiner = () => {
    setJoinLink("");
    setJoinError(null);
    setJoinSuccess(null);
  };

  const handleCreateGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupName.trim()) {
      return;
    }

    const id = crypto.randomUUID();
    const inviteCode = generateInviteCode();
    const inviteLink = buildInvitePath(id, inviteCode);

    const newGroup = ensureInviteFields({
      id,
      name: groupName.trim(),
      description: description.trim() || undefined,
      members: 0,
      totalBill: 0,
      inviteCode,
      inviteLink,
    });

    setGroups((current) => [newGroup, ...current]);
    persistGroupDetail(newGroup.id, {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      inviteCode: newGroup.inviteCode,
      inviteLink: newGroup.inviteLink,
      members: [],
      expenses: [],
    });
    resetCreator();
    setShowCreator(false);
  };

  const handleJoinGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (typeof window === "undefined") {
      return;
    }

    setJoinError(null);
    setJoinSuccess(null);

    const trimmedLink = joinLink.trim();
    if (!trimmedLink) {
      setJoinError("Vui lòng nhập link mời của nhóm.");
      return;
    }

    const memberName = user?.name?.trim();
    if (!memberName) {
      setJoinError("Vui lòng đăng nhập để tham gia nhóm.");
      return;
    }

    const { groupId, inviteCode } = parseInviteInput(trimmedLink);
    if (!inviteCode) {
      setJoinError("Link mời không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      const stored = window.localStorage.getItem(GROUP_DETAIL_STORAGE_KEY);
      const parsed = stored
        ? (JSON.parse(stored) as Record<string, SeedGroupDetail>)
        : {};
      const merged: Record<string, SeedGroupDetail> = {
        ...seedGroupDetails,
        ...parsed,
      };

      let detail = groupId ? merged[groupId] : undefined;
      if (detail && detail.inviteCode && detail.inviteCode !== inviteCode) {
        detail = undefined;
      }

      if (!detail) {
        detail = Object.values(merged).find(
          (item) => item.inviteCode === inviteCode
        );
      }

      if (!detail) {
        setJoinError("Không tìm thấy nhóm với link được cung cấp.");
        return;
      }

      const normalizedDetail: SeedGroupDetail = {
        ...detail,
        inviteCode: detail.inviteCode ?? inviteCode,
        inviteLink: detail.inviteLink ?? buildInvitePath(detail.id, inviteCode),
        members: Array.isArray(detail.members) ? detail.members : [],
        expenses: Array.isArray(detail.expenses) ? detail.expenses : [],
      };

      const alreadyMember = normalizedDetail.members.some(
        (member) => member.name.toLowerCase() === memberName.toLowerCase()
      );

      const members = alreadyMember
        ? normalizedDetail.members
        : [
            ...normalizedDetail.members,
            {
              id: crypto.randomUUID(),
              name: memberName,
              spent: 0,
              owes: 0,
            },
          ];

      const totalBill = normalizedDetail.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const summary = ensureInviteFields({
        id: normalizedDetail.id,
        name: normalizedDetail.name,
        description: normalizedDetail.description,
        members: members.length,
        totalBill,
        inviteCode: normalizedDetail.inviteCode ?? inviteCode,
        inviteLink: normalizedDetail.inviteLink,
      });

      setGroups((current) => {
        const exists = current.some((group) => group.id === summary.id);
        if (exists) {
          return current.map((group) =>
            group.id === summary.id
              ? {
                  ...group,
                  members: summary.members,
                  totalBill: summary.totalBill,
                  inviteCode: summary.inviteCode,
                  inviteLink: summary.inviteLink,
                }
              : group
          );
        }

        return [summary, ...current];
      });

      persistGroupDetail(summary.id, {
        ...normalizedDetail,
        inviteCode: summary.inviteCode,
        inviteLink: summary.inviteLink,
        members,
      });

      setJoinSuccess(
        alreadyMember
          ? `Bạn đã là thành viên của nhóm ${summary.name}.`
          : `Đã tham gia nhóm ${summary.name}.`
      );
      setJoinLink("");
    } catch (error) {
      console.error("Failed to join group", error);
      setJoinError("Không thể tham gia nhóm. Vui lòng thử lại.");
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups((current) => current.filter((group) => group.id !== groupId));
    removeGroupDetail(groupId);
  };

  const hasGroups = groups.length > 0;

  return (
    <MainLayout
      title="Nhóm của tôi"
      rightAction={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              const nextState = !showCreator;
              setShowCreator(nextState);
              if (nextState) {
                setShowJoiner(false);
                resetJoiner();
              } else {
                resetCreator();
              }
            }}
          >
            <span className="text-lg leading-none mr-2">+</span>
            {showCreator ? "Đóng" : "Tạo nhóm"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const nextState = !showJoiner;
              setShowJoiner(nextState);
              if (nextState) {
                setShowCreator(false);
                resetCreator();
              } else {
                resetJoiner();
              }
            }}
          >
            Vào nhóm
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {showJoiner && (
          <Card>
            <CardHeader>
              <CardTitle>Tham gia nhóm</CardTitle>
              <CardDescription>
                Dán link mời của nhóm để tham gia cùng mọi người.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleJoinGroup}>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Link mời nhóm</label>
                  <input
                    required
                    value={joinLink}
                    onChange={(event) => setJoinLink(event.target.value)}
                    placeholder="Ví dụ: /groups/join?group=1&code=ABCD-1234"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {joinError ? (
                  <p className="text-sm text-destructive">{joinError}</p>
                ) : null}
                {joinSuccess ? (
                  <p className="text-sm text-emerald-600">{joinSuccess}</p>
                ) : null}
                <Button type="submit" className="w-full">
                  Vào nhóm
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        {showCreator && (
          <Card>
            <CardHeader>
              <CardTitle>Nhóm mới</CardTitle>
              <CardDescription>
                Điền thông tin bên dưới để thêm nhóm vào danh sách của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleCreateGroup}>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tên nhóm</label>
                  <input
                    required
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    placeholder="Ví dụ: Team marketing"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Thêm ghi chú cho nhóm (không bắt buộc)"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <span className="text-lg leading-none mr-2">+</span>
                  Thêm nhóm
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {!hasGroups ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">Bạn chưa có nhóm nào</p>
              <Button onClick={() => setShowCreator(true)}>
                <span className="mr-2 text-lg leading-none">+</span>
                Tạo nhóm đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-accent">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                      {group.members} thành viên
                    </CardDescription>
                    {group.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleDeleteGroup(group.id);
                    }}
                    aria-label="Xóa nhóm"
                  >
                    <span className="text-xl leading-none">-</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tổng chi phí
                    </span>
                    <span className="text-lg font-semibold">
                      {group.totalBill.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </MainLayout>
  );
}

function ensureInviteFields(group: Group): Group {
  if (!group.inviteCode) {
    return group;
  }

  const inviteLink = group.inviteLink ?? buildInvitePath(group.id, group.inviteCode);
  return {
    ...group,
    inviteLink,
  };
}

function ensureSeededGroupDetails() {
  if (typeof window === "undefined") {
    return;
  }

  const stored = window.localStorage.getItem(GROUP_DETAIL_STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(
      GROUP_DETAIL_STORAGE_KEY,
      JSON.stringify(seedGroupDetails)
    );
    notifyDataChanged();
    return;
  }

  try {
    const parsed = JSON.parse(stored) as Record<string, SeedGroupDetail>;
    const merged: Record<string, SeedGroupDetail> = {
      ...seedGroupDetails,
      ...parsed,
    };

    const normalized = Object.fromEntries(
      Object.entries(merged).map(([id, detail]) => {
        const inviteCode = detail.inviteCode;
        const inviteLink = detail.inviteLink ?? (inviteCode ? buildInvitePath(id, inviteCode) : undefined);
        return [
          id,
          {
            ...detail,
            inviteCode,
            inviteLink,
            members: Array.isArray(detail.members) ? detail.members : [],
            expenses: Array.isArray(detail.expenses) ? detail.expenses : [],
          },
        ];
      })
    );

    window.localStorage.setItem(
      GROUP_DETAIL_STORAGE_KEY,
      JSON.stringify(normalized)
    );
    notifyDataChanged();
  } catch (error) {
    console.error("Failed to parse stored group details", error);
    window.localStorage.setItem(
      GROUP_DETAIL_STORAGE_KEY,
      JSON.stringify(seedGroupDetails)
    );
    notifyDataChanged();
  }
}

function persistGroupDetail(
  groupId: string,
  detail: SeedGroupDetail
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = window.localStorage.getItem(GROUP_DETAIL_STORAGE_KEY);
    const parsed = stored
      ? (JSON.parse(stored) as Record<string, SeedGroupDetail>)
      : {};
    const normalizedDetail: SeedGroupDetail = {
      ...detail,
      inviteLink:
        detail.inviteLink ??
        (detail.inviteCode ? buildInvitePath(groupId, detail.inviteCode) : undefined),
      members: Array.isArray(detail.members) ? detail.members : [],
      expenses: Array.isArray(detail.expenses) ? detail.expenses : [],
    };
    const next = { ...parsed, [groupId]: normalizedDetail };
    window.localStorage.setItem(
      GROUP_DETAIL_STORAGE_KEY,
      JSON.stringify(next)
    );
    notifyDataChanged();
  } catch (error) {
    console.error("Failed to persist group detail", error);
  }
}

function removeGroupDetail(groupId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = window.localStorage.getItem(GROUP_DETAIL_STORAGE_KEY);
    if (!stored) {
      return;
    }

    const parsed = JSON.parse(stored) as Record<string, SeedGroupDetail>;
    if (!(groupId in parsed)) {
      return;
    }

    const rest = { ...parsed };
    delete rest[groupId];
    window.localStorage.setItem(
      GROUP_DETAIL_STORAGE_KEY,
      JSON.stringify(rest)
    );
    notifyDataChanged();
  } catch (error) {
    console.error("Failed to remove group detail", error);
  }
}

function notifyDataChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("sb:data-changed"));
}
