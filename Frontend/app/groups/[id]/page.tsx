"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle, Users, ArrowLeft } from "lucide-react";
import { groupApi, getAvatarUrl } from "@/lib/api";
import type { Group } from "@/lib/types";

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

        {/* Expenses placeholder - will be implemented in next task */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              Chức năng chi tiêu sẽ được kết nối trong task tiếp theo
            </p>
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
