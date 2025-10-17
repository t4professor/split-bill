"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { Users, Loader2, AlertCircle, UserPlus } from "lucide-react";
import { groupApi } from "@/lib/api";
import type { Group } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Load groups from API
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await groupApi.getUserGroups();
      setGroups(data.groups);
    } catch (err) {
      console.error("Failed to load groups:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách nhóm"
      );
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
  const handleJoinGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inviteCode.trim() || isJoining) {
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      const response = await groupApi.joinGroupByCode({
        inviteCode: inviteCode.trim(),
      });

      await loadGroups();
      setInviteCode("");
      setShowJoinForm(false);
    } catch (err) {
      console.error("Failed to join group:", err);
      setError(err instanceof Error ? err.message : "Không thể tham gia nhóm");
    } finally {
      setIsJoining(false);
    }
  };

  const hasGroups = groups.length > 0;

  return (
    <ProtectedRoute>
      <MainLayout
        title="Nhóm của tôi"
        rightAction={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const nextState = !showJoinForm;
                setShowJoinForm(nextState);
                if (!nextState) {
                  setInviteCode("");
                  setError(null);
                }
                // Close create form if opening join form
                if (nextState) {
                  setShowCreator(false);
                  resetCreator();
                }
              }}
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {showJoinForm ? "Đóng" : "Vào nhóm"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const nextState = !showCreator;
                setShowCreator(nextState);
                if (!nextState) {
                  resetCreator();
                  setError(null);
                }
                if (nextState) {
                  setShowJoinForm(false);
                  setInviteCode("");
                }
              }}
              disabled={isLoading}
            >
              <span className="text-lg leading-none mr-2">+</span>
              {showCreator ? "Đóng" : "Tạo nhóm"}
            </Button>
          </div>
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCreating}
                  >
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
          {showJoinForm && (
            <Card>
              <CardHeader>
                <CardTitle>Tham gia nhóm</CardTitle>
                <CardDescription>
                  Nhập mã mời để tham gia vào một nhóm có sẵn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleJoinGroup}>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Mã mời</label>
                    <input
                      required
                      value={inviteCode}
                      onChange={(event) => setInviteCode(event.target.value)}
                      placeholder="Ví dụ: ABCD1234"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={isJoining}
                      maxLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mã mời gồm 8 ký tự được cung cấp bởi người tạo nhóm
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isJoining}>
                    {isJoining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tham gia...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Tham gia nhóm
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
                <p className="text-muted-foreground">
                  Đang tải danh sách nhóm...
                </p>
              </CardContent>
            </Card>
          ) : !hasGroups ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  Bạn chưa có nhóm nào
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => setShowCreator(true)}>
                    <span className="mr-2 text-lg leading-none">+</span>
                    Tạo nhóm đầu tiên
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/groups/join")}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Tham gia nhóm
                  </Button>
                </div>
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
    </ProtectedRoute>
  );
}
