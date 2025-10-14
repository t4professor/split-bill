'use client';

import { useCallback, useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Users, Receipt, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  GROUP_DETAIL_STORAGE_KEY,
  GROUPS_STORAGE_KEY,
} from '@/lib/constants';
import {
  seedGroupDetails,
  seedGroups,
  type SeedGroupDetail,
} from '@/lib/seedData';

type GroupSummary = {
  id: string;
  name: string;
  description?: string;
  members: number;
  totalBill: number;
};

type RecentActivity = {
  id: string;
  type: 'expense';
  group: string;
  description: string;
  amount: number;
  timestamp?: number;
  timeLabel: string;
};

const QUICK_ACTIONS = [
  {
    icon: Plus,
    label: 'Tạo nhóm mới',
    description: 'Bắt đầu chia bill với bạn bè',
    href: '/groups/new',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Receipt,
    label: 'Thêm chi phí',
    description: 'Ghi lại khoản chi tiêu',
    href: '/expenses/new',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Users,
    label: 'Xem nhóm',
    description: 'Quản lý các nhóm của bạn',
    href: '/groups',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalAmount: 0,
    pendingSettlements: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [groupSummaries, setGroupSummaries] = useState<GroupSummary[]>([]);

  const ensureSeedData = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedGroups = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!storedGroups) {
      window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(seedGroups));
    }

    const storedDetails = window.localStorage.getItem(GROUP_DETAIL_STORAGE_KEY);
    if (!storedDetails) {
      window.localStorage.setItem(
        GROUP_DETAIL_STORAGE_KEY,
        JSON.stringify(seedGroupDetails)
      );
    }
  }, []);

  const loadDashboardData = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    ensureSeedData();

    let summaries: GroupSummary[] = seedGroups;
    let details: Record<string, SeedGroupDetail> = seedGroupDetails;

    const groupsRaw = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    if (groupsRaw) {
      try {
        const parsed = JSON.parse(groupsRaw) as GroupSummary[];
        if (Array.isArray(parsed)) {
          summaries = parsed;
        }
      } catch (error) {
        console.error('Failed to parse stored groups', error);
      }
    }

    const detailsRaw = window.localStorage.getItem(GROUP_DETAIL_STORAGE_KEY);
    if (detailsRaw) {
      try {
        const parsed = JSON.parse(detailsRaw) as Record<string, SeedGroupDetail>;
        if (parsed && typeof parsed === 'object') {
          details = parsed;
        }
      } catch (error) {
        console.error('Failed to parse stored group details', error);
      }
    }

    const relevantDetails = summaries
      .map((summary) => details[summary.id])
      .filter((detail): detail is SeedGroupDetail => Boolean(detail));

    const enrichedSummaries = summaries
      .map((summary) => {
        const detail = details[summary.id];
        if (!detail) {
          return summary;
        }

        const totalBill = detail.expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        return {
          ...summary,
          members: detail.members.length,
          totalBill,
        } satisfies GroupSummary;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    const totalExpenses = relevantDetails.reduce(
      (sum, detail) => sum + detail.expenses.length,
      0
    );
    const totalAmount = enrichedSummaries.reduce(
      (sum, summary) => sum + summary.totalBill,
      0
    );

    setGroupSummaries(enrichedSummaries);

    setStats({
      totalGroups: enrichedSummaries.length,
      totalExpenses,
      totalAmount,
      pendingSettlements: 0,
    });

    const activities: RecentActivity[] = relevantDetails
      .flatMap((detail) =>
        detail.expenses.map((expense) => {
          const timestamp = expense.date ? new Date(expense.date).getTime() : undefined;
          return {
            id: `${detail.id}-${expense.id}`,
            type: 'expense' as const,
            group: detail.name,
            description: expense.description,
            amount: expense.amount,
            timestamp,
            timeLabel: timestamp
              ? new Date(timestamp).toLocaleString('vi-VN')
              : 'Chưa rõ thời gian',
          } satisfies RecentActivity;
        })
      )
      .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
      .slice(0, 5);

    setRecentActivities(activities);
  }, [ensureSeedData]);

  useEffect(() => {
    loadDashboardData();

    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === GROUPS_STORAGE_KEY || event.key === GROUP_DETAIL_STORAGE_KEY) {
        loadDashboardData();
      }
    };

    const handleDataChanged = () => loadDashboardData();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sb:data-changed', handleDataChanged as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sb:data-changed', handleDataChanged as EventListener);
    };
  }, [loadDashboardData]);

  return (
    <MainLayout title="Trang chủ">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Xin chào! 👋</CardTitle>
            <CardDescription className="text-blue-50">
              Hãy bắt đầu quản lý chi tiêu nhóm của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/groups/new">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-5 w-5" />
                Tạo nhóm mới
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nhóm</p>
                  <p className="text-2xl font-bold">{stats.totalGroups}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chi phí</p>
                  <p className="text-2xl font-bold">{stats.totalExpenses}</p>
                </div>
                <Receipt className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold">
                    {stats.totalAmount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href}>
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className={`p-3 rounded-full ${action.bgColor}`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{action.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nhóm của bạn</CardTitle>
              <Link href="/groups">
                <Button variant="ghost" size="sm">
                  Quản lý nhóm
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupSummaries.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Bạn chưa có nhóm nào, hãy tạo nhóm mới để bắt đầu chia bill.
              </p>
            ) : (
              groupSummaries.slice(0, 5).map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
                    <div>
                      <p className="font-semibold leading-tight">{group.name}</p>
                      {group.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {group.members} thành viên
                      </p>
                      <p className="text-sm font-medium">
                        {group.totalBill.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hoạt động gần đây</CardTitle>
              <Link href="/activities">
                <Button variant="ghost" size="sm">
                  Xem tất cả
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có hoạt động nào
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="p-2 rounded-full bg-orange-50">
                    <Receipt className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.group}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timeLabel}
                    </p>
                  </div>
                  <p className="font-semibold text-sm whitespace-nowrap">
                    {activity.amount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Settlements Alert */}
        {stats.pendingSettlements > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Receipt className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    Bạn có {stats.pendingSettlements} khoản thanh toán chờ xử lý
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nhấn để xem chi tiết
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}