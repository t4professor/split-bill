"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GROUP_DETAIL_STORAGE_KEY,
  GROUPS_STORAGE_KEY,
} from "@/lib/constants";
import { type SeedGroupDetail } from "@/lib/seedData";
import { useAuth } from "@/contexts/AuthContext";

export default function NewGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const creatorName = useMemo(() => user?.name?.trim() ?? "", [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      return;
    }

    if (!creatorName) {
      setFormError("Vui lòng đăng nhập để tạo nhóm và tham gia nhóm.");
      return;
    }

    setFormError(null);

    const creatorId = crypto.randomUUID();
    const newGroup = {
      id: crypto.randomUUID(),
      name: groupName.trim(),
      description: description.trim() || undefined,
      members: 1,
      totalBill: 0,
    };

    const stored = typeof window !== "undefined"
      ? window.localStorage.getItem(GROUPS_STORAGE_KEY)
      : null;
    let groups: typeof newGroup[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          groups = parsed;
        }
      } catch (error) {
        console.error("Failed to parse stored groups", error);
      }
    }

    window.localStorage.setItem(
      GROUPS_STORAGE_KEY,
      JSON.stringify([newGroup, ...groups])
    );
    notifyDataChanged();

    try {
      const detailStored = window.localStorage.getItem(
        GROUP_DETAIL_STORAGE_KEY
      );
      const parsed = detailStored
        ? (JSON.parse(detailStored) as Record<string, SeedGroupDetail>)
        : {};
      parsed[newGroup.id] = {
        id: newGroup.id,
        name: newGroup.name,
        description: newGroup.description,
        members: [
          {
            id: creatorId,
            name: creatorName,
            spent: 0,
            owes: 0,
          },
        ],
        expenses: [],
      };
      window.localStorage.setItem(
        GROUP_DETAIL_STORAGE_KEY,
        JSON.stringify(parsed)
      );
      notifyDataChanged();
    } catch (error) {
      console.error("Failed to persist new group detail", error);
    }

    router.push("/groups");
  };

  return (
    <MainLayout title="Tạo nhóm mới">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow space-y-4"
      >
        {formError ? (
          <p className="text-sm text-destructive">{formError}</p>
        ) : null}
        <div>
          <label className="block text-sm font-medium">Tên nhóm</label>
          <Input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Mô tả</label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Tạo nhóm
        </Button>
      </form>
    </MainLayout>
  );
}

function notifyDataChanged(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("sb:data-changed"));
}
