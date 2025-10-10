"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  // hooks - always run
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [phoneInput, setPhoneInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("phone") || "" : ""
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    setNameInput(user?.name || "");
    setEmailInput(user?.email || "");
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AccountPage: save clicked", {
      nameInput,
      emailInput,
      phoneInput,
    });
    // update in AuthContext and localStorage
    updateProfile({ name: nameInput, email: emailInput, phone: phoneInput });
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
                  console.log("AccountPage: cancel clicked");
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
              console.log("AccountPage: edit clicked");
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
