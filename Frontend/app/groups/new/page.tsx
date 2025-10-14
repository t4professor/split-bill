"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewGroupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Group Name:", groupName);
    console.log("Description:", description);
    const newGroupId = "4";
    router.push(`/groups/${newGroupId}`);
  };

  return (
    <MainLayout title="Tạo nhóm mới">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow space-y-4"
      >
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
