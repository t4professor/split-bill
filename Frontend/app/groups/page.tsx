"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";

const groups = [
  { id: "1", name: "Du lịch Đà Lạt", members: 5, totalBill: 2500000 },
  { id: "2", name: "Team outing", members: 8, totalBill: 4200000 },
  { id: "3", name: "Sinh nhật Minh", members: 12, totalBill: 3800000 },
];

export default function GroupsPage() {
  return (
    <MainLayout
      title="Nhóm của tôi"
      rightAction={
        <Link href="/groups/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Tạo nhóm
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        {groups.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Bạn chưa có nhóm nào</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo nhóm đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.members} thành viên</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Tổng chi phí
                    </span>
                    <span className="text-lg font-semibold">
                      {group.totalBill.toLocaleString("vi-VN")}đ
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
