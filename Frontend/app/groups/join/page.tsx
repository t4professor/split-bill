"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { groupApi } from "@/lib/api";

export default function JoinGroupPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inviteCode.trim() || isJoining) {
      return;
    }

    const code = inviteCode.trim().toUpperCase();
    if (code.length !== 8) {
      setError("Mã mời phải có 8 ký tự");
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      const response = await groupApi.joinGroupByCode({ inviteCode: code });

      router.push(`/groups/${response.group.id}`);
    } catch (err) {
      console.error("Failed to join group:", err);
      setError(err instanceof Error ? err.message : "Không thể tham gia nhóm");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <MainLayout
      title="Tham gia nhóm"
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
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Nhập mã mời</CardTitle>
            <CardDescription className="text-center">
              Nhập mã mời 8 ký tự để tham gia nhóm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-sm text-destructive text-center">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Mã mời</label>
                <Input
                  required
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="VD: ABCD1234"
                  maxLength={8}
                  className="text-center text-lg font-mono tracking-wider"
                  disabled={isJoining}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Mã mời có 8 ký tự, không phân biệt hoa thường
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tham gia...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-5 w-5" />
                    Tham gia nhóm
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Chưa có mã mời?</p>
          <Button variant="outline" onClick={() => router.push("/groups")}>
            Quay lại danh sách nhóm
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
