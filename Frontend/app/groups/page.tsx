"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Users, Loader2 } from "lucide-react";
import { groupApi } from "@/lib/api";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const { isAuthenticated, user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);

  // Create group states
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Join group states
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Fetch groups on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await groupApi.getUserGroups();
      setGroups(response.groups);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      alert(
        error instanceof Error ? error.message : "Không thể tải danh sách nhóm"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetCreator = () => {
    setGroupName("");
    setDescription("");
  };

  const resetJoinForm = () => {
    setInviteCode("");
  };

  const handleCreateGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupName.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      await groupApi.createGroup({
        name: groupName.trim(),
        description: description.trim() || undefined,
      });

      alert("Tạo nhóm thành công!");
      resetCreator();
      setShowCreator(false);

      // Refresh groups list
      await fetchGroups();
    } catch (error) {
      console.error("Failed to create group:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Không thể tạo nhóm. Vui lòng thử lại."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inviteCode.trim()) {
      return;
    }

    setIsJoining(true);
    try {
      const response = await groupApi.joinGroup({
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      alert(`Đã tham gia nhóm thành công!`);
      resetJoinForm();
      setShowJoinGroup(false);

      // Refresh groups list
      await fetchGroups();
    } catch (error) {
      console.error("Failed to join group:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Không thể tham gia nhóm. Vui lòng kiểm tra lại mã nhóm."
      );
    } finally {
      setIsJoining(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout title="Nhóm của tôi">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              Vui lòng đăng nhập để xem nhóm của bạn
            </p>
            <Link href="/login">
              <Button>Đăng nhập</Button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout title="Nhóm của tôi">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Đang tải...</span>
        </div>
      </MainLayout>
    );
  }

  const hasGroups = groups.length > 0;

  return (
    <MainLayout
      title="Nhóm của tôi"
      rightAction={
        <div className="flex gap-2">
          {/* Join Group Button */}
          <Button
            size="sm"
            variant={showJoinGroup ? "default" : "outline"}
            onClick={() => {
              const nextState = !showJoinGroup;
              setShowJoinGroup(nextState);
              if (!nextState) {
                resetJoinForm();
              }
              if (nextState && showCreator) {
                setShowCreator(false);
                resetCreator();
              }
            }}
          >
            {showJoinGroup ? "Đóng" : "Tham gia nhóm"}
          </Button>

          {/* Create Group Button */}
          <Button
            size="sm"
            variant={showCreator ? "default" : "outline"}
            onClick={() => {
              const nextState = !showCreator;
              setShowCreator(nextState);
              if (!nextState) {
                resetCreator();
              }
              if (nextState && showJoinGroup) {
                setShowJoinGroup(false);
                resetJoinForm();
              }
            }}
          >
            <span className="text-lg leading-none mr-2">+</span>
            {showCreator ? "Đóng" : "Tạo nhóm"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {showCreator && (
          <Card>
            <CardHeader>
              <CardTitle>Nhóm mới</CardTitle>
              <CardDescription>
                Điền thông tin bên dưới để tạo nhóm mới.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleCreateGroup}>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tên nhóm</label>
                  <Input
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ví dụ: Team marketing"
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Thêm ghi chú cho nhóm (không bắt buộc)"
                    rows={3}
                    disabled={isCreating}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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
                      Tạo nhóm
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        {showJoinGroup && (
          <Card>
            <CardHeader>
              <CardTitle>Vào nhóm</CardTitle>
              <CardDescription>
                Nhập mã mời 8 ký tự để tham gia vào nhóm có sẵn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleJoinGroup}>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mã nhóm</label>
                  <Input
                    required
                    value={inviteCode}
                    onChange={(e) =>
                      setInviteCode(e.target.value.toUpperCase())
                    }
                    placeholder="Ví dụ: ABCD1234"
                    maxLength={8}
                    disabled={isJoining}
                    className="font-mono tracking-wider text-center text-lg"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {inviteCode.length}/8 ký tự
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isJoining || inviteCode.length !== 8}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tham gia...
                    </>
                  ) : (
                    "Tham gia nhóm"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Groups List or Empty State */}
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
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>
                        {group.members.length} thành viên
                      </CardDescription>
                      {group.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {group.inviteCode}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </div>
    </MainLayout>
  );
}
