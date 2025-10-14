"use client";

import { useEffect, useState } from "react";
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

type Group = {
  id: string;
  name: string;
  description?: string;
  totalBill: number;
  members: number;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(seedGroups);
  const [initialized, setInitialized] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedGroups = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    if (storedGroups) {
      try {
        const parsed = JSON.parse(storedGroups) as Group[];
        if (Array.isArray(parsed)) {
          setGroups(parsed);
          setInitialized(true);
          ensureSeededGroupDetails();
          return;
        }
      } catch (error) {
        console.error("Failed to parse stored groups", error);
      }
    }

    window.localStorage.setItem(
      GROUPS_STORAGE_KEY,
      JSON.stringify(seedGroups)
    );
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

  const handleCreateGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupName.trim()) {
      return;
    }

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: groupName.trim(),
      description: description.trim() || undefined,
      members: 0,
      totalBill: 0,
    };

    setGroups((current) => [newGroup, ...current]);
    persistGroupDetail(newGroup.id, {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      members: [],
      expenses: [],
    });
    resetCreator();
    setShowCreator(false);
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
        <Button
          size="sm"
          onClick={() => {
            const nextState = !showCreator;
            setShowCreator(nextState);
            if (!nextState) {
              resetCreator();
            }
          }}
        >
          <span className="text-lg leading-none mr-2">+</span>
          {showCreator ? "Đóng" : "Tạo nhóm"}
        </Button>
      }
    >
      <div className="space-y-4">
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
    window.localStorage.setItem(
      GROUP_DETAIL_STORAGE_KEY,
      JSON.stringify(merged)
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
    const next = { ...parsed, [groupId]: detail };
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
