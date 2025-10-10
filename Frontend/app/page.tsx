'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Users, Receipt, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // Mock data - thay bằng real data từ API
  const stats = {
    totalGroups: 3,
    totalExpenses: 15,
    totalAmount: 10500000,
    pendingSettlements: 2,
  };

  const recentActivities = [
    {
      id: '1',
      type: 'expense',
      group: 'Du lịch Đà Lạt',
      description: 'Khách sạn',
      amount: 1500000,
      time: '2 giờ trước',
    },
    {
      id: '2',
      type: 'settlement',
      group: 'Team outing',
      description: 'Minh đã thanh toán cho Hùng',
      amount: 300000,
      time: '5 giờ trước',
    },
    {
      id: '3',
      type: 'expense',
      group: 'Sinh nhật Minh',
      description: 'Đặt bánh kem',
      amount: 500000,
      time: 'Hôm qua',
    },
  ];

  const quickActions = [
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
            {quickActions.map((action) => {
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
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === 'expense'
                        ? 'bg-orange-50'
                        : 'bg-green-50'
                    }`}
                  >
                    {activity.type === 'expense' ? (
                      <Receipt className="h-4 w-4 text-orange-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.group}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
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