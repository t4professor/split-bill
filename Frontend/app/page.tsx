"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  Plus,
  TrendingUp,
  Users,
  Receipt,
  ArrowRight,
  Loader2,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { groupApi } from "@/lib/api";
import type { Group, Expense } from "@/lib/types";

// Types
type GroupWithExpenses = Group & {
  totalExpenses: number;
  totalAmount: number;
  recentExpenses: Expense[];
};

type RecentActivity = {
  id: string;
  type: "expense";
  groupId: string;
  groupName: string;
  description: string;
  amount: number;
  paidBy: string;
  timestamp: string;
};

const QUICK_ACTIONS = [
  {
    icon: Plus,
    label: "Tạo nhóm mới",
    description: "Bắt đầu chia bill với bạn bè",
    href: "/groups?action=create",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Users,
    label: "Xem nhóm",
    description: "Quản lý các nhóm của bạn",
    href: "/groups",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [groups, setGroups] = useState<GroupWithExpenses[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalAmount: 0,
  });

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Load all groups
      const groupsResponse = await groupApi.getUserGroups();
      const userGroups = groupsResponse.groups;

      if (userGroups.length === 0) {
        setGroups([]);
        setRecentActivities([]);
        setStats({
          totalGroups: 0,
          totalExpenses: 0,
          totalAmount: 0,
        });
        setIsLoading(false);
        return;
      }

      // 2. Load expenses for each group
      const groupsWithExpenses = await Promise.all(
        userGroups.map(async (group) => {
          try {
            const expensesResponse = await groupApi.getGroupExpenses(group.id);
            const expenses = expensesResponse.expenses;

            const totalAmount = expenses.reduce(
              (sum, expense) => sum + expense.amount,
              0
            );

            // Get 3 most recent expenses
            const recentExpenses = expenses
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 3);

            return {
              ...group,
              totalExpenses: expenses.length,
              totalAmount,
              recentExpenses,
            } as GroupWithExpenses;
          } catch (error) {
            console.error(
              `Failed to load expenses for group ${group.id}`,
              error
            );
            return {
              ...group,
              totalExpenses: 0,
              totalAmount: 0,
              recentExpenses: [],
            } as GroupWithExpenses;
          }
        })
      );

      setGroups(groupsWithExpenses);

      // 3. Aggregate statistics
      const totalExpenses = groupsWithExpenses.reduce(
        (sum, group) => sum + group.totalExpenses,
        0
      );
      const totalAmount = groupsWithExpenses.reduce(
        (sum, group) => sum + group.totalAmount,
        0
      );

      setStats({
        totalGroups: groupsWithExpenses.length,
        totalExpenses,
        totalAmount,
      });

      // 4. Collect recent activities from all groups
      const allActivities: RecentActivity[] = groupsWithExpenses.flatMap(
        (group) =>
          group.recentExpenses.map((expense) => ({
            id: expense.id,
            type: "expense" as const,
            groupId: group.id,
            groupName: group.name,
            description: expense.description,
            amount: expense.amount,
            paidBy: expense.paidBy.userName,
            timestamp: expense.createdAt,
          }))
      );

      // Sort by timestamp and take top 5
      const sortedActivities = allActivities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);

      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (!isAuthenticated) {
    return (
      <MainLayout title="Trang chủ">
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">
            Chào mừng đến Split Bill
          </h2>
          <p className="mb-6 text-center text-muted-foreground">
            Vui lòng đăng nhập để bắt đầu quản lý chi tiêu nhóm
          </p>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
            <Button variant="outline" onClick={() => router.push("/register")}>
              Đăng ký
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Trang chủ">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle>Xin chào, {user?.userName || "Bạn"}! 👋</CardTitle>
            <CardDescription>
              Chào mừng trở lại. Đây là tổng quan về các nhóm và hoạt động của
              bạn.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`rounded-lg p-3 ${action.bgColor}`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{action.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng số nhóm
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalGroups}</div>
                  <p className="text-xs text-muted-foreground">
                    Nhóm bạn tham gia
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng chi tiêu
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalExpenses}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Khoản chi tiêu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng số tiền
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Hoạt động gần đây
                    </CardTitle>
                    <CardDescription>
                      Các chi tiêu mới nhất trong nhóm của bạn
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                    <Receipt className="mb-3 h-10 w-10" />
                    <p>Chưa có hoạt động nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <Link
                              href={`/groups/${activity.groupId}`}
                              className="font-medium hover:underline"
                            >
                              {activity.groupName}
                            </Link>
                          </div>
                          <p className="mt-1 text-sm">{activity.description}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{activity.paidBy}</span>
                            <span>•</span>
                            <span>
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {formatCurrency(activity.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Groups */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nhóm của tôi</CardTitle>
                    <CardDescription>
                      Các nhóm bạn đang tham gia
                    </CardDescription>
                  </div>
                  <Link href="/groups">
                    <Button variant="outline" size="sm">
                      Xem tất cả
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                    <Users className="mb-3 h-10 w-10" />
                    <p>Bạn chưa tham gia nhóm nào</p>
                    <Link href="/groups/new">
                      <Button size="sm" className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo nhóm đầu tiên
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groups.slice(0, 5).map((group) => (
                      <Link
                        key={group.id}
                        href={`/groups/${group.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
                          <div className="flex-1">
                            <h3 className="font-semibold">{group.name}</h3>
                            {group.description && (
                              <p className="text-sm text-muted-foreground">
                                {group.description}
                              </p>
                            )}
                            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                              <span>{group.members.length} thành viên</span>
                              <span>•</span>
                              <span>{group.totalExpenses} chi tiêu</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(group.totalAmount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tổng chi
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
