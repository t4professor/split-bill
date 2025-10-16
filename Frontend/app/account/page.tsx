"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, updateProfile, refreshProfile } =
    useAuth();
  const router = useRouter();
  // hooks - always run
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [firstNameInput, setFirstNameInput] = useState(user?.firstName ?? "");
  const [lastNameInput, setLastNameInput] = useState(user?.lastName ?? "");
  const [emailInput, setEmailInput] = useState(user?.email ?? "");
  const [phoneInput, setPhoneInput] = useState<string>(user?.phoneNumber ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarPath ?? null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setFirstNameInput(user?.firstName ?? "");
    setLastNameInput(user?.lastName ?? "");
    setEmailInput(user?.email ?? "");
    setPhoneInput(user?.phoneNumber ?? "");
    setAvatarPreview(user?.avatarPath ?? null);
  }, [user]);

  const resetForm = () => {
    setFirstNameInput(user?.firstName ?? "");
    setLastNameInput(user?.lastName ?? "");
    setEmailInput(user?.email ?? "");
    setPhoneInput(user?.phoneNumber ?? "");
    setAvatarPreview(user?.avatarPath ?? null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Store the file for upload
    setAvatarFile(file);

    // Create preview
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
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // First, upload avatar if a new file was selected
      if (avatarFile) {
        const { authApi } = await import("@/lib/api");
        await authApi.uploadAvatar(avatarFile);
      }

      // Then update profile information
      await updateProfile({
        firstName: firstNameInput,
        lastName: lastNameInput,
        email: emailInput,
        phoneNumber: phoneInput,
      });

      // Refresh profile to get updated avatar path
      await refreshProfile();

      setIsEditing(false);
      setAvatarFile(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
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
            <AvatarImage
              src={
                avatarFile
                  ? avatarPreview
                  : `http://localhost:3001/${avatarPreview}`
              }
              alt={user ? `${user.firstName} ${user.lastName}` : "Avatar"}
            />
          ) : (
            <AvatarFallback>
              {(user?.firstName || user?.userName || user?.email || "?")
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Họ</div>
            {isEditing ? (
              <Input
                value={firstNameInput}
                onChange={(e) => setFirstNameInput(e.target.value)}
              />
            ) : (
              <div className="font-medium">{user?.firstName}</div>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Tên</div>
            {isEditing ? (
              <Input
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
              />
            ) : (
              <div className="font-medium">{user?.lastName}</div>
            )}
          </div>
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
                disabled={isSaving}
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
