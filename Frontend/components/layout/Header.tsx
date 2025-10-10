'use client';
import { useAuth } from '../../contexts/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Menu, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  showBack?: boolean;
  onBackClick?: () => void;
  rightAction?: React.ReactNode;
}

export default function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded">
      Đăng xuất
    </button>
  );
}
export function Header({ 
  title, 
  onMenuClick, 
  showBack = false,
  onBackClick,
  rightAction 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        {rightAction && (
          <div className="flex items-center gap-2">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
}