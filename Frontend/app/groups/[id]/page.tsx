"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Receipt } from "lucide-react";

// Mock data
const groupData = {
  id: "1",
  name: "Du lịch Đà Lạt",
  description: "Chuyến đi thú vị đến Đà Lạt",
  members: [
    { id: "1", name: "Nguyễn Văn A", spent: 500000, owes: 200000 },
    { id: "2", name: "Trần Thị B", spent: 800000, owes: -100000 },
    { id: "3", name: "Lê Văn C", spent: 300000, owes: 400000 },
  ],
  expenses: [
    {
      id: "1",
      description: "Khách sạn",
      amount: 1500000,
      paidBy: "Trần Thị B",
      date: "2024-01-15",
    },
    {
      id: "2",
      description: "Ăn tối",
      amount: 600000,
      paidBy: "Nguyễn Văn A",
      date: "2024-01-15",
    },
    {
      id: "3",
      description: "Xăng xe",
      amount: 500000,
      paidBy: "Trần Thị B",
      date: "2024-01-16",
    },
  ],
};

export default function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(groupData.expenses);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
  });

  return (
    <MainLayout
      title={groupData.name}
      showBack
      onBackClick={() => router.back()}
      rightAction={
        <Button
          size="sm"
          onClick={() => {
            const element = document.getElementById("add-expense-form");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Chi phí
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Members Section */}
        <Card>
          <CardHeader>
            <CardTitle>Thành viên ({groupData.members.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupData.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Đã chi: {member.spent.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {member.owes > 0 ? (
                    <p className="text-sm text-destructive">
                      Nợ {member.owes.toLocaleString("vi-VN")}đ
                    </p>
                  ) : member.owes < 0 ? (
                    <p className="text-sm text-green-600">
                      Được trả {Math.abs(member.owes).toLocaleString("vi-VN")}đ
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Đã cân</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Chi phí gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chưa có chi phí nào</p>
              </div>
            ) : (
              expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-start border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.paidBy} thanh toán
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {expense.amount.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Add Expense Form */}
        <Card id="add-expense-form">
          <CardHeader>
            <CardTitle>Thêm chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setExpenses([
                  ...expenses,
                  {
                    ...newExpense,
                    amount: parseInt(newExpense.amount) || 0,
                    id: (expenses.length + 1).toString(),
                    date: new Date().toISOString(),
                  },
                ]);
                setNewExpense({ description: "", amount: "", paidBy: "" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">Người chi</label>
                <input
                  type="text"
                  value={newExpense.paidBy}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, paidBy: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Số tiền</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mô tả</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Lưu chi tiêu
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
