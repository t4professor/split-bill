"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  // hooks - always run
  const [isEditing, setIsEditing] = useState(false);
  const readStoredPhone = () =>
    (typeof window !== "undefined" ? localStorage.getItem("phone") ?? "" : "");

  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [emailInput, setEmailInput] = useState(user?.email ?? "");
  const [phoneInput, setPhoneInput] = useState<string>(() => readStoredPhone());
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setNameInput(user?.name ?? "");
    setEmailInput(user?.email ?? "");
    setPhoneInput(readStoredPhone);
    setAvatarPreview(user?.avatarUrl ?? null);
  }, [user]);

  const resetForm = () => {
    setNameInput(user?.name ?? "");
    setEmailInput(user?.email ?? "");
    setPhoneInput(readStoredPhone);
    setAvatarPreview(user?.avatarUrl ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setAvatarPreview(result);
    };
    reader.onerror = () => {
      setAvatarPreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      avatarUrl: avatarPreview ?? null,
    });
    setIsEditing(false);
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <div className="flex relative mt-4">
        <ChevronLeft
          className="fixed top-0 mt-3 "
          onClick={() => router.push("/")}
        />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tài khoản của tôi</h1>
        {isEditing && (
          <span className="text-sm text-yellow-600">Đang chỉnh sửa</span>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 pb-4">
        <Avatar className="h-24 w-24">
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} alt={user?.name ?? "Avatar"} />
          ) : (
            <AvatarFallback>
              {(user?.name || user?.email || "?")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        {isEditing ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <Button type="button" size="sm" onClick={handleSelectAvatar}>
              Chọn ảnh mới
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRemoveAvatar}
              disabled={!avatarPreview}
            >
              Gỡ ảnh
            </Button>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground">Tên</div>
          {isEditing ? (
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          ) : (
            <div className="font-medium text-lg">{user?.name}</div>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Email</div>
          {isEditing ? (
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          ) : (
            <div className="font-medium">{user?.email}</div>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-foreground">Số điện thoại</div>
          {isEditing ? (
            <Input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
          ) : (
            <div className="font-medium">{phoneInput || "Chưa có"}</div>
          )}
        </div>

        <div className="pt-4 flex items-center gap-2">
          {isEditing ? (
            <>
              <Button type="submit">Lưu</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
              >
                Hủy
              </Button>
            </>
          ) : null}
        </div>
      </form>

      {!isEditing && (
        <div className="pt-4">
          <Button
            type="button"
            onClick={() => {
              resetForm();
              setIsEditing(true);
            }}
          >
            Chỉnh sửa thông tin
          </Button>
        </div>
      )}
    </div>
  );
}
