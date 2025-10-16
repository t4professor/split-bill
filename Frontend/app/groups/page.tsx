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
import { Users, Loader2, AlertCircle } from "lucide-react";
import { groupApi } from "@/lib/api";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Load groups from API
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await groupApi.getUserGroups();
      setGroups(data);
    } catch (err) {
      console.error("Failed to load groups:", err);
      setError(err instanceof Error ? err.message : "Không thể tải danh sách nhóm");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreator = () => {
    setGroupName("");
    setDescription("");
  };

  const handleCreateGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupName.trim() || isCreating) {
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const response = await groupApi.createGroup({
        name: groupName.trim(),
        description: description.trim() || undefined,
      });

      // Add new group to the list
      setGroups((current) => [response.group, ...current]);
      resetCreator();
      setShowCreator(false);
    } catch (err) {
      console.error("Failed to create group:", err);
      setError(err instanceof Error ? err.message : "Không thể tạo nhóm");
    } finally {
      setIsCreating(false);
    }
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
              setError(null);
            }
          }}
          disabled={isLoading}
        >
          <span className="text-lg leading-none mr-2">+</span>
          {showCreator ? "Đóng" : "Tạo nhóm"}
        </Button>
      }
    >
      <div className="space-y-4">
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
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
                    disabled={isCreating}
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
                    disabled={isCreating}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <span className="text-lg leading-none mr-2">+</span>
                      Thêm nhóm
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải danh sách nhóm...</p>
            </CardContent>
          </Card>
        ) : !hasGroups ? (
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
                  <div className="flex-1">
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                      {group.members?.length || 0} thành viên
                    </CardDescription>
                    {group.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Mã mời
                    </span>
                    <span className="text-lg font-mono font-semibold">
                      {group.inviteCode}
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
